# DroneOps Web

DroneOps Web es la plataforma digital oficial orientada a la gestión operativa, reclutamiento y difusión pública del equipo de robótica del Tecnológico de Monterrey, Campus Guadalajara. La solución permite dar a conocer el proyecto a la comunidad externa, canalizar el registro de nuevos aspirantes, conectar las herramientas de trabajo del equipo y ofrecer un espacio privado para la gestión de tareas de los miembros activos.

La solución está estructurada sobre un entorno de renderizado en servidor (SSR) con SvelteKit 2 y Svelte 5, un backend en la nube potenciado por Supabase (autenticación y base de datos) y estilos construidos con Tailwind CSS v4. El despliegue está optimizado para la infraestructura de Vercel mediante su adaptador oficial.

## 1. Descripción general

El objetivo de DroneOps Web es centralizar la presencia digital del equipo y brindar una herramienta de gestión interna eficiente tanto para aspirantes como para ingenieros activos. El flujo de la aplicación queda dividido en cinco momentos:

* **Exploración pública:** Consulta de la visión tecnológica, áreas de investigación y objetivos del equipo.
* **Reclutamiento de candidatos:** Integración de aspirantes mediante escaneo de código QR o acceso directo al grupo oficial en WhatsApp desde `/unete`.
* **Autenticación de miembros:** Inicio de sesión seguro mediante credenciales gestionadas por Supabase Auth.
* **Gestión de entregables:** Panel privado "Por hacer" accesible únicamente para usuarios autenticados para asignar y dar seguimiento a tareas.
* **Hub comunitario:** Plataforma centralizada con accesos directos a GitHub, Notion, Discord e Instagram.

La interfaz funciona mediante renderizado híbrido (SSR + SPA), ofreciendo vistas dedicadas para inicio (`/`), reclutamiento (`/unete`), comunidad (`/comunidad`), área de tareas (`/por-hacer`) e inicio de sesión (`/iniciar_sesion`).

La lógica de negocio aprovecha el manejo de sesiones en el servidor mediante cookies HTTP, permitiendo proteger rutas privadas de forma transparente y reactivar la interfaz del frontend según el estado del usuario.

## 2. Arquitectura

### Frontend

El frontend está desarrollado con SvelteKit 2 y componentes en Svelte 5. La navegación utiliza el enrutador basado en archivos nativo de SvelteKit dentro del directorio `src/routes`.

Los componentes reutilizables del sistema viven en `src/lib` e incluyen la navegación principal (`Navbar.svelte`), el pie de página (`Footer.svelte`) y el cliente para el navegador de Supabase (`supabaseClient.ts`). La aplicación gestiona el estado de la sesión de forma reactiva a través del almacén `$page.data.user`, transmitido directamente desde el servidor.

### Backend & SSR

El backend se apoya en la capa de servidor de SvelteKit (SSR) y servicios de Supabase. Las responsabilidades del servidor incluyen:

* **Gestión de layouts (`+layout.server.ts`):** Valida la sesión del usuario en cada petición HTTP y provee el estado global de autenticación.
* **Rutas de autenticación (`/iniciar_sesion`, `/cerrar_sesion`):** Procesa credenciales de acceso e invalida cookies de sesión durante el cierre de sesión.
* **Rutas protegidas (`/por-hacer`):** Restringe el acceso a la gestión de tareas solo a usuarios con sesión activa.
* **Cliente Supabase SSR (`@supabase/ssr`):** Mantiene sincronizadas las credenciales entre el servidor, el cliente del navegador y la base de datos de Supabase.

## 3. Módulos principales

### Página de inicio (rediseño)

La ruta `/` es la carta de presentación del equipo para patrocinadores y aspirantes. En la branch `rediseno-inicio` se reorganizó en estas secciones, de arriba hacia abajo:

1. **Hero:** badge "Grupo Estudiantil", título de bienvenida, botones **Únete** (`/unete`) y **Conócenos** (`/comunidad`) y dos bloques de color encimados que después se reemplazarán por fotos.
2. **Franja de logos:** fila de logos bajo el hero. Los logos actuales son **de prueba** (`logo-prueba-colores.png` y `logo-prueba-emblema.png`) y deben cambiarse por los de los patrocinadores reales en el arreglo `logos`.
3. **¿Qué hacemos en DroneOps?:** carrusel que cambia de foto cada `SEGUNDOS_POR_FOTO` segundos (4 por defecto). Las franjas de abajo indican la foto actual y permiten saltar a otra con un clic; el temporizador se reinicia al cambiar. Las fotos (`slides`) y el texto (lorem ipsum) son **de prueba**.
4. **Nuestro objetivo (`#objetivo`):** tarjetas de competencias (TMR e IMAV 2026) con líneas para cambiar entre ellas y dos fotos por competencia. Las tarjetas se apilan en la misma celda para que la altura no cambie al alternar. Para agregar una competencia basta con añadir un objeto al arreglo `competencias`; las fotos actuales son **de prueba**.
5. **Investigación (`#investigacion`):** sección que muestra que el grupo también investiga. Está escrita directamente en `+page.svelte` (los datos de los proyectos están en el `<script>` de la página) e incluye:
   - Una introducción con fondo oscuro de ancho completo y cuadrícula, con un panel que grafica la rutina cuadrada del proyecto Tello + OptiTrack (la trayectoria es ilustrativa) y la ley de control PI.
   - **Proyectos destacados:** la investigación principal (control con restricciones de estado basado en cuaterniones y funciones de Lyapunov de barrera) con su gráfica, y tarjetas de Kalman-Navigation, Tello-Optitrack y la plataforma móvil Talos. Cada tarjeta enlaza a su repositorio en [github.com/DroneOps](https://github.com/DroneOps).
   - Para agregar un proyecto, copia un objeto del arreglo `proyectos` y cambia sus datos; el ícono se elige con la propiedad `icono` (`mira`, `camara` o `rayo`).
   - Para que el fondo llegue a las orillas de la pantalla, la página aplica `overflow-x: clip` a `html` en su bloque `<style>`; esto evita un scroll horizontal de unos píxeles causado por la barra de scroll.
6. **Recursos y documentación:** secciones desplegables de tutoriales en video, documentación (Tello, ROS 2, OptiTrack, visión computacional y repositorios) y drones.

Archivos clave:
- [src/routes/+page.svelte](src/routes/+page.svelte)
- [src/lib/assets/logo-prueba-colores.png](src/lib/assets/logo-prueba-colores.png)
- [src/lib/assets/logo-prueba-emblema.png](src/lib/assets/logo-prueba-emblema.png)

### Autenticación y Control de Acceso

El módulo de autenticación gestiona la sesión global de los miembros del equipo. Mediante Supabase Auth y la librería `@supabase/ssr`, las credenciales y tokens se procesan del lado del servidor guardándose en cookies HTTP seguras. La función `+layout.server.ts` verifica el estado de la sesión en cada petición e inyecta la información del usuario a la vista.

En el frontend, el componente de navegación adapta su interfaz de manera reactiva: si el usuario está autenticado, habilita accesos a vistas privadas como `/por-hacer` y muestra su identificador junto a la opción de cerrar sesión.

Archivos clave:
- [src/lib/supabaseClient.ts](src/lib/supabaseClient.ts)
- [src/routes/+layout.server.ts](src/routes/+layout.server.ts)
- [src/routes/iniciar_sesion/+page.svelte](src/routes/iniciar_sesion/+page.svelte)
- [src/routes/cerrar_sesion/+page.server.ts](src/routes/cerrar_sesion/+page.server.ts)

### Portal de Reclutamiento ("Únete")

Punto de entrada para la captación de nuevos talentos. La vista `/unete` está diseñada con un enfoque interactivo e instructivo que guía a los aspirantes a través de tres pasos para unirse al equipo de competencia.

Incluye la integración de un código QR, un aviso de código de conducta para los aspirantes y un enlace de redirección directa al canal oficial de candidatos en WhatsApp.

Archivos clave:
- [src/routes/unete/+page.svelte](src/routes/unete/+page.svelte)
- [src/lib/assets/qr.jpg](src/lib/assets/qr.jpg)

### Gestión de Tareas ("Por hacer")

Módulo privado destinado a la organización interna de proyectos y entregables. La ruta `/por-hacer` está protegida del lado del servidor; si un usuario no autenticado intenta acceder, la aplicación restringe el paso y redirige hacia el flujo de inicio de sesión.

Permite a los miembros registrados visualizar, agregar y administrar las actividades técnicas pendientes dentro de las distintas divisiones del equipo.

Archivos clave:
- [src/routes/por-hacer/+page.svelte](src/routes/por-hacer/+page.svelte)
- [src/routes/por-hacer/+page.server.ts](src/routes/por-hacer/+page.server.ts)

### Hub Comunitario e Integraciones

Módulo público dedicado a la difusión y conexión con las plataformas activas de la organización. Centraliza la navegación hacia herramientas de colaboración técnica y redes sociales.

Proporciona accesos directos estructurados hacia el repositorio central en GitHub, la base de conocimientos del equipo en Notion, el servidor de comunicación en Discord y la cuenta de difusión en Instagram.

Archivos clave:
- [src/routes/comunidad/+page.svelte](src/routes/comunidad/+page.svelte)
- [src/lib/Footer.svelte](src/lib/Footer.svelte)

### Navegación y Layout Adaptativo

El componente de navegación `Navbar.svelte` ofrece una experiencia adaptativa (responsive) con menú desplegable tipo hamburguesa para dispositivos móviles. Evalúa el estado global `$page.data.user` para alternar dinámicamente entre el botón de inicio de sesión y la insignia con el nombre o correo del usuario.

Archivos clave:
- [src/lib/Navbar.svelte](src/lib/Navbar.svelte)
- [src/routes/+layout.svelte](src/routes/+layout.svelte)

---

## 4. Stack tecnológico completo

### Frontend

- Svelte 5.56.1
- SvelteKit 2.63.0
- Tailwind CSS 4.3.3
- @tailwindcss/vite 4.3.3
- TypeScript 6.0.3
- Vite 8.0.16

### Backend y BaaS

- Supabase JS Client 2.112.4
- Supabase SSR Helper 0.12.5
- SvelteKit Server Load & Endpoints (`+layout.server.ts`, `+page.server.ts`)

### Servicios e Infraestructura

- Supabase Cloud (Autenticación y base de datos PostgreSQL)
- Vercel vía `@sveltejs/adapter-vercel` 6.3.4
- WhatsApp Community (Canalización de reclutamiento)
- Integraciones externas: GitHub, Notion, Discord e Instagram

## 5. Instalación y variables de entorno

### Requisitos

- Node.js 18 o superior (recomendado Node.js 20+)
- npm (o tu gestor de paquetes preferido)
- Un proyecto activo en Supabase (para Autenticación y Base de Datos)
- Una cuenta en Vercel (opcional, para despliegue en producción)

### Instalación local

1. Clona el repositorio e ingresa al directorio raíz del proyecto:

```bash
git clone [https://github.com/DroneOps/droneopsweb.git](https://github.com/DroneOps/droneopsweb.git)
cd droneopsweb
```
Instala las dependencias del proyecto:
```bash
npm install
```
Inicia el servidor de desarrollo con Vite:
```bash
npm run dev
```
La aplicación estará disponible localmente en http://localhost:5173.

### Variables de entorno del servidor

Crea [server/.env](server/.env) con al menos estas variables:

```env
PUBLIC_SUPABASE_URL=https://aryqqewcmmxvcakpgepj.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyeXFxZXdjbW14dmNha3BnZXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMjI4MjYsImV4cCI6MjEwMzY5ODgyNn0.OesqpXBiOR-Nx68mvIO5z7Cg9rTb1oSg4ByDrPS3qFY
```

## 7. Estructura de carpetas

```text
.
├── static/
│   └── logo.svg
├── src/
│   ├── app.css
│   ├── app.d.ts
│   ├── lib/
│   │   ├── Navbar.svelte
│   │   ├── Footer.svelte
│   │   ├── supabaseClient.ts
│   │   └── assets/
│   │       ├── logo-prueba-colores.png
│   │       ├── logo-prueba-emblema.png
│   │       └── qr.jpg
│   └── routes/
│       ├── +layout.server.ts
│       ├── +layout.svelte
│       ├── +page.svelte
│       ├── cerrar_sesion/
│       │   └── +page.server.ts
│       ├── comunidad/
│       │   └── +page.svelte
│       ├── iniciar_sesion/
│       │   └── +page.svelte
│       ├── por-hacer/
│       │   ├── +page.server.ts
│       │   └── +page.svelte
│       └── unete/
│           └── +page.svelte
├── .env
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 8. Historial de cambios: branch `rediseno-inicio`

Cambios de la branch respecto a `main`, del más antiguo al más reciente:

| Commit | Fecha | Autor | Cambio |
|--------|-------|-------|--------|
| `21a5002` | 13 oct 2026 | Juan Carlos | Rediseño del hero del inicio: nuevo layout con texto a la izquierda y bloques de imagen encimados, y franja de logos de prueba debajo. Agrega `logo-prueba-colores.png` y `logo-prueba-emblema.png`. |
| `b2c22b1` | 13 oct 2026 | ProAldanaxd | Actualiza el usuario de GitHub de Juan Carlos en la tabla de créditos del README. |
| `cdacf25` | 14 oct 2026 | Juan Carlos | Agrega la sección "¿Qué hacemos en DroneOps?" con un carrusel automático de fotos y franjas para navegar entre ellas. |
| `9aa2b32` | 14 oct 2026 | Juan Carlos | Merge de la branch remota `rediseno-inicio` en la copia local (sin cambios propios). |

Cambios pendientes de commit:

- **Inicio (`src/routes/+page.svelte`):** el badge del hero ahora dice "Grupo Estudiantil"; "Nuestro objetivo" pasa a ser un selector de competencias con fotos (se quitó la imagen fija `Drone.jpeg`), y se agrega la nueva sección de investigación debajo de "Competencias internacionales", descrita en "Página de inicio (rediseño)".
- **Comunidad (`src/routes/comunidad/+page.svelte`):** corrección de nombres: "Hernán Abaunza González" (sin guion) y "Victor".
- **README:** esta documentación.

## 9. Créditos

Este proyecto fue construido de forma colaborativa. Cada integrante cubrió una parte concreta del flujo funcional, lo que explica por qué el README y la estructura del código están divididos por dominios de negocio.

| Avatar | Nombre | Rol | Contribución | GitHub |
|--------|--------|-----|---------------|--------|
| <img src="https://github.com/Charlie1719.png" width="60"> | Carlos Eduardo Lopez Cuevas | Su rol fue ... | Implementó ... | [@Charlie1719](https://github.com/Charlie1719) |
| <img src="https://github.com/JuanCarlosCA-007.png" width="60"> | Juan Carlos | Desarrollar el diseño inicial de la parte de iniciar sesión, uno de los desarrolladores de la pagina de inicio inical, a su vez que actualizarla conforme surgian nuevos cambios, creador del diseño del apartado de inventario junto con Carlos Lopez, rediseño completo de la pagima de inicio. | [@ProAldanaxd](https://github.com/ProAldanaxd) |
| <img src="https://github.com/RodRM6.png" width="60"> | Rodolfo | Esto y esto | Desarrolló ... | [@RodRM6](https://github.com/RodRM6) |
