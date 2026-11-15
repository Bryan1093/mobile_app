import { useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { RegistroPacienteDTO, UsuarioPaciente } from '../../core/domain';
import { authRepository } from '../../infrastructure/container';

interface AuthContextType {
  usuario: UsuarioPaciente | null;
  isLoading: boolean;
  login: (identificador: string, contrasena: string) => Promise<{ ok: boolean; mensaje?: string }>;
  registro: (datos: RegistroPacienteDTO) => Promise<{ ok: boolean; mensaje?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [usuario, setUsuario] = useState<UsuarioPaciente | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const currentUser = await authRepository.getMe();
        if (isMounted) {
          setUsuario(currentUser);
        }
      } catch (err) {
        console.warn('[AuthContext] Error verificando sesión inicial:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (
    identificador: string,
    contrasena: string
  ): Promise<{ ok: boolean; mensaje?: string }> => {
    setIsLoading(true);
    try {
      const user = await authRepository.login(identificador, contrasena);
      queryClient.clear();
      setUsuario(user);
      return { ok: true };
    } catch (e: any) {
      return {
        ok: false,
        mensaje: e?.message || 'Error al autenticar credenciales en el sistema.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const registro = async (
    datos: RegistroPacienteDTO
  ): Promise<{ ok: boolean; mensaje?: string }> => {
    setIsLoading(true);
    try {
      const user = await authRepository.register(datos);
      queryClient.clear();
      setUsuario(user);
      return { ok: true };
    } catch (e: any) {
      return {
        ok: false,
        mensaje: e?.message || 'Error al completar el registro del paciente.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authRepository.logout();
      queryClient.clear();
      setUsuario(null);
    } catch (e) {
      console.warn('[AuthContext] Error durante logout:', e);
      queryClient.clear();
      setUsuario(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, isLoading, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
