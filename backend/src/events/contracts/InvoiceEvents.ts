import { DomainEvent, createEventId } from './BaseEvent';

export const EVENT_INVOICE_CREATED = 'invoice.created';

export interface InvoiceCreatedPayload {
  invoiceId: string;
  invoiceNumber: string;
  businessId: string;
  clientId: string;
  totalAmount: number;
  currency: string;
  status: string;
  issueDate: string;
  dueDate: string;
}

export function createInvoiceCreatedEvent(
  payload: InvoiceCreatedPayload,
  meta?: { correlationId?: string; actorId?: string }
): DomainEvent {
  return {
    eventId: createEventId(),
    eventName: EVENT_INVOICE_CREATED,
    version: 1,
    timestamp: new Date(),
    correlationId: meta?.correlationId || createEventId(),
    businessId: payload.businessId,
    actorId: meta?.actorId,
    payload,
  };
}
