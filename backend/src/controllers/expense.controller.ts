import { Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.query;
    
    if (!businessId) {
      return res.status(400).json({ message: 'Business ID is required' });
    }

    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('organization_id', businessId as string)
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
  } catch (error) {
    next(error);
  }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { businessId, ...data } = req.body;
    
    const { data: expense, error } = await supabase
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
  } catch (error) {
    next(error);
  }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { businessId, ...data } = req.body;
    
    const { data: expense, error } = await supabase
      .from('expenses')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id as string)
      .select()
      .single();

    if (error) throw error;
    res.json(expense);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', req.params.id as string);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
