import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';

interface BookingStepperProps {
  currentStep: 1 | 2;
}

export const BookingStepper: React.FC<BookingStepperProps> = ({ currentStep }) => {
  return (
    <View style={styles.container}>
      {/* Barra de progreso visual continua */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: currentStep === 1 ? '50%' : '100%' },
          ]}
        />
      </View>

      {/* Etiquetas e indicadores de paso */}
      <View style={styles.stepsRow}>
        {/* Paso 1 */}
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, styles.stepCircleActive]}>
            {currentStep > 1 ? (
              <MaterialIcons name="check" size={14} color="#FFFFFF" />
            ) : (
              <Text style={styles.stepNumberActive}>1</Text>
            )}
          </View>
          <Text style={[styles.stepLabel, styles.stepLabelActive]}>
            Especialidad y Horario
          </Text>
        </View>

        {/* Paso 2 */}
        <View style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              currentStep === 2 ? styles.stepCircleActive : styles.stepCircleInactive,
            ]}
          >
            <Text
              style={
                currentStep === 2 ? styles.stepNumberActive : styles.stepNumberInactive
              }
            >
              2
            </Text>
          </View>
          <Text
            style={[
              styles.stepLabel,
              currentStep === 2 ? styles.stepLabelActive : styles.stepLabelInactive,
            ]}
          >
            Revisión y Confirmación
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 8,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#38BDF8', // Cyan brillante médico
    borderRadius: 2,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#38BDF8',
  },
  stepCircleInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepNumberActive: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepNumberInactive: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 12,
  },
  stepLabelActive: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepLabelInactive: {
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.65)',
  },
});

