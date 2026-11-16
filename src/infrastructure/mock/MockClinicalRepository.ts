import { RegistroEva } from '../../core/domain';
import { IClinicalRepository } from '../../core/ports';
import { EVOLUCION_EVA_MOCK } from './mockData';

export class MockClinicalRepository implements IClinicalRepository {
  private registros: RegistroEva[] = [...EVOLUCION_EVA_MOCK];

  async getHistorialEva(): Promise<RegistroEva[]> {
    await new Promise((res) => setTimeout(res, 250));
    return [...this.registros];
  }
}
