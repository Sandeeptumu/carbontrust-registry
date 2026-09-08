import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Theme, { Colors } from '../../constants/theme';
import { getBuyerRetirements } from '../../services/registryService';
import { ApiError } from '../../services/api';
import { ListSkeleton, ErrorState, EmptyState, Card } from '../../components/ui';
import { ScreenHeader, KVRow } from '../../components/layout/ScreenHeader';
import { formatCredits, formatDateTime } from '../../utils/format';
import { StaggerItem } from '../../components/animated/AnimatedCountUp';
import { Ionicons } from '@expo/vector-icons';

export default function RetirementsScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getBuyerRetirements();
      setItems(data || []);
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

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Retirement Registry</Text>
      </View>

      {loading ? (
        <View style={styles.body}>
          <ListSkeleton count={4} height={110} />
        </View>
      ) : error ? (
        <View style={styles.body}>
          <ErrorState message={error} onRetry={load} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.retirementId)}
          contentContainerStyle={styles.body}
          ListHeaderComponent={
            <View style={{ marginBottom: 14 }}>
              <ScreenHeader
                title="Permanent Removals"
                subtitle={`${items.length} retirement record${items.length === 1 ? '' : 's'}`}
              />
              <Card style={{ borderLeftWidth: 3, borderLeftColor: Colors.forest }}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <Ionicons name="lock-closed" size={18} color={Colors.forest} />
                  <Text style={{ flex: 1, fontSize: 12.5, color: Colors.textSecondary, lineHeight: 18, fontWeight: '500' }}>
                    Retired credits are permanently locked in the registry and can never re-enter circulation.
                  </Text>
                </View>
              </Card>
            </View>
          }
          renderItem={({ item, index }) => (
            <StaggerItem index={Math.min(index, 6)}>
              <Card style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.forest, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="lock-closed" size={18} color={Colors.lime} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textPrimary }} numberOfLines={1}>
                      {item.projectName || `Purchase #${item.purchaseId}`}
                    </Text>
                    <Text style={{ fontSize: 12.5, color: Colors.textTertiary, marginTop: 2 }}>
                      {formatDateTime(item.retirementDate)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 17, fontWeight: '800', color: Colors.forest }}>
                      {formatCredits(item.quantity)}
                    </Text>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 0.5 }}>
                      RETIRED
                    </Text>
                  </View>
                </View>
                {item.reason ? (
                  <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.divider }}>
                    <KVRow k="Reason" v={item.reason} last />
                  </View>
                ) : null}
              </Card>
            </StaggerItem>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="lock-closed-outline"
              title="No retirements yet"
              message="When you retire credits they will be permanently recorded here."
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
  body: { padding: 20, paddingBottom: 40 },
});
