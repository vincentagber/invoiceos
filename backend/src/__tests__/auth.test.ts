import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authRoutes from '../routes/auth.routes';
import prisma from '../lib/prisma';
import { errorHandler } from '../middlewares/errorHandler';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

let server: any;

beforeAll(async () => {
  server = app.listen(4001);
  // Clean test user if exists
  await prisma.user.deleteMany({ where: { email: 'test@example.com' } });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: 'test@example.com' } });
  await prisma.$disconnect();
  server.close();
});

describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'TestPass123',
        name: 'Test User',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).not.toHaveProperty('password');
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.businesses).toHaveLength(1);
  });

  it('should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'TestPass123',
        name: 'Test User',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });

  it('should reject weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'weak@example.com',
        password: 'short',
        name: 'Weak',
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should reject invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'not-an-email',
        password: 'TestPass123',
        name: 'Test User',
      });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'TestPass123',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should reject invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'WrongPass123',
      });

    expect(res.status).toBe(401);
  });

  it('should reject non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'TestPass123',
      });

    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/refresh', () => {
  it('should refresh token when valid cookie present', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'TestPass123' });

    const cookies = loginRes.headers['set-cookie'];
    expect(cookies).toBeDefined();

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookies as any);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should reject without refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh');

    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('should clear refresh token cookie', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(200);
    // Cookie should be cleared (max-age=0)
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
  });
});

describe('GET /api/auth/me', () => {
  it('should return authenticated user', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'TestPass123' });

    const token = loginRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@example.com');
    expect(res.body).not.toHaveProperty('password');
  });

  it('should reject unauthenticated requests', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
