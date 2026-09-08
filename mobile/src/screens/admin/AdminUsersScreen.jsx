import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors, RoleMeta } from '../../constants/theme';
import { getAdminUsers } from '../../services/registryService';
import { ApiError } from '../../services/api';
import { roleLabel, formatDate } from '../../utils/format';
import { ListSkeleton, ErrorState, EmptyState, Card, Badge } from '../../components/ui';
import { ScreenHeader, Avatar, KVRow } from '../../components/layout/ScreenHeader';
import { StaggerItem } from '../../components/animated/AnimatedCountUp';

const ROLE_FILTERS = ['ALL', 'BUYER', 'NGO', 'VERIFIER', 'ADMIN', 'USER', 'HEALTHCARE_ADVISOR'];

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('ALL');

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getAdminUsers();
      setUsers(data || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filtered = useMemo(() => {
    let list = users;
    if (role !== 'ALL') list = list.filter((u) => (u.role || '').toUpperCase() === role);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          (u.username || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, role, query]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={styles.headerPad} />
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <ScreenHeader title="User Directory" subtitle={`${users.length} registered account${users.length === 1 ? '' : 's'}`} />

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={17} color={Colors.textTertiary} style={{ marginRight: 8 }} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search name, username, email…"
            placeholderTextColor={Colors.textTertiary}
            style={{ flex: 1, fontSize: 14, color: Colors.textPrimary, paddingVertical: 10 }}
          />
        </View>

        <View style={styles.filters}>
          {ROLE_FILTERS.map((r) => (
            <PressableChip key={r} label={r === 'ALL' ? 'All' : roleLabel(r)} active={role === r} onPress={() => setRole(r)} />
          ))}
        </View>

        {loading ? (
          <ListSkeleton count={5} height={90} />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.userId)}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item, index }) => {
              const meta = RoleMeta[(item.role || '').toUpperCase()] || RoleMeta.USER;
              return (
                <StaggerItem index={Math.min(index, 6)}>
                  <Card style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Avatar name={`${item.firstName || ''} ${item.lastName || ''}`.trim() || item.username} size={44} color={meta.color} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ fontSize: 14.5, fontWeight: '800', color: Colors.textPrimary }} numberOfLines={1}>
                          {item.username}
                        </Text>
                        <Text style={{ fontSize: 12, color: Colors.textTertiary }} numberOfLines={1}>
                          {item.email}
                        </Text>
                      </View>
                      <Badge label={meta.label} color={meta.color} soft={meta.soft} />
                    </View>
                    <View style={{ marginTop: 8 }}>
                      <KVRow k="Name" v={`${item.firstName || ''} ${item.lastName || ''}`.trim() || '—'} />
                      <KVRow k="Joined" v={formatDate(item.createdAt)} last />
                    </View>
                  </Card>
                </StaggerItem>
              );
            }}
            ListEmptyComponent={
              <EmptyState icon="people-outline" title="No users found" message="Adjust your search or role filter." />
            }
          />
        )}
      </View>
    </View>
  );
}

function PressableChip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && { backgroundColor: Colors.forest, borderColor: Colors.forest }]}
    >
      <Text style={[styles.chipText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerPad: { height: 56 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Theme.radius.md,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  filters: { flexDirection: 'row', gap: 7, marginBottom: 16, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: Theme.radius.pill,
    borderWidth: 1.2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
});
