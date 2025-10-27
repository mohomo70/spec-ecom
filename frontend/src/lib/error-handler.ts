/**
 * Error handling utilities for freshwater fish ecommerce platform.
 */

import { AxiosError } from 'axios';
import { authService } from './auth';

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
}

export class AuthError extends Error {
  public code?: string;
  public details?: any;
  public status?: number;

  constructor(message: string, code?: string, details?: any, status?: number) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

export class TokenExpiredError extends AuthError {
  constructor() {
    super('Token has expired', 'TOKEN_EXPIRED');
    this.name = 'TokenExpiredError';
  }
}

export class AuthenticationError extends AuthError {
  constructor(message: string = 'Authentication failed', code?: string) {
    super(message, code);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AuthError {
  constructor(message: string = 'Access denied', code?: string) {
    super(message, code);
    this.name = 'AuthorizationError';
  }
}

/**
 * Handle authentication errors gracefully
 */
export function handleAuthError(error: AxiosError): AuthError {
  const response = error.response;
  
  if (!response) {
    return new AuthError('Network error', 'NETWORK_ERROR');
  }

  const errorData: ErrorResponse = response.data;
  const status = response.status;

  switch (status) {
    case 401:
      if (errorData.code === 'TOKEN_EXPIRED') {
        return new TokenExpiredError();
      }
      return new AuthenticationError(errorData.error || 'Authentication failed', errorData.code);
    
    case 403:
      return new AuthorizationError(errorData.error || 'Access denied', errorData.code);
    
    case 429:
      return new AuthError('Too many requests. Please try again later.', 'RATE_LIMITED', errorData.details, status);
    
    case 500:
      return new AuthError('Server error. Please try again later.', 'SERVER_ERROR', errorData.details, status);
    
    default:
      return new AuthError(errorData.error || 'An error occurred', errorData.code, errorData.details, status);
  }
}

/**
 * Handle token expiration gracefully
 */
export async function handleTokenExpiration(): Promise<boolean> {
  try {
    // Attempt to refresh the token
    const success = await authService.refreshToken();
    
    if (success) {
      return true;
    } else {
      // Refresh failed, redirect to login
      await authService.logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return false;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    await authService.logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return false;
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: AuthError): string {
  switch (error.code) {
    case 'TOKEN_EXPIRED':
      return 'Your session has expired. Please log in again.';
    
    case 'INVALID_CREDENTIALS':
      return 'Invalid email or password. Please check your credentials.';
    
    case 'RATE_LIMITED':
      return 'Too many login attempts. Please wait a moment before trying again.';
    
    case 'NETWORK_ERROR':
      return 'Unable to connect to the server. Please check your internet connection.';
    
    case 'SERVER_ERROR':
      return 'Something went wrong on our end. Please try again later.';
    
    case 'VALIDATION_ERROR':
      return 'Please check your input and try again.';
    
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Log error for debugging
 */
export function logError(error: Error, context?: string): void {
  const errorInfo = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  };
  
  console.error('Error logged:', errorInfo);
  
  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, etc.
}
