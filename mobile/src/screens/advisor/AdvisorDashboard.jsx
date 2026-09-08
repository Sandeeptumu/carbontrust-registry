import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { getEnvironmentalHealth } from '../../services/healthService';
import { greeting } from '../../utils/format';
import { Card, SectionHeader, StatCard, ProgressRing, MiniBarChart, Badge } from '../../components/ui';
import { ScreenHeader, Avatar } from '../../components/layout/ScreenHeader';
import { StaggerItem } from '../../components/animated/AnimatedCountUp';

/**
 * Healthcare Advisor dashboard.
 *
 * Privacy model: the existing backend exposes no health-record endpoints
 * yet, so this dashboard surfaces environmental-health context only and
 * includes explicit permission placeholders. Any future health-record API
 * access should be enforced server-side and surfaced here with the same
 * privacy indicators.
 */
export default function AdvisorDashboard() {
  const { user } = useAuth();
  const [env] = useState(getEnvironmentalHealthSync);

  const aqiRatio = Math.min(1, (env.airQualityIndex || 0) / 150);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={styles.screen}>
      <ScreenHeader
        title={`${greeting()}, ${user?.username || 'Advisor'}`}
        subtitle="Environmental health desk"
        right={<Avatar name={user?.username || 'H'} size={46} color="#7C3AED" />}
      />

      <StaggerItem index={0}>
        <Card style={{ marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#7C3AED' }}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Ionicons name="shield-checkmark" size={19} color="#7C3AED" />
            <Text style={{ flex: 1, fontSize: 12.5, color: Colors.textSecondary, lineHeight: 19, fontWeight: '500' }}>
              You see only data your role permits. Personal health records stay private to their owners.
            </Text>
          </View>
        </Card>
      </StaggerItem>

      <StaggerItem index={1}>
        <Card style={{ marginBottom: 16 }}>
          <SectionHeader title="Environmental Health Overview" />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
            <ProgressRing
              size={92}
              progress={aqiRatio}
              color={aqiRatio < 0.4 ? Colors.success : Colors.warning}
              label={env.airQualityLabel}
              sublabel={`AQI ${env.airQualityIndex}`}
            />
            <View style={{ flex: 1 }}>
              <OverviewRow icon="warning-outline" label="Pollution exposure" value={env.pollutionExposure} />
              <OverviewRow icon="medkit-outline" label="Environmental risk" value={env.environmentalRisk} />
              <OverviewRow icon="heart-outline" label="Health impact" value={env.healthImpact} last />
            </View>
          </View>
        </Card>
      </StaggerItem>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <StaggerItem index={2} style={{ flex: 1 }}>
          <StatCard icon="people-outline" label="Registry Users" value={0} hint="Health module pending" />
        </StaggerItem>
        <StaggerItem index={3} style={{ flex: 1 }}>
          <StatCard icon="folder-open-outline" label="Health Records" value={0} iconColor="#7C3AED" iconSoft="#EDE9FE" hint="Backend module pending" />
        </StaggerItem>
      </View>

      <StaggerItem index={4}>
        <Card style={{ marginBottom: 16 }}>
          <SectionHeader title="Environmental Risk Trend" />
          <MiniBarChart data={env.trend} height={70} color="#7C3AED" />
          <Text style={{ fontSize: 11.5, color: Colors.textTertiary, marginTop: 8, fontWeight: '600' }}>
            7-day AQI pattern — lower is better
          </Text>
        </Card>
      </StaggerItem>

      <StaggerItem index={5}>
        <Card>
          <SectionHeader title="Health Recommendations" />
          {env.recommendations.map((rec, i) => (
            <View key={i} style={styles.recRow}>
              <View style={[styles.recBullet, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="medical" size={12} color="#7C3AED" />
              </View>
              <Text style={styles.recText}>{rec}</Text>
            </View>
          ))}
          <Badge label="Awaiting backend health module" color="#7C3AED" soft="#EDE9FE" icon="hourglass-outline" style={{ marginTop: 4 }} />
        </Card>
      </StaggerItem>
    </ScrollView>
  );
}

// Synchronous sample read (same placeholder dataset as the async service).
function getEnvironmentalHealthSync() {
  return {
    airQualityIndex: 42,
    airQualityLabel: 'Good',
    pollutionExposure: 'Low',
    environmentalRisk: 'Low',
    healthImpact: 'Minimal',
    trend: [38, 45, 41, 52, 47, 42, 39],
    recommendations: [
      'Air quality is favorable — schedule community health screenings outdoors.',
      'Pollution exposure is low; no additional precautions needed.',
      'Ideal window for environmental field data collection.',
    ],
  };
}

function OverviewRow({ icon, label, value, last = false }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 9 }, !last && { borderBottomWidth: 1, borderBottomColor: Colors.divider }]}>
      <Ionicons name={icon} size={15} color={Colors.textSecondary} />
      <Text style={{ flex: 1, fontSize: 13, color: Colors.textSecondary, fontWeight: '600', marginLeft: 8 }}>{label}</Text>
      <Text style={{ fontSize: 13.5, fontWeight: '800', color: Colors.textPrimary }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 20, paddingBottom: 40 },
  recRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  recBullet: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  recText: { flex: 1, fontSize: 13.5, color: Colors.textSecondary, lineHeight: 20 },
});
