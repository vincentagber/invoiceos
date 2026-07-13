import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import invoiceRoutes from '../routes/invoice.routes';
import prisma from '../lib/prisma';
import { errorHandler } from '../middlewares/errorHandler';

const app = express();
app.use(express.json());
app.use('/api/invoices', invoiceRoutes);
app.use(errorHandler);

let server: any;
let testToken: string;
let testBusinessId: string;
let testClientId: string;
let testInvoiceId: string;
let testPaymentId: string;

beforeAll(async () => {
  server = app.listen(4003);

  const user = await prisma.user.create({
    data: {
      email: 'payment-test@example.com',
      password: '$2a$12$dummyhash',
      name: 'Payment Test',
    },
  });

  const business = await prisma.business.create({
    data: { name: 'Payment Test Biz', ownerId: user.id },
  });
  testBusinessId = business.id;

  const client = await prisma.client.create({
    data: { businessId: testBusinessId, name: 'Payment Client', email: 'pay@example.com' },
  });
  testClientId = client.id;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'PAY-TEST-001',
      businessId: testBusinessId,
      clientId: testClientId,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      totalAmount: 500,
      status: 'SENT',
    },
  });
  testInvoiceId = invoice.id;

  testToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '1h', issuer: 'invoiceos', audience: 'invoiceos-client' }
  );
});

afterAll(async () => {
  await prisma.payment.deleteMany({ where: { invoiceId: testInvoiceId } });
  await prisma.invoice.deleteMany({ where: { id: testInvoiceId } });
  await prisma.client.deleteMany({ where: { id: testClientId } });
  await prisma.business.deleteMany({ where: { id: testBusinessId } });
  await prisma.user.deleteMany({ where: { email: 'payment-test@example.com' } });
  await prisma.$disconnect();
  server.close();
});

describe('Payment Processing', () => {
  it('should add a partial payment', async () => {
    const res = await request(app)
      .post(`/api/invoices/${testInvoiceId}/payments`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        amount: 200,
        method: 'CARD',
        transactionId: 'txn_123',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('SUCCESS');
    expect(res.body.amount).toBe(200);
    testPaymentId = res.body.id;

    // Invoice should now be PARTIAL
    const invRes = await request(app)
      .get(`/api/invoices/${testInvoiceId}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(invRes.body.status).toBe('PARTIAL');
  });

  it('should add remaining payment and mark invoice as PAID', async () => {
    const res = await request(app)
      .post(`/api/invoices/${testInvoiceId}/payments`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        amount: 300,
        method: 'BANK_TRANSFER',
        transactionId: 'txn_456',
      });

    expect(res.status).toBe(201);

    const invRes = await request(app)
      .get(`/api/invoices/${testInvoiceId}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(invRes.body.status).toBe('PAID');
  });

  it('should reject payment without amount', async () => {
    const res = await request(app)
      .post(`/api/invoices/${testInvoiceId}/payments`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ method: 'CARD' });

    // Zod validation or prisma should catch this (amount is required)
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('should reject payment on non-existent invoice', async () => {
    const res = await request(app)
      .post('/api/invoices/nonexistent-id/payments')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ amount: 100, method: 'CARD' });

    expect(res.status).toBe(404);
  });
});
