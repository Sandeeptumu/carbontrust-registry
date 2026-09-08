import api, { ApiError } from './api';
import { ENDPOINTS } from '../constants/config';

/**
 * Auth service — talks to the EXISTING Spring Boot auth endpoints.
 * No fake authentication: everything below hits the real backend.
 */

export const login = async (email, password) => {
  const data = await api.post(ENDPOINTS.LOGIN, { email, password });
  return data; // { userId, username, email, role, token }
};

export const register = async (payload) => {
  // Backend UserRegistrationRequest: firstName, lastName, username, email,
  // phoneNumber, address, password, dateOfBirth(optional, yyyy-MM-dd)
  const body = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    username: payload.username,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    address: payload.address,
    password: payload.password,
  };
  if (payload.dateOfBirth) body.dateOfBirth = payload.dateOfBirth;
  const data = await api.post(ENDPOINTS.REGISTER, body);
  return data; // User entity (backend default role: BUYER)
};

export const getCurrentUser = async () => {
  return api.get(ENDPOINTS.ME); // { userId, username, email, role }
};

export const authErrorMessage = (err) => {
  if (err instanceof ApiError) {
    if (err.status === 0) return 'Unable to reach the CarbonTrust server. Is the backend running?';
    if (err.status === 400 && err.data && typeof err.data === 'object') {
      // Bean validation errors may arrive as a field map
      const fields = err.data;
      const first = Object.values(fields)[0];
      if (typeof first === 'string') return first;
    }
    return err.message;
  }
  return 'Something went wrong. Please try again.';
};
