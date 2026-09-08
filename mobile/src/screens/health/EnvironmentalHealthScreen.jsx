import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors } from '../../constants/theme';
import { getEnvironmentalHealth } from '../../services/healthService';
import { Card, SectionHeader, Skeleton, ErrorState, Badge } from '../../components/ui';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ProgressRing, MiniBarChart } from '../../components/ui';
import { StaggerItem } from '../../components/animated/AnimatedCountUp';
import { formatDateTime } from '../../utils/format';

export default function EnvironmentalHealthScreen() {
  const [env, setEnv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      setEnv(await getEnvironmentalHealth());
    } catch {
      setError(true);
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
      <View style={{ flex: 1, backgroundColor: Colors.background, padding: 20 }}>
        <Skeleton height={150} radius={18} style={{ marginBottom: 14 }} />
        <Skeleton height={110} radius={18} style={{ marginBottom: 14 }} />
        <Skeleton height={110} radius={18} />
      </View>
    );
  }

  if (error || !env) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, padding: 20 }}>
        <ErrorState message="Could not load environmental readings." onRetry={load} />
      </View>
    );
  }

  const aqiRatio = Math.min(1, (env.airQualityIndex || 0) / 150);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.forest} />}
    >
      <ScreenHeader title="Environmental Health" subtitle="How environment shapes wellbeing" />

      <StaggerItem index={0}>
        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
            <ProgressRing
              size={104}
              progress={aqiRatio}
              color={aqiRatio < 0.4 ? Colors.success : aqiRatio < 0.7 ? Colors.warning : Colors.danger}
              thickness={9}
              label={env.airQualityLabel}
              sublabel={`AQI ${env.airQualityIndex}`}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15.5, fontWeight: '800', color: Colors.textPrimary }}>Air Quality</Text>
              <Text style={{ fontSize: 12.5, color: Colors.textSecondary, lineHeight: 19, marginTop: 4 }}>
                {aqiRatio < 0.4
                  ? 'Conditions are good — ideal for outdoor field work and community activities.'
                  : aqiRatio < 0.7
                    ? 'Moderate conditions — sensitive groups should limit prolonged exertion.'
                    : 'Poor conditions — reduce outdoor exposure where possible.'}
              </Text>
              <Text style={{ fontSize: 11, color: Colors.textTertiary, marginTop: 8, fontWeight: '600' }}>
                Updated {formatDateTime(env.updatedAt)}
              </Text>
            </View>
          </View>
        </Card>
      </StaggerItem>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <StaggerItem index={1} style={{ flex: 1 }}>
          <Card>
            <View style={styles.riskIcon}>
              <Ionicons name="warning-outline" size={18} color={Colors.warning} />
            </View>
            <Text style={styles.riskValue}>{env.pollutionExposure}</Text>
            <Text style={styles.riskLabel}>Pollution Exposure</Text>
          </Card>
        </StaggerItem>
        <StaggerItem index={2} style={{ flex: 1 }}>
          <Card>
            <View style={styles.riskIcon}>
              <Ionicons name="medkit-outline" size={18} color={Colors.danger} />
            </View>
            <Text style={styles.riskValue}>{env.environmentalRisk}</Text>
            <Text style={styles.riskLabel}>Environmental Risk</Text>
          </Card>
        </StaggerItem>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <StaggerItem index={3} style={{ flex: 1 }}>
          <Card>
            <View style={styles.riskIcon}>
              <Ionicons name="heart-outline" size={18} color={Colors.success} />
            </View>
            <Text style={styles.riskValue}>{env.healthImpact}</Text>
            <Text style={styles.riskLabel}>Health Impact</Text>
          </Card>
        </StaggerItem>
        <StaggerItem index={4} style={{ flex: 1 }}>
          <Card>
            <View style={styles.riskIcon}>
              <Ionicons name="flower-outline" size={18} color={Colors.info} />
            </View>
            <Text style={styles.riskValue}>{env.pollenLevel}</Text>
            <Text style={styles.riskLabel}>Pollen Level</Text>
          </Card>
        </StaggerItem>
      </View>

      <StaggerItem index={5}>
        <Card style={{ marginBottom: 16 }}>
          <SectionHeader title="7-Day Air Quality Trend" actionLabel={`AQI scale`} />
          <MiniBarChart data={env.trend} height={72} color={Colors.emerald} />
        </Card>
      </StaggerItem>

      <StaggerItem index={6}>
        <Card>
          <SectionHeader title="Health Recommendations" />
          {env.recommendations.map((rec, i) => (
            <View key={i} style={styles.recRow}>
              <View style={styles.recBullet}>
                <Ionicons name="checkmark" size={13} color={Colors.emeraldDark} />
              </View>
              <Text style={styles.recText}>{rec}</Text>
            </View>
          ))}
        </Card>
      </StaggerItem>

      <Text style={styles.sourceNote}>
        Placeholder readings for demonstration — connect a live environmental-data endpoint in services/healthService.js.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  riskIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  riskValue: { fontSize: 19, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },
  riskLabel: { fontSize: 11.5, fontWeight: '700', color: Colors.textTertiary, marginTop: 2, letterSpacing: 0.3 },
  recRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  recBullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.emeraldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  recText: { flex: 1, fontSize: 13.5, color: Colors.textSecondary, lineHeight: 20 },
  sourceNote: { fontSize: 11, color: Colors.textTertiary, textAlign: 'center', marginTop: 16, fontWeight: '600', lineHeight: 17 },
});
