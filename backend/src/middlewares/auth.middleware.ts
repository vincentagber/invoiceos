import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

/**
 * Optimized Auth Middleware
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    (req as AuthRequest).user = {
      id: user.id,
      email: user.email || '',
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * RBAC Middleware: Organization Level
 */
export const checkRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const organizationId = req.query.businessId || req.body.businessId || req.params.businessId;
      const userId = authReq.user?.id;

      if (!organizationId || !userId) {
        return res.status(400).json({ message: 'Organization context missing' });
      }

      const { data: member, error } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .single();

      if (error || !member) {
        return res.status(403).json({ message: 'Unauthorized: Not a member' });
      }

      if (!allowedRoles.includes(member.role)) {
        return res.status(403).json({ message: 'Unauthorized: Insufficient permissions' });
      }

      authReq.user!.role = member.role;
      next();
    } catch (error) {
      next(error);
    }
  };
};
