import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { getMarketplaceCredits } from '../../services/registryService';
import { getEnvironmentalHealth } from '../../services/healthService';
import { greeting } from '../../utils/format';
import { Card, SectionHeader, StatCard, ErrorState, ProgressRing, ListSkeleton } from '../../components/ui';
import { ScreenHeader, Avatar, KVRow } from '../../components/layout/ScreenHeader';
import { StaggerItem } from '../../components/animated/AnimatedCountUp';
import { ApiError } from '../../services/api';

/**
 * Dashboard for standard USER accounts.
 * The backend's public registration grants BUYER; USER is a read-mostly role.
 * Surface registry transparency + environmental-personal health entry points.
 */
export default function UserDashboard({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marketCount, setMarketCount] = useState(0);
  const [env, setEnv] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [m, e] = await Promise.all([
        getMarketplaceCredits().catch(() => []),
        getEnvironmentalHealth(),
      ]);
      setMarketCount((m || []).length);
      setEnv(e);
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

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
        subtitle="Your sustainability snapshot"
        right={<Avatar name={user?.username || 'U'} size={46} />}
      />

      {env ? (
        <StaggerItem index={0}>
          <Card gradient={Theme.gradients.brand} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '700', letterSpacing: 0.8 }}>
                  ENVIRONMENT TODAY
                </Text>
                <Text style={{ fontSize: 26, fontWeight: '800', color: '#fff', marginTop: 6, letterSpacing: -0.6 }}>
                  {env.airQualityLabel} air quality
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12.5, fontWeight: '600', marginTop: 4 }}>
                  Risk {env.environmentalRisk.toLowerCase()} • Impact {env.healthImpact.toLowerCase()}
                </Text>
              </View>
              <ProgressRing
                size={78}
                progress={Math.min(1, env.airQualityIndex / 150)}
                color={Colors.lime}
                track="rgba(255,255,255,0.15)"
                thickness={7}
                label={`${env.airQualityIndex}`}
                sublabel="AQI"
              />
            </View>
          </Card>
        </StaggerItem>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <StaggerItem index={1} style={{ flex: 1 }}>
          <StatCard icon="storefront-outline" label="Credits Listed" value={marketCount} onPress={() => navigation.navigate('Market')} />
        </StaggerItem>
        <StaggerItem index={2} style={{ flex: 1 }}>
          <Card onPress={() => navigation.navigate('PersonalHealth')}>
            <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="heart-outline" size={16} color="#7C3AED" />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 }}>
              <Ionicons name="lock-closed" size={17} color="#7C3AED" />
              <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textPrimary }}>Private</Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginTop: 2 }}>Health Record</Text>
          </Card>
        </StaggerItem>
      </View>

      <StaggerItem index={3}>
        <Card style={{ marginBottom: 16 }}>
          <SectionHeader title="Quick Actions" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { icon: 'storefront', label: 'Market', go: 'Market' },
              { icon: 'heart', label: 'My Health', go: 'PersonalHealth' },
              { icon: 'leaf', label: 'Env Health', go: 'Health' },
              { icon: 'notifications', label: 'Alerts', go: 'Alerts' },
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

      <StaggerItem index={4}>
        <Card>
          <SectionHeader title="Where Carbon Credits Come From" />
          <KVRow k="1. Project" v="NGO registers a restoration project" />
          <KVRow k="2. Verification" v="Independent verifiers approve MRV evidence" />
          <KVRow k="3. Credits" v="Registry issues credit batches" />
          <KVRow k="4. Purchase" v="Buyers acquire credits on the marketplace" />
          <KVRow k="5. Retirement" v="Credits are permanently retired for impact" last />
        </Card>
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
