# FocusFlow

Una aplicación React moderna y accesible para gestionar tareas y sesiones de enfoque (focus).

## Características

- ✅ Gestión de tareas por categorías (Trabajo, Personal, Compras)
- ✅ Prioridades visuales con indicadores de color y texto
- ✅ Subtareas para desglosar tareas complejas
- ✅ Temporizador Pomodoro (25 minutos) para sesiones de enfoque
- ✅ Estadísticas de productividad
- ✅ Persistencia de datos en localStorage
- ✅ Diseño accesible y responsive

## Accesibilidad (A11y)

FocusFlow ha sido diseñado siguiendo las mejores prácticas de accesibilidad web:

### Navegación por Teclado

- **Tab**: Navega entre elementos interactivos en orden lógico
- **Shift + Tab**: Navega hacia atrás
- **Enter/Space**: Activa botones y enlaces
- **Escape**: Cierra modales y diálogos
- **Flechas**: Navega entre opciones de prioridad (usando aria-pressed)

### Indicadores Visuales

- Todos los elementos interactivos tienen un anillo de foco visible (`--focus-ring`) cuando se navega con teclado
- Los colores cumplen con el contraste AA (WCAG 2.1)
- La prioridad se indica tanto con color como con texto e iconos
- El estado de los controles se anuncia mediante aria-live

### Atributos ARIA

- **aria-label**: Todos los botones icon-only tienen etiquetas descriptivas
- **aria-live="polite"**: El temporizador anuncia cambios de minuto y transiciones de estado
- **role="timer"**: El temporizador usa el rol semántico correcto
- **aria-pressed**: Los botones de prioridad indican su estado seleccionado
- **aria-modal="true"**: Los modales están correctamente marcados
- **aria-invalid**: Los campos con errores están marcados
- **aria-describedby**: Los errores de validación están vinculados a sus campos

### Áreas de Toque

- Todos los elementos interactivos tienen un área mínima de 44x44 píxeles
- Los checkboxes y toggles son fácilmente accesibles en dispositivos táctiles

### Estructura Semántica

- Uso de elementos HTML semánticos: `<header>`, `<main>`, `<nav>`, `<section>`, `<footer>`
- Encabezados jerárquicos (h1, h2, h3)
- Landmarks ARIA implícitos mediante elementos semánticos

### Validación de Formularios

- Mensajes de error específicos y descriptivos
- Errores vinculados a campos mediante `aria-describedby`
- Validación en tiempo real con feedback visual

## Instalación y Uso

### Requisitos Previos

- Node.js 18+ y npm

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Construcción

```bash
npm run build
```

### Vista Previa de Producción

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Estructura del Proyecto

```
focusflow/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Toggle.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Fab.tsx
│   │   ├── PriorityPills.tsx
│   │   └── ProgressRing.tsx
│   ├── pages/            # Páginas de la aplicación
│   │   ├── Welcome.tsx
│   │   ├── Dashboard.tsx
│   │   ├── TaskDetail.tsx
│   │   ├── FocusSession.tsx
│   │   └── Profile.tsx
│   ├── styles/           # Estilos globales
│   │   └── tokens.css    # Design tokens
│   ├── utils/            # Utilidades
│   │   └── storage.ts    # Gestión de localStorage
│   ├── types.ts          # Tipos TypeScript
│   ├── App.tsx           # Componente principal y rutas
│   └── main.tsx          # Punto de entrada
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Rutas

- `/` - Página de bienvenida
- `/dashboard` - Panel principal con tareas por categoría
- `/task/:id` - Detalle de una tarea
- `/focus/:id` - Sesión de enfoque con temporizador
- `/profile` - Perfil de usuario y estadísticas

## Tecnologías

- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router** - Enrutamiento
- **CSS Modules** - Estilos modulares

## Design Tokens

Los tokens de diseño están definidos en `src/styles/tokens.css`:

- Colores: fondo, superficie, texto, primario, acento, prioridades
- Espaciado: --space-1 a --space-4
- Radio de borde: --radius
- Anillo de foco: --focus-ring

## Persistencia de Datos

Los datos se guardan en `localStorage`:

- `focusflow_tasks`: Lista de tareas
- `focusflow_stats`: Estadísticas (sesiones de focus, racha, etc.)

Al iniciar por primera vez, se crean 3 tareas de ejemplo (una por categoría).

## Temporizador

El temporizador de sesiones de enfoque:

- Duración: 25 minutos (configurable en código)
- Actualización: Cada 100ms para animación suave
- Anuncios: Cambios de minuto y estado se anuncian mediante `aria-live="polite"`
- Rol semántico: `role="timer"` para lectores de pantalla

## Mejoras Futuras

- Autenticación de usuarios
- Sincronización en la nube
- Notificaciones push
- Temas personalizables
- Exportación de datos
- Análisis de productividad avanzado

## Deployment en Vercel

FocusFlow está configurado para desplegarse fácilmente en Vercel:

### Configuración de Vercel

1. **Build Command**: `vite build`
2. **Output Directory**: `dist`
3. **SPA Rewrites**: Configurado automáticamente mediante `vercel.json`

El archivo `vercel.json` incluye rewrites para que todas las rutas del cliente sirvan `index.html`, evitando errores 404 al refrescar la página en rutas como `/dashboard` o `/profile`.

### Pasos para Desplegar

1. Conecta tu repositorio a Vercel
2. Vercel detectará automáticamente la configuración de Vite
3. El build se ejecutará con `vite build`
4. Los archivos se servirán desde el directorio `dist`

### Verificación Post-Deploy

Después del despliegue, verifica que las rutas funcionan correctamente:
- Abre directamente `/dashboard` o `/profile` en el navegador
- Refresca la página - no debería mostrar un 404
- Navega entre diferentes rutas usando los enlaces de la aplicación

### Nota sobre Node.js

El proyecto requiere Node.js >= 18 (especificado en `package.json` engines).

## Licencia

MIT

