import { BullWorkerAdapter } from '../queue/BullQueue';
import { JobData } from '../interfaces/IQueue';
import { logger } from '../../utils/logger';

const QUEUE_NAME = 'pdf';

async function handler(data: JobData): Promise<void> {
  const { eventName, eventId, payload } = data;

  logger.info(`PDFWorker: generating PDF for ${eventName} [${eventId}]`, { eventName, eventId });

  const invoicePayload = payload as { invoiceId?: string; invoiceNumber?: string; businessId?: string };

  // PDF generation will be implemented here when the backend PDF engine is ready.
  // Currently PDF generation runs on the frontend via jspdf.
  // This worker is the integration point for a future server-side PDF service.
  logger.info(`PDFWorker: queued PDF for invoice ${invoicePayload.invoiceNumber || invoicePayload.invoiceId}`, {
    invoiceId: invoicePayload.invoiceId,
    businessId: invoicePayload.businessId,
  });
}

export function createPDFWorker(): BullWorkerAdapter {
  return new BullWorkerAdapter(QUEUE_NAME, handler, { concurrency: 2 });
}

export { QUEUE_NAME as PDF_QUEUE };
