"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.sendInvoice = exports.triggerReminder = exports.update = exports.addPayment = exports.trackView = exports.updateStatus = exports.getOne = exports.create = exports.getAll = void 0;
const supabase_1 = require("../lib/supabase");
const getAll = async (req, res, next) => {
    try {
        const { businessId, clientId, status, startDate, endDate, page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
        const from = (Number(page) - 1) * Number(limit);
        const to = from + Number(limit) - 1;
        let query = supabase_1.supabase
            .from('invoices')
            .select('*, client:clients(id, name, email), items:invoice_items(*)', { count: 'exact' })
            .eq('organization_id', businessId);
        if (clientId)
            query = query.eq('client_id', clientId);
        if (status)
            query = query.eq('status', status);
        if (startDate)
            query = query.gte('created_at', startDate);
        if (endDate)
            query = query.lte('created_at', endDate);
        const { data: invoices, count, error } = await query
            .order(sortBy, { ascending: sortOrder === 'asc' })
            .range(from, to);
        if (error)
            throw error;
        res.json({
            data: invoices,
            pagination: {
                total: count,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil((count || 0) / Number(limit))
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAll = getAll;
const create = async (req, res, next) => {
    try {
        const { businessId, clientId, items, ...data } = req.body;
        const invoiceNumber = data.invoiceNumber || `INV-${Date.now()}`;
        const { data: invoice, error: invError } = await supabase_1.supabase
            .from('invoices')
            .insert({
            ...data,
            invoice_number: invoiceNumber,
            organization_id: businessId,
            client_id: clientId,
        })
            .select()
            .single();
        if (invError)
            throw invError;
        if (items && items.length > 0) {
            const { error: itemsError } = await supabase_1.supabase
                .from('invoice_items')
                .insert(items.map((item) => ({
                ...item,
                invoice_id: invoice.id
            })));
            if (itemsError)
                throw itemsError;
        }
        await supabase_1.supabase.from('invoice_events').insert({
            invoice_id: invoice.id,
            event_type: 'CREATED',
            metadata: { items_count: items?.length }
        });
        const io = req.app.get('io');
        io.to(businessId).emit('invoice-created', invoice);
        res.status(201).json(invoice);
    }
    catch (error) {
        next(error);
    }
};
exports.create = create;
const getOne = async (req, res, next) => {
    try {
        const { data: invoice, error } = await supabase_1.supabase
            .from('invoices')
            .select('*, client:clients(*), items:invoice_items(*), payments:payments(*)')
            .eq('id', req.params.id)
            .single();
        if (error)
            throw error;
        if (!invoice)
            return res.status(404).json({ message: 'Invoice not found' });
        res.json(invoice);
    }
    catch (error) {
        next(error);
    }
};
exports.getOne = getOne;
const updateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const { data: invoice, error } = await supabase_1.supabase
            .from('invoices')
            .update({ status })
            .eq('id', req.params.id)
            .select()
            .single();
        if (error)
            throw error;
        await supabase_1.supabase.from('invoice_events').insert({
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
    }
    catch (error) {
        next(error);
    }
};
exports.updateStatus = updateStatus;
const trackView = async (req, res, next) => {
    try {
        const { data: currentInvoice, error: fetchError } = await supabase_1.supabase
            .from('invoices')
            .select('view_count, organization_id, invoice_number')
            .eq('id', req.params.id)
            .single();
        if (fetchError)
            throw fetchError;
        const { data: invoice, error } = await supabase_1.supabase
            .from('invoices')
            .update({
            view_count: (currentInvoice.view_count || 0) + 1,
            last_viewed_at: new Date(),
            status: 'VIEWED'
        })
            .eq('id', req.params.id)
            .select()
            .single();
        if (error)
            throw error;
        await supabase_1.supabase.from('invoice_events').insert({
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
    }
    catch (error) {
        next(error);
    }
};
exports.trackView = trackView;
const addPayment = async (req, res, next) => {
    try {
        const { amount, method, transactionId } = req.body;
        const invoiceId = req.params.id;
        const { data: payment, error: payError } = await supabase_1.supabase
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
        if (payError)
            throw payError;
        const { data: allPayments } = await supabase_1.supabase
            .from('payments')
            .select('amount')
            .eq('invoice_id', invoiceId)
            .eq('status', 'SUCCESS');
        const totalPaid = (allPayments || []).reduce((sum, p) => sum + p.amount, 0);
        const newStatus = totalPaid >= payment.invoice.total_amount ? 'PAID' : 'PARTIAL';
        await supabase_1.supabase
            .from('invoices')
            .update({ status: newStatus })
            .eq('id', invoiceId);
        await supabase_1.supabase.from('invoice_events').insert({
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
    }
    catch (error) {
        next(error);
    }
};
exports.addPayment = addPayment;
const update = async (req, res, next) => {
    try {
        const { items, version, ...data } = req.body;
        // OCC Check: Update only if version matches
        const { data: invoice, error: invError } = await supabase_1.supabase
            .from('invoices')
            .update({
            ...data,
            version: (version || 1) + 1,
            updated_at: new Date().toISOString()
        })
            .eq('id', req.params.id)
            .eq('version', version || 1)
            .select()
            .single();
        if (invError) {
            // PGRST116: No rows matched the filter (conflict or not found)
            if (invError.code === 'PGRST116') {
                const { data: current } = await supabase_1.supabase
                    .from('invoices')
                    .select('version, updated_at')
                    .eq('id', req.params.id)
                    .single();
                return res.status(409).json({
                    message: 'Conflict detected: The document has been modified by another user.',
                    currentVersion: current?.version,
                    lastModified: current?.updated_at
                });
            }
            throw invError;
        }
        if (items) {
            await supabase_1.supabase.from('invoice_items').delete().eq('invoice_id', req.params.id);
            const { error: itemsError } = await supabase_1.supabase
                .from('invoice_items')
                .insert(items.map((item) => ({
                ...item,
                invoice_id: invoice.id
            })));
            if (itemsError)
                throw itemsError;
        }
        const io = req.app.get('io');
        io.to(invoice.organization_id).emit('invoice-updated', invoice);
        res.json(invoice);
    }
    catch (error) {
        next(error);
    }
};
exports.update = update;
const triggerReminder = async (req, res, next) => {
    try {
        const { data: invoice, error } = await supabase_1.supabase
            .from('invoices')
            .select('*, client:clients(*)')
            .eq('id', req.params.id)
            .single();
        if (error || !invoice)
            return res.status(404).json({ message: 'Invoice not found' });
        await supabase_1.supabase.from('invoice_events').insert({
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
    }
    catch (error) {
        next(error);
    }
};
exports.triggerReminder = triggerReminder;
const sendInvoice = async (req, res, next) => {
    try {
        const { data: invoice, error } = await supabase_1.supabase
            .from('invoices')
            .update({ status: 'SENT' })
            .eq('id', req.params.id)
            .select()
            .single();
        if (error)
            throw error;
        await supabase_1.supabase.from('invoice_events').insert({
            invoice_id: invoice.id,
            event_type: 'SENT'
        });
        const io = req.app.get('io');
        io.to(invoice.organization_id).emit('invoice-sent', {
            id: invoice.id,
            invoiceNumber: invoice.invoice_number
        });
        res.json({ success: true, message: 'Invoice sent successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.sendInvoice = sendInvoice;
const remove = async (req, res, next) => {
    try {
        const { error } = await supabase_1.supabase
            .from('invoices')
            .delete()
            .eq('id', req.params.id);
        if (error)
            throw error;
        res.json({ success: true, message: 'Invoice deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.remove = remove;
