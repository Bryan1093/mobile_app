import { isAxiosError } from 'axios';
import { DocumentoClinico } from '../../core/domain';
import { IDocumentRepository } from '../../core/ports';
import { apiClient } from './client';
import { handleAxiosError } from './httpErrors';

export class HttpDocumentRepository implements IDocumentRepository {
  async getDocumentos(): Promise<DocumentoClinico[]> {
    try {
      const response = await apiClient.get<DocumentoClinico[]>('/me/documentos');
      return Array.isArray(response.data) ? response.data : [];
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
