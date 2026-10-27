import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { THEME } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';
import { AuthStackNavigator } from './AuthStackNavigator';
import { BottomTabNavigator } from './BottomTabNavigator';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { usuario, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: THEME.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {usuario ? (
          <RootStack.Screen name="Main" component={BottomTabNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthStackNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

