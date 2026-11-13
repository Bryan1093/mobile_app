import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ConfirmarCitaScreen } from '../screens/citas/ConfirmarCitaScreen';
import { MisCitasScreen } from '../screens/citas/MisCitasScreen';
import { SeleccionHorarioScreen } from '../screens/citas/SeleccionHorarioScreen';
import { CitasStackParamList } from '../../shared/types';

const Stack = createNativeStackNavigator<CitasStackParamList>();

export const CitasStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        animationDuration: 280,
      }}
    >
      <Stack.Screen name="MisCitas" component={MisCitasScreen} />
      <Stack.Screen name="SeleccionHorario" component={SeleccionHorarioScreen} />
      <Stack.Screen name="ConfirmarCita" component={ConfirmarCitaScreen} />
    </Stack.Navigator>
  );
};
