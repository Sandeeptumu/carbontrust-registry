import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../../components/Logo';
import Theme, { Colors } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

/** Deterministic pseudo-random so particles are stable between renders. */
const rand = (i, min, max) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return min + (x - Math.floor(x)) * (max - min);
};

const PARTICLES = Array.from({ length: 14 }).map((_, i) => ({
  x: rand(i, 0.05, 0.95) * width,
  size: rand(i + 40, 5, 11),
  delay: rand(i + 80, 0, 500),
  duration: rand(i + 120, 2600, 4200),
  drift: rand(i + 160, -30, 30),
  opacity: rand(i + 200, 0.12, 0.35),
}));

export default function Splash() {
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const tagline = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const particles = useRef(PARTICLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const anims = [
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(ring, { toValue: 1, duration: 900, delay: 200, useNativeDriver: true }),
      Animated.timing(tagline, { toValue: 1, duration: 600, delay: 650, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 1, duration: 1400, useNativeDriver: true }),
    ];
    Animated.parallel(anims).start();

    particles.forEach((p, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(p, {
            toValue: 1,
            duration: PARTICLES[i].duration,
            delay: PARTICLES[i].delay,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(p, { toValue: 0, duration: PARTICLES[i].duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      ).start();
    });
  }, [logoScale, logoOpacity, ring, tagline, glow, particles]);

  return (
    <View style={styles.root}>
      <LinearGradient colors={Theme.gradients.brand} style={StyleSheet.absoluteFill} />

      {/* Environmental particle motion */}
      {particles.map((p, i) => {
        const meta = PARTICLES[i];
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: meta.x,
              bottom: height * 0.18,
              width: meta.size,
              height: meta.size,
              borderRadius: meta.size / 2,
              backgroundColor: i % 3 === 0 ? Colors.lime : Colors.emerald,
              opacity: p.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, meta.opacity, 0] }),
              transform: [
                { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [0, -height * 0.45] }) },
                { translateX: p.interpolate({ inputRange: [0, 1], outputRange: [0, meta.drift] }) },
                { scale: p.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 1.15, 0.7] }) },
              ],
            }}
          />
        );
      })}

      <View style={styles.center}>
        <View style={styles.logoWrap}>
          <Animated.View
            style={{
              position: 'absolute',
              width: 150,
              height: 150,
              borderRadius: 75,
              borderWidth: 1.5,
              borderColor: 'rgba(163,230,53,0.35)',
              opacity: ring,
              transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.3] }) }],
            }}
          />
          <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
            <View style={styles.logoBadge}>
              <Logo size={64} />
            </View>
          </Animated.View>
        </View>

        <Animated.Text style={[styles.title, { opacity: tagline, transform: [{ translateY: tagline.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}>
          CarbonTrust <Text style={{ color: Colors.lime }}>Registry</Text>
        </Animated.Text>

        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: tagline,
              transform: [{ translateY: tagline.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
            },
          ]}
        >
          Building Trust in Every Carbon Credit
        </Animated.Text>
      </View>

      <Animated.Text style={[styles.footer, { opacity: tagline }]}>
        🌱 CO₂ • VERIFIED • TRUSTED
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.forestDeep },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  logoWrap: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center' },
  logoBadge: {
    width: 112,
    height: 112,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 27, fontWeight: '800', color: '#fff', letterSpacing: -0.6, marginTop: 18 },
  tagline: {
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  footer: {
    position: 'absolute',
    bottom: 46,
    alignSelf: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: 'rgba(163,230,53,0.55)',
  },
});
