import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors } from '../../constants/theme';
import { submitVerification, getMRVVerifications } from '../../services/registryService';
import { ApiError } from '../../services/api';
import { formatDateTime, mrvStatusMeta } from '../../utils/format';
import { PrimaryButton, Card, Badge, SectionHeader } from '../../components/ui';
import { KVRow } from '../../components/layout/ScreenHeader';
import { SuccessCheckmark, FadeInView, StaggerItem } from '../../components/animated/AnimatedCountUp';
import { useNotifications } from '../../hooks/useNotifications';

export default function VerifierReviewScreen({ route, navigation }) {
  const mrv = route.params?.mrv;
  const { add } = useNotifications();
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState(null);
  const [approved, setApproved] = useState(false);
  const [prior, setPrior] = useState([]);

  React.useEffect(() => {
    if (mrv?.mrvId) {
      getMRVVerifications(mrv.mrvId)
        .then(setPrior)
        .catch(() => {});
    }
  }, [mrv?.mrvId]);

  if (!mrv) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.textSecondary }}>No submission selected.</Text>
      </View>
    );
  }

  const meta = mrvStatusMeta(mrv.mrvStatus);

  const act = async (status, reason) => {
    setError(null);
    setLoading(true);
    try {
      await submitVerification(mrv.mrvId, {
        verificationStatus: status,
        comments: reason || comments || '',
      });
      setLoading(false);
      if (status === 'APPROVED') {
        setApproved(true);
        add({ title: 'Verification approved', body: `${mrv.projectName || `MRV #${mrv.mrvId}`} approved.`, type: 'verification' });
      } else {
        setRejectOpen(false);
        Alert.alert('Submission Rejected', 'The NGO has been notified with your reason.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      setLoading(false);
      setError(err instanceof ApiError ? err.message : 'Action failed. Please try again.');
    }
  };

  if (approved) {
    return (
      <View style={styles.doneRoot}>
        <FadeInView>
          <SuccessCheckmark size={112} />
        </FadeInView>
        <Text style={styles.doneTitle}>Verification Approved</Text>
        <Text style={styles.doneMsg}>
          {mrv.projectName || `MRV #${mrv.mrvId}`} has passed verification. The NGO can now be issued carbon credits.
        </Text>
        <PrimaryButton label="Back to Queue" style={{ alignSelf: 'stretch', marginTop: 26 }} onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <PressableBtn onPress={() => navigation.goBack()} icon="chevron-back" />
          <Text style={styles.headerTitle} numberOfLines={1}>Compliance Review</Text>
          <View style={{ width: 38 }} />
        </View>
        <Text style={styles.headerProject} numberOfLines={1}>
          {mrv.projectName || `MRV #${mrv.mrvId}`}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Verification status banner */}
        <StaggerItem index={0}>
          <Card style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[styles.statusIcon, { backgroundColor: meta.soft }]}>
              <Ionicons name="shield-checkmark" size={20} color={meta.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14.5, fontWeight: '800', color: Colors.textPrimary }}>{meta.label}</Text>
              <Text style={{ fontSize: 12, color: Colors.textTertiary, marginTop: 2 }}>
                Submitted {formatDateTime(mrv.uploadDate)}
              </Text>
            </View>
            <Badge label={`MRV #${mrv.mrvId}`} color={Colors.textSecondary} />
          </Card>
        </StaggerItem>

        {/* Project information */}
        <StaggerItem index={1}>
          <Card style={{ marginBottom: 16 }}>
            <SectionHeader title="Project Information" />
            <KVRow k="Project" v={mrv.projectName || '—'} />
            <KVRow k="Ecosystem" v={mrv.ecosystemType || '—'} />
            <KVRow k="Location" v={mrv.location || '—'} />
            <KVRow k="NGO" v={mrv.ownerUsername || '—'} />
            <KVRow k="Project status" v={(mrv.projectStatus || '—').replace('_', ' ')} last />
          </Card>
        </StaggerItem>

        {/* Evidence */}
        <StaggerItem index={2}>
          <Card style={{ marginBottom: 16 }}>
            <SectionHeader title="Evidence & Measurements" />
            <View style={styles.evidenceRow}>
              <Ionicons name={mrv.photoVerification ? 'checkmark-circle' : 'alert-circle'} size={17} color={mrv.photoVerification ? Colors.success : Colors.warning} />
              <Text style={styles.evidenceText}>
                {mrv.photoVerification
                  ? 'Geo-tagged field photos declared by NGO'
                  : 'No photo verification declared'}
              </Text>
            </View>
            {mrv.remarks ? (
              <View style={styles.remarksBox}>
                <Text style={styles.remarksLabel}>NGO Remarks</Text>
                <Text style={styles.remarksText}>{mrv.remarks}</Text>
              </View>
            ) : (
              <Text style={{ fontSize: 13, color: Colors.textTertiary, marginTop: 10 }}>No remarks provided.</Text>
            )}
          </Card>
        </StaggerItem>

        {/* Prior verifications */}
        {prior.length > 0 ? (
          <StaggerItem index={3}>
            <Card style={{ marginBottom: 16 }}>
              <SectionHeader title="Verification Trail" />
              {prior.map((v) => (
                <View key={v.verificationId} style={styles.trailRow}>
                  <Ionicons
                    name={v.verificationStatus === 'APPROVED' ? 'checkmark-circle' : 'close-circle'}
                    size={15}
                    color={v.verificationStatus === 'APPROVED' ? Colors.success : Colors.danger}
                  />
                  <Text style={styles.trailText} numberOfLines={1}>
                    {v.verifierUsername || 'Verifier'} • {(v.comments || v.verificationStatus).slice(0, 40)}
                  </Text>
                  <Text style={styles.trailTime}>{formatDateTime(v.verificationDate)}</Text>
                </View>
              ))}
            </Card>
          </StaggerItem>
        ) : null}

        {/* Reviewer comments */}
        <StaggerItem index={4}>
          <Card style={{ marginBottom: 20 }}>
            <SectionHeader title="Reviewer Comments" />
            <TextInput
              value={comments}
              onChangeText={setComments}
              placeholder="Add context for your decision (optional for approvals)…"
              placeholderTextColor={Colors.textTertiary}
              multiline
              style={styles.commentsInput}
            />
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </Card>
        </StaggerItem>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <PrimaryButton label="Reject" variant="danger" icon="close" style={{ flex: 1 }} onPress={() => setRejectOpen(true)} />
          <PrimaryButton label="Approve" variant="success" icon="checkmark" style={{ flex: 1 }} loading={loading} onPress={() => act('APPROVED')} />
        </View>
      </ScrollView>

      {/* Reject reason modal */}
      <Modal visible={rejectOpen} transparent animationType="slide" onRequestClose={() => setRejectOpen(false)}>
        <View style={styles.modalScrim}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Rejection Reason</Text>
            <Text style={styles.modalSubtitle}>
              A clear reason is required so the NGO can correct and resubmit.
            </Text>
            <TextInput
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="e.g. Photo evidence does not cover the reported plot area…"
              placeholderTextColor={Colors.textTertiary}
              multiline
              style={[styles.commentsInput, { minHeight: 100 }]}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <PrimaryButton label="Cancel" variant="ghost" style={{ flex: 1 }} onPress={() => setRejectOpen(false)} />
              <PrimaryButton
                label="Reject Submission"
                variant="danger"
                style={{ flex: 2 }}
                loading={loading}
                disabled={rejectReason.trim().length < 5}
                onPress={() => act('REJECTED', rejectReason.trim())}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function PressableBtn({ onPress, icon }) {
  return (
    <Pressable onPress={onPress} style={styles.headerBtn}>
      <Ionicons name={icon} size={22} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  statusIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  evidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  evidenceText: { flex: 1, fontSize: 13.5, fontWeight: '600', color: Colors.textPrimary },
  remarksBox: { backgroundColor: Colors.surfaceAlt, borderRadius: Theme.radius.md, padding: 12, marginTop: 12 },
  remarksLabel: { fontSize: 11, fontWeight: '800', color: Colors.textTertiary, letterSpacing: 0.6, marginBottom: 4 },
  remarksText: { fontSize: 13.5, color: Colors.textPrimary, lineHeight: 20 },
  trailRow: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  trailText: { flex: 1, fontSize: 12.5, fontWeight: '600', color: Colors.textPrimary },
  trailTime: { fontSize: 11, color: Colors.textTertiary },
  commentsInput: {
    borderWidth: 1.4,
    borderColor: Colors.border,
    borderRadius: Theme.radius.md,
    backgroundColor: Colors.surface,
    padding: 14,
    minHeight: 90,
    textAlignVertical: 'top',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dangerSoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: Theme.radius.md,
    marginTop: 10,
  },
  errorText: { color: Colors.danger, fontSize: 13, fontWeight: '600', flex: 1 },
  doneRoot: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 30 },
  doneTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginTop: 20, letterSpacing: -0.5, textAlign: 'center' },
  doneMsg: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 21 },
  modalScrim: { flex: 1, backgroundColor: Colors.scrim, justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: 34,
  },
  modalHandle: { alignSelf: 'center', width: 42, height: 4.5, borderRadius: 3, backgroundColor: Colors.borderStrong, marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  modalSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, marginBottom: 14, lineHeight: 19 },
});
