import { useCallback, useEffect, useState } from 'react';
import {
  getNotifications,
  addNotification,
  markAllRead,
  markRead,
  clearNotifications,
  unreadCount,
} from '../services/notificationService';

export function useNotifications(poll = false) {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    const list = await getNotifications();
    setItems(list);
    setUnread(list.filter((n) => !n.read).length);
  }, []);

  useEffect(() => {
    refresh();
    if (!poll) return undefined;
    const t = setInterval(refresh, 8000);
    return () => clearInterval(t);
  }, [refresh, poll]);

  const add = useCallback(
    async (payload) => {
      await addNotification(payload);
      refresh();
    },
    [refresh]
  );

  const markAll = useCallback(async () => {
    await markAllRead();
    refresh();
  }, [refresh]);

  const markOne = useCallback(
    async (id) => {
      await markRead(id);
      refresh();
    },
    [refresh]
  );

  const clearAll = useCallback(async () => {
    await clearNotifications();
    refresh();
  }, [refresh]);

  return { items, unread, add, markAll, markOne, clearAll, refresh, unreadCountRef: unreadCount };
}

export default useNotifications;
