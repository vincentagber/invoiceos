"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.getOne = exports.create = exports.getAll = void 0;
const supabase_1 = require("../lib/supabase");
const getAll = async (req, res, next) => {
    try {
        const organizationId = req.query.businessId;
        if (!organizationId) {
            return res.json([]);
        }
        const { data: clients, error } = await supabase_1.supabase
            .from('clients')
            .select('*, invoices(count)')
            .eq('organization_id', organizationId)
            .order('name', { ascending: true });
        if (error)
            throw error;
        res.json(clients);
    }
    catch (error) {
        next(error);
    }
};
exports.getAll = getAll;
const create = async (req, res, next) => {
    try {
        const { businessId, name, contactName, email, phone, address, taxId } = req.body;
        const { data: client, error } = await supabase_1.supabase
            .from('clients')
            .insert({
            organization_id: businessId,
            name,
            contact_name: contactName || null,
            email,
            phone: phone || null,
            address: address || null,
            tax_id: taxId || null,
        })
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json(client);
    }
    catch (error) {
        next(error);
    }
};
exports.create = create;
const getOne = async (req, res, next) => {
    try {
        const { data: client, error } = await supabase_1.supabase
            .from('clients')
            .select('*, invoices(*)')
            .eq('id', req.params.id)
            .single();
        if (error)
            throw error;
        res.json(client);
    }
    catch (error) {
        next(error);
    }
};
exports.getOne = getOne;
const update = async (req, res, next) => {
    try {
        const { version, businessId, name, contactName, email, phone, address, taxId } = req.body;
        const { data: client, error } = await supabase_1.supabase
            .from('clients')
            .update({
            name,
            contact_name: contactName,
            email,
            phone: phone || null,
            address: address || null,
            tax_id: taxId || null,
            version: (version || 1) + 1,
            updated_at: new Date().toISOString()
        })
            .eq('id', req.params.id)
            .eq('version', version || 1)
            .select()
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                const { data: current } = await supabase_1.supabase
                    .from('clients')
                    .select('version, updated_at')
                    .eq('id', req.params.id)
                    .single();
                return res.status(409).json({
                    message: 'Conflict detected',
                    currentVersion: current?.version,
                    lastModified: current?.updated_at
                });
            }
            throw error;
        }
        res.json(client);
    }
    catch (error) {
        next(error);
    }
};
exports.update = update;
const remove = async (req, res, next) => {
    try {
        const { error } = await supabase_1.supabase
            .from('clients')
            .delete()
            .eq('id', req.params.id);
        if (error)
            throw error;
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
};
exports.remove = remove;
