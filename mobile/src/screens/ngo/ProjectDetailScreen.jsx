import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors } from '../../constants/theme';
import { getProject, getProjectMRV, getProjectCredits, deleteProject } from '../../services/registryService';
import { ApiError } from '../../services/api';
import { formatDate, formatCredits, formatDateTime, projectStatusMeta } from '../../utils/format';
import { Card, Badge, SectionHeader, ListSkeleton, ErrorState, EmptyState, PrimaryButton } from '../../components/ui';
import { KVRow } from '../../components/layout/ScreenHeader';
import { StatusPill } from '../../components/registry/ProjectCard';
import { ProgressBar, StaggerItem } from '../../components/animated/AnimatedCountUp';

export default function ProjectDetailScreen({ route, navigation }) {
  const projectId = route.params?.projectId;
  const [project, setProject] = useState(null);
  const [mrv, setMrv] = useState([]);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    setError(null);
    try {
      const [p, m, c] = await Promise.all([
        getProject(projectId),
        getProjectMRV(projectId).catch(() => []),
        getProjectCredits(projectId).catch(() => []),
      ]);
      setProject(p);
      setMrv(m || []);
      setCredits(c || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const confirmDelete = () => {
    Alert.alert('Delete Project', 'This draft will be permanently removed. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProject(projectId);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Cannot delete', err instanceof ApiError ? err.message : 'Please try again.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, padding: 20 }}>
        <ListSkeleton count={3} height={120} />
      </View>
    );
  }

  if (error || !project) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, padding: 20 }}>
        <ErrorState message={error || 'Project not found'} onRetry={load} />
      </View>
    );
  }

  const meta = projectStatusMeta(project.projectStatus);
  const progress = { DRAFT: 0.1, SUBMITTED: 0.45, UNDER_REVIEW: 0.7, VERIFIED: 1, REJECTED: 0.3 }[meta.key] ?? 0.2;
  const totalIssued = (credits || []).reduce((s, c) => s + (Number(c.originalQuantity) || 0), 0);
  const canEdit = meta.key === 'DRAFT' || meta.key === 'REJECTED';

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <PressableIcon name="chevron-back" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle} numberOfLines={1}>Project</Text>
          <View style={{ width: 38 }} />
        </View>
        <Text style={styles.headerProject} numberOfLines={1}>{project.projectName}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <StaggerItem index={0}>
          <Card style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Badge label={meta.label} color={meta.color} soft={meta.soft} icon="shield-checkmark" />
              <Text style={{ fontSize: 12, color: Colors.textTertiary, fontWeight: '600' }}>
                Created {formatDate(project.createdAt)}
              </Text>
            </View>
            <ProgressBar progress={progress} color={meta.color} style={{ marginBottom: 4 }} />
            <Text style={{ fontSize: 11.5, color: Colors.textTertiary, fontWeight: '600', marginTop: 6 }}>
              Registry pipeline: Draft → Submitted → Review → Verified
            </Text>
          </Card>
        </StaggerItem>

        <StaggerItem index={1}>
          <Card style={{ marginBottom: 16 }}>
            <SectionHeader title="Project Information" />
            <KVRow k="Ecosystem" v={project.ecosystemType} />
            <KVRow k="Location" v={project.location} />
            <KVRow k="Area" v={`${formatCredits(project.area)} ha`} />
            <KVRow k="Start date" v={formatDate(project.startDate)} />
            <KVRow k="Owner" v={project.ownerUsername || '—'} last />
            {project.description ? (
              <Text style={{ fontSize: 13.5, color: Colors.textSecondary, lineHeight: 20, marginTop: 12 }}>
                {project.description}
              </Text>
            ) : null}
          </Card>
        </StaggerItem>

        {/* Credits issued */}
        <StaggerItem index={2}>
          <Card style={{ marginBottom: 16 }}>
            <SectionHeader title="Carbon Credit Batches" />
            {(credits || []).length === 0 ? (
              <Text style={{ fontSize: 13, color: Colors.textTertiary, paddingVertical: 8 }}>
                No credit batches issued yet. Credits are issued after successful verification.
              </Text>
            ) : (
              (credits || []).map((c) => (
                <View key={c.ccbId} style={styles.creditRow}>
                  <Ionicons name="ribbon" size={16} color={Colors.emeraldDark} />
                  <Text style={styles.creditText}>
                    {formatCredits(c.availableQuantity)} / {formatCredits(c.originalQuantity)} available
                  </Text>
                  <Text style={{ fontSize: 12, color: Colors.textTertiary, fontWeight: '600' }}>
                    {formatDate(c.issuedDate)}
                  </Text>
                </View>
              ))
            )}
            {totalIssued > 0 ? (
              <View style={{ marginTop: 8, alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 12.5, fontWeight: '800', color: Colors.emeraldDark }}>
                  Total issued: {formatCredits(totalIssued)} credits
                </Text>
              </View>
            ) : null}
          </Card>
        </StaggerItem>

        {/* MRV history */}
        <StaggerItem index={3}>
          <SectionHeader title="MRV Submissions" />
          {(mrv || []).length === 0 ? (
            <EmptyState
              icon="document-text-outline"
              title="No MRV submissions"
              message="Submit measurement evidence so verifiers can review your project."
            />
          ) : (
            (mrv || []).map((sub) => (
              <Card key={sub.mrvId} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textPrimary }}>
                      MRV #{sub.mrvId}
                    </Text>
                    <Text style={{ fontSize: 12, color: Colors.textTertiary, marginTop: 2 }}>
                      {formatDateTime(sub.uploadDate)}
                    </Text>
                  </View>
                  <StatusPill kind="mrv" raw={sub.mrvStatus} />
                </View>
                {sub.remarks ? (
                  <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 8, lineHeight: 19 }} numberOfLines={3}>
                    {sub.remarks}
                  </Text>
                ) : null}
              </Card>
            ))
          )}
        </StaggerItem>

        {/* Actions */}
        <View style={{ marginTop: 14, gap: 10 }}>
          <PrimaryButton
            label="Submit MRV Evidence"
            icon="cloud-upload-outline"
            onPress={() => navigation.navigate('SubmitMrv', { projectId, projectName: project.projectName })}
          />
          {meta.key === 'VERIFIED' ? (
            <PrimaryButton
              label="Issue Carbon Credits"
              icon="ribbon-outline"
              variant="success"
              onPress={() => navigation.navigate('IssueCredits', { projectId, projectName: project.projectName })}
            />
          ) : null}
          {canEdit ? (
            <PrimaryButton label="Delete Draft" variant="danger" icon="trash-outline" onPress={confirmDelete} />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function PressableIcon({ name, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.headerBtn}>
      <Ionicons name={name} size={22} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.forest,
    paddingTop: 54,
    paddingBottom: 18,
    paddingHorizontal: 18,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.75)' },
  headerProject: { fontSize: 21, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  creditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap: 8,
  },
  creditText: { flex: 1, fontSize: 13.5, fontWeight: '700', color: Colors.textPrimary },
});
