import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors } from '../../constants/theme';
import { getProjects } from '../../services/registryService';
import { ApiError } from '../../services/api';
import { ListSkeleton, EmptyState, ErrorState } from '../../components/ui';
import { ProjectCard } from '../../components/registry/ProjectCard';
import { ScreenHeader } from '../../components/layout/ScreenHeader';

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'UNDER_REVIEW', label: 'Review' },
  { key: 'VERIFIED', label: 'Verified' },
  { key: 'REJECTED', label: 'Rejected' },
];

export default function NgoProjectsScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');

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

  const filtered = useMemo(() => {
    let list = projects;
    if (filter !== 'ALL') list = list.filter((p) => projectStatusMeta(p.projectStatus).key === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          (p.projectName || '').toLowerCase().includes(q) ||
          (p.location || '').toLowerCase().includes(q) ||
          (p.ecosystemType || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [projects, filter, query]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={styles.headerPad} />
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <ScreenHeader
          title="My Projects"
          subtitle={`${projects.length} registered project${projects.length === 1 ? '' : 's'}`}
          right={
            <Pressable style={styles.addButton} onPress={() => navigation.navigate('CreateProject')}>
              <Ionicons name="add" size={24} color="#fff" />
            </Pressable>
          }
        />

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={17} color={Colors.textTertiary} style={{ marginRight: 8 }} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search projects…"
            placeholderTextColor={Colors.textTertiary}
            style={{ flex: 1, fontSize: 14, color: Colors.textPrimary, paddingVertical: 10 }}
          />
        </View>

        <View style={styles.filters}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.filterChip, filter === f.key && { backgroundColor: Colors.forest, borderColor: Colors.forest }]}
            >
              <Text style={[styles.filterText, filter === f.key && { color: '#fff' }]}>{f.label}</Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <ListSkeleton count={4} height={130} />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.projectId)}
            renderItem={({ item }) => (
              <ProjectCard project={item} onPress={() => navigation.navigate('ProjectDetail', { projectId: item.projectId })} />
            )}
            ListEmptyComponent={
              <EmptyState
                icon="leaf-outline"
                title={query || filter !== 'ALL' ? 'No matches' : 'No projects yet'}
                message={query || filter !== 'ALL' ? 'Try adjusting your search or filters.' : 'Register your first environmental project.'}
                actionLabel={!query && filter === 'ALL' ? 'Create Project' : undefined}
                onAction={() => navigation.navigate('CreateProject')}
              />
            }
            contentContainerStyle={{ paddingBottom: 90 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Floating create button */}
      <Pressable style={styles.fab} onPress={() => navigation.navigate('CreateProject')}>
        <Ionicons name="add" size={26} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  headerPad: { height: 56 },
  addButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.forest, alignItems: 'center', justifyContent: 'center' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Theme.radius.md,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  filters: { flexDirection: 'row', gap: 7, marginBottom: 16, flexWrap: 'wrap' },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: Theme.radius.pill,
    borderWidth: 1.2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  fab: {
    position: 'absolute',
    bottom: 26,
    right: 22,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
});
