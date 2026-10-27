import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '../constants/theme';

interface ConflictModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="error-outline" size={48} color={THEME.colors.danger} />
          </View>
          <Text style={styles.title}>Horario No Disponible (409 Conflict)</Text>
          <Text style={styles.description}>
            Lo sentimos, otro paciente o la recepción acaba de reservar este mismo turno hace un instante.
          </Text>
          <Text style={styles.subtext}>
            Para garantizar la integridad y evitar citas duplicadas (control de concurrencia ACID en PostgreSQL),
            hemos actualizado la lista de horarios libres. Por favor selecciona otro bloque.
          </Text>
          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Entendido, elegir otro horario</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 43, 73, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    ...THEME.shadows.modal,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: THEME.colors.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  subtext: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  button: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: THEME.borderRadius.md,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});

