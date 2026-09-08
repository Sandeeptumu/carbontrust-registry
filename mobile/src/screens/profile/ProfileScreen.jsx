import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge, Avatar, ScreenHeader } from '../../components/layout/ScreenHeader';
import { Card } from '../../components/ui';
import { isWeb } from '../../utils/format';

const SECTIONS = [
  {
    title: 'Account',
    items: [
      { icon: 'person-circle-outline', label: 'Account details', note: () => 'View only' },
      { icon: 'ribbon-outline', label: 'Carbon portfolio', note: () => 'Credits & purchases' },
    ],
  },
  {
    title: 'Security',
    items: [
      { icon: 'shield-checkmark-outline', label: 'JWT session security', note: () => 'Managed by the registry' },
      { icon: 'key-outline', label: 'Token storage', note: () => (isWeb ? 'Browser storage' : 'Device Keychain/Keystore') },
    ],
  },
  {
    title: 'Privacy',
    items: [
      { icon: 'heart-outline', label: 'Personal health record', note: () => 'Stored on this device only' },
    ],
  },
  {
    title: 'Help',
    items: [
      { icon: 'information-circle-outline', label: 'About CarbonTrust Registry', note: () => 'v1.0.0' },
    ],
  },
];

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const confirmLogout = () => {
    Alert.alert('Sign Out', 'End your CarbonTrust session on this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          await logout();
        },
      },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ paddingBottom: 44 }}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={{ alignItems: 'center', paddingTop: 34 }}>
          <Avatar name={user?.username || 'U'} size={78} />
          <Text style={styles.name}>{user?.username || 'Member'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          <RoleBadge role={user?.role} style={{ marginTop: 10 }} />
        </View>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        {/* Identity card */}
        <Card style={{ marginTop: -28, marginBottom: 18 }}>
          <View style={styles.idRow}>
            <View style={styles.idBlock}>
              <Text style={styles.idLabel}>USER ID</Text>
              <Text style={styles.idValue}>#{user?.userId ?? '—'}</Text>
            </View>
            <View style={[styles.idDivider]} />
            <View style={styles.idBlock}>
              <Text style={styles.idLabel}>USERNAME</Text>
              <Text style={styles.idValue} numberOfLines={1}>{user?.username || '—'}</Text>
            </View>
            <View style={styles.idDivider} />
            <View style={styles.idBlock}>
              <Text style={styles.idLabel}>ROLE</Text>
              <Text style={styles.idValue}>{(user?.role || '—').replace('_', ' ')}</Text>
            </View>
          </View>
        </Card>

        {/* Settings sections */}
        {SECTIONS.map((section) => (
          <View key={section.title} style={{ marginBottom: 18 }}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card padded={false}>
              {section.items.map((item, i) => (
                <PressableRow
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  note={item.note ? item.note() : null}
                  last={i === section.items.length - 1}
                  onPress={() => {
                    if (item.label === 'Personal health record') navigation.navigate('PersonalHealth');
                  }}
                />
              ))}
            </Card>
          </View>
        ))}

        {/* Logout */}
        <Pressable style={styles.logoutBtn} onPress={confirmLogout} disabled={loggingOut}>
          <Ionicons name="log-out-outline" size={19} color={Colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        <Text style={styles.footerNote}>
          CarbonTrust Registry 🌱 — Building Trust in Every Carbon Credit
        </Text>
      </View>
    </ScrollView>
  );
}

function PressableRow({ icon, label, note, last, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: Colors.divider }]}
    >
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={17} color={Colors.forest} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {note ? <Text style={styles.rowNote}>{note}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.borderStrong} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: Colors.forest,
    paddingBottom: 44,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  name: { fontSize: 21, fontWeight: '800', color: '#fff', marginTop: 12, letterSpacing: -0.4 },
  email: { fontSize: 12.5, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  idRow: { flexDirection: 'row', alignItems: 'center' },
  idBlock: { flex: 1, alignItems: 'center' },
  idDivider: { width: 1, height: 26, backgroundColor: Colors.divider },
  idLabel: { fontSize: 9.5, fontWeight: '800', color: Colors.textTertiary, letterSpacing: 0.8 },
  idValue: { fontSize: 13.5, fontWeight: '800', color: Colors.textPrimary, marginTop: 3 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: Colors.textTertiary, letterSpacing: 0.8, marginBottom: 8, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, gap: 11 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  rowNote: { fontSize: 11.5, color: Colors.textTertiary, marginTop: 1 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.6,
    borderColor: Colors.dangerSoft,
    backgroundColor: Colors.dangerSoft,
    paddingVertical: 15,
    borderRadius: Theme.radius.md,
  },
  logoutText: { color: Colors.danger, fontWeight: '800', fontSize: 15 },
  footerNote: { textAlign: 'center', fontSize: 11.5, color: Colors.textTertiary, marginTop: 22, fontWeight: '600' },
});
