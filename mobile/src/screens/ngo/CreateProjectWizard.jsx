import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Theme, { Colors } from '../../constants/theme';
import { createProject } from '../../services/registryService';
import { ApiError } from '../../services/api';
import { PrimaryButton, Input } from '../../components/ui';
import { useNotifications } from '../../hooks/useNotifications';

const ECOSYSTEMS = ['Mangrove', 'Seagrass', 'Salt Marsh', 'Forest', 'Peatland', 'Wetland'];

const STEPS = ['Project', 'Location', 'Data', 'Evidence', 'Review'];

export default function CreateProjectWizard({ navigation }) {
  const { add } = useNotifications();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    projectName: '',
    description: '',
    ecosystemType: 'Mangrove',
    location: '',
    area: '',
    startDate: new Date().toISOString().slice(0, 10),
    contactPerson: '',
    methodology: '',
    measurements: '',
    documentNotes: '',
  });

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const stepValid = (i) => {
    switch (i) {
      case 0:
        return form.projectName.trim().length >= 3 && form.ecosystemType;
      case 1:
        return form.location.trim().length >= 3;
      case 2:
        return Number(form.area) > 0 && /^\d{4}-\d{2}-\d{2}$/.test(form.startDate);
      case 3:
        return true; // evidence is optional annotations
      case 4:
        return true;
      default:
        return false;
    }
  };

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      // Backend ProjectRequest: projectName, description, ecosystemType,
      // location, area, startDate. Extra wizard fields are contextual and
      // folded into the description so no backend behavior is invented.
      const extras = [];
      if (form.contactPerson.trim()) extras.push(`Contact: ${form.contactPerson.trim()}`);
      if (form.methodology.trim()) extras.push(`Methodology: ${form.methodology.trim()}`);
      if (form.measurements.trim()) extras.push(`Measurements: ${form.measurements.trim()}`);
      if (form.documentNotes.trim()) extras.push(`Evidence notes: ${form.documentNotes.trim()}`);
      const description = [form.description.trim(), ...extras].filter(Boolean).join('\n');

      await createProject({
        projectName: form.projectName.trim(),
        description,
        ecosystemType: form.ecosystemType,
        location: form.location.trim(),
        area: Number(form.area),
        startDate: form.startDate,
      });
      add({ title: 'Project created', body: `${form.projectName.trim()} was registered as a draft.`, type: 'project' });
      Alert.alert('Project Created 🌱', 'Your project has been registered. Submit MRV evidence to begin verification.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create the project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => (step === 0 ? navigation.goBack() : setStep((s) => s - 1))} style={styles.backBtn}>
          <Ionicons name={step === 0 ? 'close' : 'chevron-back'} size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>New Project</Text>
        <Text style={styles.stepCounter}>{step + 1}/5</Text>
      </View>

      {/* Animated progress indicator: 1 ── 2 ── 3 ── 4 ── 5 */}
      <View style={styles.progressRow}>
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <View style={styles.stepWrap}>
              <View style={[styles.stepDot, i < step && styles.stepDone, i === step && styles.stepActive, i <= step && { borderColor: Colors.emeraldDark }]}>
                {i < step ? (
                  <Ionicons name="checkmark" size={13} color="#fff" />
                ) : (
                  <Text style={[styles.stepNum, (i === step) && { color: '#fff' }, i > step && { color: Colors.textTertiary }]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, i === step && { color: Colors.forest }]} numberOfLines={1}>{label}</Text>
            </View>
            {i < STEPS.length - 1 ? (
              <View style={[styles.connector, i < step && { backgroundColor: Colors.emeraldDark }]} />
            ) : null}
          </React.Fragment>
        ))}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {step === 0 && (
            <StepCard title="Project Information" subtitle="Describe the restoration project you are registering.">
              <Input label="Project Name" icon="leaf-outline" placeholder="e.g. Delta Mangrove Restoration" value={form.projectName} onChangeText={set('projectName')} />
              <Input label="Description" icon="document-text-outline" placeholder="What does this project do?" value={form.description} onChangeText={set('description')} multiline />
              <Text style={styles.choiceLabel}>Ecosystem Type</Text>
              <View style={styles.chipWrap}>
                {ECOSYSTEMS.map((e) => (
                  <Pressable key={e} onPress={() => set('ecosystemType')(e)} style={[styles.chip, form.ecosystemType === e && styles.chipActive]}>
                    <Text style={[styles.chipText, form.ecosystemType === e && { color: '#fff', fontWeight: '800' }]}>{e}</Text>
                  </Pressable>
                ))}
              </View>
            </StepCard>
          )}

          {step === 1 && (
            <StepCard title="Location" subtitle="Where is the project site?">
              <Input label="Location" icon="location-outline" placeholder="Region, Country" value={form.location} onChangeText={set('location')} />
              <Input label="Contact Person (optional)" icon="person-outline" placeholder="Field coordinator" value={form.contactPerson} onChangeText={set('contactPerson')} />
            </StepCard>
          )}

          {step === 2 && (
            <StepCard title="Environmental Data" subtitle="Site size and project start.">
              <Input label="Area (hectares)" icon="resize-outline" keyboardType="decimal-pad" placeholder="e.g. 250" value={form.area} onChangeText={set('area')} />
              <Input label="Start Date (YYYY-MM-DD)" icon="calendar-outline" placeholder="2026-01-15" value={form.startDate} onChangeText={set('startDate')} autoCapitalize="none" />
              <Input label="Methodology (optional)" icon="flask-outline" placeholder="e.g. VM0007 / field plots" value={form.methodology} onChangeText={set('methodology')} />
            </StepCard>
          )}

          {step === 3 && (
            <StepCard title="Documents / Evidence" subtitle="Note the field evidence you will attach with MRV submissions.">
              <Input label="Planned measurements" icon="stats-chart-outline" placeholder="e.g. 40 plots, quarterly surveys" value={form.measurements} onChangeText={set('measurements')} multiline />
              <Input label="Evidence notes" icon="attach-outline" placeholder="Photos, permits, surveys…" value={form.documentNotes} onChangeText={set('documentNotes')} multiline />
              <View style={styles.noteBox}>
                <Ionicons name="information-circle" size={17} color={Colors.info} />
                <Text style={styles.noteText}>
                  Photos and documents are uploaded with each MRV submission after the project is registered.
                </Text>
              </View>
            </StepCard>
          )}

          {step === 4 && (
            <StepCard title="Review & Submit" subtitle="Confirm the details before registering.">
              <ReviewRow k="Name" v={form.projectName} />
              <ReviewRow k="Ecosystem" v={form.ecosystemType} />
              <ReviewRow k="Location" v={form.location} />
              <ReviewRow k="Area" v={`${form.area} ha`} />
              <ReviewRow k="Start date" v={form.startDate} />
              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
            </StepCard>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        {step > 0 ? (
          <PrimaryButton label="Back" variant="outline" style={{ flex: 1 }} onPress={() => setStep((s) => s - 1)} />
        ) : (
          <View style={{ flex: 1 }} />
        )}
        {step < 4 ? (
          <PrimaryButton
            label="Continue"
            icon="arrow-forward"
            style={{ flex: 2 }}
            disabled={!stepValid(step)}
            onPress={() => setStep((s) => s + 1)}
          />
        ) : (
          <PrimaryButton label="Submit Project" icon="checkmark" style={{ flex: 2 }} loading={submitting} onPress={submit} />
        )}
      </View>
    </View>
  );
}

function StepCard({ title, subtitle, children }) {
  return (
    <View style={styles.stepCard}>
      <Text style={styles.stepTitle}>{title}</Text>
      {subtitle ? <Text style={styles.stepSubtitle}>{subtitle}</Text> : null}
      <View style={{ marginTop: 14 }}>{children}</View>
    </View>
  );
}

function ReviewRow({ k, v }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.divider }}>
      <Text style={{ fontSize: 13.5, color: Colors.textSecondary, fontWeight: '500' }}>{k}</Text>
      <Text style={{ fontSize: 13.5, fontWeight: '700', color: Colors.textPrimary, maxWidth: '58%', textAlign: 'right' }}>{v || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.forest,
    paddingTop: 54,
    paddingBottom: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  stepCounter: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stepWrap: { alignItems: 'center', width: 56 },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDone: { backgroundColor: Colors.emeraldDark, borderColor: Colors.emeraldDark },
  stepActive: {
    backgroundColor: Colors.forest,
    borderColor: Colors.forest,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  stepNum: { fontSize: 12.5, fontWeight: '800' },
  stepLabel: { fontSize: 10, fontWeight: '700', color: Colors.textTertiary, marginTop: 5 },
  connector: { flex: 1, height: 2.5, borderRadius: 2, backgroundColor: Colors.border, marginTop: 14 },
  body: { padding: 20, paddingBottom: 30 },
  stepCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
  },
  stepTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },
  stepSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, lineHeight: 19 },
  choiceLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8, marginTop: 4 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Theme.radius.pill,
    borderWidth: 1.4,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.forest, borderColor: Colors.forest },
  chipText: { fontSize: 12.5, fontWeight: '600', color: Colors.textSecondary },
  noteBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.infoSoft,
    padding: 12,
    borderRadius: Theme.radius.md,
    marginTop: 6,
  },
  noteText: { flex: 1, fontSize: 12, color: Colors.info, fontWeight: '600', lineHeight: 18 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dangerSoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: Theme.radius.md,
    marginTop: 12,
  },
  errorText: { color: Colors.danger, fontSize: 13, fontWeight: '600', flex: 1 },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
