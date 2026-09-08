import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { getProjects, getProjectCredits } from '../../services/registryService';
import { ApiError } from '../../services/api';
import { greeting, projectStatusMeta, formatCredits } from '../../utils/format';
import { StatCard, Card, SectionHeader, ListSkeleton, ErrorState, EmptyState, Badge } from '../../components/ui';
import { ScreenHeader, Avatar } from '../../components/layout/ScreenHeader';
import { ProjectCard } from '../../components/registry/ProjectCard';
import { StaggerItem } from '../../components/animated/AnimatedCountUp';

export default function NgoDashboard({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getProjects();
      setProjects(data || []);
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

  const stats = React.useMemo(() => {
    const by = (s) => (projects || []).filter((p) => projectStatusMeta(p.projectStatus).key === s).length;
    return {
      total: (projects || []).length,
      draft: by('DRAFT'),
      pending: by('SUBMITTED') + by('UNDER_REVIEW'),
      verified: by('VERIFIED'),
      rejected: by('REJECTED'),
    };
  }, [projects]);

  const recent = (projects || []).slice(0, 3);

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
        title={`${greeting()}, ${user?.username || 'NGO'} 👋`}
        subtitle="Project portfolio"
        right={<Avatar name={user?.username || 'NGO'} size={46} color={Colors.emeraldDark} />}
      />

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
        <StaggerItem index={0} style={{ flex: 1 }}>
          <StatCard icon="leaf-outline" label="Total Projects" value={stats.total} onPress={() => navigation.navigate('Projects')} />
        </StaggerItem>
        <StaggerItem index={1} style={{ flex: 1 }}>
          <StatCard icon="time-outline" label="Pending MRV" value={stats.pending} iconColor={Colors.warning} iconSoft={Colors.warningSoft} />
        </StaggerItem>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <StaggerItem index={2} style={{ flex: 1 }}>
          <StatCard icon="shield-checkmark-outline" label="Verified" value={stats.verified} iconColor={Colors.success} iconSoft={Colors.successSoft} />
        </StaggerItem>
        <StaggerItem index={3} style={{ flex: 1 }}>
          <StatCard icon="close-circle-outline" label="Rejected" value={stats.rejected} iconColor={Colors.danger} iconSoft={Colors.dangerSoft} />
        </StaggerItem>
      </View>

      <StaggerItem index={4}>
        <Card style={{ marginBottom: 16 }}>
          <SectionHeader title="Quick Actions" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { icon: 'add-circle', label: 'New Project', go: 'CreateProject' },
              { icon: 'document-text', label: 'Submit MRV', go: 'Projects' },
              { icon: 'leaf', label: 'Projects', go: 'Projects' },
              { icon: 'ribbon', label: 'Latest', go: 'ProjectDetail' },
            ].map((a) => (
              <Pressable
                key={a.label}
                style={styles.quickAction}
                onPress={() =>
                  a.go === 'ProjectDetail'
                    ? recent[0] && navigation.navigate('ProjectDetail', { projectId: recent[0].projectId })
                    : navigation.navigate(a.go)
                }
              >
                <View style={styles.quickIcon}>
                  <Ionicons name={a.icon} size={20} color={Colors.emeraldDark} />
                </View>
                <Text style={styles.quickLabel} numberOfLines={1}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      </StaggerItem>

      <SectionHeader title="Recent Projects" actionLabel="See all" onAction={() => navigation.navigate('Projects')} />
      {recent.length === 0 ? (
        <EmptyState
          icon="leaf-outline"
          title="No projects yet"
          message="Register your first environmental project to start the verification journey."
          actionLabel="Create Project"
          onAction={() => navigation.navigate('CreateProject')}
        />
      ) : (
        recent.map((p, i) => (
          <StaggerItem key={p.projectId} index={5 + i}>
            <ProjectCard project={p} onPress={() => navigation.navigate('ProjectDetail', { projectId: p.projectId })} />
          </StaggerItem>
        ))
      )}
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
