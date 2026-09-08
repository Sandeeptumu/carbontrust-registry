import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Local notification feed — a UI layer over registry events.
 *
 * NOTE: The existing backend has no notifications endpoint yet, so the app
 * records important local milestones (login, purchases, retirements, MRV
 * submissions, verifications) on-device. When the backend ships a
 * notifications API, replace the storage layer here — call sites stay
 * identical.
 */

const KEY = 'ct.notifications';
const MAX = 60;

export const getNotifications = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addNotification = async ({ id, title, body, type = 'info' }) => {
  try {
    const list = await getNotifications();
    const item = {
      id: id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      body,
      type,
      createdAt: new Date().toISOString(),
      read: false,
    };
    const next = [item, ...list].slice(0, MAX);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    return item;
  } catch {
    return null;
  }
};

export const markAllRead = async () => {
  try {
    const list = await getNotifications();
    await AsyncStorage.setItem(
      KEY,
      JSON.stringify(list.map((n) => ({ ...n, read: true })))
    );
  } catch {}
};

export const markRead = async (id) => {
  try {
    const list = await getNotifications();
    await AsyncStorage.setItem(
      KEY,
      JSON.stringify(list.map((n) => (n.id === id ? { ...n, read: true } : n)))
    );
  } catch {}
};

export const clearNotifications = async () => {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
};

export const unreadCount = async () => {
  const list = await getNotifications();
  return list.filter((n) => !n.read).length;
};
