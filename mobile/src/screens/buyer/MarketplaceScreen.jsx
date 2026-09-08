import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors } from '../../constants/theme';
import { getMarketplaceCredits } from '../../services/registryService';
import { ApiError } from '../../services/api';
import { ListSkeleton, EmptyState, ErrorState } from '../../components/ui';
import { MarketplaceCard } from '../../components/registry/ProjectCard';
import { ScreenHeader } from '../../components/layout/ScreenHeader';

export default function MarketplaceScreen({ navigation }) {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getMarketplaceCredits();
      setCredits(data || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return credits;
    return credits.filter(
      (c) =>
        (c.projectName || '').toLowerCase().includes(q) ||
        (c.location || '').toLowerCase().includes(q) ||
        (c.ecosystemType || '').toLowerCase().includes(q) ||
        (c.ownerUsername || '').toLowerCase().includes(q)
    );
  }, [credits, query]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={styles.headerPad} />
      <View style={styles.body}>
        <ScreenHeader title="Marketplace" subtitle="Verified carbon credit batches" />

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={17} color={Colors.textTertiary} style={{ marginRight: 8 }} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search project, location, ecosystem…"
            placeholderTextColor={Colors.textTertiary}
            style={{ flex: 1, fontSize: 14, color: Colors.textPrimary, paddingVertical: 10 }}
          />
          {query ? (
            <Ionicons name="close-circle" size={17} color={Colors.textTertiary} onPress={() => setQuery('')} />
          ) : null}
        </View>

        {loading ? (
          <ListSkeleton count={4} height={150} />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.ccbId)}
            renderItem={({ item, index }) => (
              <MarketplaceCard
                credit={item}
                onPress={() => navigation.navigate('Purchase', { credit: item })}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                icon="storefront-outline"
                title="No batches found"
                message={query ? 'Try a different search term.' : 'Verified credit batches will appear here once issued.'}
              />
            }
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.forest} />}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerPad: { height: 56 },
  body: { flex: 1, paddingHorizontal: 20 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Theme.radius.md,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
});
