import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors } from '../../constants/theme';
import { getAdminPurchases, getAdminRetirements } from '../../services/registryService';
import { ApiError } from '../../services/api';
import { formatCredits, formatCurrency, formatDateTime } from '../../utils/format';
import { ListSkeleton, ErrorState, EmptyState, Card } from '../../components/ui';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { StaggerItem } from '../../components/animated/AnimatedCountUp';

export default function AdminLedgerScreen() {
  const [purchases, setPurchases] = useState([]);
  const [retirements, setRetirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('purchases');

  const load = useCallback(async () => {
    setError(null);
    try {
      const [p, r] = await Promise.all([getAdminPurchases(), getAdminRetirements()]);
      setPurchases(p || []);
      setRetirements(r || []);
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

  const data = tab === 'purchases' ? purchases : retirements;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Registry Ledger</Text>
      </View>

      <View style={styles.tabRow}>
        <Pressable onPress={() => setTab('purchases')} style={[styles.tab, tab === 'purchases' && styles.tabActive]}>
          <Ionicons name="bag-handle" size={16} color={tab === 'purchases' ? '#fff' : Colors.textSecondary} />
          <Text style={[styles.tabText, tab === 'purchases' && { color: '#fff' }]}>Purchases ({purchases.length})</Text>
        </Pressable>
        <Pressable onPress={() => setTab('retirements')} style={[styles.tab, tab === 'retirements' && styles.tabActive]}>
          <Ionicons name="lock-closed" size={16} color={tab === 'retirements' ? '#fff' : Colors.textSecondary} />
          <Text style={[styles.tabText, tab === 'retirements' && { color: '#fff' }]}>Retirements ({retirements.length})</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.body}>
          <ListSkeleton count={5} height={90} />
        </View>
      ) : error ? (
        <View style={styles.body}>
          <ErrorState message={error} onRetry={load} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) =>
            String(tab === 'purchases' ? item.purchaseId : item.retirementId)
          }
          contentContainerStyle={styles.body}
          renderItem={({ item, index }) =>
            tab === 'purchases' ? (
              <StaggerItem key={item.purchaseId} index={Math.min(index, 6)}>
                <Card style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.rowIcon, { backgroundColor: Colors.infoSoft }]}>
                      <Ionicons name="bag-handle-outline" size={17} color={Colors.info} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 11 }}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {item.buyerUsername || 'Buyer'} → {item.projectName || `Batch #${item.ccbId}`}
                      </Text>
                      <Text style={styles.rowSub}>{formatDateTime(item.purchaseDate)} • {item.paymentMethod || '—'}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 14.5, fontWeight: '800', color: Colors.forest }}>{formatCurrency(item.price)}</Text>
                      <Text style={styles.rowSub}>{formatCredits(item.quantity)} credits</Text>
                    </View>
                  </View>
                </Card>
              </StaggerItem>
            ) : (
              <StaggerItem key={item.retirementId} index={Math.min(index, 6)}>
                <Card style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.rowIcon, { backgroundColor: Colors.forest }]}>
                      <Ionicons name="lock-closed" size={17} color={Colors.lime} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 11 }}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {item.buyerUsername || 'Buyer'} • {item.projectName || `Purchase #${item.purchaseId}`}
                      </Text>
                      <Text style={styles.rowSub} numberOfLines={1}>{item.reason || '—'}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 14.5, fontWeight: '800', color: Colors.forest }}>{formatCredits(item.quantity)}</Text>
                      <Text style={styles.rowSub}>{formatDateTime(item.retirementDate)}</Text>
                    </View>
                  </View>
                </Card>
              </StaggerItem>
            )
          }
          ListEmptyComponent={
            <EmptyState
              icon={tab === 'purchases' ? 'bag-handle-outline' : 'lock-closed-outline'}
              title={tab === 'purchases' ? 'No purchases yet' : 'No retirements yet'}
              message="Registry transactions will appear here in real time."
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.forest,
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  tabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 14 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Theme.radius.pill,
    borderWidth: 1.2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tabActive: { backgroundColor: Colors.forest, borderColor: Colors.forest },
  tabText: { fontSize: 12.5, fontWeight: '700', color: Colors.textSecondary },
  body: { padding: 20, paddingTop: 4, paddingBottom: 40 },
  rowIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 13.5, fontWeight: '800', color: Colors.textPrimary },
  rowSub: { fontSize: 11.5, color: Colors.textTertiary, marginTop: 2, fontWeight: '600' },
});
