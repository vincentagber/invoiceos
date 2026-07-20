export interface JobData {
  eventName: string;
  eventId: string;
  correlationId: string;
  businessId?: string;
  actorId?: string;
  payload: unknown;
  retryCount: number;
}

export interface IQueue {
  readonly name: string;
  add(data: JobData, options?: { delay?: number; attempts?: number; backoff?: { type: string; delay: number } }): Promise<void>;
}
