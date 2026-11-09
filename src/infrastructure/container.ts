import {
  IAppointmentRepository,
  IAuthRepository,
  IClinicalRepository,
  IDocumentRepository,
  INotificationRepository,
} from '../core/ports';
import {
  HttpAppointmentRepository,
  HttpAuthRepository,
  HttpClinicalRepository,
  HttpDocumentRepository,
  HttpNotificationRepository,
} from './api';
import {
  MockAppointmentRepository,
  MockAuthRepository,
  MockClinicalRepository,
  MockDocumentRepository,
  MockNotificationRepository,
} from './mock';

export type DataSourceType = 'mock' | 'api';

export interface ServiceContainer {
  readonly dataSource: DataSourceType;
  readonly authRepository: IAuthRepository;
  readonly appointmentRepository: IAppointmentRepository;
  readonly clinicalRepository: IClinicalRepository;
  readonly documentRepository: IDocumentRepository;
  readonly notificationRepository: INotificationRepository;
}

class DependencyContainer implements ServiceContainer {
  private _dataSource: DataSourceType;
  private _authRepo!: IAuthRepository;
  private _appointmentRepo!: IAppointmentRepository;
  private _clinicalRepo!: IClinicalRepository;
  private _documentRepo!: IDocumentRepository;
  private _notificationRepo!: INotificationRepository;

  constructor() {
    const envSource = (process.env.EXPO_PUBLIC_DATA_SOURCE || 'mock').toLowerCase() as DataSourceType;
    this._dataSource = envSource === 'api' ? 'api' : 'mock';
    this.initRepositories();
  }

  private initRepositories(): void {
    if (this._dataSource === 'api') {
      console.info('[Container] Inicializando repositorios HTTP (Conexión Backend Real)...');
      this._authRepo = new HttpAuthRepository();
      this._appointmentRepo = new HttpAppointmentRepository();
      this._clinicalRepo = new HttpClinicalRepository();
      this._documentRepo = new HttpDocumentRepository();
      this._notificationRepo = new HttpNotificationRepository();
    } else {
      console.info('[Container] Inicializando repositorios MOCK (Modo Tesis Offline)...');
      this._authRepo = new MockAuthRepository();
      this._appointmentRepo = new MockAppointmentRepository();
      this._clinicalRepo = new MockClinicalRepository();
      this._documentRepo = new MockDocumentRepository();
      this._notificationRepo = new MockNotificationRepository();
    }
  }

  public setDataSource(source: DataSourceType): void {
    if (this._dataSource !== source) {
      this._dataSource = source;
      this.initRepositories();
    }
  }

  get dataSource(): DataSourceType {
    return this._dataSource;
  }

  get authRepository(): IAuthRepository {
    return this._authRepo;
  }

  get appointmentRepository(): IAppointmentRepository {
    return this._appointmentRepo;
  }

  get clinicalRepository(): IClinicalRepository {
    return this._clinicalRepo;
  }

  get documentRepository(): IDocumentRepository {
    return this._documentRepo;
  }

  get notificationRepository(): INotificationRepository {
    return this._notificationRepo;
  }
}

// Singleton global del contenedor de inyección de dependencias
export const container = new DependencyContainer();

// Proxies de conveniencia para acceso directo
export const authRepository = new Proxy({} as IAuthRepository, {
  get: (_, prop: string | symbol) => {
    return (container.authRepository as any)[prop];
  },
});

export const appointmentRepository = new Proxy({} as IAppointmentRepository, {
  get: (_, prop: string | symbol) => {
    return (container.appointmentRepository as any)[prop];
  },
});

export const clinicalRepository = new Proxy({} as IClinicalRepository, {
  get: (_, prop: string | symbol) => {
    return (container.clinicalRepository as any)[prop];
  },
});

export const documentRepository = new Proxy({} as IDocumentRepository, {
  get: (_, prop: string | symbol) => {
    return (container.documentRepository as any)[prop];
  },
});

export const notificationRepository = new Proxy({} as INotificationRepository, {
  get: (_, prop: string | symbol) => {
    return (container.notificationRepository as any)[prop];
  },
});
