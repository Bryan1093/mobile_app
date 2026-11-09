import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { THEME } from '../constants/theme';
import { triggerHaptic } from '../utils/haptics';
import { PressableScale } from './PressableScale';

export interface BookingSummaryData {
  fisioterapeuta: string;
  especialidad: string;
  fechaTexto: string;
  horario: string;
  sede: string;
  precio?: string;
}

interface SuccessBookingModalProps {
  visible: boolean;
  data: BookingSummaryData | null;
  onVerCitas: () => void;
  onVolverInicio: () => void;
}

export const SuccessBookingModal: React.FC<SuccessBookingModalProps> = ({
  visible,
  data,
  onVerCitas,
  onVolverInicio,
}) => {
  // Animaciones nativas a 60 FPS con inicialización declarativa React 19
  const [backdropOpacity] = useState(() => new Animated.Value(0));
  const [cardScale] = useState(() => new Animated.Value(0.85));
  const [cardOpacity] = useState(() => new Animated.Value(0));

  // Animación del checkmark circular esmeralda (~250ms con spring orgánico)
  const [checkScale] = useState(() => new Animated.Value(0));
  const [checkOpacity] = useState(() => new Animated.Value(0));
  const [ringScale] = useState(() => new Animated.Value(0.7));
  const [ringOpacity] = useState(() => new Animated.Value(0.6));

  useEffect(() => {
    if (visible) {
      // Disparo de retroalimentación háptica de éxito al montar/abrir el modal
      triggerHaptic('success');

      // Resetear valores iniciales
      backdropOpacity.setValue(0);
      cardScale.setValue(0.88);
      cardOpacity.setValue(0);
      checkScale.setValue(0);
      checkOpacity.setValue(0);
      ringScale.setValue(0.7);
      ringOpacity.setValue(0.7);

      // Secuencia de entrada fluida y profesional a 60 FPS
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(cardOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(cardScale, {
            toValue: 1,
            friction: 7,
            tension: 70,
            useNativeDriver: true,
          }),
        ]),
        // Micro-animación del checkmark verde institucional (escala + fade en ~250ms)
        Animated.parallel([
          Animated.timing(checkOpacity, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.spring(checkScale, {
            toValue: 1,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(ringScale, {
              toValue: 1.35,
              duration: 320,
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacity, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    }
  }, [visible, backdropOpacity, cardScale, cardOpacity, checkScale, checkOpacity, ringScale, ringOpacity]);

  if (!visible || !data) return null;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={styles.overlay}>
        {/* Fondo semi-transparente con fade animado */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />

        {/* Tarjeta de Éxito Modal */}
        <Animated.View
          style={[
            styles.cardModal,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardContent}
          >
            {/* Animación del Checkmark Circular Verde Esmeralda */}
            <View style={styles.checkmarkWrapper}>
              {/* Anillo de pulso/expansión */}
              <Animated.View
                style={[
                  styles.pulseRing,
                  {
                    opacity: ringOpacity,
                    transform: [{ scale: ringScale }],
                  },
                ]}
              />

              {/* Círculo institucional verde con checkmark */}
              <Animated.View
                style={[
                  styles.checkmarkCircle,
                  {
                    opacity: checkOpacity,
                    transform: [{ scale: checkScale }],
                  },
                ]}
              >
                <MaterialIcons name="check" size={44} color="#FFFFFF" />
              </Animated.View>
            </View>

            {/* Títulos y Feedback de Confirmación */}
            <Text style={styles.title}>¡Turno Confirmado!</Text>
            <Text style={styles.subtitle}>
              Tu cita médica ha sido agendada con éxito y registrada en el sistema clínico de Innova Fisioterapia.
            </Text>

            {/* Tarjeta con Resumen Médico Confirmado */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryHeader}>
                <MaterialIcons name="event-available" size={18} color={THEME.colors.primary} />
                <Text style={styles.summaryHeaderTitle}>Resumen de la Cita</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <View style={styles.iconCol}>
                  <MaterialIcons name="person" size={17} color={THEME.colors.primary} />
                </View>
                <View style={styles.textCol}>
                  <Text style={styles.label}>Especialista</Text>
                  <Text style={styles.value}>{data.fisioterapeuta}</Text>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.iconCol}>
                  <MaterialIcons name="medical-services" size={17} color={THEME.colors.primary} />
                </View>
                <View style={styles.textCol}>
                  <Text style={styles.label}>Especialidad</Text>
                  <Text style={styles.value}>{data.especialidad}</Text>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.iconCol}>
                  <MaterialIcons name="calendar-today" size={17} color={THEME.colors.primary} />
                </View>
                <View style={styles.textCol}>
                  <Text style={styles.label}>Fecha y Hora</Text>
                  <Text style={styles.value}>
                    {data.fechaTexto} • {data.horario}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.iconCol}>
                  <MaterialIcons name="location-on" size={17} color={THEME.colors.primary} />
                </View>
                <View style={styles.textCol}>
                  <Text style={styles.label}>Sede de Atención</Text>
                  <Text style={styles.value}>{data.sede}</Text>
                </View>
              </View>

              {data.precio && (
                <View style={styles.summaryRow}>
                  <View style={styles.iconCol}>
                    <MaterialIcons name="payments" size={17} color={THEME.colors.primary} />
                  </View>
                  <View style={styles.textCol}>
                    <Text style={styles.label}>Modalidad de Pago</Text>
                    <Text style={styles.valueHighlight}>
                      {data.precio} (Presencial en recepción)
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Aviso breve de tranquilidad */}
            <View style={styles.securityNote}>
              <MaterialIcons name="verified-user" size={16} color={THEME.colors.primary} />
              <Text style={styles.securityNoteText}>
                Te esperamos 10 minutos antes para tu recepción clínica.
              </Text>
            </View>

            {/* Botones de Acción */}
            <View style={styles.actionsContainer}>
              <PressableScale
                onPress={onVerCitas}
                hapticStyle="medium"
                style={styles.primaryBtnWrapper}
              >
                <View style={styles.primaryBtn}>
                  <MaterialIcons name="event" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Ver mis citas</Text>
                </View>
              </PressableScale>

              <PressableScale
                onPress={onVolverInicio}
                hapticStyle="light"
                style={styles.secondaryBtnWrapper}
              >
                <View style={styles.secondaryBtn}>
                  <MaterialIcons name="home" size={20} color="#0F2820" />
                  <Text style={styles.secondaryBtnText}>Volver al inicio</Text>
                </View>
              </PressableScale>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 56, 43, 0.65)',
  },
  cardModal: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    ...THEME.shadows.modal,
  },
  cardContent: {
    padding: 24,
    alignItems: 'center',
  },
  checkmarkWrapper: {
    width: 88,
    height: 88,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  pulseRing: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryLight,
  },
  checkmarkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: THEME.colors.primary, // #1B6B53 Verde esmeralda institucional
    justifyContent: 'center',
    alignItems: 'center',
    ...THEME.shadows.card,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F2820',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#5A6872',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  summaryContainer: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  summaryHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2820',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
    gap: 10,
  },
  iconCol: {
    marginTop: 2,
    width: 22,
    alignItems: 'center',
  },
  textCol: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 1,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2820',
  },
  valueHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5F1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: 20,
  },
  securityNoteText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#145340',
    flex: 1,
  },
  actionsContainer: {
    width: '100%',
    gap: 10,
  },
  primaryBtnWrapper: {
    width: '100%',
  },
  primaryBtn: {
    backgroundColor: THEME.colors.primary,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondaryBtnWrapper: {
    width: '100%',
  },
  secondaryBtn: {
    backgroundColor: '#F1F5F9',
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2820',
  },
});
