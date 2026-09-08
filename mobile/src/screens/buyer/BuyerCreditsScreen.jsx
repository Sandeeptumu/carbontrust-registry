import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Theme, { Colors } from '../../constants/theme';
import { getBuyerPurchases, getBuyerRetirements } from '../../services/registryService';
import { ApiError } from '../../services/api';
import { Card, SectionHeader, ListSkeleton, ErrorState, EmptyState, StatCard } from '../../components/ui';
import { PurchaseCard } from '../../components/registry/ProjectCard';
import { CreditFlow, ScreenHeader } from '../../components/layout/ScreenHeader';
import { formatCredits, formatCurrency } from '../../utils/format';
import AnimatedCountUp, { StaggerItem } from '../../components/animated/AnimatedCountUp';

export default function BuyerCreditsScreen({ navigation }) {
  const [purchases, setPurchases] = useState([]);
  const [retirements, setRetirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [p, r] = await Promise.all([getBuyerPurchases(), getBuyerRetirements()]);
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

  const retiredByPurchase = useMemo(() => {
    const map = {};
    (retirements || []).forEach((r) => {
      map[r.purchaseId] = (map[r.purchaseId] || 0) + (Number(r.quantity) || 0);
    });
    return map;
  }, [retirements]);

  const totals = useMemo(() => {
    const purchased = (purchases || []).reduce((s, p) => s + (Number(p.quantity) || 0), 0);
    const retired = (retirements || []).reduce((s, r) => s + (Number(r.quantity) || 0), 0);
    const spent = (purchases || []).reduce((s, p) => s + (Number(p.price) || 0), 0);
    return { purchased, retired, available: Math.max(0, purchased - retired), spent };
  }, [purchases, retirements]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Carbon Credits</Text>
      </View>

      {loading ? (
        <View style={styles.body}>
          <ListSkeleton count={3} height={120} />
        </View>
      ) : error ? (
        <View style={styles.body}>
          <ErrorState message={error} onRetry={load} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Card gradient={Theme.gradients.brand} style={{ marginBottom: 16 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>
                🌱 AVAILABLE CREDITS
              </Text>
              <AnimatedCountUp
                value={totals.available}
                style={{ fontSize: 44, fontWeight: '800', color: '#fff', letterSpacing: -1.4, marginTop: 4 }}
              />
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12.5, fontWeight: '600' }}>
                {formatCredits(totals.retired)} retired • {formatCurrency(totals.spent)} invested
              </Text>
            </View>
          </Card>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            <StaggerItem index={0} style={{ flex: 1 }}>
              <StatCard icon="bag-handle-outline" label="Purchased" value={totals.purchased} />
            </StaggerItem>
            <StaggerItem index={1} style={{ flex: 1 }}>
              <StatCard icon="lock-closed-outline" label="Retired" value={totals.retired} iconColor={Colors.forest} iconSoft={Colors.surfaceMuted} />
            </StaggerItem>
          </View>

          <Card style={{ marginBottom: 18 }}>
            <SectionHeader title="Credit Lifecycle" />
            <CreditFlow />
          </Card>

          <SectionHeader title="Purchases" />
          {purchases.length === 0 ? (
            <EmptyState
              icon="bag-handle-outline"
              title="No purchases yet"
              message="Buy verified carbon credits from the marketplace to see them here."
              actionLabel="Open Marketplace"
              onAction={() => navigation.navigate('Marketplace')}
            />
          ) : (
            purchases.map((p, i) => (
              <StaggerItem key={p.purchaseId} index={i}>
                <PurchaseCard
                  purchase={p}
                  retired={retiredByPurchase[p.purchaseId] || 0}
                  onRetire={() =>
                    navigation.navigate('Retire', {
                      purchase: p,
                      retiredAlready: retiredByPurchase[p.purchaseId] || 0,
                    })
                  }
                />
              </StaggerItem>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
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
