import prisma from '../../lib/prisma';
import type { PermissionKey, PolicyEvaluation } from './authz.types';

let permissionCache: Map<string, string> | null = null;
let rolePermissionCache = new Map<string, Set<string>>();
const CACHE_TTL = 5 * 60 * 1000;
let lastCacheRefresh = 0;

async function refreshCache(): Promise<void> {
  const now = Date.now();
  if (now - lastCacheRefresh < CACHE_TTL && permissionCache) return;
  lastCacheRefresh = now;

  const allPerms = await prisma.permission.findMany({ select: { key: true, id: true } });
  permissionCache = new Map(allPerms.map((p) => [p.key, p.id]));

  const allRolePerms = await prisma.rolePermission.findMany({
    include: { permission: true, role: true },
  });

  rolePermissionCache.clear();
  for (const rp of allRolePerms) {
    const existing = rolePermissionCache.get(rp.roleId) || new Set();
    existing.add(rp.permission.key);
    rolePermissionCache.set(rp.roleId, existing);
  }
}

async function getRoleForUser(businessId: string, userId: string): Promise<{ roleId: string; roleName: string } | null> {
  // First check OrganizationMember via business's organization
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { organizationId: true, ownerId: true },
  });

  if (!business) return null;

  // Business owner gets Owner role
  if (business.ownerId === userId) {
    const ownerRole = await prisma.role.findUnique({ where: { name: 'Owner' } });
    if (ownerRole) return { roleId: ownerRole.id, roleName: 'Owner' };
  }

  // Check organization membership
  if (business.organizationId) {
    const member = await prisma.organizationMember.findFirst({
      where: { organizationId: business.organizationId, userId },
      include: { role: true },
    });
    if (member) return { roleId: member.roleId, roleName: member.role.name };
  }

  return null;
}

export async function can(
  userId: string,
  businessId: string,
  permission: PermissionKey
): Promise<PolicyEvaluation> {
  await refreshCache();

  const role = await getRoleForUser(businessId, userId);
  if (!role) {
    return { allowed: false, reason: 'User has no role in this business' };
  }

  // Owner role has all permissions
  if (role.roleName === 'Owner') {
    return { allowed: true, rule: 'Owner:unrestricted' };
  }

  const rolePerms = rolePermissionCache.get(role.roleId);
  if (!rolePerms || !rolePerms.has(permission)) {
    // Check for overriding PolicyRules
    const overrideRule = await prisma.policyRule.findFirst({
      where: {
        businessId,
        permissionKey: permission,
        roleId: role.roleId,
        enabled: true,
      },
      orderBy: { priority: 'desc' },
    });

    if (overrideRule) {
      if (overrideRule.effect === 'GRANT') {
        return { allowed: true, rule: `PolicyRule:${overrideRule.id}`, reason: 'Granted by policy' };
      }
      if (overrideRule.effect === 'DENY') {
        return { allowed: false, rule: `PolicyRule:${overrideRule.id}`, reason: 'Denied by policy' };
      }
    }

    return { allowed: false, reason: `Role ${role.roleName} lacks permission ${permission}` };
  }

  // Permission granted by role — check for DENY policy override
  const denyRule = await prisma.policyRule.findFirst({
    where: {
      businessId,
      permissionKey: permission,
      roleId: role.roleId,
      effect: 'DENY',
      enabled: true,
    },
    orderBy: { priority: 'desc' },
  });

  if (denyRule) {
    return { allowed: false, rule: `PolicyRule:${denyRule.id}`, reason: 'Overridden by deny policy' };
  }

  return { allowed: true, rule: `Role:${role.roleName}` };
}

export async function getEffectivePermissions(userId: string, businessId: string): Promise<string[]> {
  const role = await getRoleForUser(businessId, userId);
  if (!role) return [];

  if (role.roleName === 'Owner') {
    if (!permissionCache) await refreshCache();
    return Array.from(permissionCache?.keys() || []);
  }

  return Array.from(rolePermissionCache.get(role.roleId) || []);
}
