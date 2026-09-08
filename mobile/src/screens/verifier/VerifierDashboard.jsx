import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { getVerifierQueue, getVerifierHistory } from '../../services/registryService';
import { ApiError } from '../../services/api';
import { greeting, timeAgo } from '../../utils/format';
import { StatCard, Card, SectionHeader, ListSkeleton, ErrorState, EmptyState, Badge } from '../../components/ui';
import { ScreenHeader, Avatar } from '../../components/layout/ScreenHeader';
import { MrvCard } from '../../components/registry/ProjectCard';
import { StaggerItem } from '../../components/animated/AnimatedCountUp';

const QUEUE_FILTERS = [
  { key: '', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
];

export default function VerifierDashboard({ navigation }) {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try {
      const [q, h] = await Promise.all([getVerifierQueue(), getVerifierHistory()]);
      setQueue(q || []);
      setHistory(h || []);
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

  const stats = useMemo(() => {
    const count = (s) => (queue || []).filter((x) => (x.mrvStatus || '').toUpperCase() === s).length;
    return {
      pending: count('PENDING') + count('UNDER_REVIEW'),
      approved: count('APPROVED'),
      rejected: count('REJECTED'),
      total: (queue || []).length,
    };
  }, [queue]);

  const filtered = useMemo(
    () => (filter ? (queue || []).filter((x) => (x.mrvStatus || '').toUpperCase() === filter) : queue || []),
    [queue, filter]
  );

  if (loading) {
    return (
      <View style={styles.screen}>
        <ListSkeleton count={4} height={120} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.screen}>
        <ErrorState message={error} onRetry={load} />
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={styles.screen}
      data={filtered}
      keyExtractor={(item) => String(item.mrvId)}
      ListHeaderComponent={
        <>
          <ScreenHeader
            title={`${greeting()}, ${user?.username || 'Verifier'}`}
            subtitle="Verification workspace"
            right={<Avatar name={user?.username || 'V'} size={46} color={Colors.warning} />}
          />

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <StaggerItem index={0} style={{ flex: 1 }}>
              <StatCard icon="hourglass-outline" label="Pending" value={stats.pending} iconColor={Colors.warning} iconSoft={Colors.warningSoft} />
            </StaggerItem>
            <StaggerItem index={1} style={{ flex: 1 }}>
              <StatCard icon="shield-checkmark-outline" label="Approved" value={stats.approved} iconColor={Colors.success} iconSoft={Colors.successSoft} />
            </StaggerItem>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            <StaggerItem index={2} style={{ flex: 1 }}>
              <StatCard icon="close-circle-outline" label="Rejected" value={stats.rejected} iconColor={Colors.danger} iconSoft={Colors.dangerSoft} />
            </StaggerItem>
            <StaggerItem index={3} style={{ flex: 1 }}>
              <StatCard icon="documents-outline" label="Total MRV" value={stats.total} iconColor={Colors.forest} iconSoft={Colors.surfaceMuted} />
            </StaggerItem>
          </View>

          <Card style={{ marginBottom: 16 }}>
            <SectionHeader title="My Verification History" actionLabel={`${history.length} records`} />
            {history.slice(0, 3).map((h) => (
              <View key={h.verificationId} style={styles.historyRow}>
                <Ionicons
                  name={h.verificationStatus === 'APPROVED' ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color={h.verificationStatus === 'APPROVED' ? Colors.success : Colors.danger}
                />
                <Text style={styles.historyText} numberOfLines={1}>
                  {h.projectName || `MRV #${h.mrvId}`}
                </Text>
                <Text style={styles.historyTime}>{timeAgo(h.verificationDate)}</Text>
              </View>
            ))}
            {history.length === 0 ? (
              <Text style={{ fontSize: 13, color: Colors.textTertiary, paddingVertical: 6 }}>
                No verifications performed yet.
              </Text>
            ) : null}
          </Card>

          <SectionHeader title="Verification Queue" />
          <View style={styles.filters}>
            {QUEUE_FILTERS.map((f) => (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.filterChip, filter === f.key && { backgroundColor: Colors.forest, borderColor: Colors.forest }]}
              >
                <Text style={[styles.filterText, filter === f.key && { color: '#fff' }]}>{f.label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      }
      renderItem={({ item, index }) => (
        <StaggerItem index={Math.min(index, 5)}>
          <MrvCard submission={item} onPress={() => navigation.navigate('VerifierReview', { mrv: item })} />
        </StaggerItem>
      )}
      ListEmptyComponent={
        <EmptyState
          icon="shield-checkmark-outline"
          title="Queue is clear"
          message="No MRV submissions match this filter right now."
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: { padding: 20, paddingBottom: 40 },
  filters: { flexDirection: 'row', gap: 7, marginBottom: 14, flexWrap: 'wrap' },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: Theme.radius.pill,
    borderWidth: 1.2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap: 8,
  },
  historyText: { flex: 1, fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  historyTime: { fontSize: 11.5, color: Colors.textTertiary, fontWeight: '600' },
});
