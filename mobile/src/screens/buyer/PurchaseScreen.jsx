import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors } from '../../constants/theme';
import { purchaseCredits } from '../../services/registryService';
import { formatCredits, formatCurrency } from '../../utils/format';
import { PrimaryButton, Card, Input, Toast, Badge } from '../../components/ui';
import { KVRow } from '../../components/layout/ScreenHeader';
import { SuccessCheckmark, FadeInView } from '../../components/animated/AnimatedCountUp';
import { ApiError } from '../../services/api';
import { useNotifications } from '../../hooks/useNotifications';

const PAYMENT_METHODS = [
  { id: 'CARD', label: 'Card', icon: 'card-outline' },
  { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: 'business-outline' },
  { id: 'MOBILE_MONEY', label: 'Mobile Money', icon: 'phone-portrait-outline' },
];

export default function PurchaseScreen({ route, navigation }) {
  const credit = route.params?.credit;
  const { add } = useNotifications();
  const [quantity, setQuantity] = useState('');
  const [method, setMethod] = useState('CARD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);
  const [toast, setToast] = useState(null);

  const qty = Math.max(0, Number(quantity) || 0);
  const available = Number(credit?.availableQuantity) || 0;
  const price = Number(credit?.pricePerCredit) || 0;
  const total = useMemo(() => qty * price, [qty, price]);

  const overLimit = qty > available;
  const valid = qty >= 0.01 && !overLimit;

  if (!credit) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={{ color: Colors.textSecondary }}>No credit batch selected.</Text>
      </View>
    );
  }

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await purchaseCredits(credit.ccbId, { quantity: qty, paymentMethod: method });
      setDone(res);
      add({
        title: 'Purchase successful',
        body: `${formatCredits(qty)} credits from ${credit.projectName}`,
        type: 'purchase',
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <View style={[styles.container, { justifyContent: 'center', paddingHorizontal: 26 }]}>
        <FadeInView>
          <SuccessCheckmark size={112} />
        </FadeInView>
        <Text style={styles.successTitle}>Carbon Credits Purchased</Text>
        <Text style={styles.successMsg}>
          {formatCredits(done.quantity)} credits from {done.projectName || credit.projectName} are now in your portfolio.
        </Text>

        <Card style={{ alignSelf: 'stretch', width: '100%', marginTop: 24 }}>
          <KVRow k="Credits" v={formatCredits(done.quantity)} />
          <KVRow k="Total paid" v={formatCurrency(done.price)} />
          <KVRow k="Payment" v={done.paymentMethod || method} />
          <KVRow k="Status" v={done.paymentStatus || 'COMPLETED'} last />
        </Card>

        <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'stretch', width: '100%', marginTop: 20 }}>
          <PrimaryButton label="My Credits" variant="outline" style={{ flex: 1 }} onPress={() => navigation.replace('BuyerCredits')} />
          <PrimaryButton label="Marketplace" style={{ flex: 1 }} onPress={() => navigation.popToTop()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Buy Credits</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Card gradient={Theme.gradients.brand} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.batchIcon}>
              <Ionicons name="leaf" size={22} color={Colors.lime} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: '#fff', fontSize: 16.5, fontWeight: '800', letterSpacing: -0.3 }}>
                {credit.projectName}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12.5, marginTop: 3 }}>
                {credit.location} • {credit.ecosystemType}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            <View style={[styles.metaChip]}>
              <Ionicons name="checkmark-circle" size={13} color={Colors.lime} />
              <Text style={styles.metaChipText}>Verified</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="cube-outline" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={[styles.metaChipText]}>{formatCredits(available)} available</Text>
            </View>
          </View>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Input
            label={`Quantity (max ${formatCredits(available)})`}
            icon="cube-outline"
            keyboardType="decimal-pad"
            placeholder="e.g. 25"
            value={quantity}
            onChangeText={setQuantity}
            error={overLimit ? 'Quantity exceeds available credits' : quantity && qty < 0.01 ? 'Minimum 0.01 credits' : null}
          />

          <Text style={styles.sectionLabel}>Payment Method</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {PAYMENT_METHODS.map((m) => (
              <PressableMethod
                key={m.id}
                method={m}
                active={method === m.id}
                onPress={() => setMethod(m.id)}
              />
            ))}
          </View>

          <View style={{ marginTop: 18, borderTopWidth: 1, borderTopColor: Colors.divider }}>
            <KVRow k="Price per credit" v={formatCurrency(price)} />
            <KVRow k="Credits" v={formatCredits(qty)} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textPrimary }}>Total</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.forest }}>{formatCurrency(total)}</Text>
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <PrimaryButton
            label={`Buy ${qty > 0 ? formatCredits(qty) : ''} Credits`}
            onPress={submit}
            loading={loading}
            disabled={!valid}
            icon="bag-handle"
            style={{ marginTop: 4 }}
          />
        </Card>

        <Text style={styles.footnote}>
          <Ionicons name="shield-checkmark-outline" size={12} color={Colors.textTertiary} /> Purchases are recorded against
          verified batches issued through the CarbonTrust registry.
        </Text>
      </ScrollView>
      <Toast visible={Boolean(toast)} message={toast || ''} onHide={() => setToast(null)} />
    </View>
  );
}

function PressableMethod({ method, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.method,
        active && { borderColor: Colors.forest, backgroundColor: Colors.emeraldSoft },
      ]}
    >
      <Ionicons name={method.icon} size={18} color={active ? Colors.forest : Colors.textSecondary} />
      <Text style={[styles.methodText, active && { color: Colors.forest, fontWeight: '800' }]} numberOfLines={1}>
        {method.label}
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
  batchIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Theme.radius.pill,
  },
  metaChipText: { color: 'rgba(255,255,255,0.85)', fontSize: 11.5, fontWeight: '700' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8, marginTop: 6 },
  method: {
    flex: 1,
    borderWidth: 1.4,
    borderColor: Colors.border,
    borderRadius: Theme.radius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    paddingVertical: 12,
    gap: 5,
  },
  methodText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
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
  footnote: { fontSize: 11.5, color: Colors.textTertiary, textAlign: 'center', lineHeight: 18, fontWeight: '600' },
  successTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginTop: 20, letterSpacing: -0.6, textAlign: 'center' },
  successMsg: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 21 },
});
