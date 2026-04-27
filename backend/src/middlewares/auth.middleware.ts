import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string; // Role within the context of the current organization
  };
}

/**
 * Optimized Auth Middleware
 * Verifies Supabase JWT and attaches user to request
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Verify token with Supabase (Edge-ready: uses Supabase Auth)
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.user = {
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
 * Ensures the user belongs to the organization and has the required role
 */
export const checkRole = (allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.query.businessId || req.body.businessId || req.params.businessId;
      const userId = req.user?.id;

      if (!organizationId || !userId) {
        return res.status(400).json({ message: 'Organization context missing' });
      }

      // Check membership and role in Supabase
      const { data: member, error } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .single();

      if (error || !member) {
        return res.status(403).json({ message: 'Unauthorized: Not a member of this organization' });
      }

      if (!allowedRoles.includes(member.role)) {
        return res.status(403).json({ message: `Unauthorized: Requires one of roles: ${allowedRoles.join(', ')}` });
      }

      // Attach role to user object for downstream use
      req.user!.role = member.role;
      
      next();
    } catch (error) {
      next(error);
    }
  };
};
