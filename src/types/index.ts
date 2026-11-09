import { BloqueHorario, Especialidad, Fisioterapeuta } from '../core/domain';

// Re-exportación completa del Dominio Limpio
export * from '../core/domain';

// Parámetros de navegación (Capa de Presentación)
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type CitasStackParamList = {
  MisCitas: undefined;
  SeleccionHorario: { especialidadIdPrevia?: string };
  ConfirmarCita: {
    especialidad: Especialidad;
    fisioterapeuta: Fisioterapeuta;
    fecha: string;
    bloqueHorario: BloqueHorario;
  };
};

export type MainTabParamList = {
  InicioTab: undefined;
  CitasTab: undefined;
  TratamientosTab: undefined;
  CuentaTab: undefined;
};
