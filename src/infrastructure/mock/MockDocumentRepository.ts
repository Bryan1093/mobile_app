import { DocumentoClinico, NotFoundError } from '../../core/domain';
import { IDocumentRepository } from '../../core/ports';
import { DOCUMENTOS_MOCK } from '../../data/mockData';

export class MockDocumentRepository implements IDocumentRepository {
  private documentos: DocumentoClinico[] = [...DOCUMENTOS_MOCK];

  async getDocumentos(): Promise<DocumentoClinico[]> {
    await new Promise((res) => setTimeout(res, 300));
    return [...this.documentos];
  }

  async descargarDocumento(id: string): Promise<string> {
    await new Promise((res) => setTimeout(res, 500));
    const doc = this.documentos.find((d) => d.id === id);
    if (!doc) {
      throw new NotFoundError(`No se encontró el documento clínico con ID ${id}`);
    }
    return doc.archivoUrl;
  }
}
