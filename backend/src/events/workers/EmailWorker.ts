import { BullWorkerAdapter } from '../queue/BullQueue';
import { JobData } from '../interfaces/IQueue';
import { logger } from '../../utils/logger';

const QUEUE_NAME = 'email';

async function handler(data: JobData): Promise<void> {
  const { eventName, eventId, payload, businessId, correlationId } = data;

  logger.info(`EmailWorker: processing ${eventName} [${eventId}]`, { eventName, eventId, businessId, correlationId });

  // Email sending will be implemented here when the SMTP engine is production-ready.
  // The settings module already stores SMTP credentials per business.
  // This worker is the integration point for:
  //   - Invoice sent → email to client
  //   - Payment received → receipt to client
  //   - Overdue reminder → email to client
  //   - Welcome email → email to new user
  const invoicePayload = payload as { invoiceNumber?: string; clientEmail?: string };
  logger.info(`EmailWorker: would send email for invoice ${invoicePayload.invoiceNumber} to ${invoicePayload.clientEmail || 'unknown'}`);
}

export function createEmailWorker(): BullWorkerAdapter {
  return new BullWorkerAdapter(QUEUE_NAME, handler, { concurrency: 5 });
}

export { QUEUE_NAME as EMAIL_QUEUE };
