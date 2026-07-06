"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.getAll = void 0;
const supabase_1 = require("../lib/supabase");
const getAll = async (req, res, next) => {
    try {
        const { businessId } = req.query;
        if (!businessId) {
            return res.status(400).json({ message: 'Business ID is required' });
        }
        const { data: expenses, error } = await supabase_1.supabase
            .from('expenses')
            .select('*')
            .eq('organization_id', businessId)
            .order('date', { ascending: false });
        if (error) {
            // If table doesn't exist, return empty array instead of 500
            if (error.code === '42P01' || error.message?.includes('relation "expenses" does not exist')) {
                console.warn('Expenses table not found. Please run SQL migration.');
                return res.json([]);
            }
            throw error;
        }
        res.json(expenses);
    }
    catch (error) {
        next(error);
    }
};
exports.getAll = getAll;
const create = async (req, res, next) => {
    try {
        const { businessId, ...data } = req.body;
        const { data: expense, error } = await supabase_1.supabase
            .from('expenses')
            .insert({
            ...data,
            organization_id: businessId,
            user_id: req.user?.id
        })
            .select()
            .single();
        if (error) {
            if (error.code === '42P01' || error.message?.includes('relation "expenses" does not exist')) {
                return res.status(400).json({
                    message: 'The institutional expenses table has not been initialized. Please run the SQL migration in your Supabase editor.'
                });
            }
            throw error;
        }
        const io = req.app.get('io');
        io.to(businessId).emit('expense-recorded', expense);
        res.status(201).json(expense);
    }
    catch (error) {
        next(error);
    }
};
exports.create = create;
const update = async (req, res, next) => {
    try {
        const { businessId, ...data } = req.body;
        const { data: expense, error } = await supabase_1.supabase
            .from('expenses')
            .update({
            ...data,
            updated_at: new Date().toISOString()
        })
            .eq('id', req.params.id)
            .select()
            .single();
        if (error)
            throw error;
        res.json(expense);
    }
    catch (error) {
        next(error);
    }
};
exports.update = update;
const remove = async (req, res, next) => {
    try {
        const { error } = await supabase_1.supabase
            .from('expenses')
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
