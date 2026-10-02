import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { colors, typography, borderRadius } from '../theme';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'google' | 'danger';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return styles.btnPrimary;
      case 'outline':
        return styles.btnOutline;
      case 'ghost':
        return styles.btnGhost;
      case 'google':
        return styles.btnGoogle;
      case 'danger':
        return styles.btnDanger;
      default:
        return styles.btnPrimary;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
        return styles.textPrimary;
      case 'outline':
      case 'ghost':
        return styles.textOutline;
      case 'google':
        return styles.textGoogle;
      case 'danger':
        return styles.textDanger;
      default:
        return styles.textPrimary;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.baseButton,
        getContainerStyle(),
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#062017' : colors.text}
          size="small"
        />
      ) : (
        <>
          {icon && icon}
          <Text style={[styles.baseText, getTextStyle(), textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: borderRadius.md + 2,
    minHeight: 50,
    paddingVertical: 15,
    paddingHorizontal: 16,
    width: '100%',
  },
  baseText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: 0.2,
  },
  btnPrimary: {
    backgroundColor: colors.teal,
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
  },
  textPrimary: {
    color: '#062017',
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  textOutline: {
    color: colors.text,
  },
  btnGhost: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnGoogle: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
  },
  textGoogle: {
    color: '#1F2430',
    fontWeight: typography.fontWeight.bold,
  },
  btnDanger: {
    backgroundColor: colors.redAlpha10,
    borderWidth: 1,
    borderColor: colors.redAlpha40,
  },
  textDanger: {
    color: colors.red,
  },
  disabled: {
    opacity: 0.45,
  },
});
