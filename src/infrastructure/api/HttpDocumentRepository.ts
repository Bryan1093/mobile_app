import { apiClient } from './client';
import { DocumentoClinico } from '../../core/domain';
import { IDocumentRepository } from '../../core/ports';
import { handleAxiosError } from './httpErrors';

export class HttpDocumentRepository implements IDocumentRepository {
  async getDocumentos(): Promise<DocumentoClinico[]> {
    try {
      const response = await apiClient.get('/pacientes/me/documentos');
      return response.data?.data || response.data;
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  async descargarDocumento(id: string): Promise<string> {
    try {
      const response = await apiClient.get(`/pacientes/me/documentos/${id}/descargar`);
      const data = response.data;
      return data?.url || data?.downloadUrl || data;
    } catch (error) {
      return handleAxiosError(error);
    }
  }
}
