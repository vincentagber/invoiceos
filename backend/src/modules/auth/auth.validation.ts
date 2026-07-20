import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])/, 'Password must contain a lowercase letter')
    .regex(/^(?=.*[A-Z])/, 'Password must contain an uppercase letter')
    .regex(/^(?=.*\d)/, 'Password must contain a number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});
