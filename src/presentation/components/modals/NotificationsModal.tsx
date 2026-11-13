import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '../../theme/theme';
import { Notificacion } from '../../../shared/types';

interface NotificationsModalProps {
  visible: boolean;
  notificaciones: Notificacion[];
  onClose: () => void;
  onMarcarLeidas: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  notificaciones,
  onClose,
  onMarcarLeidas,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Cabecera */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <MaterialIcons name="notifications-active" size={24} color={THEME.colors.primary} />
              <Text style={styles.title}>Notificaciones</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Botón para marcar todas como leídas */}
          {notificaciones.some((n) => !n.leida) && (
            <TouchableOpacity style={styles.markReadRow} onPress={onMarcarLeidas}>
              <Text style={styles.markReadText}>Marcar todas como leídas</Text>
            </TouchableOpacity>
          )}

          {/* Lista de Notificaciones */}
          <FlatList
            data={notificaciones}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="notifications-none" size={48} color={THEME.colors.textMuted} />
                <Text style={styles.emptyText}>No tienes notificaciones pendientes</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={[styles.itemCard, !item.leida && styles.itemCardUnread]}>
                <View style={styles.itemIconContainer}>
                  <MaterialIcons
                    name={
                      item.tipo === 'RECORDATORIO_CITA'
                        ? 'event'
                        : item.tipo === 'NUEVO_DOCUMENTO'
                        ? 'picture-as-pdf'
                        : 'info'
                    }
                    size={22}
                    color={!item.leida ? THEME.colors.primary : THEME.colors.textSecondary}
                  />
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={[styles.itemTitle, !item.leida && styles.itemTitleUnread]}>
                    {item.titulo}
                  </Text>
                  <Text style={styles.itemMessage}>{item.mensaje}</Text>
                  <Text style={styles.itemFecha}>{item.fecha}</Text>
                </View>
                {!item.leida && <View style={styles.unreadDot} />}
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 43, 73, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
    paddingTop: 16,
    ...THEME.shadows.modal,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.divider,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  markReadRow: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'flex-end',
  },
  markReadText: {
    color: THEME.colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  itemCardUnread: {
    backgroundColor: '#F8FAFC',
    borderRadius: THEME.borderRadius.sm,
    paddingHorizontal: 8,
  },
  itemIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    marginBottom: 2,
  },
  itemTitleUnread: {
    fontWeight: '700',
    color: THEME.colors.primaryDark,
  },
  itemMessage: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  itemFecha: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.primary,
    marginTop: 6,
    marginLeft: 6,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: THEME.colors.textMuted,
    marginTop: 8,
  },
});

