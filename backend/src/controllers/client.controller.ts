import { Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.query.businessId as string;
    
    // We can't do exact _count in a single simple Supabase select like Prisma without specialized functions,
    // but we can fetch clients and handle count or use a view.
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*, invoices(count)')
      .eq('organization_id', organizationId)
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { businessId, ...data } = req.body;
    const { data: client, error } = await supabase
      .from('clients')
      .insert({ ...data, organization_id: businessId })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: client, error } = await supabase
      .from('clients')
      .select('*, invoices(*)')
      .eq('id', req.params.id as string)
      .single();

    if (error) throw error;
    res.json(client);
  } catch (error) {
    next(error);
  }
};
