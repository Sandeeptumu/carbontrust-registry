/**
 * Centralized API configuration.
 *
 * Change BASE_URL here — nothing else needs to move — when:
 *  - running on a physical phone (use your computer's LAN IP, e.g. 192.168.x.x)
 *  - pointing at a deployed backend
 *
 * Platform notes:
 *  - Android emulator maps host loopback to 10.0.2.2
 *  - iOS Simulator and web share the machine's own localhost
 */
import { Platform } from 'react-native';

const DEV_DESKTOP = 'http://localhost:8080';
const DEV_ANDROID_EMULATOR = 'http://10.0.2.2:8080';

// For a physical phone, set to your computer's LAN IP, e.g. 'http://192.168.1.20:8080'
const DEV_PHYSICAL_DEVICE = 'http://192.168.1.20:8080';

// 'desktop' | 'physical'
const DEV_TARGET = 'desktop';

const DEV_TARGET_URL = DEV_TARGET === 'physical' ? DEV_PHYSICAL_DEVICE : DEV_DESKTOP;

export const BASE_URL =
  DEV_TARGET === 'desktop' && Platform.OS === 'android'
    ? DEV_ANDROID_EMULATOR
    : DEV_TARGET_URL;

export const API_TIMEOUT_MS = 15000;

export const STORAGE_KEYS = {
  TOKEN: 'ct.auth.token',
  USER: 'ct.auth.user',
  HEALTH_PROFILE: 'ct.health.profile',
  NOTIFICATIONS: 'ct.notifications',
};

export const ENDPOINTS = {
  // Auth — existing UserController
  REGISTER: '/users/register',
  LOGIN: '/users/login',
  ME: '/users/me',

  // Projects — existing ProjectController (NGO role)
  PROJECTS: '/projects',
  project: (id) => `/projects/${id}`,

  // MRV — existing MRVSubmissionController (NGO role)
  mrvSubmissions: (projectId) => `/projects/${projectId}/mrv`,

  // Verifier workspace — existing VerifierWorkspaceController (VERIFIER role)
  VERIFIER_MRV: '/verifier/mrv',
  verifierMrvByStatus: (status) => `/verifier/mrv?status=${status}`,
  VERIFIER_HISTORY: '/verifier/verifications',

  // Verification — existing VerificationController (VERIFIER role)
  verifyMrv: (mrvId) => `/verifier/mrv/${mrvId}/verify`,
  mrvVerifications: (mrvId) => `/verifier/mrv/${mrvId}/verifications`,

  // Credit batches — existing CarbonCreditBatchController
  issueCredits: (projectId) => `/projects/${projectId}/carbon-credits`,
  projectCredits: (projectId) => `/projects/${projectId}/carbon-credits`,

  // Marketplace — existing MarketplaceController
  MARKETPLACE_CREDITS: '/marketplace/credits',
  marketplaceProject: (projectId) => `/marketplace/projects/${projectId}`,

  // Buyer — existing PurchaseController + RetirementController (BUYER role)
  purchaseCredits: (ccbId) => `/buyer/carbon-credits/${ccbId}/purchase`,
  BUYER_PURCHASES: '/buyer/purchases',
  retireCredits: (purchaseId) => `/buyer/purchases/${purchaseId}/retire`,
  BUYER_RETIREMENTS: '/buyer/retirements',

  // Admin — existing AdminController (ADMIN role)
  ADMIN_STATS: '/admin/stats',
  ADMIN_USERS: '/admin/users',
  ADMIN_PROJECTS: '/admin/projects',
  ADMIN_CREDITS: '/admin/credits',
  ADMIN_PURCHASES: '/admin/purchases',
  ADMIN_RETIREMENTS: '/admin/retirements',
};

export default { BASE_URL, API_TIMEOUT_MS, STORAGE_KEYS, ENDPOINTS };
