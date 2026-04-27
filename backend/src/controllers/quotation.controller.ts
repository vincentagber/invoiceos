import { Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.query.businessId as string;
    const { data: quotations, error } = await supabase
      .from('quotations')
      .select('*, client:clients(*), items:quotation_items(*)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(quotations);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { businessId, clientId, items, ...data } = req.body;
    const quotationNumber = data.quotationNumber || `QT-${Date.now()}`;

    const { data: quotation, error: qtError } = await supabase
      .from('quotations')
      .insert({
        ...data,
        quotation_number: quotationNumber,
        organization_id: businessId,
        client_id: clientId,
      })
      .select()
      .single();

    if (qtError) throw qtError;

    if (items && items.length > 0) {
      const { error: itemsError } = await supabase
        .from('quotation_items')
        .insert(items.map((item: any) => ({
          ...item,
          quotation_id: quotation.id
        })));
      if (itemsError) throw itemsError;
    }

    res.status(201).json(quotation);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: quotation, error } = await supabase
      .from('quotations')
      .select('*, client:clients(*), items:quotation_items(*)')
      .eq('id', req.params.id as string)
      .single();

    if (error) throw error;
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { items, ...data } = req.body;
    
    // Update main quotation
    const { data: quotation, error: qtError } = await supabase
      .from('quotations')
      .update(data)
      .eq('id', req.params.id as string)
      .select()
      .single();

    if (qtError) throw qtError;

    // Replace items
    if (items) {
      await supabase.from('quotation_items').delete().eq('quotation_id', req.params.id as string);
      const { error: itemsError } = await supabase
        .from('quotation_items')
        .insert(items.map((item: any) => ({
          ...item,
          quotation_id: quotation.id
        })));
      if (itemsError) throw itemsError;
    }

    res.json(quotation);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabase
      .from('quotations')
      .delete()
      .eq('id', req.params.id as string);

    if (error) throw error;
    res.json({ success: true, message: 'Quotation deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const convertToInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const { data: quotation, error: fetchError } = await supabase
      .from('quotations')
      .select('*, items:quotation_items(*)')
      .eq('id', id as string)
      .single();

    if (fetchError || !quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    const invoiceNumber = `INV-${Date.now()}`;
    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        organization_id: quotation.organization_id,
        client_id: quotation.client_id,
        currency: quotation.currency,
        issue_date: new Date(),
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        tax_rate: quotation.tax_rate,
        discount_amount: quotation.discount_amount,
        total_amount: quotation.total_amount,
        status: 'DRAFT',
      })
      .select()
      .single();

    if (invError) throw invError;

    // Copy items
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(quotation.items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        invoice_id: invoice.id
      })));
    
    if (itemsError) throw itemsError;

    // Update quotation status
    await supabase.from('quotations').update({ status: 'ACCEPTED' }).eq('id', id as string);

    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};
