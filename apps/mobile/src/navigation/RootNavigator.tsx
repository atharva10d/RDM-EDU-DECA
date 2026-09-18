import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthStackNavigator } from './AuthStackNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { colors } from '@edudeca/ui';
import { useAppStore } from '../store/useAppStore';
import { Session } from '@supabase/supabase-js';
import { isMainAuthenticated } from './isMainAuthenticated';
import { isProfileGateComplete } from '../services/studentLoop/profileGate';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    primary: colors.teal,
  },
};

interface RootNavigatorProps {
  session: Session | null;
}

export const RootNavigator: React.FC<RootNavigatorProps> = ({ session }) => {
  const user = useAppStore((state) => state.user);
  const disciplines = useAppStore((state) => state.disciplines);
  const isAuthenticated = isMainAuthenticated({
    hasSession: Boolean(session),
    disciplineCount: Array.isArray(disciplines) ? disciplines.length : 0,
    profileComplete: isProfileGateComplete(user),
    isGuest: false,
  });

  return (
    <NavigationContainer theme={AppNavTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStackNavigator as React.ComponentType<any>} />
        ) : (
          <Stack.Screen name="Main" component={MainTabNavigator as React.ComponentType<any>} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

