export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    profilePicture: string | null;
    businesses: Array<{
      id: string;
      name: string;
    }>;
  };
  token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  profilePicture: string | null;
  businesses: Array<{
    id: string;
    name: string;
  }>;
}
