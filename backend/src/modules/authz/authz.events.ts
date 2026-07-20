import { eventBus } from '../../events';
import { logger } from '../../utils/logger';
import type { PermissionKey, PolicyEvaluation } from './authz.types';

const EVENT_AUTHZ = 'authz' as const;

export const AuthzEventName = {
  PermissionGranted: 'authz.permission.granted',
  PermissionDenied: 'authz.permission.denied',
  RoleAssigned: 'authz.role.assigned',
  RoleRemoved: 'authz.role.removed',
  PolicyCreated: 'authz.policy.created',
  PolicyUpdated: 'authz.policy.updated',
  PolicyDeleted: 'authz.policy.deleted',
} as const;

export interface AuthzEventPayload {
  eventId: string;
  eventName: string;
  timestamp: string;
  correlationId?: string;
  businessId: string;
  userId: string;
  permissionKey?: PermissionKey;
  roleName?: string;
  policyRuleId?: string;
  effect?: string;
  reason?: string;
  resourceId?: string;
  resourceType?: string;
  metadata?: Record<string, unknown>;
}

export function publishAuthzEvent(
  eventName: string,
  payload: Omit<AuthzEventPayload, 'eventId' | 'eventName' | 'timestamp'>
): void {
  try {
    const event: AuthzEventPayload = {
      eventId: crypto.randomUUID(),
      eventName,
      timestamp: new Date().toISOString(),
      ...payload,
    };
    eventBus.publish(EVENT_AUTHZ, event).catch((err) => {
      logger.warn('Failed to publish authz event', { error: err, eventName });
    });
  } catch (err) {
    logger.warn('Failed to publish authz event (bus not ready)', { error: err, eventName });
  }
}

export function publishPermissionCheck(
  userId: string,
  businessId: string,
  permission: PermissionKey,
  result: PolicyEvaluation
): void {
  const eventName = result.allowed ? AuthzEventName.PermissionGranted : AuthzEventName.PermissionDenied;
  publishAuthzEvent(eventName, {
    userId,
    businessId,
    permissionKey: permission,
    effect: result.allowed ? 'GRANT' : 'DENY',
    reason: result.reason,
    metadata: { rule: result.rule },
  });
}
