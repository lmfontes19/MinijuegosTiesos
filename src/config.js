// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Application configuration
export const APP_CONFIG = {
  appName: 'MinijuegosTiesos',
  version: '1.0.0',
  supportEmail: 'support@minijuegostiesos.com'
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  USER_DATA: 'userData',
  THEME: 'theme'
};

// Application routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  EARN: '/dashboard/earn',
  WALLET: '/dashboard/wallet',
  PROFILE: '/dashboard/profile',
  TASKS: {
    CLICK: '/dashboard/earn/clicks',
    CLICK_DETAIL: '/dashboard/earn/clicks/:id',
    SURVEY: '/dashboard/earn/surveys',
    SURVEY_DETAIL: '/dashboard/earn/surveys/:id',
    OFFERS: '/dashboard/earn/offers'
  }
}; 