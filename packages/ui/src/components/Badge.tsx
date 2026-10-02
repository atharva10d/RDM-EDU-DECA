import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { colors, typography, borderRadius } from '../theme';

export type BadgeVariant = 'streak' | 'rank' | 'free' | 'paid' | 'finals' | 'custom';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  customColor?: string;
  customBg?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'rank',
  icon,
  style,
  textStyle,
  customColor,
  customBg,
}) => {
  const getBadgeStyle = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'streak':
        return {
          container: styles.badgeStreak,
          text: styles.textStreak,
        };
      case 'rank':
        return {
          container: styles.badgeRank,
          text: styles.textRank,
        };
      case 'free':
        return {
          container: styles.badgeFree,
          text: styles.textFree,
        };
      case 'paid':
        return {
          container: styles.badgePaid,
          text: styles.textPaid,
        };
      case 'finals':
        return {
          container: styles.badgeFinals,
          text: styles.textFinals,
        };
      case 'custom':
        return {
          container: {
            backgroundColor: customBg || 'rgba(255, 255, 255, 0.08)',
            borderColor: customColor || colors.border,
          },
          text: {
            color: customColor || colors.text,
          },
        };
      default:
        return {
          container: styles.badgeRank,
          text: styles.textRank,
        };
    }
  };

  const current = getBadgeStyle();

  return (
    <View style={[styles.baseBadge, current.container, style]}>
      {icon && icon}
      <Text style={[styles.baseText, current.text, textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  baseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  baseText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  badgeStreak: {
    backgroundColor: colors.goldAlpha12,
    borderColor: colors.goldAlpha35,
  },
  textStreak: {
    color: colors.gold,
  },
  badgeRank: {
    backgroundColor: colors.tealAlpha12,
    borderColor: colors.tealAlpha35,
  },
  textRank: {
    color: colors.teal,
  },
  badgeFree: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  textFree: {
    color: '#04140E',
    fontWeight: typography.fontWeight.extrabold,
  },
  badgePaid: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  textPaid: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.extrabold,
  },
  badgeFinals: {
    backgroundColor: colors.pink,
    borderColor: colors.pink,
  },
  textFinals: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.extrabold,
  },
});
