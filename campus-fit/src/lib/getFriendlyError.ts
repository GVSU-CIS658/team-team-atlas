import { ApiError } from './api';

export interface FriendlyError {
  message: string;
  code?: string;
  status?: number;
  isAuth: boolean;
}

export function getFriendlyError(err: unknown): FriendlyError {
  if (err instanceof ApiError) {
    switch (err.code) {
      case 'UNAUTHORIZED':
        return {
          message: 'Your session has expired. Please sign back in to continue.',
          code: err.code,
          status: err.status,
          isAuth: true,
        };
      case 'FORBIDDEN':
        return {
          message: "You don't have permission to view this.",
          code: err.code,
          status: err.status,
          isAuth: false,
        };
      case 'NOT_FOUND':
        return {
          message: "We couldn't find what you were looking for.",
          code: err.code,
          status: err.status,
          isAuth: false,
        };
      case 'RATE_LIMITED':
        return {
          message: "You're moving fast! Please wait a moment and try again.",
          code: err.code,
          status: err.status,
          isAuth: false,
        };
      case 'VALIDATION_ERROR':
        return {
          message: 'Something about your request looks off. Please try again.',
          code: err.code,
          status: err.status,
          isAuth: false,
        };
      case 'INTERNAL_ERROR':
      default:
        return {
          message: 'Something went wrong on our end. Please try again in a moment.',
          code: err.code,
          status: err.status,
          isAuth: false,
        };
    }
  }

  return {
    message: 'We had trouble reaching the server. Please check your connection and try again.',
    isAuth: false,
  };
}
