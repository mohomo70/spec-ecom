import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_joined: string;
  is_active: boolean;
}

interface UserProfile {
  experience_level: string;
  preferred_tank_size?: number;
  newsletter_subscribed: boolean;
  marketing_emails: boolean;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (user: User, profile: UserProfile, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateProfile: (profile: UserProfile) => void;
  updateUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  refreshTokens: (accessToken: string, refreshToken?: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user: User, profile: UserProfile, accessToken: string, refreshToken: string) => {
        set({
          user,
          profile,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });

        // Store tokens in localStorage for API client
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', accessToken);
        }
      },

      logout: () => {
        set({
          user: null,
          profile: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // Clear tokens from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
      },

      updateProfile: (profile: UserProfile) => {
        set({ profile });
      },

      updateUser: (user: User) => {
        set({ user });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      refreshTokens: (accessToken: string, refreshToken?: string) => {
        set({
          accessToken,
          refreshToken: refreshToken || get().refreshToken,
        });

        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', accessToken);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);