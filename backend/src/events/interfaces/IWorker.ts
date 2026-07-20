import type { JobData } from './IQueue';

export type JobHandler = (data: JobData) => Promise<void>;

export interface IWorker {
  readonly queueName: string;
  start(): Promise<void>;
  shutdown(): Promise<void>;
}
