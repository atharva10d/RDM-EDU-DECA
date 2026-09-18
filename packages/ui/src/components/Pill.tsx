import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { colors, typography, borderRadius } from '../theme';

export type PillVariant = 'teal' | 'blue' | 'purple' | 'dim' | 'active';

export interface PillProps {
  label: string;
  variant?: PillVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Pill: React.FC<PillProps> = ({
  label,
  variant = 'dim',
  style,
  textStyle,
}) => {
  const getStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'teal':
        return {
          container: styles.pillTeal,
          text: styles.textTeal,
        };
      case 'blue':
        return {
          container: styles.pillBlue,
          text: styles.textBlue,
        };
      case 'purple':
        return {
          container: styles.pillPurple,
          text: styles.textPurple,
        };
      case 'active':
        return {
          container: styles.pillActive,
          text: styles.textActive,
        };
      case 'dim':
      default:
        return {
          container: styles.pillDim,
          text: styles.textDim,
        };
    }
  };

  const current = getStyles();

  return (
    <View style={[styles.basePill, current.container, style]}>
      <Text style={[styles.baseText, current.text, textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  basePill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  pillTeal: {
    borderColor: 'rgba(34, 211, 166, 0.5)',
    backgroundColor: 'transparent',
  },
  textTeal: {
    color: colors.teal,
  },
  pillBlue: {
    borderColor: 'rgba(79, 163, 232, 0.5)',
    backgroundColor: 'transparent',
  },
  textBlue: {
    color: colors.blue,
  },
  pillPurple: {
    borderColor: 'rgba(127, 119, 221, 0.5)',
    backgroundColor: 'transparent',
  },
  textPurple: {
    color: colors.purple,
  },
  pillDim: {
    borderColor: '#2A3242',
    backgroundColor: 'transparent',
  },
  textDim: {
    color: colors.mutedDim,
  },
  pillActive: {
    backgroundColor: colors.gold,
    borderColor: 'transparent',
  },
  textActive: {
    color: '#1a1400',
    fontWeight: typography.fontWeight.extrabold,
  },
});
