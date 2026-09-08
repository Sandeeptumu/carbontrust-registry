import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import * as authService from '../services/authService';
import { setAuthToken } from '../services/api';

/**
 * AuthContext — JWT session management for the existing Spring Boot backend.
 *
 * Security notes:
 * - JWT is stored in expo-secure-store (Keychain / Keystore) on native;
 *   localStorage-backed storage on web (demo parity).
 * - Role comes from the backend login/me response (never decoded client-side
 *   as a source of truth).
 * - 401 responses reset the session so protected screens re-authenticate.
 * - No sensitive values are ever logged.
 */

const AuthContext = createContext(null);

// Lightweight event bus for 401 session-expiry notifications.
const unauthorizedBus = { subscribe: () => () => {}, emit: () => {} };

// Web fallback: SecureStore is native-only.
const secureGet = async (key) => {
  if (Platform.OS === 'web') return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
};
const secureSet = async (key, value) => {
  if (Platform.OS === 'web') return localStorage.setItem(key, value);
  return SecureStore.setItemAsync(key, value);
};
const secureDelete = async (key) => {
  if (Platform.OS === 'web') return localStorage.removeItem(key);
  return SecureStore.deleteItemAsync(key);
};

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    checking: true, // bootstrapping persisted session
    loading: false, // login/register in-flight
    user: null, // { userId, username, email, role }
    token: null,
    error: null,
  });

  const applySession = useCallback((user, token) => {
    setAuthToken(token);
    setState((s) => ({ ...s, user, token, checking: false, loading: false, error: null }));
  }, []);

  const clearSession = useCallback(() => {
    setAuthToken(null);
    setState((s) => ({ ...s, user: null, token: null, checking: false, loading: false }));
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [token, userRaw] = await Promise.all([
          secureGet(STORAGE_KEYS.TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.USER),
        ]);
        if (!alive) return;
        if (token && userRaw) {
          const user = JSON.parse(userRaw);
          applySession(user, token);
          // Revalidate in the background against /users/me.
          authService
            .getCurrentUser()
            .then((fresh) => {
              if (alive && fresh && fresh.role) {
                applySession(fresh, token);
                AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(fresh)).catch(() => {});
              }
            })
            .catch(() => {
              // Keep cached session on transient failures; a 401 mid-use will
              // force sign-out via the interceptor below.
            });
        } else {
          clearSession();
        }
      } catch {
        if (alive) clearSession();
      }
    })();
    return () => {
      alive = false;
    };
  }, [applySession, clearSession]);

  const login = useCallback(
    async (email, password) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await authService.login(email.trim().toLowerCase(), password);
        await secureSet(STORAGE_KEYS.TOKEN, data.token);
        const user = {
          userId: data.userId,
          username: data.username,
          email: data.email,
          role: data.role,
        };
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        applySession(user, data.token);
        return { ok: true, user };
      } catch (err) {
        const message = authService.authErrorMessage(err);
        setState((s) => ({ ...s, loading: false, error: message }));
        return { ok: false, error: message };
      }
    },
    [applySession]
  );

  const register = useCallback(async (payload) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await authService.register(payload);
      setState((s) => ({ ...s, loading: false, error: null }));
      return { ok: true };
    } catch (err) {
      const message = authService.authErrorMessage(err);
      setState((s) => ({ ...s, loading: false, error: message }));
      return { ok: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await secureDelete(STORAGE_KEYS.TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch {}
    clearSession();
  }, [clearSession]);

  // Global 401 handling: any API call that reports 401 signs the user out.
  // Implemented with a tiny event emitter so it works on native (no window
  // EventTarget required) without depending on navigation state.
  useEffect(() => {
    const listeners = new Set();
    unauthorizedBus.subscribe = (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    };
    unauthorizedBus.emit = () => listeners.forEach((fn) => fn());
    const unsubscribe = unauthorizedBus.subscribe(() => {
      (async () => {
        try {
          await secureDelete(STORAGE_KEYS.TOKEN);
          await AsyncStorage.removeItem(STORAGE_KEYS.USER);
        } catch {}
        setAuthToken(null);
        clearSession();
      })();
    });
    return unsubscribe;
  }, [clearSession]);

  useEffect(() => {
    const originalFetch = global.fetch;
    if (!global.__ctFetchPatched) {
      global.__ctFetchPatched = true;
      global.fetch = async (...args) => {
        const res = await originalFetch(...args);
        if (res && res.status === 401) {
          unauthorizedBus.emit();
        }
        return res;
      };
    }
    return undefined;
  }, []);

  const value = useMemo(
    () => ({
      user: state.user,
      token: state.token,
      checking: state.checking,
      loading: state.loading,
      error: state.error,
      login,
      register,
      logout,
      clearError: () => setState((s) => ({ ...s, error: null })),
    }),
    [state, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
