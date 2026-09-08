import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors } from '../../constants/theme';
import { submitMRV } from '../../services/registryService';
import { ApiError } from '../../services/api';
import { PrimaryButton, Card, Input, Badge } from '../../components/ui';
import { SuccessCheckmark, FadeInView } from '../../components/animated/AnimatedCountUp';
import { useNotifications } from '../../hooks/useNotifications';

/**
 * MRV submission against the existing backend contract:
 * POST /projects/{projectId}/mrv  { photoVerification: boolean, remarks: string }
 *
 * The photo toggle captures the "photos attached & verified in field"
 * declaration; measurements and document notes are appended to remarks so
 * no backend behavior is invented.
 */
export default function SubmitMrvScreen({ route, navigation }) {
  const projectId = route.params?.projectId;
  const projectName = route.params?.projectName || 'Project';
  const { add } = useNotifications();

  const [photoVerification, setPhotoVerification] = useState(false);
  const [measurements, setMeasurements] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setError(null);
    if (!photoVerification) {
      setError('Please confirm that geo-tagged field photos were captured for this reporting period.');
      return;
    }
    setLoading(true);
    try {
      const fullRemarks = [
        remarks.trim(),
        measurements.trim() ? `Measurements: ${measurements.trim()}` : null,
      ]
        .filter(Boolean)
        .join('\n');
      await submitMRV(projectId, { photoVerification, remarks: fullRemarks });
      add({ title: 'MRV submitted', body: `${projectName} is awaiting verifier review.`, type: 'mrv' });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <View style={styles.doneRoot}>
        <FadeInView>
          <SuccessCheckmark size={108} />
        </FadeInView>
        <Text style={styles.doneTitle}>MRV Evidence Submitted</Text>
        <Text style={styles.doneMsg}>
          {projectName} is now awaiting verifier review. You will be notified when the verification is completed.
        </Text>
        <PrimaryButton label="Back to Project" style={{ alignSelf: 'stretch', marginTop: 26 }} onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Submit MRV Evidence</Text>
        <Text style={styles.headerSub} numberOfLines={1}>{projectName}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Card style={{ marginBottom: 16 }}>
          <View style={styles.mrvBadgeRow}>
            <View style={styles.mrvStep}>
              <Text style={styles.mrvStepLetter}>M</Text>
              <Text style={styles.mrvStepLabel}>Measurement</Text>
            </View>
            <View style={styles.mrvStep}>
              <Text style={styles.mrvStepLetter}>R</Text>
              <Text style={styles.mrvStepLabel}>Reporting</Text>
            </View>
            <View style={styles.mrvStep}>
              <Text style={styles.mrvStepLetter}>V</Text>
              <Text style={styles.mrvStepLabel}>Verification</Text>
            </View>
          </View>
          <Text style={{ fontSize: 12.5, color: Colors.textSecondary, lineHeight: 19 }}>
            MRV is the evidence backbone of every carbon credit: measure the site, report the data, and pass independent
            verification before credits are issued.
          </Text>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Text style={styles.sectionLabel}>Field Photos</Text>
          <Pressable
            onPress={() => {
              setPhotoVerification((v) => !v);
              setError(null);
            }}
            style={[styles.photoToggle, photoVerification && { borderColor: Colors.success, backgroundColor: Colors.successSoft }]}
          >
            <View style={[styles.photoIcon, { backgroundColor: photoVerification ? Colors.success : Colors.surfaceMuted }]}>
              <Ionicons name={photoVerification ? 'checkmark' : 'camera-outline'} size={20} color={photoVerification ? '#fff' : Colors.textTertiary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textPrimary }}>
                {photoVerification ? 'Photos captured & geo-tagged' : 'Confirm field photos'}
              </Text>
              <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>
                Tap to declare geo-tagged site photos were captured this period.
              </Text>
            </View>
          </Pressable>

          <Input
            label="Measurements"
            icon="stats-chart-outline"
            placeholder="e.g. 42 plots surveyed; 1.3m avg canopy height"
            value={measurements}
            onChangeText={setMeasurements}
            multiline
            style={{ marginTop: 8 }}
          />
          <Input
            label="Remarks"
            icon="create-outline"
            placeholder="Observations, seasonal notes, incidents…"
            value={remarks}
            onChangeText={setRemarks}
            multiline
            hint="Maximum 2000 characters"
          />

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <PrimaryButton label="Submit for Verification" icon="paper-plane-outline" loading={loading} onPress={submit} />
        </Card>
      </ScrollView>
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
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#fff', textAlign: 'center' },
  headerSub: { fontSize: 12.5, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 3 },
  doneRoot: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 30 },
  doneTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginTop: 20, letterSpacing: -0.5, textAlign: 'center' },
  doneMsg: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 21 },
  mrvBadgeRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 14 },
  mrvStep: { alignItems: 'center' },
  mrvStepLetter: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: Colors.emeraldSoft,
    color: Colors.emeraldDark,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 40,
    overflow: 'hidden',
  },
  mrvStepLabel: { fontSize: 10.5, fontWeight: '700', color: Colors.textSecondary, marginTop: 6 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  photoToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.6,
    borderColor: Colors.border,
    borderRadius: Theme.radius.md,
    padding: 14,
    backgroundColor: Colors.surface,
  },
  photoIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dangerSoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: Theme.radius.md,
    marginBottom: 12,
  },
  errorText: { color: Colors.danger, fontSize: 13, fontWeight: '600', flex: 1 },
});
