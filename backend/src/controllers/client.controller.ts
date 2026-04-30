import { Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.query.businessId as string;
    
    if (!organizationId) {
      return res.json([]);
    }

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
    const { businessId, name, contactName, email, phone, address, taxId } = req.body;
    const { data: client, error } = await supabase
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

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { version, businessId, name, contactName, email, phone, address, taxId } = req.body;
    const { data: client, error } = await supabase
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
      .eq('id', req.params.id as string)
      .eq('version', version || 1)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        const { data: current } = await supabase
          .from('clients')
          .select('version, updated_at')
          .eq('id', req.params.id as string)
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
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', req.params.id as string);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
