import { Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getCurrent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: business, error } = await supabase
      .from('organizations')
      .select('*, clients(count), invoices(count)')
      .eq('owner_id', req.user?.id as string)
      .maybeSingle();

    if (error) throw error;
    res.json(business);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: business, error } = await supabase
      .from('organizations')
      .select('*, clients(count), invoices(count)')
      .eq('id', req.params.id as string)
      .single();

    if (error) throw error;
    res.json(business);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: business, error } = await supabase
      .from('organizations')
      .update(req.body)
      .eq('id', req.params.id as string)
      .select()
      .single();

    if (error) throw error;
    res.json(business);
  } catch (error) {
    next(error);
  }
};

export const updateBranding = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { logo, brandColor, customDomain } = req.body;
    const { data: business, error } = await supabase
      .from('organizations')
      .update({ logo_url: logo, brand_color: brandColor, custom_domain: customDomain })
      .eq('id', req.params.id as string)
      .select()
      .single();

    if (error) throw error;
    res.json(business);
  } catch (error) {
    next(error);
  }
};
