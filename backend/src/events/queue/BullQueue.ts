import { Queue, QueueOptions, Job as BullJob, Worker as BullWorker, WorkerOptions } from 'bullmq';
import { IQueue, JobData } from '../interfaces/IQueue';
import { IWorker, JobHandler } from '../interfaces/IWorker';
import { getRedisConnection } from './RedisConnection';
import { logger } from '../../utils/logger';

const DEFAULT_ATTEMPTS = 5;
const DEFAULT_BACKOFF = { type: 'exponential' as const, delay: 2000 };

const sharedConnection = { connection: getRedisConnection() } as QueueOptions;

export class BullQueue implements IQueue {
  public readonly name: string;
  private queue: Queue;

  constructor(name: string) {
    this.name = name;
    this.queue = new Queue(name, sharedConnection);

    this.queue.on('error', (err) => {
      logger.error(`BullMQ queue ${name} error`, err);
    });
  }

  async add(data: JobData, options?: { delay?: number; attempts?: number; backoff?: { type: string; delay: number } }): Promise<void> {
    await this.queue.add(this.name, data, {
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
      attempts: options?.attempts ?? DEFAULT_ATTEMPTS,
      backoff: options?.backoff ?? DEFAULT_BACKOFF,
      delay: options?.delay,
    });
  }
}

export class BullWorkerAdapter implements IWorker {
  public readonly queueName: string;
  private worker: BullWorker;

  constructor(queueName: string, handler: JobHandler, options?: { concurrency?: number }) {
    this.queueName = queueName;

    this.worker = new BullWorker(
      queueName,
      async (job: BullJob<JobData>) => {
        const start = Date.now();
        const { eventName, eventId, correlationId } = job.data;

        logger.info(`Worker ${queueName} processing ${eventName} [${eventId}]`, {
          queue: queueName,
          eventName,
          eventId,
          correlationId,
          attempt: job.attemptsMade,
        });

        try {
          await handler(job.data);
          const duration = Date.now() - start;
          logger.info(`Worker ${queueName} completed ${eventName} [${eventId}] in ${duration}ms`, {
            queue: queueName,
            eventName,
            eventId,
            duration,
            correlationId,
          });
        } catch (error) {
          const duration = Date.now() - start;
          logger.error(`Worker ${queueName} failed ${eventName} [${eventId}] after ${duration}ms`, {
            queue: queueName,
            eventName,
            eventId,
            error: error instanceof Error ? error.message : String(error),
            correlationId,
            attemptsMade: job.attemptsMade,
          });
          throw error;
        }
      },
      {
        ...sharedConnection,
        concurrency: options?.concurrency ?? 3,
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 500 },
      } as WorkerOptions
    );

    this.worker.on('completed', (job) => {
      logger.debug(`BullMQ job ${job.id} completed on ${queueName}`);
    });

    this.worker.on('failed', (job, err) => {
      if (job) {
        logger.error(`BullMQ job ${job.id} failed on ${queueName} after ${job.attemptsMade} attempts: ${err.message}`);
      }
    });
  }

  async start(): Promise<void> {
    await this.worker.waitUntilReady();
    logger.info(`Worker ${this.queueName} started`);
  }

  async shutdown(): Promise<void> {
    await this.worker.close();
    logger.info(`Worker ${this.queueName} shut down`);
  }
}
