import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import invoiceRoutes from '../routes/invoice.routes';
import clientRoutes from '../routes/client.routes';
import prisma from '../lib/prisma';
import { errorHandler } from '../middlewares/errorHandler';

const app = express();
app.use(express.json());
app.use('/api/invoices', invoiceRoutes);
app.use('/api/clients', clientRoutes);
app.use(errorHandler);

let server: any;
let testToken: string;
let testBusinessId: string;
let testClientId: string;
let testInvoiceId: string;

beforeAll(async () => {
  server = app.listen(4002);

  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'invoice-test@example.com',
      password: '$2a$12$dummyhash',
      name: 'Invoice Test',
    },
  });

  // Create test business
  const business = await prisma.business.create({
    data: {
      name: 'Test Business',
      ownerId: user.id,
    },
  });
  testBusinessId = business.id;

  // Create test client
  const client = await prisma.client.create({
    data: {
      businessId: testBusinessId,
      name: 'Test Client',
      email: 'client@example.com',
    },
  });
  testClientId = client.id;

  // Generate test token
  testToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '1h', issuer: 'invoiceos', audience: 'invoiceos-client' }
  );
});

afterAll(async () => {
  await prisma.invoiceItem.deleteMany({ where: { invoice: { businessId: testBusinessId } } });
  await prisma.payment.deleteMany({ where: { invoice: { businessId: testBusinessId } } });
  await prisma.invoice.deleteMany({ where: { businessId: testBusinessId } });
  await prisma.client.deleteMany({ where: { businessId: testBusinessId } });
  await prisma.business.deleteMany({ where: { id: testBusinessId } });
  await prisma.user.deleteMany({ where: { email: 'invoice-test@example.com' } });
  await prisma.$disconnect();
  server.close();
});

describe('Invoice CRUD', () => {
  it('should create an invoice', async () => {
    const res = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        businessId: testBusinessId,
        clientId: testClientId,
        currency: 'USD',
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        totalAmount: 1000,
        items: [
          { description: 'Service A', quantity: 1, unitPrice: 1000 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('DRAFT');
    expect(res.body.items).toHaveLength(1);
    testInvoiceId = res.body.id;
  });

  it('should list invoices for the business', async () => {
    const res = await request(app)
      .get(`/api/invoices?businessId=${testBusinessId}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.pagination).toBeDefined();
  });

  it('should get a single invoice', async () => {
    const res = await request(app)
      .get(`/api/invoices/${testInvoiceId}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(testInvoiceId);
    expect(res.body.client).toBeDefined();
    expect(res.body.items).toBeDefined();
    expect(res.body.payments).toBeDefined();
  });

  it('should update invoice status', async () => {
    const res = await request(app)
      .patch(`/api/invoices/${testInvoiceId}/status`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ status: 'SENT' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('SENT');
  });

  it('should reject unauthorized access to another business', async () => {
    const res = await request(app)
      .get(`/api/invoices?businessId=nonexistent-business`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.status).toBe(403);
  });

  it('should reject requests without auth token', async () => {
    const res = await request(app)
      .get('/api/invoices');

    expect(res.status).toBe(401);
  });

  it('should delete an invoice', async () => {
    const res = await request(app)
      .delete(`/api/invoices/${testInvoiceId}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.status).toBe(200);
  });
});
