# Contrato de Interfaz de API REST — Innova Fisioterapia
**Proyecto de Titulación (Tesis) — Universidad Central del Ecuador**  
**Consumidor:** Aplicación Móvil React Native / Expo  
**Proveedor:** Backend Node.js / Express / NestJS / PostgreSQL (Kevin)  
**Versión de Especificación:** 1.0.0  

---

## 1. Convenciones Generales de Comunicación

### 1.1 Base URL y Versionamiento
- **URL Base:** `http://<HOST>:<PUERTO>/api` (ej. `http://192.168.100.10:3000/api`)
- **Content-Type / Accept:** `application/json; charset=utf-8`

### 1.2 Formato Uniforme de Respuestas JSON (Envelope Pattern)

**Respuesta Exitosa (200 OK / 201 Created):**
```json
{
  "success": true,
  "data": { ... } // Objeto o array con los datos solicitados
}
```

**Respuesta de Error (400, 401, 403, 404, 409, 500):**
```json
{
  "success": false,
  "error": {
    "code": "CODIGO_ERROR_ENUM",
    "message": "Descripción clara orientada al usuario o registro técnico",
    "details": null
  }
}
```

### 1.3 Autenticación y Autorización (JWT - LOPDP)
- Todas las rutas protegidas requieren el header HTTP:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
- Si el token expira o es inválido, el backend debe retornar **`401 Unauthorized`**.

---

## 2. Módulo de Autenticación y Pacientes

### 2.1 Iniciar Sesión (Login)
- **Ruta:** `POST /api/auth/login`
- **Pública:** Sí
- **Request Body:**
  ```json
  {
    "identificador": "1725893412", // Puede ser Cédula (10 dígitos) o Correo Electrónico
    "contrasena": "MiClaveSegura123"
  }
  ```
- **Responses:**
  - **`200 OK`**:
    ```json
    {
      "success": true,
      "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "usuario": {
          "id": "usr-1725893412",
          "nombres": "Carlos Andrés",
          "apellidos": "Mendoza Silva",
          "cedula": "1725893412",
          "correo": "carlos.mendoza@innova.com",
          "telefono": "0991234567",
          "fechaNacimiento": "1994-05-14",
          "rol": "PACIENTE",
          "consentimientoLOPDP": true,
          "fechaConsentimiento": "2026-01-10T14:30:00Z",
          "expoPushToken": "ExponentPushToken[xxxxxx]"
        }
      }
    }
    ```
  - **`401 Unauthorized`**:
    ```json
    {
      "success": false,
      "error": {
        "code": "INVALID_CREDENTIALS",
        "message": "Cédula/correo o contraseña incorrectos."
      }
    }
    ```

---

### 2.2 Registro de Paciente Nuevo (con consentimiento LOPDP)
- **Ruta:** `POST /api/auth/register`
- **Pública:** Sí
- **Request Body:**
  ```json
  {
    "nombres": "Carlos Andrés",
    "apellidos": "Mendoza Silva",
    "cedula": "1725893412",
    "correo": "carlos.mendoza@innova.com",
    "telefono": "0991234567",
    "fechaNacimiento": "1994-05-14",
    "contrasena": "MiClaveSegura123",
    "consentimientoLOPDP": true
  }
  ```
- **Responses:**
  - **`201 Created`**: Estructura idéntica al login (retorna `token` y `usuario`).
  - **`409 Conflict`**: Si la cédula o correo ya se encuentran registrados (`code: "USER_ALREADY_EXISTS"`).

---

### 2.3 Obtener Perfil del Paciente Autenticado
- **Ruta:** `GET /api/auth/me` *(Fallback admitido: `GET /api/pacientes/me`)*
- **Headers:** `Authorization: Bearer <JWT>`
- **Responses:**
  - **`200 OK`**:
    ```json
    {
      "success": true,
      "data": {
        "id": "usr-1725893412",
        "nombres": "Carlos Andrés",
        "apellidos": "Mendoza Silva",
        "cedula": "1725893412",
        "correo": "carlos.mendoza@innova.com",
        "telefono": "0991234567",
        "fechaNacimiento": "1994-05-14",
        "rol": "PACIENTE",
        "consentimientoLOPDP": true,
        "expoPushToken": "ExponentPushToken[xxxxxx]"
      }
    }
    ```

---

## 3. Catálogos Clínicos y Disponibilidad

### 3.1 Listar Especialidades de Fisioterapia
- **Ruta:** `GET /api/especialidades`
- **Headers:** `Authorization: Bearer <JWT>` (o pública)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "esp-01",
        "nombre": "Fisioterapia Deportiva",
        "descripcion": "Rehabilitación de lesiones atléticas, ligamentos, tendones y reintegro al deporte.",
        "duracionMinutos": 60,
        "icono": "fitness-center"
      },
      {
        "id": "esp-02",
        "nombre": "Rehabilitación Traumatológica",
        "descripcion": "Recuperación post-quirúrgica, fracturas, esguinces y dolor articular agudo o crónico.",
        "duracionMinutos": 60,
        "icono": "healing"
      }
    ]
  }
  ```

---

### 3.2 Listar Fisioterapeutas
- **Ruta:** `GET /api/fisioterapeutas`
- **Headers:** `Authorization: Bearer <JWT>`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "fisio-01",
        "nombres": "Andrés",
        "apellidos": "Silva",
        "registroProfesional": "MSP-FT-2018-0492",
        "sede": "Innova Fisioterapia - Tumbaco",
        "fotoUrl": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300",
        "especialidadesIds": ["esp-01", "esp-02"],
        "calificacion": 4.9
      }
    ]
  }
  ```

---

### 3.3 Consultar Bloques Horarios Disponibles
- **Ruta:** `GET /api/turnos/disponibles`
- **Query Params:**
  - `fecha` (string, formato `YYYY-MM-DD`, obligatorio). Ej: `2026-11-10`
  - `fisioterapeutaId` (string, obligatorio). Ej: `fisio-01`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "bloque-2026-11-10-09:00",
        "horaInicio": "09:00",
        "horaFin": "10:00",
        "disponible": true,
        "fisioterapeutaId": "fisio-01",
        "fecha": "2026-11-10"
      },
      {
        "id": "bloque-2026-11-10-10:00",
        "horaInicio": "10:00",
        "horaFin": "11:00",
        "disponible": true,
        "fisioterapeutaId": "fisio-01",
        "fecha": "2026-11-10"
      }
    ]
  }
  ```

---

## 4. Agendamiento y Control de Concurrencia Transaccional

### 4.1 Confirmar y Agendar Turno (CORE DE CONCURRENCIA ACID)
- **Ruta:** `POST /api/citas`
- **Headers:** `Authorization: Bearer <JWT>`
- **Request Body:**
  ```json
  {
    "pacienteId": "usr-1725893412",
    "pacienteNombre": "Carlos Andrés Mendoza Silva",
    "especialidadId": "esp-01",
    "especialidadNombre": "Fisioterapia Deportiva",
    "fisioterapeutaId": "fisio-01",
    "fisioterapeutaNombre": "Andrés Silva",
    "fecha": "2026-11-10",
    "horaInicio": "09:00",
    "horaFin": "10:00",
    "sede": "Innova Fisioterapia - Tumbaco"
  }
  ```

#### 🔒 IMPLEMENTACIÓN OBLIGATORIA EN BACKEND (PostgreSQL + Transacciones):
Para garantizar que **NUNCA** existan citas duplicadas para el mismo doctor y camilla en recepción o app móvil:

```sql
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- 1. Bloqueo pesimista a nivel de fila (Pessimistic Locking)
SELECT id, estado 
FROM citas 
WHERE fisioterapeuta_id = $fisioterapeutaId 
  AND fecha = $fecha 
  AND hora_inicio = $horaInicio 
  AND estado = 'PROGRAMADA'
FOR UPDATE;

-- 2. Si ya existe un registro activo retornado por la consulta anterior:
--    Hacer ROLLBACK y retornar HTTP 409 Conflict.

-- 3. Si no existe conflicto:
INSERT INTO citas (
  id, paciente_id, fisioterapeuta_id, especialidad_id, 
  fecha, hora_inicio, hora_fin, sede, estado, 
  modalidad_pago, estado_pago, created_at
) VALUES (
  $nuevoId, $pacienteId, $fisioterapeutaId, $especialidadId, 
  $fecha, $horaInicio, $horaFin, $sede, 'PROGRAMADA', 
  'PRESENCIAL_RECEPCION', 'PENDIENTE', NOW()
);

COMMIT;
```

#### Respuestas HTTP:
- **`201 Created`** (Reserva exitosa):
  ```json
  {
    "success": true,
    "data": {
      "id": "cita-8941",
      "pacienteId": "usr-1725893412",
      "pacienteNombreCompleto": "Carlos Andrés Mendoza Silva",
      "fisioterapeutaId": "fisio-01",
      "fisioterapeutaNombreCompleto": "Lcdo. Andrés Silva",
      "especialidadId": "esp-01",
      "especialidadNombre": "Fisioterapia Deportiva",
      "sede": "Innova Fisioterapia - Tumbaco",
      "fecha": "2026-11-10",
      "horaInicio": "09:00",
      "horaFin": "10:00",
      "estado": "PROGRAMADA",
      "modalidadPago": "PRESENCIAL_RECEPCION",
      "estadoPago": "PENDIENTE",
      "createdAt": "2026-11-09T22:00:00.000Z"
    }
  }
  ```

- **`409 Conflict`** (Colisión concurrente detectada):
  > **IMPORTANTE:** La app móvil intercepta este código HTTP exacto (409) para disparar el `ConflictModal` nativo, proteger la UI y evitar dobles cobros/asignaciones.
  ```json
  {
    "success": false,
    "error": {
      "code": "CONFLICT_409",
      "message": "El turno de las 09:00 para la fecha seleccionada acaba de ser reservado por otro paciente. Por favor selecciona otro horario."
    }
  }
  ```

---

### 4.2 Listar Citas del Paciente Autenticado
- **Ruta:** `GET /api/pacientes/me/citas`
- **Headers:** `Authorization: Bearer <JWT>`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "cita-8941",
        "pacienteId": "usr-1725893412",
        "pacienteNombreCompleto": "Carlos Andrés Mendoza Silva",
        "fisioterapeutaId": "fisio-01",
        "fisioterapeutaNombreCompleto": "Lcdo. Andrés Silva",
        "especialidadId": "esp-01",
        "especialidadNombre": "Fisioterapia Deportiva",
        "sede": "Innova Fisioterapia - Tumbaco",
        "fecha": "2026-11-10",
        "horaInicio": "09:00",
        "horaFin": "10:00",
        "estado": "PROGRAMADA",
        "modalidadPago": "PRESENCIAL_RECEPCION",
        "estadoPago": "PENDIENTE",
        "createdAt": "2026-11-09T22:00:00Z"
      }
    ]
  }
  ```

---

### 4.3 Cancelar Cita
- **Ruta:** `PATCH /api/citas/:id/cancelar` *(Fallback admitido: `POST /api/citas/:id/cancelar`)*
- **Headers:** `Authorization: Bearer <JWT>`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "id": "cita-8941",
      "estado": "CANCELADA"
    }
  }
  ```

---

## 5. Módulo Clínico: Escala EVA y Documentos

### 5.1 Historial de Escala Visual Análoga (EVA)
- **Ruta:** `GET /api/pacientes/me/eva`
- **Headers:** `Authorization: Bearer <JWT>`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "eva-01",
        "pacienteId": "usr-1725893412",
        "fecha": "08 nov. 2026",
        "nivelDolor": 4,
        "zonaAfectada": "Hombro derecho",
        "comentario": "Disminuyó la punzada al elevar el brazo."
      }
    ]
  }
  ```

### 5.2 Registrar Medición EVA
- **Ruta:** `POST /api/pacientes/me/eva`
- **Headers:** `Authorization: Bearer <JWT>`
- **Request Body:**
  ```json
  {
    "pacienteId": "usr-1725893412",
    "fecha": "09 nov. 2026",
    "nivelDolor": 3,
    "zonaAfectada": "Hombro derecho",
    "comentario": "Casi sin dolor tras la rutina de estiramientos."
  }
  ```
- **Response `201 Created`:** Retorna el registro EVA insertado con su `id`.

---

### 5.3 Documentos Clínicos y Rutinas
- **Ruta:** `GET /api/pacientes/me/documentos`
- **Headers:** `Authorization: Bearer <JWT>`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "doc-01",
        "pacienteId": "usr-1725893412",
        "fisioterapeutaNombre": "Lcdo. Andrés Silva",
        "titulo": "Rutina de Fortalecimiento Manguito Rotador",
        "tipo": "RUTINA_EJERCICIOS",
        "fechaEmision": "2026-11-05",
        "archivoUrl": "https://innova-docs.s3.amazonaws.com/rutinas/doc-01.pdf",
        "tamano": "1.2 MB"
      }
    ]
  }
  ```

### 5.4 Descarga de Documento
- **Ruta:** `GET /api/pacientes/me/documentos/:id/descargar`
- **Headers:** `Authorization: Bearer <JWT>`
- **Response:** Binario PDF (`application/pdf`) o redirección 302 a URL firmada con expiración corta.

---

## 6. Notificaciones Push y Botón Administrativo ("Notificar a todos")

### 6.1 Registrar ExpoPushToken del Dispositivo
- **Ruta:** `POST /api/notificaciones/push-token`
- **Headers:** `Authorization: Bearer <JWT>`
- **Request Body:**
  ```json
  {
    "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
  }
  ```
- **Lógica Backend:** Actualiza el campo `expo_push_token` en la tabla `usuarios` del paciente autenticado.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Push token registrado satisfactoriamente."
  }
  ```

---

### 6.2 Obtener Notificaciones In-App del Paciente
- **Ruta:** `GET /api/notificaciones`
- **Headers:** `Authorization: Bearer <JWT>`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "notif-01",
        "titulo": "Recordatorio de Cita Médica",
        "mensaje": "Hola Carlos Andrés, recuerda que tienes una cita médica mañana 10/11/2026, con el doctor Lcdo. Andrés Silva a las 09:00.",
        "fecha": "Hace 10 min",
        "leida": false,
        "tipo": "RECORDATORIO_CITA",
        "citaId": "cita-8941"
      }
    ]
  }
  ```

---

### 6.3 Marcar Notificaciones como Leídas
- **Ruta:** `PATCH /api/notificaciones/marcar-leidas` *(Fallback admitido: `POST /api/notificaciones/marcar-leidas`)*
- **Headers:** `Authorization: Bearer <JWT>`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Notificaciones marcadas como leídas."
  }
  ```

---

### 6.4 BOTÓN ADMINISTRATIVO: "Notificar a todos los pacientes con cita mañana"
> **Caso de Uso Central de Tesis:**  
> El personal administrativo entra al panel web 1 día antes, revisa las citas programadas para el día siguiente y pulsa el botón **"Notificar a todos"**. El backend procesa el envío masivo tanto a nivel Push (Expo Push API) como in-app en base de datos.

- **Ruta:** `POST /api/notificaciones/recordatorios-dia-siguiente`
- **Headers:** `Authorization: Bearer <ADMIN_JWT>`
- **Request Body (Opcional si se quiere filtrar fecha o enviar a mañana por defecto):**
  ```json
  {
    "fecha": "2026-11-10" // Si se omite, el backend calcula automáticamente DATE(NOW() + INTERVAL '1 DAY')
  }
  ```

#### Lógica de Ejecución en Backend:
1. Buscar citas en PostgreSQL:
   ```sql
   SELECT 
     c.id AS cita_id,
     c.fecha,
     c.hora_inicio,
     u.id AS paciente_id,
     u.nombres AS paciente_nombre,
     u.expo_push_token,
     f.nombres AS doctor_nombres,
     f.apellidos AS doctor_apellidos
   FROM citas c
   INNER JOIN usuarios u ON u.id = c.paciente_id
   INNER JOIN fisioterapeutas f ON f.id = c.fisioterapeuta_id
   WHERE c.fecha = $fechaObjetivo
     AND c.estado = 'PROGRAMADA'
     AND u.expo_push_token IS NOT NULL;
   ```
2. Por cada cita encontrada:
   - Crear registro en la tabla `notificaciones` (in-app):
     - `titulo`: `"Recordatorio de Cita Médica"`
     - `mensaje`: `"Hola ${paciente_nombre}, recuerda que tienes una cita médica mañana ${fecha}, con el doctor Lcdo. ${doctor_nombres} ${doctor_apellidos} a las ${hora_inicio}."`
     - `tipo`: `"RECORDATORIO_CITA"`
     - `cita_id`: `${cita_id}`
     - `leida`: `false`
   - Armar el payload para el servicio Expo Push:
     ```json
     {
       "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
       "sound": "default",
       "title": "Recordatorio de Cita Médica",
       "body": "Hola Carlos, recuerda que tienes una cita médica mañana 10/11/2026, con el doctor Lcdo. Andrés Silva a las 09:00.",
       "data": {
         "id": "notif-uuid",
         "tipo": "RECORDATORIO_CITA",
         "citaId": "cita-8941"
       },
       "channelId": "innova_citas_channel"
     }
     ```
3. Enviar lote HTTP POST a `https://exp.host/--/api/v2/push/send` con headers `Content-Type: application/json` y `Accept: application/json`.

#### Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "fechaProcesada": "2026-11-10",
    "citasNotificadas": 14,
    "mensajesEnviadosPush": 12,
    "sinPushToken": 2
  }
}
```

---

## 7. Tabla Resumen de Códigos HTTP

| Código | Significado | Cuándo lo retorna el backend |
|---|---|---|
| **`200 OK`** | Petición exitosa | Consultas GET, actualizaciones exitosas |
| **`201 Created`** | Recurso creado | Agendamiento exitoso, nuevo registro EVA |
| **`400 Bad Request`** | Parámetros inválidos | Validación de campos o cédula mal formada |
| **`401 Unauthorized`** | No autenticado | Token ausente, alterado o expirado |
| **`403 Forbidden`** | Sin permisos | Paciente intentando acceder a ruta de Administrador |
| **`404 Not Found`** | No encontrado | Cita, documento o paciente inexistente |
| **`409 Conflict`** | Colisión de estado | **Bloqueo pesimista `SELECT FOR UPDATE` detecta turno ya ocupado** |
| **`500 Internal Error`** | Error en servidor | Error no controlado en BD o servidor |
