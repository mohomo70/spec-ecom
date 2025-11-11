/**
 * Authentication utilities for freshwater fish ecommerce platform.
 */

import { api } from './api';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'admin';
  date_joined: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Authentication service class
 */
export class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
  };

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAuth();
    } else {
      this.authState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async initializeAuth(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        this.authState = {
          user: null,
          isAuthenticated: false,
          isLoading: false,
        };
        return;
      }

      const response = await api.get('/auth/me/');
      if (response.status === 200) {
        this.authState = {
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
        };
      } else {
        // Invalid token, clear it
        localStorage.removeItem('token');
        this.authState = {
          user: null,
          isAuthenticated: false,
          isLoading: false,
        };
      }
    } catch (error: any) {
      // Extract error details safely
      const status = error?.response?.status;
      const errorData = error?.response?.data;
      const errorMessage = error?.message;
      
      // Only log if it's not a 401/403/404 (expected for invalid/missing tokens)
      if (status && status !== 401 && status !== 403 && status !== 404) {
        const logData = errorData || errorMessage || (typeof error === 'object' ? JSON.stringify(error) : error);
        console.error('Auth initialization error:', logData);
      }
      
      // Clear invalid token for auth errors
      if (status === 401 || status === 403) {
        localStorage.removeItem('token');
      }
      
      this.authState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    }
  }

  /**
   * Login user
   */
  public async login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User; token?: string }> {
    try {
      const response = await api.post('/auth/login/', { email, password });
      
      if (response.status === 200 && response.data.token) {
        localStorage.setItem('token', response.data.token);
        this.authState = {
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        };
        return { success: true, user: response.data.user, token: response.data.token };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
    }
    
    return { success: false, error: 'Login failed. Please try again.' };
  }

  public async register(email: string, password: string, firstName: string, lastName: string): Promise<{ success: boolean; error?: string; user?: User; token?: string }> {
    try {
      const response = await api.post('/auth/register/', { 
        email, 
        password, 
        password_confirm: password,
        first_name: firstName,
        last_name: lastName
      });
      
      if (response.status === 201 && response.data.token) {
        localStorage.setItem('token', response.data.token);
        this.authState = {
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        };
        return { success: true, user: response.data.user, token: response.data.token };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || 'Registration failed. Please try again.';
      return { success: false, error: errorMessage };
    }
    
    return { success: false, error: 'Registration failed. Please try again.' };
  }

  public async getProfile(): Promise<User | null> {
    try {
      const response = await api.get('/auth/me/');
      if (response.status === 200) {
        this.authState.user = response.data;
        return response.data;
      }
    } catch (error) {
      console.error('Get profile error:', error);
    }
    return null;
  }

  public async updateProfile(data: Partial<User>): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const response = await api.patch('/auth/me/', data);
      if (response.status === 200) {
        this.authState.user = response.data;
        return { success: true, user: response.data };
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update profile.';
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Failed to update profile.' };
  }

  /**
   * Logout user
   */
  public async logout(): Promise<void> {
    try {
      // Optionally call logout endpoint if it exists
      await api.post('/auth/logout/').catch(() => {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth state regardless of API response
      this.authState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
      
      // Clear any stored tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    }
  }

  /**
   * Refresh access token
   */
  public async refreshToken(): Promise<boolean> {
    try {
      const response = await api.post('/auth/refresh/', {});
      return response.status === 200;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  public getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  /**
   * Get current user
   */
  public getCurrentUser(): User | null {
    return this.authState.user;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  /**
   * Check if user is admin
   */
  public isAdmin(): boolean {
    return this.authState.user?.role === 'admin';
  }

  /**
   * Get authentication state
   */
  public getAuthState(): AuthState {
    return { ...this.authState };
  }

  /**
   * Check if auth is loading
   */
  public isLoading(): boolean {
    return this.authState.isLoading;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// Export convenience functions
export const login = (email: string, password: string) => authService.login(email, password);
export const register = (email: string, password: string, firstName: string, lastName: string) => authService.register(email, password, firstName, lastName);
export const logout = () => authService.logout();
export const getProfile = () => authService.getProfile();
export const updateProfile = (data: Partial<User>) => authService.updateProfile(data);
export const getCurrentUser = () => authService.getCurrentUser();
export const isAuthenticated = () => authService.isAuthenticated();
export const isAdmin = () => authService.isAdmin();
export const getAuthState = () => authService.getAuthState();
export const isLoading = () => authService.isLoading();
export const getToken = () => authService.getToken();
