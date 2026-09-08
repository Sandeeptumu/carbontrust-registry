import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors } from '../../constants/theme';
import { retireCredits } from '../../services/registryService';
import { formatCredits, formatDateTime } from '../../utils/format';
import { PrimaryButton, Card, Input, Badge } from '../../components/ui';
import { KVRow } from '../../components/layout/ScreenHeader';
import { SuccessCheckmark, FadeInView } from '../../components/animated/AnimatedCountUp';
import { ApiError } from '../../services/api';
import { useNotifications } from '../../hooks/useNotifications';

const REASONS = [
  { id: 'CORPORATE_NET_ZERO', label: 'Corporate Net-Zero', icon: 'business-outline' },
  { id: 'FLIGHT_TRAVEL', label: 'Flight Travel', icon: 'airplane-outline' },
  { id: 'EVENT_OFFSET', label: 'Event Offset', icon: 'calendar-outline' },
  { id: 'PERSONAL_OFFSET', label: 'Personal Offset', icon: 'person-outline' },
  { id: 'GIFT', label: 'Gift', icon: 'gift-outline' },
  { id: 'OTHER', label: 'Other', icon: 'ellipsis-horizontal' },
];

export default function RetireScreen({ route, navigation }) {
  const purchase = route.params?.purchase;
  const retiredAlready = route.params?.retiredAlready || 0;
  const { add } = useNotifications();

  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('CORPORATE_NET_ZERO');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);

  const maxRemaining = Math.max(0, (Number(purchase?.quantity) || 0) - retiredAlready);
  const qty = Math.max(0, Number(quantity) || 0);
  const overLimit = qty > maxRemaining;
  const valid = qty >= 0.01 && !overLimit && reason;

  if (!purchase) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.textSecondary }}>No purchase selected.</Text>
      </View>
    );
  }

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await retireCredits(purchase.purchaseId, {
        quantity: qty,
        reason: note.trim() ? `${reason} — ${note.trim()}` : reason,
      });
      setDone(res);
      add({
        title: 'Credits retired',
        body: `${formatCredits(qty)} credits permanently retired from ${purchase.projectName || 'your portfolio'}`,
        type: 'retirement',
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Retirement failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <View style={[styles.container, { justifyContent: 'center', paddingHorizontal: 26 }]}>
        <FadeInView>
          <SuccessCheckmark size={112} color={Colors.forest} />
        </FadeInView>
        <Text style={styles.successTitle}>Credits Successfully Retired</Text>
        <Text style={styles.successMsg}>
          {formatCredits(done.quantity)} credits have been permanently removed from circulation. This action is
          permanent and recorded in the registry.
        </Text>

        <Card style={{ alignSelf: 'stretch', width: '100%', marginTop: 24 }}>
          <KVRow k="Credits retired" v={formatCredits(done.quantity)} />
          <KVRow k="Project" v={done.projectName || purchase.projectName || '—'} />
          <KVRow k="Reason" v={done.reason || reason} />
          <KVRow k="Date" v={formatDateTime(done.retirementDate)} last />
        </Card>

        <PrimaryButton label="View Retirements" style={{ alignSelf: 'stretch', width: '100%', marginTop: 20 }} onPress={() => navigation.replace('Retirements')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Retire Credits</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Card style={{ marginBottom: 16, borderLeftWidth: 3, borderLeftColor: Colors.warning }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Ionicons name="information-circle" size={20} color={Colors.warning} />
            <Text style={{ flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 19, fontWeight: '500' }}>
              Retiring carbon credits <Text style={{ fontWeight: '800', color: Colors.textPrimary }}>permanently removes
              them from future circulation</Text>. Retired credits cannot be sold or transferred again.
            </Text>
          </View>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ fontSize: 15.5, fontWeight: '800', color: Colors.textPrimary }} numberOfLines={1}>
              {purchase.projectName || `Purchase #${purchase.purchaseId}`}
            </Text>
            <Badge label={`${formatCredits(maxRemaining)} available`} color={Colors.emeraldDark} soft={Colors.emeraldSoft} />
          </View>

          <Input
            label="Credits to retire"
            icon="lock-closed-outline"
            keyboardType="decimal-pad"
            placeholder={`Max ${formatCredits(maxRemaining)}`}
            value={quantity}
            onChangeText={setQuantity}
            error={overLimit ? 'Quantity exceeds your remaining credits' : quantity && qty < 0.01 ? 'Minimum 0.01 credits' : null}
            style={{ marginTop: 10 }}
          />

          <Text style={styles.sectionLabel}>Retirement Reason</Text>
          <View style={styles.reasonGrid}>
            {REASONS.map((r) => (
              <PressableReason key={r.id} reason={r} active={reason === r.id} onPress={() => setReason(r.id)} />
            ))}
          </View>

          <Input
            label="Beneficiary / note (optional)"
            icon="create-outline"
            placeholder="e.g. On behalf of ACME Corp"
            value={note}
            onChangeText={setNote}
            style={{ marginTop: 6 }}
          />

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <PrimaryButton
            label={`Retire ${qty > 0 ? formatCredits(qty) : ''} Credits`}
            onPress={submit}
            loading={loading}
            disabled={!valid}
            icon="lock-closed"
            style={{ marginTop: 4 }}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

function PressableReason({ reason, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.reason, active && { borderColor: Colors.forest, backgroundColor: Colors.emeraldSoft }]}>
      <Ionicons name={reason.icon} size={16} color={active ? Colors.forest : Colors.textSecondary} />
      <Text style={[styles.reasonText, active && { color: Colors.forest, fontWeight: '800' }]} numberOfLines={1}>
        {reason.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.forest,
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8, marginTop: 6 },
  reasonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  reason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.4,
    borderColor: Colors.border,
    borderRadius: Theme.radius.pill,
    backgroundColor: Colors.surface,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  reasonText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
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
  successTitle: { fontSize: 23, fontWeight: '800', color: Colors.textPrimary, marginTop: 20, letterSpacing: -0.5, textAlign: 'center' },
  successMsg: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 21 },
});
