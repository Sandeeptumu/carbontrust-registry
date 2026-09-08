import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { getBuyerPurchases, getBuyerRetirements, getMarketplaceCredits } from '../../services/registryService';
import { getEnvironmentalHealth } from '../../services/healthService';
import { greeting, formatCredits, formatCurrency } from '../../utils/format';
import { StatCard, Card, SectionHeader, ListSkeleton, ErrorState, ProgressRing } from '../../components/ui';
import { ScreenHeader, Avatar, KVRow } from '../../components/layout/ScreenHeader';
import { MarketplaceCard } from '../../components/registry/ProjectCard';
import AnimatedCountUp, { StaggerItem } from '../../components/animated/AnimatedCountUp';
import { ApiError } from '../../services/api';

export default function BuyerDashboard({ navigation }) {
  const { user } = useAuth();
  const { unread } = useNotifications(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [retirements, setRetirements] = useState([]);
  const [market, setMarket] = useState([]);
  const [env, setEnv] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [p, r, m, e] = await Promise.all([
        getBuyerPurchases(),
        getBuyerRetirements(),
        getMarketplaceCredits(),
        getEnvironmentalHealth(),
      ]);
      setPurchases(p || []);
      setRetirements(r || []);
      setMarket(m || []);
      setEnv(e);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const stats = useMemo(() => {
    const purchased = (purchases || []).reduce((s, p) => s + (Number(p.quantity) || 0), 0);
    const retired = (retirements || []).reduce((s, r) => s + (Number(r.quantity) || 0), 0);
    const spent = (purchases || []).reduce((s, p) => s + (Number(p.price) || 0), 0);
    return { purchased, retired, held: Math.max(0, purchased - retired), spent };
  }, [purchases, retirements]);

  const topListings = (market || []).slice(0, 2);

  if (loading) {
    return (
      <View style={styles.screen}>
        <ListSkeleton count={4} height={110} />
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
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.forest} />}
    >
      <ScreenHeader
        title={`${greeting()}, ${user?.username || 'there'} 👋`}
        subtitle="Your carbon portfolio"
        right={
          <Avatar name={user?.username || 'U'} size={46} />
        }
      />

      {/* Hero portfolio card */}
      <StaggerItem index={0}>
        <Card gradient={Theme.gradients.brand} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="leaf" size={15} color={Colors.lime} />
                <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '700', letterSpacing: 0.8 }}>
                  CREDITS HELD
                </Text>
              </View>
              <AnimatedCountUp
                value={stats.held}
                style={{ fontSize: 40, fontWeight: '800', color: '#fff', letterSpacing: -1.2, marginTop: 4 }}
              />
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12.5, fontWeight: '600', marginTop: 2 }}>
                {formatCurrency(stats.spent)} invested • {formatCredits(stats.retired)} retired
              </Text>
            </View>
            <ProgressRing
              size={82}
              progress={stats.purchased > 0 ? stats.retired / stats.purchased : 0}
              color={Colors.lime}
              track="rgba(255,255,255,0.15)"
              thickness={7}
              label={`${Math.round(stats.purchased > 0 ? (stats.retired / stats.purchased) * 100 : 0)}%`}
              sublabel="retired"
            />
          </View>
        </Card>
      </StaggerItem>

      {/* Quick stats */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <StaggerItem index={1} style={{ flex: 1 }}>
          <StatCard icon="bag-handle-outline" label="Purchased" value={stats.purchased} onPress={() => navigation.navigate('BuyerCredits')} />
        </StaggerItem>
        <StaggerItem index={2} style={{ flex: 1 }}>
          <StatCard icon="lock-closed-outline" label="Retired" value={stats.retired} iconColor={Colors.forest} iconSoft={Colors.surfaceMuted} onPress={() => navigation.navigate('Retirements')} />
        </StaggerItem>
      </View>

      {/* Quick actions */}
      <StaggerItem index={3}>
        <Card style={{ marginBottom: 16 }}>
          <SectionHeader title="Quick Actions" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { icon: 'storefront', label: 'Marketplace', go: 'Marketplace' },
              { icon: 'ribbon', label: 'My Credits', go: 'BuyerCredits' },
              { icon: 'lock-closed', label: 'Retire', go: 'Retirements' },
              { icon: 'heart', label: 'Health', go: 'Health' },
            ].map((a) => (
              <Pressable key={a.label} style={styles.quickAction} onPress={() => navigation.navigate(a.go)}>
                <View style={styles.quickIcon}>
                  <Ionicons name={a.icon} size={20} color={Colors.emeraldDark} />
                </View>
                <Text style={styles.quickLabel} numberOfLines={1}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      </StaggerItem>

      {/* Environmental snapshot */}
      {env ? (
        <StaggerItem index={4}>
          <Card style={{ marginBottom: 16 }}>
            <SectionHeader title="Environmental Health" actionLabel="Details" onAction={() => navigation.navigate('Health')} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <ProgressRing size={72} progress={Math.min(1, env.airQualityIndex / 150)} color={env.airQualityIndex < 60 ? Colors.success : Colors.warning} label={env.airQualityLabel} sublabel="AQI" />
              <View style={{ flex: 1 }}>
                <KVRow k="Pollution Exposure" v={env.pollutionExposure} />
                <KVRow k="Environmental Risk" v={env.environmentalRisk} last />
              </View>
            </View>
          </Card>
        </StaggerItem>
      ) : null}

      {/* Marketplace preview */}
      <StaggerItem index={5}>
        <SectionHeader title="Live Marketplace" actionLabel="See all" onAction={() => navigation.navigate('Marketplace')} />
        {topListings.length === 0 ? (
          <Card>
            <Text style={{ color: Colors.textSecondary, fontSize: 13.5, textAlign: 'center', paddingVertical: 18 }}>
              No credit batches listed right now. Check back soon 🌱
            </Text>
          </Card>
        ) : (
          topListings.map((c) => (
            <MarketplaceCard
              key={c.ccbId}
              credit={c}
              onPress={() => navigation.navigate('Purchase', { credit: c })}
            />
          ))
        )}
      </StaggerItem>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 20, paddingBottom: 40 },
  quickAction: { flex: 1, alignItems: 'center', gap: 8 },
  quickIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: Colors.emeraldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
});
