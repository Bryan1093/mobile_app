import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppointmentProvider } from './src/context/AppointmentContext';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 3, // 3 minutos
    },
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppointmentProvider>
            <AppNavigator />
          </AppointmentProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
