# R3B0RN CyberGlitch Hub

## Descripción

R3B0RN CyberGlitch Hub es una plataforma social de audio inspirada en BeReal pero enfocada en música. La plataforma permite a los usuarios compartir lo que están escuchando en momentos aleatorios, interactuar con amigos, y descubrir nuevo contenido musical en un entorno social immersivo con estética cyberpunk.

## Características Principales

- **Compartición musical en tiempo real**: Comparte lo que estás escuchando con tus amigos.
- **Integración con servicios de música**: Conecta tus cuentas de Spotify, Apple Music y YouTube Music.
- **Visualizaciones de audio personalizadas**: Efectos visuales reactivos al audio.
- **Modo de escucha colaborativa**: Sesiones grupales para escuchar música juntos.
- **Animaciones y efectos reactivos**: Interfaz que responde a sensores del dispositivo y geolocalización.
- **Sistema de notificaciones en tiempo real**: Mantente al día con la actividad de tus amigos.

## Características Premium

- **Modo Fan**: Seguimiento avanzado de artistas con notificaciones especiales y prioridad de contenido.
- **Hub Social**: Integración con redes sociales externas y publicación en múltiples plataformas.
- **Gestión SEO y promoción**: Optimización de perfil y herramientas de promoción para músicos.
- **Panel Kanban para equipos**: Sistema de gestión de proyectos para colaboraciones musicales.
- **Visualizadores avanzados**: Personalización completa de la experiencia visual.

## Tecnologías Utilizadas

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, WebSockets
- **Base de datos**: PostgreSQL con Drizzle ORM
- **APIs externas**: Spotify, Apple Music, YouTube Music, OpenAI
- **Animaciones**: Framer Motion, canvas, Web Audio API

## Requisitos Técnicos

### Dependencias

```bash
# Instalación de dependencias
npm install
```

### Configuración

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
# Base de datos
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/r3b0rn

# JWT
JWT_SECRET=tu_secreto_jwt

# APIs de Música
SPOTIFY_CLIENT_ID=tu_client_id
SPOTIFY_CLIENT_SECRET=tu_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback

APPLE_MUSIC_TEAM_ID=tu_team_id
APPLE_MUSIC_KEY_ID=tu_key_id
APPLE_MUSIC_PRIVATE_KEY=tu_private_key

YOUTUBE_API_KEY=tu_api_key

# OpenAI (para recomendaciones y generación de contenido)
OPENAI_API_KEY=tu_api_key
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
```

### Producción

```bash
# Construcción para producción
npm run build

# Iniciar servidor de producción
npm start
```

## Estructura del Proyecto

```
├── client/                  # Frontend React 
│   ├── src/                 # Código fuente
│   │   ├── components/      # Componentes React
│   │   ├── hooks/           # Hooks personalizados
│   │   ├── lib/             # Utilidades y funciones
│   │   └── pages/           # Páginas principales
│   └── index.html           # HTML raíz
├── server/                  # Backend Node.js/Express
│   ├── controllers/         # Controladores de API
│   ├── services/            # Servicios externos
│   ├── db.ts                # Configuración de base de datos
│   ├── routes.ts            # Definición de rutas de API
│   ├── storage.ts           # Interfaz de almacenamiento
│   └── index.ts             # Punto de entrada
├── shared/                  # Código compartido
│   └── schema.ts            # Esquema de datos con tipos
└── docs/                    # Documentación
    └── API_REFERENCE.md     # Referencia de API
```

## Integración de Servicios de Música

### Spotify

1. Crea una aplicación en [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Configura la URI de redirección como `http://tu-dominio/api/spotify/callback`
3. Copia el Client ID y Client Secret a tu archivo `.env`

### Apple Music

1. Genera un MusicKit Key en tu [Apple Developer Account](https://developer.apple.com/)
2. Configura el Team ID, Key ID y Private Key en tu archivo `.env`

### YouTube Music

1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com/)
2. Habilita la API de YouTube
3. Genera una clave de API y configúrala en tu archivo `.env`

## Licencia

© 2024 R3B0RN CyberGlitch Hub. Todos los derechos reservados.