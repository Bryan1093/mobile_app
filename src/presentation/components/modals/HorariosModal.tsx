import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { THEME } from '../../theme/theme';
import { Fisioterapeuta } from '../../../shared/types';
import { PressableScale } from '../common/PressableScale';
import { BloqueHorarioSkeleton } from '../common/SkeletonLoader';

interface HorariosModalProps {
  visible: boolean;
  fisioterapeuta: Fisioterapeuta | null;
  fechaTexto: string;
  bloques: { id: string; horaInicio: string; horaFin: string }[];
  isLoading?: boolean;
  onSeleccionarBloque: (bloque: { id: string; horaInicio: string; horaFin: string }) => void;
  onClose: () => void;
}

export const HorariosModal: React.FC<HorariosModalProps> = ({
  visible,
  fisioterapeuta,
  fechaTexto,
  bloques,
  isLoading = false,
  onSeleccionarBloque,
  onClose,
}) => {
  if (!fisioterapeuta) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          {/* Barra pequeña de arrastre superior */}
          <View style={styles.dragHandle} />

          {/* Cabecera del Especialista */}
          <View style={styles.headerRow}>
            <View style={styles.doctorInfoRow}>
              <Image source={{ uri: fisioterapeuta.fotoUrl }} style={styles.avatar} />
              <View style={styles.doctorTextContainer}>
                <Text style={styles.doctorName}>
                  Lcdo. {fisioterapeuta.nombres} {fisioterapeuta.apellidos}
                </Text>
                <Text style={styles.sedeText}>
                  <MaterialIcons name="location-on" size={13} color={THEME.colors.primary} />{' '}
                  {fisioterapeuta.sede}
                </Text>
                <Text style={styles.fechaText}>Horarios para el {fechaTexto}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Subtítulo informativo */}
          <View style={styles.subHeaderRow}>
            <Text style={styles.subHeaderTitle}>Turnos de 60 minutos disponibles:</Text>
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>
                {isLoading ? '...' : `${bloques.length} libres`}
              </Text>
            </View>
          </View>

          {/* Lista de Bloques con Placeholder Skeleton o Scroll Suave */}
          {isLoading ? (
            <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
              <View style={styles.columnWrapper}>
                <BloqueHorarioSkeleton />
                <BloqueHorarioSkeleton />
              </View>
              <View style={styles.columnWrapper}>
                <BloqueHorarioSkeleton />
                <BloqueHorarioSkeleton />
              </View>
            </View>
          ) : (
            <FlatList
              data={bloques}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              renderItem={({ item }) => (
                <PressableScale
                  onPress={() => onSeleccionarBloque(item)}
                  hapticStyle="medium"
                  style={styles.slotCardWrapper}
                >
                  <View style={styles.slotCard}>
                    <View style={styles.slotTopRow}>
                      <MaterialIcons name="schedule" size={17} color={THEME.colors.primary} />
                      <View style={styles.greenBadge}>
                        <View style={styles.greenDot} />
                        <Text style={styles.greenBadgeText}>Libre</Text>
                      </View>
                    </View>
                    <Text style={styles.slotTimeText}>
                      {item.horaInicio} - {item.horaFin}
                    </Text>
                    <Text style={styles.slotSubtext}>Atención 1 a 1</Text>
                  </View>
                </PressableScale>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="event-busy" size={44} color={THEME.colors.textMuted} />
                  <Text style={styles.emptyText}>
                    No hay turnos libres para esta fecha con este especialista.
                  </Text>
                </View>
              }
            />
          )}

          {/* Pie informativo LOPDP y Concurrencia */}
          <View style={styles.footerNote}>
            <MaterialIcons name="verified" size={14} color={THEME.colors.primary} />
            <Text style={styles.footerNoteText}>
              Turnos sincronizados en tiempo real con bloqueo pesimista en PostgreSQL.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 37, 72, 0.55)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    minHeight: '45%',
    paddingTop: 10,
    paddingBottom: 24,
    ...THEME.shadows.modal,
  },
  dragHandle: {
    width: 44,
    height: 5,
    backgroundColor: '#CBD5E1',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  doctorTextContainer: {
    flex: 1,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2820',
  },
  sedeText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  fechaText: {
    fontSize: 11,
    color: THEME.colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  subHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  subHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  totalBadge: {
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  totalBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  slotCardWrapper: {
    width: '48%',
  },
  slotCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    ...THEME.shadows.card,
  },
  slotTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6,
  },
  greenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  greenDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: THEME.colors.success,
  },
  greenBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.success,
  },
  slotTimeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2820',
    textAlign: 'center',
  },
  slotSubtext: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerNoteText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    flex: 1,
  },
});

