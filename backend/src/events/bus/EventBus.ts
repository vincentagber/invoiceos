import { IEventBus, EventHandler } from '../interfaces/IEventBus';
import { IQueue } from '../interfaces/IQueue';
import { DomainEvent } from '../contracts/BaseEvent';
import { logger } from '../../utils/logger';

const queueMap = new Map<string, IQueue>();
const topics = new Set<string>();

export function registerQueue(eventName: string, queue: IQueue): void {
  queueMap.set(eventName, queue);
}

export function registerTopic(eventName: string): void {
  topics.add(eventName);
}

export const eventBus: IEventBus = {
  async publish(event: DomainEvent): Promise<void> {
    const queue = queueMap.get(event.eventName);

    if (!queue) {
      if (topics.has(event.eventName)) {
        return;
      }
      logger.warn(`No queue registered for event ${event.eventName} — dropping event ${event.eventId}`);
      return;
    }

    await queue.add({
      eventName: event.eventName,
      eventId: event.eventId,
      correlationId: event.correlationId,
      businessId: event.businessId,
      actorId: event.actorId,
      payload: event.payload,
      retryCount: 0,
    });

    logger.info(`Event ${event.eventName} [${event.eventId}] published to queue ${queue.name}`, {
      eventName: event.eventName,
      eventId: event.eventId,
      correlationId: event.correlationId,
      businessId: event.businessId,
      queue: queue.name,
    });
  },

  subscribe(_eventName: string, _handler: EventHandler): void {
    // Synchronous subscribers handled by registering queues + workers.
    // This method exists for in-process subscribers if needed in the future.
    logger.warn(`Direct subscription not implemented. Use queue + worker pattern instead for ${_eventName}`);
  },
};
