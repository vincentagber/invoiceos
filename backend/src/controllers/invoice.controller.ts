import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      businessId, 
      clientId, 
      status, 
      startDate, 
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let query = supabase
      .from('invoices')
      .select('*, client:clients(id, name, email), items:invoice_items(*)', { count: 'exact' })
      .eq('organization_id', businessId as string);

    if (clientId) query = query.eq('client_id', clientId as string);
    if (status) query = query.eq('status', status as string);
    if (startDate) query = query.gte('created_at', startDate as string);
    if (endDate) query = query.lte('created_at', endDate as string);

    const { data: invoices, count, error } = await query
      .order(sortBy as string, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) throw error;

    res.json({
      data: invoices,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId, clientId, items, ...data } = req.body;
    const invoiceNumber = data.invoiceNumber || `INV-${Date.now()}`;

    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .insert({
        ...data,
        invoice_number: invoiceNumber,
        organization_id: businessId,
        client_id: clientId,
      })
      .select()
      .single();

    if (invError) throw invError;

    if (items && items.length > 0) {
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(items.map((item: any) => ({
          ...item,
          invoice_id: invoice.id
        })));
      if (itemsError) throw itemsError;
    }

    await supabase.from('invoice_events').insert({
      invoice_id: invoice.id,
      event_type: 'CREATED',
      metadata: { items_count: items?.length }
    });

    const io = req.app.get('io');
    io.to(businessId).emit('invoice-created', invoice);

    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*, client:clients(*), items:invoice_items(*), payments:payments(*)')
      .eq('id', req.params.id as string)
      .single();

    if (error) throw error;
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({ status })
      .eq('id', req.params.id as string)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('invoice_events').insert({
      invoice_id: invoice.id,
      event_type: status === 'SENT' ? 'SENT' : 'STATUS_UPDATED',
      metadata: { new_status: status }
    });

    const io = req.app.get('io');
    io.to(invoice.organization_id).emit('invoice-status-updated', { 
      id: invoice.id, 
      status, 
      invoiceNumber: invoice.invoice_number 
    });

    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

export const trackView = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: currentInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select('view_count, organization_id, invoice_number')
      .eq('id', req.params.id as string)
      .single();

    if (fetchError) throw fetchError;

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({
        view_count: (currentInvoice.view_count || 0) + 1,
        last_viewed_at: new Date(),
        status: 'VIEWED'
      })
      .eq('id', req.params.id as string)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('invoice_events').insert({
      invoice_id: invoice.id,
      event_type: 'VIEWED',
      metadata: { view_count: invoice.view_count }
    });

    const io = req.app.get('io');
    io.to(invoice.organization_id).emit('invoice-viewed', { 
      id: invoice.id, 
      viewCount: invoice.view_count,
      invoiceNumber: invoice.invoice_number
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const addPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, method, transactionId } = req.body;
    const invoiceId = req.params.id as string;

    const { data: payment, error: payError } = await supabase
      .from('payments')
      .insert({
        invoice_id: invoiceId,
        amount,
        method,
        transaction_id: transactionId,
        status: 'SUCCESS',
        paid_at: new Date(),
      })
      .select('*, invoice:invoices(*)')
      .single();

    if (payError) throw payError;

    const { data: allPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('invoice_id', invoiceId)
      .eq('status', 'SUCCESS');

    const totalPaid = (allPayments || []).reduce((sum, p) => sum + p.amount, 0);
    const newStatus = totalPaid >= payment.invoice.total_amount ? 'PAID' : 'PARTIAL';

    await supabase
      .from('invoices')
      .update({ status: newStatus })
      .eq('id', invoiceId);

    await supabase.from('invoice_events').insert({
      invoice_id: invoiceId,
      event_type: 'PAYMENT_COMPLETED',
      metadata: { amount, total_paid: totalPaid }
    });

    const io = req.app.get('io');
    io.to(payment.invoice.organization_id).emit('payment-received', { 
      id: payment.invoice.id, 
      amount, 
      invoiceNumber: payment.invoice.invoice_number,
      totalPaid 
    });

    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items, ...data } = req.body;
    
    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .update(data)
      .eq('id', req.params.id as string)
      .select()
      .single();

    if (invError) throw invError;

    if (items) {
      await supabase.from('invoice_items').delete().eq('invoice_id', req.params.id as string);
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(items.map((item: any) => ({
          ...item,
          invoice_id: invoice.id
        })));
      if (itemsError) throw itemsError;
    }

    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

export const triggerReminder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*, client:clients(*)')
      .eq('id', req.params.id as string)
      .single();

    if (error || !invoice) return res.status(404).json({ message: 'Invoice not found' });

    await supabase.from('invoice_events').insert({
      invoice_id: invoice.id,
      event_type: 'REMINDER_SENT'
    });

    const io = req.app.get('io');
    io.to(invoice.organization_id).emit('notification', {
      title: 'Reminder Sent',
      message: `Overdue reminder sent to ${invoice.client.name} for Invoice #${invoice.invoice_number}`,
      type: 'info'
    });

    res.json({ success: true, message: 'Reminder triggered' });
  } catch (error) {
    next(error);
  }
};

export const sendInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({ status: 'SENT' })
      .eq('id', req.params.id as string)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('invoice_events').insert({
      invoice_id: invoice.id,
      event_type: 'SENT'
    });

    const io = req.app.get('io');
    io.to(invoice.organization_id).emit('invoice-sent', { 
      id: invoice.id, 
      invoiceNumber: invoice.invoice_number 
    });

    res.json({ success: true, message: 'Invoice sent successfully' });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', req.params.id as string);

    if (error) throw error;
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    next(error);
  }
};
