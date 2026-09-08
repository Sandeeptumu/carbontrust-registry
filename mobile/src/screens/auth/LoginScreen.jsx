import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../../components/Logo';
import Theme, { Colors } from '../../constants/theme';
import { PrimaryButton, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [touched, setTouched] = useState(false);

  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim());
  const canSubmit = emailValid && password.length >= 4;

  const submit = async () => {
    setTouched(true);
    clearError();
    if (!canSubmit) return;
    const res = await login(email, password);
    if (res.ok) {
      // Role-based routing happens automatically in App.js via AuthContext.
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={Theme.gradients.brand} style={styles.hero}>
        {/* Subtle environmental illustration: contour rings */}
        <View style={styles.ringA} />
        <View style={styles.ringB} />
        <View style={styles.ringC} />
        <View style={styles.heroInner}>
          <Logo size={52} />
          <Text style={styles.heroTitle}>CarbonTrust Registry</Text>
          <Text style={styles.heroSub}>Verified carbon credits, trusted by design</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          style={styles.sheetWrap}
          contentContainerStyle={styles.sheet}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.handle} />
          <Text style={styles.welcome}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your sustainability journey.</Text>

          <View style={{ marginTop: 24 }}>
            <Input
              label="Email"
              icon="mail-outline"
              placeholder="you@organization.org"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                clearError();
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={touched && !emailValid ? 'Enter a valid email address' : null}
            />
            <Input
              label="Password"
              icon="lock-closed-outline"
              placeholder="Your password"
              secure
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                clearError();
              }}
              error={touched && password.length === 0 ? 'Password is required' : null}
            />

            <View style={styles.row}>
              <Pressable style={styles.remember} onPress={() => setRemember((r) => !r)}>
                <View style={[styles.checkbox, remember && { backgroundColor: Colors.forest, borderColor: Colors.forest }]}>
                  {remember ? <Ionicons name="checkmark" size={13} color="#fff" /> : null}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </Pressable>
              <Pressable onPress={() => navigation.navigate('Register')}>
                <Text style={styles.forgot}>Forgot password?</Text>
              </Pressable>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <PrimaryButton label="Sign In" onPress={submit} loading={loading} style={{ marginTop: 8 }} />
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>New to CarbonTrust?</Text>
            <View style={styles.divider} />
          </View>

          <Pressable style={styles.createBtn} onPress={() => navigation.navigate('Register')}>
            <Text style={{ color: Colors.forest, fontWeight: '800', fontSize: 14.5 }}>Create Account</Text>
          </Pressable>

          <Text style={styles.secureNote}>
            <Ionicons name="shield-checkmark" size={12} color={Colors.textTertiary} /> Secured with JWT authentication
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  hero: { height: '34%', minHeight: 240, justifyContent: 'flex-end', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  heroInner: { alignItems: 'center', paddingBottom: 34 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 12, letterSpacing: -0.4 },
  heroSub: { fontSize: 12.5, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontWeight: '500' },
  ringA: { position: 'absolute', width: 260, height: 260, borderRadius: 130, borderWidth: 1, borderColor: 'rgba(163,230,53,0.14)', top: -60, right: -70 },
  ringB: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', top: 10, left: -40 },
  ringC: { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 1, borderColor: 'rgba(163,230,53,0.18)', bottom: 40, right: 46 },
  sheetWrap: { flex: 1 },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    marginTop: -22,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },
  handle: { alignSelf: 'center', width: 40, height: 4.5, borderRadius: 3, backgroundColor: Colors.borderStrong, marginBottom: 18 },
  welcome: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.7 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 6, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  remember: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 19, height: 19, borderRadius: 6, borderWidth: 1.6, borderColor: Colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  rememberText: { fontSize: 13.5, fontWeight: '600', color: Colors.textSecondary, marginLeft: 8 },
  forgot: { fontSize: 13, fontWeight: '700', color: Colors.emeraldDark },
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
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 12, color: Colors.textTertiary, marginHorizontal: 12, fontWeight: '600' },
  createBtn: {
    height: 52,
    borderRadius: Theme.radius.md,
    borderWidth: 1.6,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  secureNote: { textAlign: 'center', fontSize: 11.5, color: Colors.textTertiary, marginTop: 18, fontWeight: '600' },
});
