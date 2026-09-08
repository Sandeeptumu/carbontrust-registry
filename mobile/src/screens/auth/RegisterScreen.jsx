import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors } from '../../constants/theme';
import { PrimaryButton, Input } from '../../components/ui';
import { SuccessCheckmark } from '../../components/animated/AnimatedCountUp';
import { useAuth } from '../../context/AuthContext';

const STRENGTH_STEPS = [
  { label: 'Weak', color: Colors.danger, min: 0 },
  { label: 'Fair', color: Colors.warning, min: 2 },
  { label: 'Strong', color: Colors.emeraldDark, min: 3 },
  { label: 'Excellent', color: Colors.success, min: 4 },
];

function strengthOf(pw) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return score; // 0..4
}

const ECOSYSTEM_HINTS = ['Mangrove', 'Seagrass', 'Salt Marsh'];

export default function RegisterScreen({ navigation }) {
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    confirm: '',
  });
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState(null);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const strength = strengthOf(form.password);

  const errors = useMemo(() => {
    const e = {};
    if (form.firstName.trim().length < 2) e.firstName = 'First name is required';
    if (form.lastName.trim().length < 2) e.lastName = 'Last name is required';
    if (form.username.trim().length < 3 || form.username.length > 30)
      e.username = 'Username must be 3–30 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Enter a valid email address';
    if (form.phoneNumber.trim().length < 7) e.phoneNumber = 'Enter a valid phone number';
    if (form.address.trim().length < 4) e.address = 'Address is required';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const submit = async () => {
    setTouched(true);
    setServerError(null);
    if (!isValid) return;
    const res = await register({ ...form, dateOfBirth: null });
    if (res.ok) setDone(true);
    else setServerError(res.error);
  };

  if (done) {
    return (
      <View style={styles.successRoot}>
        <SuccessCheckmark size={110} />
        <Text style={styles.successTitle}>Account Created</Text>
        <Text style={styles.successMsg}>
          Welcome to CarbonTrust Registry. Sign in to begin your sustainability journey.
        </Text>
        <PrimaryButton label="Sign In Now" onPress={() => navigation.replace('Login')} style={{ alignSelf: 'stretch', marginTop: 28 }} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" bounces={false}>
          <Text style={styles.intro}>
            Join the registry for verified carbon credits and environmental-health insights.
          </Text>

          <View style={styles.nameRow}>
            <Input label="First Name" icon="person-outline" placeholder="Amara" value={form.firstName} onChangeText={set('firstName')} error={touched ? errors.firstName : null} style={{ flex: 1, marginRight: 8 }} />
            <Input label="Last Name" icon="person-outline" placeholder="Okafor" value={form.lastName} onChangeText={set('lastName')} error={touched ? errors.lastName : null} style={{ flex: 1 }} />
          </View>

          <Input label="Username" icon="at-outline" placeholder="amara_o" value={form.username} onChangeText={set('username')} autoCapitalize="none" error={touched ? errors.username : null} />
          <Input label="Email" icon="mail-outline" placeholder="you@organization.org" value={form.email} onChangeText={set('email')} keyboardType="email-address" error={touched ? errors.email : null} />
          <Input label="Phone Number" icon="call-outline" placeholder="+1 555 010 2030" value={form.phoneNumber} onChangeText={set('phoneNumber')} keyboardType="phone-pad" error={touched ? errors.phoneNumber : null} />
          <Input label="Address" icon="home-outline" placeholder="City, Country" value={form.address} onChangeText={set('address')} error={touched ? errors.address : null} />

          <View>
            <Input label="Password" icon="lock-closed-outline" placeholder="Minimum 8 characters" secure value={form.password} onChangeText={set('password')} error={touched ? errors.password : null} />
            {form.password.length > 0 && (
              <View style={styles.strengthWrap}>
                <View style={styles.strengthBars}>
                  {[0, 1, 2, 3].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.strengthBar,
                        { backgroundColor: i < strength ? STRENGTH_STEPS[strength]?.color || Colors.success : Colors.border },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: STRENGTH_STEPS[strength]?.color || Colors.success }]}>
                  {STRENGTH_STEPS[Math.max(0, strength - 1)]?.label || 'Weak'}
                </Text>
              </View>
            )}
          </View>

          <Input label="Confirm Password" icon="lock-closed-outline" placeholder="Repeat your password" secure value={form.confirm} onChangeText={set('confirm')} error={touched ? errors.confirm : null} />

          {serverError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{serverError}</Text>
            </View>
          ) : null}

          <PrimaryButton label="Create Account" onPress={submit} loading={loading} style={{ marginTop: 6 }} />

          <Pressable onPress={() => navigation.goBack()} style={styles.signInLink}>
            <Text style={{ fontSize: 13.5, color: Colors.textSecondary }}>
              Already registered? <Text style={{ color: Colors.emeraldDark, fontWeight: '800' }}>Sign In</Text>
            </Text>
          </Pressable>

          <Text style={styles.roleNote}>
            New accounts join as Buyers — matching the existing registry behavior.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.forest,
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  body: { padding: 22, paddingBottom: 48 },
  intro: { fontSize: 13.5, color: Colors.textSecondary, lineHeight: 20, marginBottom: 18 },
  nameRow: { flexDirection: 'row', gap: 0 },
  strengthWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: -8, marginBottom: 14 },
  strengthBars: { flexDirection: 'row', gap: 5, flex: 1 },
  strengthBar: { height: 4, flex: 1, borderRadius: 2 },
  strengthLabel: { fontSize: 11.5, fontWeight: '800', marginLeft: 10 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dangerSoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: Theme.radius.md,
    marginBottom: 14,
  },
  errorText: { color: Colors.danger, fontSize: 13, fontWeight: '600', flex: 1 },
  signInLink: { alignItems: 'center', marginTop: 16 },
  roleNote: { textAlign: 'center', fontSize: 11.5, color: Colors.textTertiary, marginTop: 12, fontWeight: '600' },
});
