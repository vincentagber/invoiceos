import { BullWorkerAdapter } from '../queue/BullQueue';
import { JobData } from '../interfaces/IQueue';
import { logger } from '../../utils/logger';
import prisma from '../../lib/prisma';

const QUEUE_NAME = 'audit';

async function handler(data: JobData): Promise<void> {
  const { eventName, eventId, correlationId, businessId, actorId, payload } = data;

  logger.info(`AuditWorker: recording ${eventName} [${eventId}]`);

  // Persistent audit log — every business event is recorded immutably.
  // This table will serve as the legal audit trail for financial operations.
  try {
    await prisma.auditLog.create({
      data: {
        eventName,
        eventId,
        correlationId,
        businessId: businessId || '',
        actorId: actorId || '',
        payload: payload as object,
        version: 1,
      },
    });
  } catch (error) {
    logger.error(`AuditWorker: failed to persist ${eventName} [${eventId}]`, error);
    throw error;
  }
}

export function createAuditWorker(): BullWorkerAdapter {
  return new BullWorkerAdapter(QUEUE_NAME, handler, { concurrency: 5 });
}

export { QUEUE_NAME as AUDIT_QUEUE };
