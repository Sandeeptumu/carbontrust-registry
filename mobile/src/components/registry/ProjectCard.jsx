import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Theme, { Colors } from '../../constants/theme';
import { projectStatusMeta, mrvStatusMeta, formatCredits, formatDateTime, formatCurrency } from '../../utils/format';
import { Badge, Card, ProgressBar } from '../ui';
import AnimatedCountUp from '../animated/AnimatedCountUp';

/**
 * StatusPill — normalized, colored status chip used across the registry.
 */
export function StatusPill({ kind = 'project', raw, style }) {
  const meta = kind === 'mrv' ? mrvStatusMeta(raw) : projectStatusMeta(raw);
  return <Badge label={meta.label} color={meta.color} soft={meta.soft} style={style} />;
}

/**
 * ProjectCard — NGO project listing card with status + verification progress.
 */
export function ProjectCard({ project, onPress, style, index = 0 }) {
  const meta = projectStatusMeta(project.projectStatus);
  const progress = { DRAFT: 0.1, SUBMITTED: 0.45, UNDER_REVIEW: 0.7, VERIFIED: 1, REJECTED: 0.3 }[meta.key] ?? 0.2;

  return (
    <Card onPress={onPress} style={[{ marginBottom: 12 }, style]} contentStyle={{ padding: Theme.spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={[styles.projIcon, { backgroundColor: meta.soft }]}>
          <Ionicons name="leaf" size={20} color={meta.color} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {project.projectName}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color={Colors.textTertiary} />
            <Text style={styles.metaText} numberOfLines={1}>
              {project.location}
            </Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{project.ecosystemType}</Text>
          </View>
        </View>
        <StatusPill raw={project.projectStatus} />
      </View>

      {project.description ? (
        <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 10, lineHeight: 19 }} numberOfLines={2}>
          {project.description}
        </Text>
      ) : null}

      <View style={{ marginTop: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={styles.progressLabel}>Verification progress</Text>
          <Text style={[styles.progressLabel, { color: meta.color }]}>{Math.round(progress * 100)}%</Text>
        </View>
        <ProgressBar progress={progress} color={meta.color} />
      </View>
    </Card>
  );
}

/**
 * MrvCard — verifier queue / NGO history card.
 */
export function MrvCard({ submission, onPress, style }) {
  const meta = mrvStatusMeta(submission.mrvStatus);
  return (
    <Card onPress={onPress} style={[{ marginBottom: 12 }, style]} contentStyle={{ padding: Theme.spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={[styles.projIcon, { backgroundColor: meta.soft }]}>
          <Ionicons name="document-text" size={20} color={meta.color} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {submission.projectName || `MRV #${submission.mrvId}`}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="person-circle-outline" size={13} color={Colors.textTertiary} />
            <Text style={styles.metaText}>{submission.ownerUsername || 'NGO'}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{formatDateTime(submission.uploadDate)}</Text>
          </View>
        </View>
        <Badge label={meta.label} color={meta.color} soft={meta.soft} />
      </View>

      {submission.remarks ? (
        <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 10, lineHeight: 19 }} numberOfLines={2}>
          {submission.remarks}
        </Text>
      ) : null}

      <View style={styles.chipRow}>
        <View style={[styles.chip, { backgroundColor: submission.photoVerification ? Colors.successSoft : Colors.warningSoft }]}>
          <Ionicons
            name={submission.photoVerification ? 'checkmark-circle' : 'time'}
            size={13}
            color={submission.photoVerification ? Colors.success : Colors.warning}
          />
          <Text style={[styles.chipText, { color: submission.photoVerification ? Colors.success : Colors.warning }]}>
            {submission.photoVerification ? 'Photos verified' : 'Photos pending'}
          </Text>
        </View>
        <View style={[styles.chip, { backgroundColor: Colors.surfaceMuted }]}>
          <Ionicons name="pricetag-outline" size={13} color={Colors.textSecondary} />
          <Text style={[styles.chipText, { color: Colors.textSecondary }]}>MRV #{submission.mrvId}</Text>
        </View>
      </View>
    </Card>
  );
}

/**
 * MarketplaceCard — credit batch listing for buyers.
 */
export function MarketplaceCard({ credit, onPress, style }) {
  return (
    <Card onPress={onPress} style={[{ marginBottom: 12 }, style]} contentStyle={{ padding: 0, overflow: 'hidden' }}>
      <LinearGradient colors={Theme.gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={{ padding: Theme.spacing.lg, flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.creditIcon}>
            <Ionicons name="leaf" size={22} color={Colors.lime} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.3 }} numberOfLines={1}>
              {credit.projectName}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
              <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.7)" />
              <Text style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)', marginLeft: 4 }} numberOfLines={1}>
                {credit.location} • {credit.ecosystemType}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '600' }}>AVAILABLE</Text>
            <AnimatedCountUp
              value={credit.availableQuantity}
              decimals={0}
              style={{ fontSize: 22, fontWeight: '800', color: Colors.lime, letterSpacing: -0.5 }}
            />
          </View>
        </View>
      </LinearGradient>

      <View style={{ padding: Theme.spacing.lg, paddingTop: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 0.6 }}>PRICE / CREDIT</Text>
            <Text style={{ fontSize: 17, fontWeight: '800', color: Colors.textPrimary }}>
              {formatCurrency(credit.pricePerCredit)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 0.6 }}>ISSUED BY</Text>
            <Text style={{ fontSize: 13.5, fontWeight: '700', color: Colors.textPrimary }}>{credit.ownerUsername}</Text>
          </View>
        </View>

        {credit.description ? (
          <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 12, lineHeight: 19 }} numberOfLines={2}>
            {credit.description}
          </Text>
        ) : null}

        <View style={[styles.buyBtn, { backgroundColor: Colors.forest }]}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>View Credits</Text>
          <Ionicons name="arrow-forward" size={15} color="#fff" style={{ marginLeft: 6 }} />
        </View>
      </View>
    </Card>
  );
}

/**
 * PurchaseCard — buyer purchase history card with retire action state.
 */
export function PurchaseCard({ purchase, retired = 0, onRetire, style }) {
  const remaining = Math.max(0, (purchase.quantity || 0) - (retired || 0));
  return (
    <Card style={[{ marginBottom: 12 }, style]} contentStyle={{ padding: Theme.spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={[styles.projIcon, { backgroundColor: Colors.emeraldSoft }]}>
          <Ionicons name="bag-handle" size={20} color={Colors.emeraldDark} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {purchase.projectName || `Batch #${purchase.ccbId}`}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={13} color={Colors.textTertiary} />
            <Text style={styles.metaText}>{formatDateTime(purchase.purchaseDate)}</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary }}>{formatCredits(purchase.quantity)}</Text>
          <Text style={{ fontSize: 10.5, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 0.5 }}>CREDITS</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
        <View style={[styles.chip, { backgroundColor: Colors.surfaceMuted }]}>
          <Ionicons name="card-outline" size={13} color={Colors.textSecondary} />
          <Text style={[styles.chipText, { color: Colors.textSecondary }]}>{purchase.paymentMethod || 'CARD'}</Text>
        </View>
        <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.forest }}>{formatCurrency(purchase.price)}</Text>
      </View>

      {onRetire && remaining > 0 ? (
        <Pressable onPress={onRetire} style={[styles.buyBtn, { backgroundColor: Colors.emeraldDark, marginTop: 14 }]}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Retire Credits</Text>
          <Ionicons name="arrow-forward" size={15} color="#fff" style={{ marginLeft: 6 }} />
        </Pressable>
      ) : remaining <= 0 ? (
        <View style={[styles.buyBtn, { backgroundColor: Colors.successSoft, marginTop: 14 }]}>
          <Ionicons name="checkmark-done" size={15} color={Colors.success} />
          <Text style={{ color: Colors.success, fontWeight: '700', fontSize: 13.5, marginLeft: 6 }}>Fully retired</Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  projIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 15.5, fontWeight: '800', color: Colors.textPrimary, flex: 1, marginRight: 8, letterSpacing: -0.2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaText: { fontSize: 12.5, color: Colors.textTertiary, marginLeft: 4 },
  metaDot: { fontSize: 12, color: Colors.textTertiary, marginHorizontal: 6 },
  progressLabel: { fontSize: 11.5, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 0.4 },
  chipRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Theme.radius.pill,
  },
  chipText: { fontSize: 11.5, fontWeight: '700' },
  creditIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtn: {
    marginTop: 14,
    height: 44,
    borderRadius: Theme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
