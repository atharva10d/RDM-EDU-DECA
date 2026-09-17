import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
} from 'react-native';
import { colors, typography, borderRadius, spacing } from '@edudeca/ui';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';
import {
  Home,
  Compass,
  Signal,
  Trophy,
  Rocket,
  Star,
  User,
  LogOut,
  X,
  Zap,
} from 'lucide-react-native';

interface BurgerDrawerProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const BurgerDrawer: React.FC<BurgerDrawerProps> = ({
  visible,
  onClose,
  onNavigate,
}) => {
  const slideAnim = useRef(new Animated.Value(320)).current;
  const resetState = useAppStore((state) => state.resetState);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 320,
        duration: 220,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleSignOut = async () => {
    onClose();
    try {
      await supabase.auth.signOut();
    } catch (_err) {
      // Ignored
    }
    resetState();
  };

  const handleItemPress = (route: string) => {
    onClose();
    onNavigate(route);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Sliding Panel from Right */}
        <Animated.View
          style={[
            styles.drawerPanel,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.menuHead}>
              <View style={styles.brand}>
                <View style={styles.brandMark}>
                  <Zap size={14} color="#04140E" strokeWidth={3} />
                </View>
                <Text style={styles.brandText}>
                  Edu<Text style={{ color: colors.teal }}>Deca</Text>
                </Text>
              </View>
              <TouchableOpacity activeOpacity={0.7} style={styles.menuClose} onPress={onClose}>
                <X size={16} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.menuItem}
              onPress={() => handleItemPress('Dashboard')}
            >
              <Home size={18} color={colors.teal} strokeWidth={2.4} />
              <Text style={[styles.menuItemText, { color: colors.teal }]}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.menuItem}
              onPress={() => handleItemPress('PickPath')}
            >
              <Compass size={18} color={colors.text} strokeWidth={2.2} />
              <Text style={styles.menuItemText}>Pick Path</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.menuItem}
              onPress={() => handleItemPress('LevelPath')}
            >
              <Signal size={18} color={colors.text} strokeWidth={2.2} />
              <Text style={styles.menuItemText}>Levels</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.menuItem}
              onPress={() => handleItemPress('Leaderboard')}
            >
              <Trophy size={18} color={colors.text} strokeWidth={2.2} />
              <Text style={styles.menuItemText}>Leaderboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.menuItem}
              onPress={() => handleItemPress('Refer')}
            >
              <Rocket size={18} color={colors.text} strokeWidth={2.2} />
              <Text style={styles.menuItemText}>Community & Refer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.menuItem}
              onPress={() => handleItemPress('Rewards')}
            >
              <Star size={18} color={colors.gold} strokeWidth={2.2} />
              <Text style={styles.menuItemText}>Rewards</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.menuItem}
              onPress={() => handleItemPress('Profile')}
            >
              <User size={18} color={colors.teal} strokeWidth={2.2} />
              <Text style={styles.menuItemText}>My Profile</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Sign Out Action */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={[styles.menuItem, styles.signoutItem]}
              onPress={handleSignOut}
            >
              <LogOut size={18} color={colors.red} strokeWidth={2.2} />
              <Text style={[styles.menuItemText, { color: colors.red }]}>Sign out</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: colors.backdropDark,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drawerPanel: {
    width: '78%',
    maxWidth: 320,
    height: '100%',
    backgroundColor: colors.card2,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 28,
    paddingBottom: 20,
    zIndex: 99,
  },
  menuHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandMark: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 15,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
  },
  menuClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderRadius: 11,
    marginBottom: 4,
  },
  menuItemText: {
    fontSize: 13.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  signoutItem: {
    backgroundColor: colors.redAlpha10,
  },
});
