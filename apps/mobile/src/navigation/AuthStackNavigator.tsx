import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { HomeScreen, PickPathScreen, SignInScreen, PickDisciplinesScreen } from '../screens/auth';
import { colors } from '@edudeca/ui';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen as React.ComponentType<any>} />
      <Stack.Screen name="PickPath" component={PickPathScreen as React.ComponentType<any>} />
      <Stack.Screen name="SignIn" component={SignInScreen as React.ComponentType<any>} />
      <Stack.Screen name="PickDisciplines" component={PickDisciplinesScreen as React.ComponentType<any>} />
    </Stack.Navigator>
  );
};

