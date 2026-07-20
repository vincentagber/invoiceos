import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { authRepository } from './auth.repository';
import { AuthTokens, AuthResponse, RegisterDTO, LoginDTO } from './auth.types';
import { ConflictError, UnauthorizedError } from '../../shared/errors';

const generateTokens = (userId: string, email: string): AuthTokens => {
  const token = jwt.sign(
    { id: userId, email },
    env.jwt.secret,
    {
      expiresIn: env.jwt.expiry as unknown as number,
      issuer: env.jwt.issuer,
      audience: env.jwt.audience,
    },
  );

  const refreshToken = jwt.sign(
    { id: userId, type: 'refresh' as const },
    env.jwt.refreshSecret,
    { expiresIn: '7d' as any },
  );

  return { token, refreshToken };
};

const excludePassword = <T extends { password?: string }>(user: T): Omit<T, 'password'> => {
  const { password, ...rest } = user;
  return rest;
};

export const authService = {
  async register(input: RegisterDTO): Promise<{ user: AuthResponse['user']; tokens: AuthTokens }> {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);
    const user = await authRepository.createWithBusiness({
      email: input.email,
      password: hashedPassword,
      name: input.name,
    });

    const tokens = generateTokens(user.id, user.email);

    return {
      user: excludePassword(user) as AuthResponse['user'],
      tokens,
    };
  },

  async login(input: LoginDTO): Promise<{ user: AuthResponse['user']; tokens: AuthTokens }> {
    const user = await authRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(input.password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = generateTokens(user.id, user.email);

    return {
      user: excludePassword(user) as AuthResponse['user'],
      tokens,
    };
  },

  async refreshToken(token: string): Promise<{ user: AuthResponse['user']; tokens: AuthTokens }> {
    let decoded: { id: string; type: string };
    try {
      decoded = jwt.verify(token, env.jwt.refreshSecret) as { id: string; type: string };
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const user = await authRepository.findByIdWithBusinesses(decoded.id);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const tokens = generateTokens(user.id, user.email);

    return {
      user: excludePassword(user) as AuthResponse['user'],
      tokens,
    };
  },

  async getProfile(userId: string) {
    const user = await authRepository.findByIdWithBusinesses(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    return excludePassword(user) as AuthResponse['user'];
  },
};
