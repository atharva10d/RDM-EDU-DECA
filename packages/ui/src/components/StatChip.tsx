import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, typography, borderRadius } from '../theme';

export interface StatChipProps {
  value: string | number;
  label: string;
  style?: StyleProp<ViewStyle>;
  valueColor?: string;
}

export const StatChip: React.FC<StatChipProps> = ({
  value,
  label,
  style,
  valueColor = colors.text,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.valueText, { color: valueColor }]}>{value}</Text>
      <Text style={styles.labelText}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  valueText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.extrabold,
  },
  labelText: {
    fontSize: typography.fontSize.micro,
    color: colors.mutedDim,
    textTransform: 'uppercase',
    marginTop: 3,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
});
