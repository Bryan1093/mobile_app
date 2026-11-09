import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { triggerHaptic } from '../utils/haptics';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../constants/theme';
import { CuentaScreen } from '../screens/cuenta/CuentaScreen';
import { InicioScreen } from '../screens/home/InicioScreen';
import { MisDocumentosScreen } from '../screens/tratamientos/MisDocumentosScreen';
import { MainTabParamList } from '../types';
import { CitasStackNavigator } from './CitasStackNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const BottomTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  // Asegura espacio respirable y ergonómico sin cortar etiquetas en Android (gesture bar) ni iOS
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 22 : 12);
  const barHeight = (Platform.OS === 'ios' ? 62 : 64) + bottomPadding;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: [
          styles.tabBar,
          {
            height: barHeight,
            paddingBottom: bottomPadding,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarHideOnKeyboard: true,
      }}
      screenListeners={{
        tabPress: () => {
          triggerHaptic('selection');
        },
      }}
    >
      <Tab.Screen
        name="InicioTab"
        component={InicioScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
              <MaterialIcons name="home" size={24} color={color} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="CitasTab"
        component={CitasStackNavigator}
        options={{
          tabBarLabel: 'Citas',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
              <MaterialIcons name="event-available" size={24} color={color} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="TratamientosTab"
        component={MisDocumentosScreen}
        options={{
          tabBarLabel: 'Tratamientos',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
              <MaterialIcons name="description" size={24} color={color} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="CuentaTab"
        component={CuentaScreen}
        options={{
          tabBarLabel: 'Cuenta',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
              <MaterialIcons name="person" size={24} color={color} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E2E8F0',
    borderTopWidth: 1,
    paddingTop: 8,
    ...THEME.shadows.card,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
    marginBottom: 2,
    includeFontPadding: false,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.primary,
    marginTop: 2,
  },
});
