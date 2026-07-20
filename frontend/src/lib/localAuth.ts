import api from './api';

export interface LocalSession {
  user: {
    id: string;
    email: string;
    user_metadata: { full_name?: string; avatar_url?: string };
    businesses?: Array<{ id: string; name: string }>;
  };
  access_token: string;
  refresh_token?: string;
}

export const localAuth = {
  async signInWithPassword(email: string, password: string): Promise<{ data: { session: LocalSession } | null; error: Error | null }> {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      const session: LocalSession = {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          user_metadata: { full_name: user.name },
          businesses: user.businesses,
        },
      };
      localStorage.setItem('token', token);
      localStorage.setItem('localUser', JSON.stringify(session));
      return { data: { session }, error: null };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Invalid email or password';
      return { data: null, error: new Error(message) };
    }
  },

  async signUp(email: string, password: string, name: string): Promise<{ data: { session: LocalSession } | null; error: Error | null }> {
    try {
      const response = await api.post('/auth/register', { email, password, name });
      const { user, token } = response.data;
      const session: LocalSession = {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          user_metadata: { full_name: user.name },
          businesses: user.businesses,
        },
      };
      localStorage.setItem('token', token);
      localStorage.setItem('localUser', JSON.stringify(session));
      return { data: { session }, error: null };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to create account';
      return { data: null, error: new Error(message) };
    }
  },

  async signOut(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('localUser');
  },

  getSession(): { data: { session: LocalSession | null } } {
    try {
      const stored = localStorage.getItem('localUser');
      if (stored) {
        return { data: { session: JSON.parse(stored) } };
      }
    } catch {}
    return { data: { session: null } };
  },
};
