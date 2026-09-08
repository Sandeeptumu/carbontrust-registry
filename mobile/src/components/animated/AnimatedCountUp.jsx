import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';

/**
 * AnimatedCountUp — animates a number from 0 (or previous value) to `value`
 * with an ease-out curve, used for carbon-credit counters and stats.
 */
export default function AnimatedCountUp({
  value = 0,
  duration = 1100,
  decimals = 0,
  style,
  prefix = '',
  suffix = '',
}) {
  const num = Number(value) || 0;
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const listenerId = anim.addListener(({ value: v }) => setDisplay(v));
    Animated.timing(anim, {
      toValue: num,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(listenerId);
  }, [num, duration, anim]);

  const formatted = display.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <Text style={style}>
      {prefix}
      {formatted}
      {suffix}
    </Text>
  );
}

/**
 * FadeInView — soft fade + optional upward drift on mount.
 */
export function FadeInView({ children, delay = 0, duration = 420, dy = 14, style }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      delay,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [v, delay, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [
            {
              translateY: v.interpolate({
                inputRange: [0, 1],
                outputRange: [dy, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * StaggeredScrollList — renders children with an incremental fade-up delay.
 */
export function StaggerItem({ index = 0, children, style }) {
  return (
    <FadeInView delay={80 + index * 70} style={style}>
      {children}
    </FadeInView>
  );
}

/**
 * ProgressBar — animated horizontal indicator.
 */
export function ProgressBar({ progress = 0, color, trackColor, height = 8, style }) {
  const clamped = Math.max(0, Math.min(1, Number(progress) || 0));
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: clamped,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [clamped, anim]);

  return (
    <View
      style={[
        {
          height,
          borderRadius: height / 2,
          backgroundColor: trackColor || 'rgba(11,46,32,0.08)',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          height: '100%',
          borderRadius: height / 2,
          backgroundColor: color,
          width: anim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          }),
        }}
      />
    </View>
  );
}

/**
 * SuccessCheckmark — draws an animated circle + tick on mount.
 */
export function SuccessCheckmark({ size = 96, color = '#16A34A' }) {
  const scale = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const tick = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(tick, { toValue: 1, duration: 320, delay: 120, useNativeDriver: true }),
    ]).start();
    Animated.timing(ring, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, [scale, ring, tick]);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: color,
          opacity: ring,
          transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.25] }) }],
        }}
      />
      <Animated.View
        style={{
          width: size * 0.78,
          height: size * 0.78,
          borderRadius: (size * 0.78) / 2,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale }],
        }}
      >
        <Animated.View style={{ flexDirection: 'row', opacity: tick }}>
          <View
            style={{
              width: size * 0.09,
              height: size * 0.2,
              backgroundColor: '#fff',
              borderRadius: 3,
              transform: [
                { translateX: -size * 0.045 },
                { rotate: '45deg' },
                { translateY: size * 0.03 },
              ],
            }}
          />
          <View
            style={{
              width: size * 0.09,
              height: size * 0.38,
              backgroundColor: '#fff',
              borderRadius: 3,
              transform: [{ rotate: '-45deg' }, { translateY: -size * 0.06 }],
            }}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}
