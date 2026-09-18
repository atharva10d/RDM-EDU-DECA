import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from './types';
import { DashboardStackNavigator } from './DashboardStackNavigator';
import { LevelPathScreen, LeaderboardScreen, RewardsScreen, ProfileScreen } from '../screens/main';
import { colors, typography } from '@edudeca/ui';
import { Home, Signal, Trophy, Star, User } from 'lucide-react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  // Safe area bottom inset following standard mobile ergonomics (Spotify, Instagram, YouTube)
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8);
  const barHeight = 56 + bottomInset;

  return (
    <Tab.Navigator
      initialRouteName="DashboardTab"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0B0E14',
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: barHeight,
          paddingTop: 6,
          paddingBottom: bottomInset,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
        },
        tabBarItemStyle: styles.tabItem,
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackNavigator as React.ComponentType<any>}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Home color={color} size={22} strokeWidth={2.2} />
          ),
        }}
      />
      <Tab.Screen
        name="LevelsTab"
        component={LevelPathScreen as React.ComponentType<any>}
        options={{
          tabBarLabel: 'Levels',
          tabBarIcon: ({ color }) => (
            <Signal color={color} size={22} strokeWidth={2.2} />
          ),
        }}
      />
      <Tab.Screen
        name="RankTab"
        component={LeaderboardScreen as React.ComponentType<any>}
        options={{
          tabBarLabel: 'Rank',
          tabBarIcon: ({ color }) => (
            <Trophy color={color} size={22} strokeWidth={2.2} />
          ),
        }}
      />
      <Tab.Screen
        name="RewardsTab"
        component={RewardsScreen as React.ComponentType<any>}
        options={{
          tabBarLabel: 'Rewards',
          tabBarIcon: ({ color }) => (
            <Star color={color} size={22} strokeWidth={2.2} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen as React.ComponentType<any>}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <User color={color} size={22} strokeWidth={2.2} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabItem: {
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: typography.fontWeight.bold,
    marginTop: 2,
    letterSpacing: 0.2,
  },
});
