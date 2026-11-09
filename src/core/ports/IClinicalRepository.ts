import { RegistroEva } from '../domain/entities';

export interface IClinicalRepository {
  getHistorialEva(): Promise<RegistroEva[]>;
  agregarRegistroEva(registro: Omit<RegistroEva, 'id'>): Promise<RegistroEva>;
}
