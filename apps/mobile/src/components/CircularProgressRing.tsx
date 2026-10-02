import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, typography } from '@edudeca/ui';

interface CircularProgressRingProps {
  level: number;
  size?: number;
  strokeWidth?: number;
}

export const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  level,
  size = 76,
  strokeWidth = 7,
}) => {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius; // ~213.6 for size=76, stroke=7
  const progressPct = Math.min(1, Math.max(0, level / 10));
  const strokeDashoffset = circumference - circumference * progressPct;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="gradRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.teal} />
            <Stop offset="100%" stopColor={colors.blue} />
          </LinearGradient>
        </Defs>
        {/* Background Track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated Fill */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#gradRing)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {/* Centered Level Label */}
      <View style={styles.labelContainer}>
        <Text style={styles.levelNum}>{level}</Text>
        <Text style={styles.levelTag}>LEVEL</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNum: {
    fontSize: 22,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
    lineHeight: 24,
  },
  levelTag: {
    fontSize: 10,
    color: colors.mutedDim,
    letterSpacing: 0.8,
    fontWeight: typography.fontWeight.bold,
  },
});
