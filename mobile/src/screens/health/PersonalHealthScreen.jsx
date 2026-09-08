import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors } from '../../constants/theme';
import { loadHealthProfile, saveHealthProfile } from '../../services/healthService';
import { PrimaryButton, Card, Input, Skeleton, Toast } from '../../components/ui';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { useAuth } from '../../context/AuthContext';

/**
 * Personal Health record.
 *
 * NOTE: the existing CarbonTrust backend has no personal-health REST module
 * yet, so this record is stored **on this device only** (never uploaded) and
 * the UI communicates that privacy guarantee. When the backend ships a
 * health module, wire it into services/healthService.js.
 */
const FIELDS = [
  { key: 'bloodGroup', label: 'Blood Group', icon: 'water-outline', placeholder: 'e.g. O+' },
  { key: 'allergies', label: 'Allergies', icon: 'alert-circle-outline', placeholder: 'e.g. Penicillin, peanuts', multiline: true },
  { key: 'conditions', label: 'Existing Conditions', icon: 'heart-half-outline', placeholder: 'e.g. Asthma', multiline: true },
  { key: 'medications', label: 'Medications', icon: 'pill-outline', placeholder: 'e.g. Ventolin inhaler', multiline: true },
  { key: 'emergencyContactName', label: 'Emergency Contact', icon: 'call-outline', placeholder: 'Name' },
  { key: 'emergencyContactPhone', label: 'Emergency Phone', icon: 'phone-portrait-outline', placeholder: '+1 555 010 2030', keyboardType: 'phone-pad' },
  { key: 'notes', label: 'Notes', icon: 'document-text-outline', placeholder: 'Anything responders should know', multiline: true },
];

export default function PersonalHealthScreen({ navigation }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadHealthProfile().then(setProfile);
  }, []);

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, padding: 20 }}>
        <Skeleton height={120} radius={18} style={{ marginBottom: 14 }} />
        <Skeleton height={280} radius={18} />
      </View>
    );
  }

  const setField = (key) => (value) => {
    setProfile((p) => ({ ...p, [key]: value }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    const saved = await saveHealthProfile(profile);
    setProfile(saved);
    setSaving(false);
    setDirty(false);
    setToast('Health record saved on this device');
  };

  const completeness =
    FIELDS.filter((f) => String(profile[f.key] || '').trim().length > 0).length / FIELDS.length;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Personal Health</Text>
        <Text style={styles.headerSub}>Private medical record — stored on this device</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Card style={{ marginBottom: 16, backgroundColor: Colors.forest, borderWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="lock-closed" size={20} color={Colors.lime} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 14.5, fontWeight: '800' }}>
                {user?.username || 'You'}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>
                Your health information is private and secure.
              </Text>
            </View>
          </View>
          <View style={{ marginTop: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>
                PROFILE COMPLETENESS
              </Text>
              <Text style={{ color: Colors.lime, fontSize: 11, fontWeight: '800' }}>
                {Math.round(completeness * 100)}%
              </Text>
            </View>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${Math.max(4, completeness * 100)}%`, borderRadius: 3, backgroundColor: Colors.lime }} />
            </View>
          </View>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          {FIELDS.map((f, i) => (
            <Input
              key={f.key}
              label={f.label}
              icon={f.icon}
              placeholder={f.placeholder}
              value={profile[f.key]}
              onChangeText={setField(f.key)}
              multiline={f.multiline}
              keyboardType={f.keyboardType}
              style={i === FIELDS.length - 1 ? { marginBottom: 0 } : undefined}
            />
          ))}
        </Card>

        <PrimaryButton
          label={dirty ? 'Save Health Record' : 'Saved'}
          icon={dirty ? 'save-outline' : 'checkmark-circle-outline'}
          loading={saving}
          disabled={!dirty}
          onPress={save}
        />

        <Text style={styles.disclaimer}>
          This record is for personal emergency reference only and is not medical advice. In an emergency, call your
          local emergency number.
        </Text>
      </ScrollView>
      <Toast visible={Boolean(toast)} message={toast} onHide={() => setToast(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.forest,
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#fff', textAlign: 'center' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 3 },
  disclaimer: { fontSize: 11.5, color: Colors.textTertiary, textAlign: 'center', lineHeight: 18, marginTop: 16, fontWeight: '600' },
});
