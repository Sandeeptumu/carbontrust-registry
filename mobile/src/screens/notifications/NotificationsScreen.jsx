import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors } from '../../constants/theme';
import { useNotifications } from '../../hooks/useNotifications';
import { EmptyState, Card } from '../../components/ui';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { timeAgo } from '../../utils/format';

const TYPE_META = {
  purchase: { icon: 'bag-handle', color: Colors.emeraldDark, soft: Colors.emeraldSoft },
  retirement: { icon: 'lock-closed', color: Colors.forest, soft: Colors.surfaceMuted },
  mrv: { icon: 'document-text', color: Colors.info, soft: Colors.infoSoft },
  verification: { icon: 'shield-checkmark', color: Colors.warning, soft: Colors.warningSoft },
  credits: { icon: 'ribbon', color: Colors.success, soft: Colors.successSoft },
  project: { icon: 'leaf', color: Colors.emeraldDark, soft: Colors.emeraldSoft },
  info: { icon: 'information-circle', color: Colors.textSecondary, soft: Colors.surfaceMuted },
};

export default function NotificationsScreen() {
  const { items, unread, markAll, clearAll, refresh } = useNotifications();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={styles.headerPad} />
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <ScreenHeader
          title="Notifications"
          subtitle={unread > 0 ? `${unread} unread` : 'All caught up'}
          right={
            items.length > 0 ? (
              <Pressable onPress={markAll} style={styles.markBtn}>
                <Text style={styles.markText}>Mark all read</Text>
              </Pressable>
            ) : null
          }
        />

        {items.length === 0 ? (
          <EmptyState
            icon="notifications-off-outline"
            title="No notifications yet"
            message="Registry milestones — purchases, verifications, retirements — will appear here."
          />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }) => {
              const meta = TYPE_META[item.type] || TYPE_META.info;
              return (
                <Card style={[styles.item, !item.read && { borderColor: Colors.emerald, borderWidth: 1.4 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={[styles.icon, { backgroundColor: meta.soft }]}>
                      <Ionicons name={meta.icon} size={17} color={meta.color} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                        {!item.read ? <View style={styles.unreadDot} /> : null}
                      </View>
                      {item.body ? <Text style={styles.body} numberOfLines={2}>{item.body}</Text> : null}
                      <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
                    </View>
                  </View>
                </Card>
              );
            }}
            ListFooterComponent={
              items.length > 0 ? (
                <Pressable onPress={clearAll} style={styles.clearBtn}>
                  <Text style={styles.clearText}>Clear all notifications</Text>
                </Pressable>
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerPad: { height: 56 },
  markBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Theme.radius.pill,
    backgroundColor: Colors.emeraldSoft,
  },
  markText: { fontSize: 11.5, fontWeight: '800', color: Colors.emeraldDark },
  item: { marginBottom: 10 },
  icon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary, flex: 1 },
  body: { fontSize: 12.5, color: Colors.textSecondary, marginTop: 2, lineHeight: 18 },
  time: { fontSize: 11, color: Colors.textTertiary, marginTop: 4, fontWeight: '600' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.emerald, marginLeft: 8 },
  clearBtn: { alignItems: 'center', paddingVertical: 14 },
  clearText: { fontSize: 12.5, fontWeight: '700', color: Colors.danger },
});
