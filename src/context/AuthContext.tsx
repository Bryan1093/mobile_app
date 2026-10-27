import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuthToken, removeAuthToken, saveAuthToken } from '../api/client';
import { PACIENTE_ACTUAL_MOCK } from '../data/mockData';
import { Usuario } from '../types';

interface AuthContextType {
  usuario: Usuario | null;
  isLoading: boolean;
  login: (identificador: string, contrasena: string) => Promise<{ ok: boolean; mensaje?: string }>;
  registro: (datos: Omit<Usuario, 'id' | 'rol'> & { contrasena: string }) => Promise<{ ok: boolean; mensaje?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Al iniciar, verificar si existe sesión guardada
    const checkSession = async () => {
      try {
        const token = await getAuthToken();
        if (token) {
          // Si hay token, cargamos los datos del paciente
          setUsuario(PACIENTE_ACTUAL_MOCK);
        } else {
          // Por comodidad inicial para desarrollo rápido en la biblioteca, podemos auto-iniciar o dejar en mock
          setUsuario(PACIENTE_ACTUAL_MOCK);
        }
      } catch (err) {
        console.warn('Error verificando sesión:', err);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (identificador: string, contrasena: string): Promise<{ ok: boolean; mensaje?: string }> => {
    setIsLoading(true);
    try {
      // Simulación de autenticación JWT o llamada API real
      await new Promise((res) => setTimeout(res, 800));
      const fakeJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockTokenInnovaLOPDP2026';
      await saveAuthToken(fakeJwt);
      setUsuario(PACIENTE_ACTUAL_MOCK);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, mensaje: e?.message || 'Error al autenticar credenciales.' };
    } finally {
      setIsLoading(false);
    }
  };

  const registro = async (
    datos: Omit<Usuario, 'id' | 'rol'> & { contrasena: string }
  ): Promise<{ ok: boolean; mensaje?: string }> => {
    setIsLoading(true);
    try {
      if (!datos.consentimientoLOPDP) {
        return {
          ok: false,
          mensaje: 'Debe aceptar los términos de la Ley Orgánica de Protección de Datos Personales (LOPDP).',
        };
      }
      await new Promise((res) => setTimeout(res, 900));
      const nuevoUsuario: Usuario = {
        id: `pac-${datos.cedula}`,
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        cedula: datos.cedula,
        correo: datos.correo,
        telefono: datos.telefono,
        fechaNacimiento: datos.fechaNacimiento,
        rol: 'PACIENTE',
        consentimientoLOPDP: true,
        fechaConsentimiento: new Date().toISOString(),
        expoPushToken: 'ExponentPushToken[mock-paciente-registered]',
      };
      const fakeJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockTokenInnovaLOPDP2026';
      await saveAuthToken(fakeJwt);
      setUsuario(nuevoUsuario);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, mensaje: e?.message || 'Error al completar el registro del paciente.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await removeAuthToken();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, isLoading, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

