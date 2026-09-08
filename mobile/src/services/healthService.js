import api, { ApiError } from './api';

/**
 * Health service.
 *
 * NOTE: The existing CarbonTrust backend does not currently expose a
 * Personal Health module over REST. Per project rules, no backend behavior
 * is invented here — this service keeps a clearly-separated placeholder:
 * personal health data is stored **on-device only** (AsyncStorage, private
 * to the phone) until the backend provides real endpoints. Wire real
 * endpoints here when they exist.
 */

const STORAGE_KEY = 'ct.health.profile';

const EMPTY_PROFILE = {
  bloodGroup: '',
  allergies: '',
  conditions: '',
  medications: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  notes: '',
  updatedAt: null,
};

export const loadHealthProfile = async () => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_PROFILE };
    return { ...EMPTY_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_PROFILE };
  }
};

export const saveHealthProfile = async (profile) => {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  const next = { ...profile, updatedAt: new Date().toISOString() };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

/**
 * Environmental health readings.
 *
 * PLACEHOLDER: no backend endpoint exists yet. Returns a deterministic
 * sample reading so the UI is demonstrable. Replace the body with a real
 * API call (e.g. api.get('/environment/health')) when the backend ships it.
 */
export const getEnvironmentalHealth = async () => {
  // Simulated network latency for realistic skeleton loading.
  await new Promise((r) => setTimeout(r, 400));
  return {
    airQualityIndex: 42,
    airQualityLabel: 'Good',
    pollutionExposure: 'Low',
    environmentalRisk: 'Low',
    healthImpact: 'Minimal',
    pollenLevel: 'Moderate',
    updatedAt: new Date().toISOString(),
    trend: [38, 45, 41, 52, 47, 42, 39],
    recommendations: [
      'Great day for outdoor activities and tree-planting field work.',
      'Air quality is good — no masks needed for field visits.',
      'Stay hydrated during afternoon field measurements.',
    ],
  };
};

export default { loadHealthProfile, saveHealthProfile, getEnvironmentalHealth };
