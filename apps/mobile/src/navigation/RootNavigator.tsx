import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthStackNavigator } from './AuthStackNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { colors } from '@edudeca/ui';
import { useAppStore } from '../store/useAppStore';
import { Session } from '@supabase/supabase-js';

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
  const isGuestOrDevAuthenticated = useAppStore(
    (state) => state.isGuestOrDevAuthenticated
  );
  const user = useAppStore((state) => state.user);

  const hasCompletedProfile = Boolean(
    user?.institution && user.institution.trim().length > 0 && user?.state && user?.city
  );

  // User is authenticated if they have a Supabase session OR completed profile locally
  const isAuthenticated = Boolean(
    session || isGuestOrDevAuthenticated || hasCompletedProfile
  );

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
