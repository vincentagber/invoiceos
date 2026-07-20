import { BullWorkerAdapter } from '../queue/BullQueue';
import { JobData } from '../interfaces/IQueue';
import { logger } from '../../utils/logger';

const QUEUE_NAME = 'analytics';

async function handler(data: JobData): Promise<void> {
  const { eventName, eventId, payload, businessId, correlationId } = data;

  logger.info(`AnalyticsWorker: updating analytics for ${eventName} [${eventId}]`, {
    eventName,
    eventId,
    businessId,
    correlationId,
  });

  // Analytics aggregation is triggered asynchronously.
  // The analytics service's getSummary() and getRevenueTrends() already compute
  // data on-the-fly from the database, so real-time aggregation isn't critical.
  //
  // This worker will be used in the future for:
  //   - Pre-computed metrics snapshots
  //   - Cache invalidation
  //   - Materialized view refresh
  //   - Real-time dashboard updates via WebSocket
  //
  // For now, the analytics endpoints compute directly from the DB,
  // so this worker acknowledges the event and exits.
  const invoicePayload = payload as { invoiceId?: string; totalAmount?: number };
  logger.info(`AnalyticsWorker: acknowledged invoice ${invoicePayload.invoiceId} for ${invoicePayload.totalAmount}`, {
    businessId,
    invoiceId: invoicePayload.invoiceId,
  });
}

export function createAnalyticsWorker(): BullWorkerAdapter {
  return new BullWorkerAdapter(QUEUE_NAME, handler, { concurrency: 3 });
}

export { QUEUE_NAME as ANALYTICS_QUEUE };
