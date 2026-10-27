# Innova Fisioterapia - Adaptador Primario Móvil (React Native)

Aplicación móvil orientada a pacientes para el centro de rehabilitación física **Innova Fisioterapia** (Tumbaco, Quito - Ecuador). Desarrollada como **Adaptador Primario Móvil** bajo el patrón de **Arquitectura Hexagonal (Ports and Adapters)** en cumplimiento del Plan de Titulación de la **Universidad Central del Ecuador (UCE)**.

---

## 📱 Tecnologías Empleadas

- **Framework**: React Native con **Expo** (SDK 58).
- **Lenguaje**: TypeScript en modo estricto.
- **Navegación**: `@react-navigation/native`, `@react-navigation/bottom-tabs` y `@react-navigation/native-stack`.
- **Gestión de Estado y Servidor**: Context API + `@tanstack/react-query` y cliente HTTP con `axios`.
- **Seguridad y LOPDP**: `expo-secure-store` para custodia cifrada de tokens JWT en el almacenamiento del dispositivo.
- **Visor y Descarga de Documentos / PDFs**: `expo-web-browser`, `expo-file-system` y `expo-sharing`.
- **Diseño de Interfaz**: Sistema de diseño clínico tipo MiVeris (Fondo `#F4F6F9`, Azul Institucional `#0052CC`, tarjetas redondeadas con elevación).

---

## 🏛️ Cobertura de Requisitos de Titulación

1. **Autoservicio de Citas para Pacientes**:
   - Selección entre las **5 especialidades** de fisioterapia.
   - Selección entre los **5 fisioterapeutas** (relación N:N) o especialista sugerido.
   - Carrusel interactivo horizontal de fechas.
   - Bloques horarios de **1 hora fija** (08:00 - 09:00, 09:00 - 10:00, etc.).
   - Filtrado estricto: **nunca se muestran horarios ocupados en rojo**; la interfaz solo renderiza bloques libres.
2. **Control Transaccional de Concurrencia (`HTTP 409 Conflict`)**:
   - Captura de colisiones de reserva simultánea (apoyada en el backend por bloqueos pesimistas `SELECT ... FOR UPDATE` sobre PostgreSQL).
   - Modal explicativo amigable que informa al paciente de la condición de carrera y refresca la disponibilidad en tiempo real.
3. **Modalidad de Pago Transparente**:
   - Sin pasarelas complejas en línea (excluye PCI-DSS); indica claramente *"Pago presencial en recepción"*.
4. **Pestaña de Tratamientos y Documentos**:
   - Visualización y descarga de rutinas domiciliarias, guías ergonómicas y recetas/órdenes médicas en formato PDF.
5. **Evolución del Dolor con Escala Visual Análoga (EVA)**:
   - Registro y gráfico del dolor de 0 a 10 puntos en la pantalla de Inicio.
6. **Cumplimiento LOPDP (Ecuador)**:
   - Validación matemática de cédulas ecuatorianas mediante el algoritmo **Módulo 10**.
   - Checkbox obligatorio de Consentimiento Informado (Artículos 7, 8 y 25 de la Ley Orgánica de Protección de Datos Personales).
   - Cifrado en reposo y sesiones stateless mediante JWT.

---

## 📁 Estructura del Proyecto

```text
app_mobil/
├── App.tsx                        # Punto de entrada principal con proveedores de contexto
├── src/
│   ├── api/
│   │   └── client.ts             # Cliente Axios con interceptores JWT y SecureStore
│   ├── components/
│   │   ├── CitaCard.tsx          # Tarjeta de cita con acciones (Ver PDF, Cancelar, Reagendar)
│   │   ├── ConflictModal.tsx     # Modal para control de concurrencia HTTP 409
│   │   ├── DocumentoCard.tsx     # Tarjeta de tratamientos y descarga de PDF
│   │   ├── EvaScaleCard.tsx      # Componente de Escala Visual Análoga (EVA 0-10)
│   │   └── NotificationsModal.tsx# Bandeja flotante de notificaciones in-app
│   ├── constants/
│   │   └── theme.ts              # Paleta de colores clínicos, tipografía y sombras
│   ├── context/
│   │   ├── AppointmentContext.tsx# Estado global de citas, tratamientos y notificaciones
│   │   └── AuthContext.tsx       # Estado de autenticación JWT y sesión del paciente
│   ├── data/
│   │   └── mockData.ts           # Datos sintéticos representativos (modelo 5x5, sedes, LOPDP)
│   ├── navigation/
│   │   ├── AppNavigator.tsx      # Switch condicional Auth / Main
│   │   ├── AuthStackNavigator.tsx # Login y Registro
│   │   ├── BottomTabNavigator.tsx # Pestañas: Inicio, Citas, Tratamientos, Cuenta
│   │   └── CitasStackNavigator.tsx # Flujo completo de agendamiento
│   ├── screens/
│   │   ├── auth/                 # Login y Registro con validación Módulo 10
│   │   ├── citas/                # Mis Citas, Selección Horario y Confirmación
│   │   ├── cuenta/               # Perfil del paciente y términos LOPDP
│   │   ├── home/                 # Inicio con resumen de citas y escala EVA
│   │   └── tratamientos/         # Lista de PDF de rutinas y recetas médicas
│   ├── types/
│   │   └── index.ts              # Contratos e interfaces estrictas en TypeScript
│   └── utils/
│       └── validators.ts         # Algoritmo Módulo 10 para cédulas del Ecuador
```

---

## 🚀 Cómo Ejecutar la Aplicación

1. Abre una terminal en esta carpeta:
   ```bash
   cd C:\Users\BIBLIOTECA-PC-04\Documents\app_mobil
   ```

2. Inicia el servidor de desarrollo Expo:
   ```bash
   npm start
   ```

3. **Para probar en tu teléfono celular (Android o iPhone)**:
   - Descarga la app gratuita **Expo Go** desde Google Play Store o App Store.
   - Asegúrate de que tu celular esté conectado a la misma red WiFi que la computadora (o en modo túnel).
   - Escanea el código QR que aparecerá en la terminal con la cámara (iOS) o desde Expo Go (Android).

4. **Para probar en la computadora (Navegador Web)**:
   - Presiona la tecla `w` en la consola de Expo.

