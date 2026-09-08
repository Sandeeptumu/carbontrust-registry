import React, { useCallback, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { getAdminStats } from '../../services/registryService';
import { ApiError } from '../../services/api';
import { greeting, formatCredits, formatCurrency, roleLabel } from '../../utils/format';
import { Card, SectionHeader, ListSkeleton, ErrorState, StatCard, MiniBarChart } from '../../components/ui';
import { ScreenHeader, Avatar } from '../../components/layout/ScreenHeader';
import AnimatedCountUp, { StaggerItem } from '../../components/animated/AnimatedCountUp';

export default function AdminDashboard({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setStats(await getAdminStats());
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

  if (loading) {
    return (
      <View style={styles.screen}>
        <ListSkeleton count={5} height={100} />
      </View>
    );
  }

  if (error || !stats) {
    return (
      <View style={styles.screen}>
        <ErrorState message={error || 'Unable to load stats'} onRetry={load} />
      </View>
    );
  }

  const roleEntries = Object.entries(stats.usersByRole || {});
  const projectEntries = Object.entries(stats.projectsByStatus || {});

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={styles.screen}>
      <ScreenHeader
        title={`${greeting()}, ${user?.username || 'Admin'}`}
        subtitle="Registry control center"
        right={<Avatar name={user?.username || 'A'} size={46} color={Colors.forest} />}
      />

      {/* Headline metrics */}
      <StaggerItem index={0}>
        <Card gradient={Theme.gradients.brand} style={{ marginBottom: 16 }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', letterSpacing: 0.8 }}>
            TOTAL CREDITS ISSUED
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 4 }}>
            <AnimatedCountUp value={stats.totalCreditsIssued || 0} style={{ fontSize: 40, fontWeight: '800', color: '#fff', letterSpacing: -1.2 }} />
            <Text style={{ color: Colors.lime, fontSize: 15, fontWeight: '700', paddingBottom: 6 }}>tCO₂e</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 18, marginTop: 12 }}>
            <Metric label="Available" value={stats.totalCreditsAvailable} />
            <Metric label="Sold" value={stats.totalCreditsSold} />
            <Metric label="Retired" value={stats.totalCreditsRetired} />
          </View>
        </Card>
      </StaggerItem>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
        <StaggerItem index={1} style={{ flex: 1 }}>
          <StatCard icon="people-outline" label="Total Users" value={stats.totalUsers || 0} onPress={() => navigation.navigate('Users')} />
        </StaggerItem>
        <StaggerItem index={2} style={{ flex: 1 }}>
          <StatCard icon="leaf-outline" label="Projects" value={stats.totalProjects || 0} iconColor={Colors.emeraldDark} iconSoft={Colors.emeraldSoft} />
        </StaggerItem>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <StaggerItem index={3} style={{ flex: 1 }}>
          <StatCard icon="bag-handle-outline" label="Purchases" value={stats.totalPurchases || 0} iconColor={Colors.info} iconSoft={Colors.infoSoft} />
        </StaggerItem>
        <StaggerItem index={4} style={{ flex: 1 }}>
          <StatCard icon="lock-closed-outline" label="Retirements" value={stats.totalRetirements || 0} iconColor={Colors.forest} iconSoft={Colors.surfaceMuted} />
        </StaggerItem>
      </View>

      {/* Revenue */}
      <StaggerItem index={5}>
        <Card style={{ marginBottom: 16 }}>
          <SectionHeader title="Marketplace Revenue" />
          <Text style={{ fontSize: 28, fontWeight: '800', color: Colors.forest, letterSpacing: -0.8 }}>
            {formatCurrency(stats.totalRevenue)}
          </Text>
          <Text style={{ fontSize: 12.5, color: Colors.textSecondary, fontWeight: '600', marginTop: 2 }}>
            across {stats.totalPurchases || 0} transactions
          </Text>
        </Card>
      </StaggerItem>

      {/* Users by role */}
      <StaggerItem index={6}>
        <Card style={{ marginBottom: 16 }}>
          <SectionHeader title="Users by Role" actionLabel="All users" onAction={() => navigation.navigate('Users')} />
          {roleEntries.length === 0 ? (
            <Text style={{ fontSize: 13, color: Colors.textTertiary, paddingVertical: 8 }}>No users yet.</Text>
          ) : (
            roleEntries.map(([role, count], i) => (
              <View key={role} style={styles.barRow}>
                <Text style={styles.barLabel}>{roleLabel(role)}</Text>
                <View style={styles.barTrack}>
                  <AnimatedCountUp value={count} duration={700} style={styles.barCount} />
                  <BarFill index={i} count={count} max={Math.max(...roleEntries.map(([, c]) => c))} />
                </View>
              </View>
            ))
          )}
        </Card>
      </StaggerItem>

      {/* Projects by status */}
      <StaggerItem index={7}>
        <Card style={{ marginBottom: 16 }}>
          <SectionHeader title="Projects by Status" />
          {projectEntries.length === 0 ? (
            <Text style={{ fontSize: 13, color: Colors.textTertiary, paddingVertical: 8 }}>No projects yet.</Text>
          ) : (
            <>
              <MiniBarChart data={projectEntries.map(([, c]) => c)} height={70} />
              <View style={styles.legendRow}>
                {projectEntries.map(([status]) => (
                  <Text key={status} style={styles.legendText} numberOfLines={1}>
                    {status.replace('_', ' ')}
                  </Text>
                ))}
              </View>
            </>
          )}
        </Card>
      </StaggerItem>

      {/* Quick links */}
      <StaggerItem index={8}>
        <SectionHeader title="Registry Sections" />
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          <AdminLink icon="people" label="Users" onPress={() => navigation.navigate('Users')} />
          <AdminLink icon="ribbon" label="Credit Batches" onPress={() => navigation.navigate('Credits')} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <AdminLink icon="receipt-outline" label="Transactions" onPress={() => navigation.navigate('Ledger')} />
          <AdminLink icon="shield-checkmark-outline" label="Verifications" onPress={() => navigation.navigate('Ledger')} />
        </View>
      </StaggerItem>
    </ScrollView>
  );
}

function Metric({ label, value }) {
  return (
    <View>
      <AnimatedCountUp value={value || 0} style={{ fontSize: 16, fontWeight: '800', color: Colors.lime }} />
      <Text style={{ fontSize: 10.5, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.4 }}>{label.toUpperCase()}</Text>
    </View>
  );
}

function BarFill({ index, count, max }) {
  const w = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(w, { toValue: count / Math.max(1, max), duration: 800, delay: index * 90, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [count, max, index, w]);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        borderRadius: 5,
        backgroundColor: Colors.emeraldSoft,
        width: w.interpolate({ inputRange: [0, 1], outputRange: ['2%', '58%'] }),
      }}
    />
  );
}

function AdminLink({ icon, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.link}>
      <View style={styles.linkIcon}>
        <Ionicons name={icon} size={18} color={Colors.emeraldDark} />
      </View>
      <Text style={styles.linkLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.borderStrong} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 20, paddingBottom: 40 },
  barRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  barLabel: { width: 120, fontSize: 12.5, fontWeight: '700', color: Colors.textSecondary },
  barTrack: { flex: 1, height: 26, borderRadius: 7, backgroundColor: Colors.surfaceAlt, justifyContent: 'center', paddingLeft: 8 },
  barCount: { fontSize: 12.5, fontWeight: '800', color: Colors.forest, zIndex: 2 },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  legendText: { flex: 1, fontSize: 9, fontWeight: '700', color: Colors.textTertiary, textAlign: 'center', letterSpacing: 0.2 },
  link: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Theme.radius.md,
    padding: 14,
    gap: 10,
  },
  linkIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.emeraldSoft, alignItems: 'center', justifyContent: 'center' },
  linkLabel: { flex: 1, fontSize: 13.5, fontWeight: '700', color: Colors.textPrimary },
});
