import { DocumentoClinico } from '../domain/entities';

export interface IDocumentRepository {
  getDocumentos(): Promise<DocumentoClinico[]>;
  descargarDocumento(id: string): Promise<string>;
}
