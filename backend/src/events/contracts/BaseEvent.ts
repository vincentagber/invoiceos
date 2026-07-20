export interface DomainEvent {
  eventId: string;
  eventName: string;
  version: number;
  timestamp: Date;
  correlationId: string;
  businessId?: string;
  actorId?: string;
  payload: unknown;
}

export const createEventId = (): string => {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 10);
  return `evt_${ts}_${rand}`;
};

export const createCorrelationId = (): string => {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 10);
  return `cor_${ts}_${rand}`;
};
