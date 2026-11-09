import { RegistroPacienteDTO, UsuarioPaciente } from '../domain/entities';

export interface IAuthRepository {
  login(identificador: string, contrasena: string): Promise<UsuarioPaciente>;
  register(datos: RegistroPacienteDTO): Promise<UsuarioPaciente>;
  logout(): Promise<void>;
  getMe(): Promise<UsuarioPaciente | null>;
}
