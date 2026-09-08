import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import Theme, { Colors } from '../../constants/theme';
import AnimatedCountUp from '../animated/AnimatedCountUp';

// Re-export animated primitives so UI consumers have one import surface.
export { ProgressBar, FadeInView, StaggerItem, SuccessCheckmark } from '../animated/AnimatedCountUp';

/* ------------------------------ PrimaryButton --------------------------- */

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
  variant = 'brand', // 'brand' | 'outline' | 'danger' | 'ghost' | 'success'
  style,
  textStyle,
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const blocked = loading || disabled;

  const pressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
  };

  const palettes = {
    brand: { bg: Colors.forest, text: '#fff', grad: Theme.gradients.brand },
    success: { bg: Colors.success, text: '#fff', grad: [Colors.success, Colors.success] },
    outline: { bg: 'transparent', text: Colors.forest, grad: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'] },
    danger: { bg: Colors.danger, text: '#fff', grad: [Colors.danger, Colors.danger] },
    ghost: { bg: 'rgba(11,46,32,0.06)', text: Colors.forest, grad: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'] },
  };
  const pal = palettes[variant] || palettes.brand;

  return (
    <Pressable
      onPress={onPress}
      disabled={blocked}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={[{ borderRadius: Theme.radius.md, overflow: 'hidden' }, style]}
    >
      <Animated.View style={{ transform: [{ scale }], borderRadius: Theme.radius.md }}>
        <LinearGradient
          colors={pal.grad}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.btnBase, variant !== 'brand' && variant !== 'success' ? { backgroundColor: pal.bg, borderWidth: variant === 'outline' ? 1.6 : 0, borderColor: Colors.borderStrong } : null]}
        >
          {loading ? (
            <ActivityIndicator color={pal.text} />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {icon ? <Ionicons name={icon} size={18} color={pal.text} /> : null}
              <Text style={[styles.btnText, { color: pal.text }, textStyle]}>{label}</Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

/* ---------------------------------- Card -------------------------------- */

export function Card({ children, style, padded = true, onPress, gradient, contentStyle }) {
  const body = <View style={[padded ? { padding: Theme.spacing.lg } : null, contentStyle]}>{children}</View>;

  if (gradient) {
    return (
      <View style={[styles.card, Theme.shadows.card, style, { overflow: 'hidden', borderWidth: 0 }]}>
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: Theme.radius.lg }}>
          {body}
        </LinearGradient>
      </View>
    );
  }
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={[styles.card, Theme.shadows.card, style]}>
        {body}
      </Pressable>
    );
  }
  return <View style={[styles.card, Theme.shadows.card, style]}>{body}</View>;
}

/* --------------------------------- Input -------------------------------- */

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secure = false,
  keyboardType,
  autoCapitalize = 'none',
  error,
  hint,
  icon,
  multiline = false,
  style,
}) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secure);

  return (
    <View style={[{ marginBottom: Theme.spacing.lg }, style]}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrap,
          { borderColor: error ? Colors.danger : focused ? Colors.emerald : Colors.border },
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? Colors.emeraldDark : Colors.textTertiary}
            style={{ marginRight: 10 }}
          />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.inputText, multiline && { minHeight: 90, textAlignVertical: 'top' }]}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={12} style={{ paddingHorizontal: 4 }}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={Colors.textTertiary} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <ErrorRow message={error} />
      ) : hint ? (
        <Text style={styles.inputHint}>{hint}</Text>
      ) : null}
    </View>
  );
}

function ErrorRow({ message }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [v]);
  return (
    <Animated.View style={{ flexDirection: 'row', alignItems: 'center', opacity: v, marginTop: 6 }}>
      <Ionicons name="alert-circle" size={14} color={Colors.danger} />
      <Text style={styles.inputError}>{message}</Text>
    </Animated.View>
  );
}

/* --------------------------------- Badge -------------------------------- */

export function Badge({ label, color, soft, icon, style }) {
  return (
    <View style={[styles.badge, { backgroundColor: soft || Colors.surfaceMuted }, style]}>
      {icon ? <Ionicons name={icon} size={12} color={color || Colors.textSecondary} /> : null}
      <Text style={[styles.badgeText, { color: color || Colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

/* -------------------------------- StatCard ------------------------------ */

export function StatCard({
  icon,
  iconColor,
  iconSoft,
  label,
  value,
  suffix,
  decimals = 0,
  gradient,
  style,
  onPress,
}) {
  const onDark = Boolean(gradient);
  return (
    <Card onPress={onPress} gradient={gradient} style={[{ flex: 1 }, style]}>
      <View style={[styles.statIcon, { backgroundColor: onDark ? 'rgba(255,255,255,0.16)' : iconSoft || Colors.emeraldSoft }]}>
        <Ionicons name={icon} size={16} color={onDark ? '#fff' : iconColor || Colors.emeraldDark} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginTop: 10 }}>
        <AnimatedCountUp
          value={value}
          decimals={decimals}
          style={{
            fontSize: 24,
            fontWeight: '800',
            color: onDark ? '#fff' : Colors.textPrimary,
            letterSpacing: -0.5,
          }}
        />
        {suffix ? (
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: onDark ? 'rgba(255,255,255,0.85)' : Colors.textSecondary,
              paddingBottom: 3,
            }}
          >
            {suffix}
          </Text>
        ) : null}
      </View>
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: onDark ? 'rgba(255,255,255,0.75)' : Colors.textSecondary,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </Card>
  );
}

/* ------------------------------- Skeletons ------------------------------ */

export function Skeleton({ width = '100%', height = 16, radius = 8, style }) {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        Animated.timing(shimmer, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: shimmer.interpolate({
            inputRange: [0, 1],
            outputRange: ['#E7EEE9', '#F4F8F5'],
          }),
        },
        style,
      ]}
    />
  );
}

export function CardSkeleton({ height = 96, style }) {
  return (
    <View style={[styles.card, Theme.shadows.card, { padding: Theme.spacing.lg, height }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Skeleton width={44} height={44} radius={22} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Skeleton width="70%" height={14} />
          <View style={{ height: 8 }} />
          <Skeleton width="45%" height={11} />
        </View>
      </View>
    </View>
  );
}

export function ListSkeleton({ count = 3, height = 96, style }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} height={height} style={[{ marginBottom: 12 }, style]} />
      ))}
    </View>
  );
}

/* ------------------------------ Empty / Error --------------------------- */

export function EmptyState({ icon = 'leaf-outline', title, message, actionLabel, onAction, style }) {
  return (
    <View style={[styles.centerBlock, style]}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={30} color={Colors.emeraldDark} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={styles.emptyMsg}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={styles.emptyAction}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13.5 }}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ErrorState({ message = 'Something went wrong. Please try again.', onRetry, style }) {
  return (
    <View style={[styles.centerBlock, style]}>
      <View style={[styles.emptyIcon, { backgroundColor: Colors.dangerSoft }]}>
        <Ionicons name="cloud-offline-outline" size={28} color={Colors.danger} />
      </View>
      <Text style={styles.emptyTitle}>Unable to load</Text>
      <Text style={styles.emptyMsg}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={[styles.emptyAction, { backgroundColor: Colors.forest }]}>
          <Ionicons name="refresh" size={15} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13.5, marginLeft: 6 }}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ----------------------------- SectionHeader ---------------------------- */

export function SectionHeader({ title, actionLabel, onAction, style }) {
  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
        style,
      ]}
    >
      <Text style={{ fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 }}>
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.emeraldDark }}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* --------------------------------- Toast -------------------------------- */

export function Toast({ visible, message, tone = 'success', onHide, duration = 2400 }) {
  const v = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      v.setValue(0);
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 260, delay: duration, useNativeDriver: true }),
      ]).start(() => {
        setMounted(false);
        onHide && onHide();
      });
    }
  }, [visible, v, duration, onHide]);

  if (!mounted) return null;
  const tones = {
    success: { bg: Colors.forest, icon: 'checkmark-circle' },
    error: { bg: Colors.danger, icon: 'alert-circle' },
    info: { bg: Colors.forestSoft, icon: 'information-circle' },
  };
  const t = tones[tone] || tones.success;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          backgroundColor: t.bg,
          opacity: v,
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }],
        },
      ]}
    >
      <Ionicons name={t.icon} size={17} color="#fff" />
      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13.5, flex: 1 }}>{message}</Text>
    </Animated.View>
  );
}

/* ------------------------------ ProgressRing ---------------------------- */

function polarToCartesian(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, r, sweepDeg) {
  const clamped = Math.min(359.99, Math.max(0.01, sweepDeg));
  const start = polarToCartesian(cx, cy, r, 0);
  const end = polarToCartesian(cx, cy, r, clamped);
  const largeArc = clamped <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export function ProgressRing({
  size = 84,
  progress = 0,
  color = Colors.emerald,
  track = 'rgba(11,46,32,0.08)',
  thickness = 8,
  label,
  sublabel,
}) {
  const clamped = Math.max(0, Math.min(1, Number(progress) || 0));
  const anim = useRef(new Animated.Value(0)).current;
  const [sweep, setSweep] = useState(0);

  useEffect(() => {
    const id = anim.addListener(({ value }) => setSweep(360 * value));
    Animated.timing(anim, {
      toValue: clamped,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(id);
  }, [clamped, anim]);

  const r = (size - thickness) / 2;
  const c = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={r} stroke={track} strokeWidth={thickness} fill="none" />
        {sweep > 0.5 ? (
          <Path d={arcPath(c, c, r, sweep)} stroke={color} strokeWidth={thickness} fill="none" strokeLinecap="round" />
        ) : null}
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ fontSize: size * 0.24, fontWeight: '800', color: Colors.textPrimary }}>{label}</Text>
        {sublabel ? (
          <Text style={{ fontSize: 10.5, fontWeight: '600', color: Colors.textTertiary, marginTop: -2 }}>
            {sublabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/* ------------------------------- MiniChart ------------------------------ */

export function MiniBarChart({ data = [], color = Colors.emerald, height = 64, style }) {
  const anims = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const stagger = anims.map((a, i) =>
      Animated.timing(a, {
        toValue: 1,
        duration: 600,
        delay: i * 60,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      })
    );
    Animated.stagger(60, stagger).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.length]);

  const max = Math.max(...data.map((d) => Number(d) || 0), 1);

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-end', height, gap: 6 }, style]}>
      {data.map((d, i) => (
        <Animated.View
          key={i}
          style={{
            flex: 1,
            height: anims[i].interpolate({
              inputRange: [0, 1],
              outputRange: [4, Math.max(6, (Number(d) / max) * height)],
            }),
            backgroundColor: color,
            opacity: 0.35 + 0.65 * (Number(d) / max),
            borderRadius: 4,
          }}
        />
      ))}
    </View>
  );
}

/* --------------------------------- Styles ------------------------------- */

const styles = StyleSheet.create({
  btnBase: {
    height: 54,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  btnText: { fontSize: 16, fontWeight: '700', letterSpacing: 0.1 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 7 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.4,
    borderRadius: Theme.radius.md,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  inputText: { flex: 1, fontSize: 15.5, color: Colors.textPrimary, paddingVertical: 14 },
  inputHint: { fontSize: 12, color: Colors.textTertiary, marginTop: 6 },
  inputError: { fontSize: 12.5, color: Colors.danger, marginLeft: 4, fontWeight: '600' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Theme.radius.pill,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBlock: { alignItems: 'center', paddingVertical: 42, paddingHorizontal: 24 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.emeraldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: { fontSize: 16.5, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  emptyMsg: { fontSize: 13.5, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  emptyAction: {
    marginTop: 16,
    backgroundColor: Colors.emeraldDark,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: Theme.radius.md,
  },
  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: Theme.radius.md,
    zIndex: 100,
  },
});
