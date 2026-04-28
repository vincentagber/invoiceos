import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { supabase } from '../lib/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getCurrent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Temporary fallback to Supabase due to Prisma authentication failure
    const { data: business, error } = await supabase
      .from('organizations')
      .select('*, clients(count), invoices(count)')
      .eq('owner_id', req.user?.id as string)
      .maybeSingle();

    if (error) throw error;
    if (!business) return res.status(404).json({ error: 'Institutional workspace not found' });

    res.json(business);
  } catch (error) {
    next(error);
  }
};

export const updateCurrent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const business = await prisma.business.findFirst({
      where: { ownerId: req.user?.id as string }
    });

    if (!business) return res.status(404).json({ error: 'Institutional workspace not found' });

    const updated = await prisma.business.update({
      where: { id: business.id },
      data: req.body
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const business = await prisma.business.findUnique({
      where: { id: req.params.id as string },
      include: {
        _count: {
          select: { clients: true, invoices: true }
        }
      }
    });

    if (!business) return res.status(404).json({ error: 'Institutional entity not found' });
    res.json(business);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await prisma.business.update({
      where: { id: req.params.id as string },
      data: req.body
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const updateBranding = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { logo, brandColor, customDomain } = req.body;
    const updated = await prisma.business.update({
      where: { id: req.params.id as string },
      data: { 
        // Note: logo is handled differently in settings.controller if it's binary
        // but here we maintain backward compatibility if needed
        brandColor, 
        customDomain 
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};
