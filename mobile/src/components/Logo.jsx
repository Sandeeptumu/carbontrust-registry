import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { Colors } from '../constants/theme';

/**
 * CarbonTrust Registry logo mark:
 * a stylized leaf formed from a carbon-molecule vein, enclosed in a
 * circular "registry" ring with a verification tick at its orbit.
 */
export default function Logo({ size = 40, monochrome = false }) {
  const s = size;
  const leaf = monochrome ? '#FFFFFF' : Colors.forest;
  const vein = monochrome ? 'rgba(255,255,255,0.85)' : Colors.emeraldDark;
  const ring = monochrome ? 'rgba(255,255,255,0.5)' : Colors.limeDark;
  const orbit = monochrome ? '#FFFFFF' : Colors.emerald;

  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={s} height={s} viewBox="0 0 64 64" fill="none">
        {/* Outer registry ring */}
        <Circle cx={32} cy={32} r={28.5} stroke={ring} strokeWidth={2.4} strokeDasharray="6 5" />
        {/* Leaf body */}
        <Path
          d="M32 13C22 21 18.5 30 20 38.5C21.4 46.3 27 51 32 52C37 51 42.6 46.3 44 38.5C45.5 30 42 21 32 13Z"
          fill={leaf}
        />
        {/* Carbon-molecule vein: nodes + bonds */}
        <G stroke={vein} strokeWidth={2.1} strokeLinecap="round">
          <Path d="M32 47V24" />
          <Path d="M32 33L24.6 27.4" />
          <Path d="M32 33L39.4 27.4" />
          <Path d="M32 40.5L25.6 36.6" />
          <Path d="M32 40.5L38.4 36.6" />
        </G>
        <G fill={vein}>
          <Circle cx={32} cy={24} r={2.6} />
          <Circle cx={24.6} cy={27.4} r={2.2} />
          <Circle cx={39.4} cy={27.4} r={2.2} />
          <Circle cx={32} cy={47} r={2.4} />
        </G>
        {/* Verification orbit node */}
        <Circle cx={53.5} cy={21} r={4.6} fill={orbit} />
        <Path
          d="M51.4 21.2L53 22.8L55.8 19.4"
          stroke="#FFFFFF"
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />      </Svg>
    </View>
  );
}
