import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z, ZodError } from 'zod';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

const RegisterSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])/, 'Password must contain a lowercase letter')
    .regex(/^(?=.*[A-Z])/, 'Password must contain an uppercase letter')
    .regex(/^(?=.*\d)/, 'Password must contain a number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

const excludePassword = (user: any) => {
  const { password, ...rest } = user;
  return rest;
};

const generateTokens = (userId: string, email: string) => {
  const token = jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET!,
    { expiresIn: (process.env.JWT_EXPIRY || '24h') as any, issuer: 'invoiceos', audience: 'invoiceos-client' }
  );

  const refreshToken = jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: '7d' as any }
  );

  return { token, refreshToken };
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = RegisterSchema.parse(req.body);
    const { email, password, name } = validated;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        businesses: {
          create: {
            name: `${name}'s Business`,
          }
        }
      },
      include: {
        businesses: true
      }
    });

    const { token, refreshToken } = generateTokens(user.id, user.email);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user: excludePassword(user), token });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.issues.map((e: any) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = LoginSchema.parse(req.body);
    const { email, password } = validated;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { businesses: true }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { token, refreshToken } = generateTokens(user.id, user.email);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: excludePassword(user), token });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.issues.map((e: any) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as { id: string; type: string };
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { businesses: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const { token: newToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.email);

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: excludePassword(user), token: newToken });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ success: true, message: 'Logged out successfully' });
};

export const me = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { businesses: true }
    });
    res.json(excludePassword(user));
  } catch (error) {
    next(error);
  }
};
