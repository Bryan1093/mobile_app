# 🚀 Guía de Instalación y Ejecución en Otra PC
## Innova Fisioterapia Móvil (React Native + Expo)

Esta guía te explica paso a paso cómo clonar, instalar dependencias y correr la aplicación en tu computadora personal, laptop de un compañero o cualquier nuevo equipo.

---

## 1. Requisitos Previos en la Nueva PC

Antes de comenzar, asegúrate de tener instalados estos dos programas en tu computadora:

1. **Node.js (versión LTS recomendada: 20.x o 22.x)**:
   - Descárgalo gratis desde [nodejs.org](https://nodejs.org/).
   - Al instalarlo, mantén marcadas las opciones por defecto (incluye `npm`).
   - Comprueba en una terminal ejecutando: `node -v` y `npm -v`.

2. **Git**:
   - Descárgalo desde [git-scm.com](https://git-scm.com/) o mediante **GitHub Desktop**.
   - Comprueba en tu terminal: `git --version`.

3. **En tu teléfono celular**:
   - Descarga la aplicación gratuita **Expo Go**:
     - [Expo Go en Google Play (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)
     - [Expo Go en App Store (iPhone)](https://apps.apple.com/app/expo-go/id982107779)

---

## 2. Paso a Paso para Clonar y Ejecutar

### Paso 1: Clonar el Repositorio de GitHub
Abre la terminal (Git Bash, CMD, PowerShell o la terminal de VS Code) y navega a la carpeta donde quieras guardar el proyecto:

```bash
cd Documents
git clone https://github.com/Bryan1093/mobile_app.git
cd mobile_app
```

---

### Paso 2: Instalar las Dependencias (`node_modules`)
Como la carpeta `node_modules` no se sube a GitHub (por ser muy pesada y dependiente del sistema operativo), el archivo `package.json` ya tiene la lista exacta de todas las librerías. 

Solo ejecuta:

```bash
npm install
```

> ⏳ Esto descargará automáticamente todas las librerías necesarias (`@react-navigation`, `expo-status-bar`, `expo-secure-store`, etc.) y tardará aproximadamente 1 a 2 minutos.

---

### Paso 3: Configurar Variables de Entorno (Opcional)
Si te vas a conectar a un servidor backend local:
1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```
2. Abre el archivo `.env` y coloca la IP local de la computadora donde corre el backend.

---

### Paso 4: Iniciar la Aplicación

Ejecuta el servidor de desarrollo de Expo:

```bash
npx expo start
```
*(O también puedes usar `npm start`).*

Aparecerá en la terminal un **Código QR grande**.

---

## 3. ¿Cómo Ver la App en tu Celular?

### Opción A (Recomendada - Misma Red WiFi):
1. Asegúrate de que tu celular esté conectado a la **misma red WiFi** que la computadora.
2. Abre la app **Expo Go** en tu celular.
   - **En Android**: Pulsa en *"Scan QR code"* y apunta la cámara al código QR de la terminal.
   - **En iPhone**: Abre la cámara nativa de iOS, enfoca el código QR y toca la notificación amarilla para abrir Expo Go.
3. La app cargará en tu teléfono en unos segundos.

### Opción B (Si estás en redes distintas o WiFi público con bloqueo):
Si tu WiFi bloquea la comunicación entre dispositivos (común en universidades, bibliotecas o redes móviles compartidas), ejecuta Expo en **modo túnel**:

```bash
npx expo start --tunnel
```
Esto genera un enlace público seguro que funcionará sin importar la red en la que esté tu teléfono.

---

## 4. Atajos Útiles en la Terminal de Expo

Con Expo corriendo en la terminal, puedes presionar una sola tecla:
- `r` : Recarga la app en el celular inmediatamente.
- `c` : Limpia la memoria caché de Metro Bundler si hiciste cambios de assets o fuentes.
- `a` : Abre en emulador de Android (si tienes Android Studio instalado).
- `w` : Abre la versión web en el navegador de la PC.
- `Ctrl + C` : Detiene el servidor de Expo.

---

## 5. Verificación de Código TypeScript
Para confirmar que todo el código y tipos compilan limpiamente sin errores:

```bash
npx tsc --noEmit
```
Debe finalizar sin mostrar ningún error en consola.

