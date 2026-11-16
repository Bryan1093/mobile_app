import { isAxiosError } from 'axios';
import { DocumentoClinico } from '../../core/domain';
import { IDocumentRepository } from '../../core/ports';
import { apiClient } from './client';
import { handleAxiosError } from './httpErrors';

export class HttpDocumentRepository implements IDocumentRepository {
  async getDocumentos(): Promise<DocumentoClinico[]> {
    try {
      const response = await apiClient.get<DocumentoClinico[]>('/me/documentos');
      if (!Array.isArray(response.data)) return [];
      return response.data.map((doc) => ({
        ...doc,
        archivoUrl: doc.archivoUrl ?? '',
        indicaciones: doc.indicaciones ?? null,
        activa: doc.activa,
        ejercicios: Array.isArray(doc.ejercicios)
          ? doc.ejercicios.map((ej) => ({
              orden: ej.orden,
              nombre: ej.nombre,
              zona: ej.zona,
              descripcion: ej.descripcion,
              series: ej.series,
              repeticiones: ej.repeticiones,
              frecuencia: ej.frecuencia,
              notas: ej.notas ?? null,
            }))
          : undefined,
      }));
    } catch (error) {
      if (isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 401)) {
        if (__DEV__) {
          console.warn('[HttpDocumentRepository] /me/documentos no disponible:', error.response?.status);
        }
        return [];
      }
      return handleAxiosError(error);
    }
  }

  async descargarDocumento(id: string): Promise<string> {
    try {
      const docs = await this.getDocumentos();
      const found = docs.find((d) => d.id === id);
      return found?.archivoUrl ?? '';
    } catch (error) {
      return handleAxiosError(error);
    }
  }
}
