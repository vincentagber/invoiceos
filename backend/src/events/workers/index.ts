import { BullWorkerAdapter } from '../queue/BullQueue';
import { createAuditWorker } from './AuditWorker';
import { createPDFWorker } from './PDFWorker';
import { createEmailWorker } from './EmailWorker';
import { createAnalyticsWorker } from './AnalyticsWorker';

let workers: BullWorkerAdapter[] = [];

export async function startAllWorkers(): Promise<void> {
  workers = [
    createAuditWorker(),
    createPDFWorker(),
    createEmailWorker(),
    createAnalyticsWorker(),
  ];

  await Promise.all(workers.map((w) => w.start()));
}

export async function stopAllWorkers(): Promise<void> {
  await Promise.all(workers.map((w) => w.shutdown()));
  workers = [];
}
