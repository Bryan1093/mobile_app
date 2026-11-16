import { RegistroEva } from '../domain/entities';

export interface IClinicalRepository {
  getHistorialEva(): Promise<RegistroEva[]>;
}
