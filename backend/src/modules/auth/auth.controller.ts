import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, tokens } = await authService.register(req.body);

      res.cookie('refresh_token', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(201).json({ user, token: tokens.token });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, tokens } = await authService.login(req.body);

      res.cookie('refresh_token', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

      res.json({ user, token: tokens.token });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refresh_token;
      if (!token) {
        return res.status(401).json({ message: 'Refresh token required' });
      }

      const { user, tokens } = await authService.refreshToken(token);

      res.cookie('refresh_token', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

      res.json({ user, token: tokens.token });
    } catch (error) {
      next(error);
    }
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.json({ success: true, message: 'Logged out successfully' });
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },
};
