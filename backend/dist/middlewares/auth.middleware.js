"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = exports.authenticate = void 0;
const supabase_1 = require("../lib/supabase");
/**
 * Optimized Auth Middleware
 */
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const { data: { user }, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        req.user = {
            id: user.id,
            email: user.email || '',
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Authentication failed' });
    }
};
exports.authenticate = authenticate;
/**
 * RBAC Middleware: Organization Level
 */
const checkRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const authReq = req;
            const organizationId = req.query.businessId || req.body.businessId || req.params.businessId;
            const userId = authReq.user?.id;
            if (!organizationId || !userId) {
                return res.status(400).json({ message: 'Organization context missing' });
            }
            const { data: member, error } = await supabase_1.supabase
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
            authReq.user.role = member.role;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.checkRole = checkRole;
