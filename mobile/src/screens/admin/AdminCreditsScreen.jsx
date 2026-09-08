import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors } from '../../constants/theme';
import { getAdminCredits } from '../../services/registryService';
import { ApiError } from '../../services/api';
import { formatCredits, formatDate } from '../../utils/format';
import { ListSkeleton, ErrorState, EmptyState, Card, Badge } from '../../components/ui';
import { ScreenHeader, KVRow } from '../../components/layout/ScreenHeader';
import AnimatedCountUp, { StaggerItem } from '../../components/animated/AnimatedCountUp';

export default function AdminCreditsScreen() {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getAdminCredits();
      setCredits(data || []);
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

  const totals = useMemo(() => {
    const issued = (credits || []).reduce((s, c) => s + (Number(c.originalQuantity) || 0), 0);
    const available = (credits || []).reduce((s, c) => s + (Number(c.availableQuantity) || 0), 0);
    return { issued, available, sold: Math.max(0, issued - available) };
  }, [credits]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={styles.headerPad} />
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <ScreenHeader title="Credit Batches" subtitle={`${credits.length} issued batch${credits.length === 1 ? '' : 'es'}`} />

        {loading ? (
          <ListSkeleton count={4} height={110} />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <FlatList
            data={credits}
            keyExtractor={(item) => String(item.ccbId)}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListHeaderComponent={
              <Card gradient={Theme.gradients.brand} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  <View style={{ alignItems: 'center' }}>
                    <AnimatedCountUp value={totals.issued} style={{ fontSize: 24, fontWeight: '800', color: '#fff' }} />
                    <Text style={styles.heroLabel}>ISSUED</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.15)' }} />
                  <View style={{ alignItems: 'center' }}>
                    <AnimatedCountUp value={totals.available} style={{ fontSize: 24, fontWeight: '800', color: Colors.lime }} />
                    <Text style={styles.heroLabel}>AVAILABLE</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.15)' }} />
                  <View style={{ alignItems: 'center' }}>
                    <AnimatedCountUp value={totals.sold} style={{ fontSize: 24, fontWeight: '800', color: '#fff' }} />
                    <Text style={styles.heroLabel}>SOLD</Text>
                  </View>
                </View>
              </Card>
            }
            renderItem={({ item, index }) => (
              <StaggerItem index={Math.min(index, 6)}>
                <Card style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.batchIcon}>
                      <Ionicons name="ribbon" size={18} color={Colors.emeraldDark} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ fontSize: 14.5, fontWeight: '800', color: Colors.textPrimary }} numberOfLines={1}>
                        {item.projectName || `Project #${item.projectId}`}
                      </Text>
                      <Text style={{ fontSize: 12, color: Colors.textTertiary, marginTop: 2 }}>
                        Batch #{item.ccbId} • {formatDate(item.issuedDate)}
                      </Text>
                    </View>
                    <Badge
                      label={(item.status || 'ISSUED').replace('_', ' ')}
                      color={item.status === 'RETIRED' ? Colors.forest : Colors.emeraldDark}
                      soft={item.status === 'RETIRED' ? Colors.surfaceMuted : Colors.emeraldSoft}
                    />
                  </View>
                  <View style={{ marginTop: 8 }}>
                    <KVRow k="Original" v={`${formatCredits(item.originalQuantity)} credits`} />
                    <KVRow k="Available" v={`${formatCredits(item.availableQuantity)} credits`} last />
                  </View>
                </Card>
              </StaggerItem>
            )}
            ListEmptyComponent={
              <EmptyState icon="ribbon-outline" title="No batches" message="Credit batches issued to verified projects will appear here." />
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerPad: { height: 56 },
  heroLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.8, marginTop: 3 },
  batchIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.emeraldSoft, alignItems: 'center', justifyContent: 'center' },
});
