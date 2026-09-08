import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors } from '../../constants/theme';
import { issueCredits } from '../../services/registryService';
import { ApiError } from '../../services/api';
import { PrimaryButton, Card, Input } from '../../components/ui';
import { SuccessCheckmark, FadeInView } from '../../components/animated/AnimatedCountUp';
import { formatCredits } from '../../utils/format';
import { useNotifications } from '../../hooks/useNotifications';

export default function IssueCreditsScreen({ route, navigation }) {
  const projectId = route.params?.projectId;
  const projectName = route.params?.projectName || 'Project';
  const { add } = useNotifications();
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [issued, setIssued] = useState(null);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await issueCredits(projectId, Number(quantity));
      setIssued(res);
      add({
        title: 'Carbon credits issued',
        body: `${formatCredits(res.originalQuantity || quantity)} credits issued for ${res.projectName || projectName}`,
        type: 'credits',
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not issue credits. Check that the project is verified.');
    } finally {
      setLoading(false);
    }
  };

  if (issued) {
    return (
      <View style={styles.doneRoot}>
        <FadeInView>
          <SuccessCheckmark size={108} />
        </FadeInView>
        <Text style={styles.doneTitle}>Credits Issued 🌱</Text>
        <Text style={styles.doneMsg}>
          {formatCredits(issued.originalQuantity)} carbon credits were minted for {issued.projectName || projectName} and
          are now available on the marketplace.
        </Text>
        <PrimaryButton label="Back to Project" style={{ alignSelf: 'stretch', marginTop: 26 }} onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Issue Carbon Credits</Text>
        <Text style={styles.headerSub} numberOfLines={1}>{projectName}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Card style={{ marginBottom: 16, borderLeftWidth: 3, borderLeftColor: Colors.emerald }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Ionicons name="ribbon" size={20} color={Colors.emeraldDark} />
            <Text style={{ flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 19, fontWeight: '500' }}>
              Issue a batch of carbon credits for this verified project. Issued batches become visible on the
              marketplace for buyers.
            </Text>
          </View>
        </Card>

        <Card>
          <Input
            label="Credit quantity (tCO₂e)"
            icon="ribbon-outline"
            keyboardType="decimal-pad"
            placeholder="e.g. 500"
            value={quantity}
            onChangeText={setQuantity}
            hint="Total credits to mint in this batch"
          />

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <PrimaryButton
            label="Issue Credits"
            icon="ribbon"
            loading={loading}
            disabled={!(Number(quantity) > 0)}
            onPress={submit}
          />
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
