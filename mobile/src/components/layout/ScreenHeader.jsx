import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors, RoleMeta } from '../../constants/theme';
import { roleLabel, initialsOf } from '../../utils/format';
import { Badge } from '../ui';

/**
 * ScreenHeader — title + subtitle header used on tab screens.
 */
export function ScreenHeader({ title, subtitle, right, style }) {
  return (
    <View style={[{ marginBottom: 18 }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          {subtitle ? (
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 2 }}>{subtitle}</Text>
          ) : null}
          <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.6 }}>{title}</Text>
        </View>
        {right}
      </View>
    </View>
  );
}

/**
 * RoleBadge — colored role chip for profile / headers.
 */
export function RoleBadge({ role, style }) {
  const meta = RoleMeta[role] || RoleMeta.USER;
  return <Badge label={meta.label} color={meta.color} soft={meta.soft} icon={meta.icon} style={style} />;
}

/**
 * Avatar — initials avatar with ring.
 */
export function Avatar({ name = '', size = 56, color = Colors.forest, style }) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 3,
          borderColor: Colors.emeraldSoft,
        },
        style,
      ]}
    >
      <Text style={{ color: '#fff', fontSize: size * 0.34, fontWeight: '800', letterSpacing: 0.5 }}>
        {initialsOf(name)}
      </Text>
    </View>
  );
}

/**
 * KVRow — key/value detail row used in review and confirmation screens.
 */
export function KVRow({ k, v, style, last = false }) {
  return (
    <View style={[{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11 }, !last && { borderBottomWidth: 1, borderBottomColor: Colors.divider }, style]}>
      <Text style={{ fontSize: 13.5, color: Colors.textSecondary, fontWeight: '500' }}>{k}</Text>
      <Text style={{ fontSize: 13.5, color: Colors.textPrimary, fontWeight: '700', maxWidth: '58%', textAlign: 'right' }}>{v}</Text>
    </View>
  );
}

/**
 * CreditFlow — visual explanation of the credit lifecycle:
 * Project → Verification → Credits → Purchase → Retirement.
 */
export function CreditFlow({ compact = false }) {
  const steps = [
    { icon: 'leaf-outline', label: 'Project' },
    { icon: 'shield-checkmark-outline', label: 'Verification' },
    { icon: 'ribbon-outline', label: 'Credits' },
    { icon: 'cart-outline', label: 'Purchase' },
    { icon: 'lock-closed-outline', label: 'Retirement' },
  ];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      {steps.map((s, i) => (
        <React.Fragment key={s.label}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <View
              style={[
                styles.flowIcon,
                i === steps.length - 1 && { backgroundColor: Colors.forest },
              ]}
            >
              <Ionicons
                name={s.icon}
                size={compact ? 16 : 18}
                color={i === steps.length - 1 ? Colors.lime : Colors.emeraldDark}
              />
            </View>
            <Text style={[styles.flowLabel, compact && { fontSize: 9.5 }]} numberOfLines={1}>
              {s.label}
            </Text>
          </View>
          {i < steps.length - 1 ? (
            <View style={styles.flowConnector}>
              <View style={styles.flowLine} />
              <Ionicons name="chevron-forward" size={11} color={Colors.borderStrong} />
            </View>
          ) : null}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.emeraldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowLabel: { fontSize: 10.5, fontWeight: '700', color: Colors.textSecondary, marginTop: 6 },
  flowConnector: { alignItems: 'center', width: 14, marginBottom: 16 },
  flowLine: { position: 'absolute', top: 19, left: -6, right: -6, height: 1.6, backgroundColor: Colors.border },
});
