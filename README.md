# Clock-In

Aplicación web de control horario y gestión de empleados desarrollada como Trabajo de Fin de Grado (TFG). Permite a los empleados fichar su entrada y salida, consultar sus fichajes, gestionar vacaciones y visualizar su planificación semanal y mensual. Los responsables disponen además de herramientas para gestionar horarios y turnos del equipo.

## Tecnologías

- **[Next.js 16](https://nextjs.org/)** — Framework React con App Router y API Routes
- **[React 19](https://react.dev/)** — Interfaz de usuario
- **[TypeScript](https://www.typescriptlang.org/)** — Tipado estático
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Estilos
- **[MySQL](https://www.mysql.com/) + [mysql2](https://github.com/sidorares/node-mysql2)** — Base de datos relacional (via XAMPP)
- **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)** — Hash de contraseñas
- **[jsPDF](https://github.com/parallax/jsPDF)** — Generación de PDFs

## Funcionalidades

| Módulo | Descripción |
|---|---|
| **Login** | Autenticación de empleados con contraseña hasheada |
| **Dashboard** | Resumen del día: horario semanal, compañeros de turno y estado de fichaje |
| **Fichajes** | Registro de entrada/salida y consulta del historial personal |
| **Vacaciones** | Solicitud y seguimiento de días de vacaciones |
| **Notificaciones** | Centro de notificaciones sin leer |
| **Planificación semanal** | Vista del horario de la semana actual |
| **Planificación mensual** | Vista del calendario mensual con turnos asignados |
| **Gestión de horarios** | *(Responsables)* Crear, editar y borrar turnos del equipo |
| **Mis datos** | Información del perfil del empleado |

## Requisitos previos

- [Node.js](https://nodejs.org/) v18+
- [XAMPP](https://www.apachefriends.org/) con MySQL activo

## Instalación y puesta en marcha

1. **Clonar el repositorio**

```bash
git clone <url-del-repositorio>
cd clock-in
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar la base de datos**

   - Inicia XAMPP y arranca el servicio MySQL.
   - Crea una base de datos llamada `clockin`.
   - Importa el esquema SQL correspondiente.
   - La conexión está configurada en `app/lib/db.ts` con los valores por defecto de XAMPP (`host: localhost`, `user: root`, sin contraseña). Modifícala si tu configuración es distinta.

4. **Hashear las contraseñas iniciales** *(si es necesario)*

```bash
node scripts/hashear-passwords.mjs
```

5. **Arrancar el servidor de desarrollo**

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador. Serás redirigido automáticamente a `/login`.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación para producción |
| `npm start` | Servidor de producción |
| `npm run lint` | Análisis estático con ESLint |

## Estructura del proyecto

```
app/
├── api/               # API Routes (Next.js Route Handlers)
├── dashboard/         # Páginas protegidas del panel principal
│   ├── fichajes/
│   ├── gestion-horarios/
│   ├── mis-datos/
│   ├── notificaciones/
│   ├── planificacion-mes/
│   ├── planificacion-semana/
│   └── vacaciones/
├── lib/               # Utilidades compartidas (db, fechas, permisos, hooks)
└── login/             # Página de inicio de sesión
scripts/               # Scripts de utilidad (hashear contraseñas)
```

## Permisos

Los puestos con ID `1` y `2` tienen acceso al módulo de gestión de horarios. El resto de empleados solo tienen acceso a las funcionalidades de consulta. La lógica de permisos se encuentra en `app/lib/permisos.ts`.
