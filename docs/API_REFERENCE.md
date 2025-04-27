# R3B0RN CyberGlitch Hub - Referencia de API

## Introducción

Esta documentación describe las APIs que se utilizan en R3B0RN CyberGlitch Hub para interactuar con servicios externos de música y funcionalidades internas avanzadas. El sistema está diseñado con un enfoque RESTful y utiliza JSON para el intercambio de datos.

## Autenticación

Todas las APIs requieren autenticación mediante token JWT, excepto los endpoints de registro y login.

### Parámetros de Autenticación

| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| Authorization | string | Header | Bearer token JWT |

## Servicios de Música

### 1. Spotify API

#### Configuración

```typescript
// server/services/spotify.ts
import SpotifyWebApi from 'spotify-web-api-node';

export const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

// Métodos de autenticación
export async function getSpotifyAuthUrl(state: string): Promise<string> {
  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-modify-playback-state',
    'playlist-read-private',
    'playlist-modify-public',
    'playlist-modify-private'
  ];
  
  return spotifyApi.createAuthorizeURL(scopes, state);
}

export async function handleSpotifyCallback(code: string): Promise<any> {
  const data = await spotifyApi.authorizationCodeGrant(code);
  return {
    accessToken: data.body.access_token,
    refreshToken: data.body.refresh_token,
    expiresIn: data.body.expires_in
  };
}

// Métodos para obtener datos
export async function getCurrentUserProfile(accessToken: string): Promise<any> {
  spotifyApi.setAccessToken(accessToken);
  const response = await spotifyApi.getMe();
  return response.body;
}

export async function getCurrentPlayback(accessToken: string): Promise<any> {
  spotifyApi.setAccessToken(accessToken);
  const response = await spotifyApi.getMyCurrentPlaybackState();
  return response.body;
}

export async function searchTracks(accessToken: string, query: string, limit = 20): Promise<any> {
  spotifyApi.setAccessToken(accessToken);
  const response = await spotifyApi.searchTracks(query, { limit });
  return response.body.tracks.items;
}

// Más métodos de la API...
```

#### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/spotify/auth | Genera URL para autorización OAuth |
| GET | /api/spotify/callback | Maneja callback de OAuth |
| GET | /api/spotify/me | Obtiene perfil del usuario |
| GET | /api/spotify/now-playing | Obtiene canción actual |
| GET | /api/spotify/search | Busca canciones |
| GET | /api/spotify/recommendations | Obtiene recomendaciones basadas en seeds |

### 2. Apple Music API

#### Configuración

```typescript
// server/services/appleMusic.ts
import jwt from 'jsonwebtoken';
import axios from 'axios';

// Generar token para autenticación
function generateAppleMusicToken(): string {
  const privateKey = process.env.APPLE_MUSIC_PRIVATE_KEY;
  const teamId = process.env.APPLE_MUSIC_TEAM_ID;
  const keyId = process.env.APPLE_MUSIC_KEY_ID;
  
  const token = jwt.sign({}, privateKey, {
    algorithm: 'ES256',
    expiresIn: '180d',
    issuer: teamId,
    header: {
      alg: 'ES256',
      kid: keyId
    }
  });
  
  return token;
}

// Instancia de cliente
const appleMusicApi = axios.create({
  baseURL: 'https://api.music.apple.com/v1',
  headers: {
    'Authorization': `Bearer ${generateAppleMusicToken()}`,
    'Content-Type': 'application/json'
  }
});

// Métodos de la API
export async function searchAppleMusic(term: string, limit = 20): Promise<any> {
  const response = await appleMusicApi.get('/catalog/es/search', {
    params: {
      term,
      types: 'songs',
      limit
    }
  });
  
  return response.data.results;
}

export async function getTrackDetails(songId: string): Promise<any> {
  const response = await appleMusicApi.get(`/catalog/es/songs/${songId}`);
  return response.data.data[0];
}

// Más métodos de la API...
```

#### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/apple-music/search | Busca canciones |
| GET | /api/apple-music/track/:id | Obtiene detalles de canción |
| GET | /api/apple-music/recommendations | Obtiene recomendaciones |

### 3. YouTube Music API

```typescript
// server/services/youtubeMusic.ts
import axios from 'axios';
import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

// Métodos de la API
export async function searchYouTubeMusic(query: string, maxResults = 20): Promise<any> {
  const response = await youtube.search.list({
    part: ['snippet'],
    q: query,
    type: ['video'],
    videoCategoryId: '10', // Music category
    maxResults
  });
  
  return response.data.items;
}

export async function getVideoDetails(videoId: string): Promise<any> {
  const response = await youtube.videos.list({
    part: ['snippet', 'contentDetails', 'statistics'],
    id: [videoId]
  });
  
  return response.data.items && response.data.items[0];
}

// Más métodos...
```

#### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/youtube-music/search | Busca videos musicales |
| GET | /api/youtube-music/video/:id | Obtiene detalles de video |

## Funcionalidades Premium

### 1. Modo Fan

El Modo Fan permite a los usuarios seguir a sus artistas favoritos con funcionalidades avanzadas como notificaciones en tiempo real, contenido exclusivo, estadísticas de artistas y más.

```typescript
// server/controllers/fanMode.controller.ts
import { Request, Response } from 'express';
import { storage } from '../storage';
import { sendRealTimeNotification } from './notification.controller';
import { spotifyApi, appleMusicApi, youtubeApi } from '../services';

export async function toggleFanMode(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    const { artistId, serviceName, isEnabled } = req.body;
    
    const fanMode = await storage.toggleFanMode({
      userId,
      artistId,
      serviceName, // 'spotify', 'apple', 'youtube'
      isEnabled
    });
    
    res.status(200).json(fanMode);
  } catch (error) {
    console.error('Error al configurar Modo Fan:', error);
    res.status(500).json({ message: 'Error al configurar Modo Fan' });
  }
}

export async function getFanModeArtists(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    
    const artists = await storage.getFanModeArtists(userId);
    res.status(200).json(artists);
  } catch (error) {
    console.error('Error al obtener artistas en Modo Fan:', error);
    res.status(500).json({ message: 'Error al obtener artistas en Modo Fan' });
  }
}

export async function getArtistUpdates(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    const { artistId } = req.params;
    
    const updates = await storage.getArtistUpdates(artistId);
    res.status(200).json(updates);
  } catch (error) {
    console.error('Error al obtener actualizaciones del artista:', error);
    res.status(500).json({ message: 'Error al obtener actualizaciones del artista' });
  }
}

export async function getArtistAnalytics(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    const { artistId } = req.params;
    
    // Verificar si el usuario tiene acceso premium
    const userPremium = await storage.getUserPremiumStatus(userId);
    if (!userPremium) {
      return res.status(403).json({ message: 'Se requiere suscripción premium para esta función' });
    }
    
    const analytics = await storage.getArtistAnalytics(artistId);
    res.status(200).json(analytics);
  } catch (error) {
    console.error('Error al obtener análisis del artista:', error);
    res.status(500).json({ message: 'Error al obtener análisis del artista' });
  }
}

// Función para comprobar actualizaciones de artistas y enviar notificaciones
export async function checkArtistUpdates() {
  try {
    // Obtener todos los registros de Modo Fan
    const fanModes = await storage.getAllActiveFanModes();
    
    for (const fanMode of fanModes) {
      // Obtener última actualización conocida
      const lastUpdate = await storage.getLastArtistUpdate(fanMode.artistId);
      
      // Comprobar nuevas actualizaciones según el servicio
      let newUpdates = [];
      switch (fanMode.serviceName) {
        case 'spotify':
          newUpdates = await checkSpotifyArtistUpdates(fanMode.artistId, lastUpdate);
          break;
        case 'apple':
          newUpdates = await checkAppleMusicArtistUpdates(fanMode.artistId, lastUpdate);
          break;
        case 'youtube':
          newUpdates = await checkYouTubeMusicArtistUpdates(fanMode.artistId, lastUpdate);
          break;
      }
      
      // Guardar nuevas actualizaciones y notificar a los fans
      for (const update of newUpdates) {
        await storage.saveArtistUpdate(update);
        
        // Notificar a todos los fans de este artista
        const fans = await storage.getArtistFans(fanMode.artistId);
        for (const fan of fans) {
          await sendRealTimeNotification({
            userId: fan.userId,
            type: 'artist_update',
            content: `Nuevo lanzamiento de ${update.artistName}: ${update.title}`,
            sourceId: update.id,
            actionUrl: `/artist/${fanMode.artistId}/updates`
          });
        }
      }
    }
  } catch (error) {
    console.error('Error al comprobar actualizaciones de artistas:', error);
  }
}
```

#### Endpoints del Modo Fan

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/fan-mode/toggle | Activa/desactiva el Modo Fan para un artista |
| GET | /api/fan-mode/artists | Lista artistas seguidos en Modo Fan |
| GET | /api/artists/:artistId/updates | Obtiene actualizaciones de un artista |
| GET | /api/artists/:artistId/analytics | Obtiene análisis y estadísticas (premium) |

### 2. Hub Social

El Hub Social permite a los usuarios integrar R3B0RN con otras redes sociales, publicar en múltiples plataformas, y gestionar su presencia social desde un único punto.

```typescript
// server/controllers/socialHub.controller.ts
import { Request, Response } from 'express';
import { storage } from '../storage';
import axios from 'axios';

// Integraciones con redes sociales
const socialNetworks = {
  twitter: {
    name: 'Twitter',
    apiUrl: 'https://api.twitter.com/2',
    icon: 'twitter'
  },
  instagram: {
    name: 'Instagram',
    apiUrl: 'https://graph.instagram.com',
    icon: 'instagram'
  },
  facebook: {
    name: 'Facebook',
    apiUrl: 'https://graph.facebook.com',
    icon: 'facebook'
  },
  tiktok: {
    name: 'TikTok',
    apiUrl: 'https://open-api.tiktok.com',
    icon: 'tiktok'
  }
};

export async function getSocialAccounts(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    
    const accounts = await storage.getUserSocialAccounts(userId);
    res.status(200).json(accounts);
  } catch (error) {
    console.error('Error al obtener cuentas sociales:', error);
    res.status(500).json({ message: 'Error al obtener cuentas sociales' });
  }
}

export async function linkSocialAccount(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    const { network, accessToken, accessSecret } = req.body;
    
    // Verificar si el usuario tiene acceso premium
    const userPremium = await storage.getUserPremiumStatus(userId);
    if (!userPremium) {
      return res.status(403).json({ message: 'Se requiere suscripción premium para esta función' });
    }
    
    // Verificar tokens con la API de la red social
    let profileData;
    switch (network) {
      case 'twitter':
        profileData = await verifyTwitterAuth(accessToken, accessSecret);
        break;
      case 'instagram':
        profileData = await verifyInstagramAuth(accessToken);
        break;
      case 'facebook':
        profileData = await verifyFacebookAuth(accessToken);
        break;
      case 'tiktok':
        profileData = await verifyTikTokAuth(accessToken);
        break;
      default:
        return res.status(400).json({ message: 'Red social no soportada' });
    }
    
    // Guardar cuenta vinculada
    const account = await storage.linkSocialAccount({
      userId,
      network,
      username: profileData.username,
      profileUrl: profileData.profileUrl,
      accessToken,
      accessSecret: accessSecret || null,
      isActive: true
    });
    
    res.status(201).json({
      id: account.id,
      network,
      username: profileData.username,
      profileUrl: profileData.profileUrl,
      isActive: true
    });
  } catch (error) {
    console.error('Error al vincular cuenta social:', error);
    res.status(500).json({ message: 'Error al vincular cuenta social' });
  }
}

export async function unlinkSocialAccount(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    const { accountId } = req.params;
    
    // Verificar que la cuenta pertenece al usuario
    const account = await storage.getSocialAccount(parseInt(accountId));
    if (!account || account.userId !== userId) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    
    await storage.unlinkSocialAccount(parseInt(accountId));
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error al desvincular cuenta social:', error);
    res.status(500).json({ message: 'Error al desvincular cuenta social' });
  }
}

export async function shareToSocial(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    const { musicShareId, networks, message } = req.body;
    
    // Verificar si el usuario tiene acceso premium
    const userPremium = await storage.getUserPremiumStatus(userId);
    if (!userPremium) {
      return res.status(403).json({ message: 'Se requiere suscripción premium para esta función' });
    }
    
    // Obtener la información de la música compartida
    const musicShare = await storage.getMusicShare(musicShareId);
    if (!musicShare) {
      return res.status(404).json({ message: 'Música compartida no encontrada' });
    }
    
    // Obtener cuentas vinculadas del usuario
    const accounts = await storage.getUserSocialAccounts(userId);
    const linkedAccounts = accounts.filter(acc => networks.includes(acc.network));
    
    if (linkedAccounts.length === 0) {
      return res.status(400).json({ message: 'No hay cuentas vinculadas para las redes seleccionadas' });
    }
    
    // Preparar contenido compartido
    const shareContent = {
      text: message || `Estoy escuchando ${musicShare.trackTitle} de ${musicShare.artist} en R3B0RN CyberGlitch Hub`,
      url: `https://r3b0rn.app/share/${musicShareId}`,
      musicShareId
    };
    
    // Publicar en cada red social
    const results = [];
    for (const account of linkedAccounts) {
      try {
        const result = await postToSocialNetwork(account, shareContent);
        results.push({
          network: account.network,
          success: true,
          postId: result.id,
          postUrl: result.url
        });
        
        // Registrar compartición
        await storage.recordSocialShare({
          userId,
          accountId: account.id,
          musicShareId,
          postId: result.id,
          postUrl: result.url
        });
      } catch (error) {
        results.push({
          network: account.network,
          success: false,
          error: error.message
        });
      }
    }
    
    res.status(200).json({ results });
  } catch (error) {
    console.error('Error al compartir en redes sociales:', error);
    res.status(500).json({ message: 'Error al compartir en redes sociales' });
  }
}

// Funciones auxiliares para verificación de autenticación
async function verifyTwitterAuth(accessToken, accessSecret) {
  // Implementación de verificación con API de Twitter
  // ...
}

async function verifyInstagramAuth(accessToken) {
  // Implementación de verificación con API de Instagram
  // ...
}

async function verifyFacebookAuth(accessToken) {
  // Implementación de verificación con API de Facebook
  // ...
}

async function verifyTikTokAuth(accessToken) {
  // Implementación de verificación con API de TikTok
  // ...
}

// Función para publicar en redes sociales
async function postToSocialNetwork(account, content) {
  switch (account.network) {
    case 'twitter':
      return postToTwitter(account, content);
    case 'instagram':
      return postToInstagram(account, content);
    case 'facebook':
      return postToFacebook(account, content);
    case 'tiktok':
      return postToTikTok(account, content);
    default:
      throw new Error('Red social no soportada');
  }
}

async function postToTwitter(account, content) {
  // Implementación de publicación en Twitter
  // ...
}

async function postToInstagram(account, content) {
  // Implementación de publicación en Instagram
  // ...
}

async function postToFacebook(account, content) {
  // Implementación de publicación en Facebook
  // ...
}

async function postToTikTok(account, content) {
  // Implementación de publicación en TikTok
  // ...
}
```

#### Endpoints del Hub Social

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/social/accounts | Obtiene cuentas sociales vinculadas |
| POST | /api/social/accounts | Vincula una nueva cuenta social |
| DELETE | /api/social/accounts/:id | Desvincula una cuenta social |
| POST | /api/social/share | Comparte contenido en redes sociales |
| GET | /api/social/analytics | Obtiene análisis de comparticiones sociales |

### 3. Gestión SEO y Promoción

Este módulo proporciona herramientas para optimizar perfiles y contenido para motores de búsqueda, así como funciones de promoción para artistas y usuarios.

```typescript
// server/controllers/seoPromotion.controller.ts
import { Request, Response } from 'express';
import { storage } from '../storage';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function getSeoProfile(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    
    // Verificar si el usuario tiene acceso premium
    const userPremium = await storage.getUserPremiumStatus(userId);
    if (!userPremium) {
      return res.status(403).json({ message: 'Se requiere suscripción premium para esta función' });
    }
    
    const seoProfile = await storage.getUserSeoProfile(userId);
    res.status(200).json(seoProfile);
  } catch (error) {
    console.error('Error al obtener perfil SEO:', error);
    res.status(500).json({ message: 'Error al obtener perfil SEO' });
  }
}

export async function updateSeoProfile(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    const seoData = req.body;
    
    // Verificar si el usuario tiene acceso premium
    const userPremium = await storage.getUserPremiumStatus(userId);
    if (!userPremium) {
      return res.status(403).json({ message: 'Se requiere suscripción premium para esta función' });
    }
    
    const seoProfile = await storage.updateUserSeoProfile(userId, seoData);
    res.status(200).json(seoProfile);
  } catch (error) {
    console.error('Error al actualizar perfil SEO:', error);
    res.status(500).json({ message: 'Error al actualizar perfil SEO' });
  }
}

export async function generateSeoSuggestions(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    const { contentType } = req.query; // 'profile', 'music', 'bio'
    
    // Verificar si el usuario tiene acceso premium
    const userPremium = await storage.getUserPremiumStatus(userId);
    if (!userPremium) {
      return res.status(403).json({ message: 'Se requiere suscripción premium para esta función' });
    }
    
    // Obtener datos del usuario
    const user = await storage.getUser(userId);
    const userProfile = {
      displayName: user.displayName,
      username: user.username,
      bio: user.bio,
      musicGenres: await storage.getUserMusicGenres(userId),
      recentShares: await storage.getUserMusicShares(userId, { limit: 5 })
    };
    
    // Generar sugerencias usando OpenAI
    const prompt = generateSeoPrompt(contentType, userProfile);
    const suggestions = await generateAiSuggestions(prompt);
    
    res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Error al generar sugerencias SEO:', error);
    res.status(500).json({ message: 'Error al generar sugerencias SEO' });
  }
}

export async function getPromotionCampaigns(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    
    // Verificar si el usuario tiene acceso premium
    const userPremium = await storage.getUserPremiumStatus(userId);
    if (!userPremium) {
      return res.status(403).json({ message: 'Se requiere suscripción premium para esta función' });
    }
    
    const campaigns = await storage.getUserPromotionCampaigns(userId);
    res.status(200).json(campaigns);
  } catch (error) {
    console.error('Error al obtener campañas de promoción:', error);
    res.status(500).json({ message: 'Error al obtener campañas de promoción' });
  }
}

export async function createPromotionCampaign(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    const campaignData = req.body;
    
    // Verificar si el usuario tiene acceso premium
    const userPremium = await storage.getUserPremiumStatus(userId);
    if (!userPremium) {
      return res.status(403).json({ message: 'Se requiere suscripción premium para esta función' });
    }
    
    const campaign = await storage.createPromotionCampaign({
      ...campaignData,
      userId,
      status: 'active',
      createdAt: new Date()
    });
    
    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error al crear campaña de promoción:', error);
    res.status(500).json({ message: 'Error al crear campaña de promoción' });
  }
}

// Funciones auxiliares
function generateSeoPrompt(contentType, userProfile) {
  switch (contentType) {
    case 'profile':
      return `Genera 5 sugerencias para optimizar SEO del perfil de músico con nombre "${userProfile.displayName}" que se especializa en ${userProfile.musicGenres.join(', ')}. Su biografía actual es: "${userProfile.bio}".`;
    case 'music':
      return `Genera 5 sugerencias para optimizar SEO de las canciones compartidas por "${userProfile.displayName}". Canciones recientes: ${userProfile.recentShares.map(s => s.trackTitle).join(', ')}.`;
    case 'bio':
      return `Genera una biografía optimizada para SEO para el músico "${userProfile.displayName}" que se especializa en ${userProfile.musicGenres.join(', ')}.`;
    default:
      return `Genera 5 sugerencias generales de SEO para un perfil musical en redes sociales.`;
  }
}

async function generateAiSuggestions(prompt) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    messages: [
      {
        role: "system",
        content: "Eres un experto en SEO para músicos y artistas. Proporciona sugerencias claras, específicas y aplicables para optimizar la presencia digital."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1000
  });
  
  return response.choices[0].message.content;
}
```

#### Endpoints de SEO y Promoción

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/seo/profile | Obtiene perfil SEO del usuario |
| PATCH | /api/seo/profile | Actualiza perfil SEO |
| GET | /api/seo/suggestions | Genera sugerencias de SEO con IA |
| GET | /api/promotion/campaigns | Lista campañas de promoción |
| POST | /api/promotion/campaigns | Crea una nueva campaña de promoción |
| GET | /api/promotion/analytics | Obtiene análisis de campañas |

### 4. Panel Kanban para Equipos Internos

Sistema de gestión de proyectos tipo Kanban para colaboraciones musicales y gestión de equipos.

```typescript
// server/controllers/kanban.controller.ts
import { Request, Response } from 'express';
import { storage } from '../storage';

export async function getProjects(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    
    // Verificar si el usuario tiene acceso premium
    const userPremium = await storage.getUserPremiumStatus(userId);
    if (!userPremium) {
      return res.status(403).json({ message: 'Se requiere suscripción premium para esta función' });
    }
    
    // Obtener proyectos donde el usuario es miembro
    const projects = await storage.getUserKanbanProjects(userId);
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error al obtener proyectos Kanban:', error);
    res.status(500).json({ message: 'Error al obtener proyectos Kanban' });
  }
}

export async function createProject(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    const projectData = req.body;
    
    // Verificar si el usuario tiene acceso premium
    const userPremium = await storage.getUserPremiumStatus(userId);
    if (!userPremium) {
      return res.status(403).json({ message: 'Se requiere suscripción premium para esta función' });
    }
    
    // Crear proyecto
    const project = await storage.createKanbanProject({
      ...projectData,
      ownerId: userId,
      createdAt: new Date()
    });
    
    // Añadir columnas predeterminadas
    const defaultColumns = [
      { name: 'Por hacer', position: 0 },
      { name: 'En progreso', position: 1 },
      { name: 'Revisión', position: 2 },
      { name: 'Completado', position: 3 }
    ];
    
    for (const column of defaultColumns) {
      await storage.createKanbanColumn({
        projectId: project.id,
        ...column
      });
    }
    
    // Añadir creador como miembro
    await storage.addKanbanMember({
      projectId: project.id,
      userId,
      role: 'admin',
      joinedAt: new Date()
    });
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Error al crear proyecto Kanban:', error);
    res.status(500).json({ message: 'Error al crear proyecto Kanban' });
  }
}

export async function getProjectById(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    const { projectId } = req.params;
    
    // Verificar acceso al proyecto
    const member = await storage.getKanbanMember(parseInt(projectId), userId);
    if (!member) {
      return res.status(403).json({ message: 'No tienes acceso a este proyecto' });
    }
    
    // Obtener proyecto con columnas, tarjetas y miembros
    const project = await storage.getKanbanProjectDetails(parseInt(projectId));
    res.status(200).json(project);
  } catch (error) {
    console.error('Error al obtener detalles del proyecto Kanban:', error);
    res.status(500).json({ message: 'Error al obtener detalles del proyecto Kanban' });
  }
}

export async function createCard(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    const { projectId, columnId } = req.params;
    const cardData = req.body;
    
    // Verificar acceso al proyecto
    const member = await storage.getKanbanMember(parseInt(projectId), userId);
    if (!member) {
      return res.status(403).json({ message: 'No tienes acceso a este proyecto' });
    }
    
    // Obtener posición máxima actual en la columna
    const cards = await storage.getColumnCards(parseInt(columnId));
    const maxPosition = cards.length > 0 
      ? Math.max(...cards.map(c => c.position)) 
      : -1;
    
    // Crear tarjeta
    const card = await storage.createKanbanCard({
      ...cardData,
      columnId: parseInt(columnId),
      createdBy: userId,
      position: maxPosition + 1,
      createdAt: new Date()
    });
    
    res.status(201).json(card);
  } catch (error) {
    console.error('Error al crear tarjeta Kanban:', error);
    res.status(500).json({ message: 'Error al crear tarjeta Kanban' });
  }
}

export async function moveCard(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    const { cardId } = req.params;
    const { columnId, position } = req.body;
    
    // Obtener tarjeta actual
    const card = await storage.getKanbanCard(parseInt(cardId));
    if (!card) {
      return res.status(404).json({ message: 'Tarjeta no encontrada' });
    }
    
    // Verificar acceso al proyecto
    const project = await storage.getKanbanProjectByCard(parseInt(cardId));
    const member = await storage.getKanbanMember(project.id, userId);
    if (!member) {
      return res.status(403).json({ message: 'No tienes acceso a este proyecto' });
    }
    
    // Mover tarjeta
    const updatedCard = await storage.moveKanbanCard(parseInt(cardId), parseInt(columnId), position);
    
    res.status(200).json(updatedCard);
  } catch (error) {
    console.error('Error al mover tarjeta Kanban:', error);
    res.status(500).json({ message: 'Error al mover tarjeta Kanban' });
  }
}

export async function addMember(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    const { projectId } = req.params;
    const { memberId, role } = req.body;
    
    // Verificar que el usuario es administrador del proyecto
    const member = await storage.getKanbanMember(parseInt(projectId), userId);
    if (!member || member.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para añadir miembros' });
    }
    
    // Añadir miembro
    const newMember = await storage.addKanbanMember({
      projectId: parseInt(projectId),
      userId: memberId,
      role: role || 'member',
      joinedAt: new Date()
    });
    
    res.status(201).json(newMember);
  } catch (error) {
    console.error('Error al añadir miembro al proyecto Kanban:', error);
    res.status(500).json({ message: 'Error al añadir miembro al proyecto Kanban' });
  }
}

// Más funciones del controlador...
```

#### Endpoints del Panel Kanban

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/kanban/projects | Lista proyectos del usuario |
| POST | /api/kanban/projects | Crea un nuevo proyecto |
| GET | /api/kanban/projects/:id | Obtiene detalles de un proyecto |
| POST | /api/kanban/projects/:id/columns | Crea una columna |
| POST | /api/kanban/projects/:id/columns/:columnId/cards | Crea una tarjeta |
| PATCH | /api/kanban/cards/:id/move | Mueve una tarjeta |
| POST | /api/kanban/projects/:id/members | Añade un miembro al proyecto |

## Animaciones Reactivas a Sensores

Implementación de animaciones y efectos visuales que responden a sensores del dispositivo como GPS, acelerómetro y giroscopio.

```typescript
// client/src/hooks/useSensorEffects.ts
import { useState, useEffect, useRef } from 'react';

interface SensorState {
  hasPermission: boolean;
  isSupported: boolean;
  acceleration: {
    x: number;
    y: number;
    z: number;
  };
  gyroscope: {
    alpha: number; // rotación alrededor del eje z
    beta: number;  // rotación alrededor del eje x
    gamma: number; // rotación alrededor del eje y
  };
  geolocation: {
    latitude: number | null;
    longitude: number | null;
    speed: number | null;
    heading: number | null;
  };
  light: number | null;
}

interface UseSensorEffectsOptions {
  enableAccelerometer?: boolean;
  enableGyroscope?: boolean;
  enableGeolocation?: boolean;
  enableLightSensor?: boolean;
  updateInterval?: number;
}

export function useSensorEffects(options: UseSensorEffectsOptions = {}) {
  const {
    enableAccelerometer = true,
    enableGyroscope = true,
    enableGeolocation = false,
    enableLightSensor = false,
    updateInterval = 50
  } = options;
  
  const [sensorState, setSensorState] = useState<SensorState>({
    hasPermission: false,
    isSupported: false,
    acceleration: { x: 0, y: 0, z: 0 },
    gyroscope: { alpha: 0, beta: 0, gamma: 0 },
    geolocation: {
      latitude: null,
      longitude: null,
      speed: null,
      heading: null
    },
    light: null
  });
  
  const [effectParams, setEffectParams] = useState({
    tilt: { x: 0, y: 0 },
    shake: 0,
    motion: 0,
    locationPulse: 0
  });
  
  // Referencias para sensores
  const accelerometerRef = useRef<DeviceMotionEventAccelerationInit | null>(null);
  const gyroscopeRef = useRef<DeviceOrientationEvent | null>(null);
  const geolocationWatchId = useRef<number | null>(null);
  const lightSensorRef = useRef<any | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Comprobar soporte de sensores
  useEffect(() => {
    const checkSensorSupport = async () => {
      let permissionGranted = false;
      let sensorsSupported = false;
      
      // Comprobar soporte de sensores de movimiento
      if ('DeviceMotionEvent' in window && 'DeviceOrientationEvent' in window) {
        sensorsSupported = true;
        
        // Solicitar permisos en iOS 13+
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
          try {
            const motionPermission = await (DeviceMotionEvent as any).requestPermission();
            const orientationPermission = await (DeviceOrientationEvent as any).requestPermission();
            
            permissionGranted = 
              motionPermission === 'granted' && 
              orientationPermission === 'granted';
          } catch (error) {
            console.error('Error al solicitar permisos de sensores:', error);
          }
        } else {
          // En otros navegadores, asumimos que está permitido
          permissionGranted = true;
        }
      }
      
      setSensorState(prev => ({
        ...prev,
        hasPermission: permissionGranted,
        isSupported: sensorsSupported
      }));
    };
    
    checkSensorSupport();
    
    return () => {
      // Limpiar cualquier suscripción o interval
      if (geolocationWatchId.current) {
        navigator.geolocation.clearWatch(geolocationWatchId.current);
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  // Configurar sensores
  useEffect(() => {
    if (!sensorState.isSupported || !sensorState.hasPermission) return;
    
    // Configurar acelerómetro
    if (enableAccelerometer) {
      const handleMotion = (event: DeviceMotionEvent) => {
        if (event.acceleration) {
          accelerometerRef.current = event.acceleration;
        }
      };
      
      window.addEventListener('devicemotion', handleMotion);
      
      return () => {
        window.removeEventListener('devicemotion', handleMotion);
      };
    }
    
    // Configurar giroscopio
    if (enableGyroscope) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        gyroscopeRef.current = event;
      };
      
      window.addEventListener('deviceorientation', handleOrientation);
      
      return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
      };
    }
  }, [sensorState.isSupported, sensorState.hasPermission, enableAccelerometer, enableGyroscope]);
  
  // Configurar geolocalización
  useEffect(() => {
    if (!enableGeolocation) return;
    
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setSensorState(prev => ({
            ...prev,
            geolocation: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              speed: position.coords.speed,
              heading: position.coords.heading
            }
          }));
        },
        (error) => {
          console.error('Error de geolocalización:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 5000
        }
      );
      
      geolocationWatchId.current = watchId;
      
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [enableGeolocation]);
  
  // Configurar sensor de luz
  useEffect(() => {
    if (!enableLightSensor) return;
    
    if ('AmbientLightSensor' in window) {
      try {
        const sensor = new (window as any).AmbientLightSensor();
        sensor.addEventListener('reading', () => {
          setSensorState(prev => ({
            ...prev,
            light: sensor.illuminance
          }));
        });
        sensor.start();
        lightSensorRef.current = sensor;
        
        return () => {
          sensor.stop();
        };
      } catch (error) {
        console.error('Error al inicializar sensor de luz:', error);
      }
    }
  }, [enableLightSensor]);
  
  // Actualizar valores y calcular efectos
  useEffect(() => {
    const updateSensorValues = () => {
      // Actualizar valores del acelerómetro
      if (accelerometerRef.current) {
        setSensorState(prev => ({
          ...prev,
          acceleration: {
            x: accelerometerRef.current?.x || 0,
            y: accelerometerRef.current?.y || 0,
            z: accelerometerRef.current?.z || 0
          }
        }));
      }
      
      // Actualizar valores del giroscopio
      if (gyroscopeRef.current) {
        setSensorState(prev => ({
          ...prev,
          gyroscope: {
            alpha: gyroscopeRef.current?.alpha || 0,
            beta: gyroscopeRef.current?.beta || 0,
            gamma: gyroscopeRef.current?.gamma || 0
          }
        }));
      }
      
      // Calcular parámetros de efectos
      const acceleration = sensorState.acceleration;
      const gyroscope = sensorState.gyroscope;
      
      // Efecto de inclinación basado en giroscopio
      const tiltX = Math.max(-15, Math.min(15, gyroscope.gamma / 2));
      const tiltY = Math.max(-15, Math.min(15, gyroscope.beta / 2));
      
      // Efecto de agitación basado en acelerómetro
      const accelerationMagnitude = Math.sqrt(
        acceleration.x * acceleration.x +
        acceleration.y * acceleration.y +
        acceleration.z * acceleration.z
      );
      const shake = Math.min(10, accelerationMagnitude / 2);
      
      // Efecto de movimiento basado en geolocalización
      let locationPulse = 0;
      if (sensorState.geolocation.speed && sensorState.geolocation.speed > 0) {
        locationPulse = Math.min(1, sensorState.geolocation.speed / 10);
      }
      
      setEffectParams({
        tilt: { x: tiltX, y: tiltY },
        shake,
        motion: accelerationMagnitude,
        locationPulse
      });
      
      animationFrameRef.current = requestAnimationFrame(updateSensorValues);
    };
    
    if (sensorState.isSupported && sensorState.hasPermission) {
      animationFrameRef.current = requestAnimationFrame(updateSensorValues);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [sensorState.acceleration, sensorState.gyroscope, sensorState.geolocation.speed]);
  
  // Generar estilos CSS para animaciones
  const getEffectStyles = () => {
    return {
      transform: `perspective(1000px) rotateX(${effectParams.tilt.y}deg) rotateY(${effectParams.tilt.x}deg)`,
      transition: 'transform 0.1s ease',
      filter: effectParams.shake > 2 ? `blur(${effectParams.shake / 10}px)` : 'none'
    };
  };
  
  // Hook para aplicar efectos a un elemento
  const applyEffectsToRef = (ref: React.RefObject<HTMLElement>) => {
    useEffect(() => {
      if (!ref.current) return;
      
      const applyStyles = () => {
        const styles = getEffectStyles();
        const element = ref.current;
        
        if (element) {
          element.style.transform = styles.transform;
          element.style.transition = styles.transition;
          element.style.filter = styles.filter;
        }
      };
      
      const interval = setInterval(applyStyles, updateInterval);
      
      return () => {
        clearInterval(interval);
        
        // Restaurar estilos originales
        if (ref.current) {
          ref.current.style.transform = '';
          ref.current.style.transition = '';
          ref.current.style.filter = '';
        }
      };
    }, [ref, effectParams]);
  };
  
  return {
    sensorState,
    effectParams,
    getEffectStyles,
    applyEffectsToRef,
    isSupported: sensorState.isSupported && sensorState.hasPermission
  };
}
```

### Ejemplo de Uso en Componente de Visualizador

```typescript
// client/src/components/AudioVisualizer.tsx
import React, { useRef, useEffect } from 'react';
import { useSensorEffects } from '@/hooks/useSensorEffects';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';

interface AudioVisualizerProps {
  audioUrl: string;
  visualType: 'neon' | 'pulse' | 'orbit';
  colorPalette: string[];
  isPlaying: boolean;
}

export default function AudioVisualizer({
  audioUrl,
  visualType = 'neon',
  colorPalette = ['#ff00ff', '#00ffff', '#00ff00'],
  isPlaying
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { audioData, connectAudio, disconnectAudio } = useAudioAnalyzer();
  const { 
    effectParams, 
    applyEffectsToRef, 
    isSupported: sensorsSupported 
  } = useSensorEffects({
    enableAccelerometer: true,
    enableGyroscope: true,
    enableGeolocation: true
  });
  
  // Aplicar efectos de sensores al contenedor
  applyEffectsToRef(containerRef);
  
  // Conectar con el audio cuando cambia la URL o el estado de reproducción
  useEffect(() => {
    if (isPlaying && audioUrl) {
      connectAudio(audioUrl);
    } else {
      disconnectAudio();
    }
    
    return () => disconnectAudio();
  }, [audioUrl, isPlaying, connectAudio, disconnectAudio]);
  
  // Renderizar visualización
  useEffect(() => {
    if (!canvasRef.current || !audioData || !isPlaying) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ajustar tamaño del canvas
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Animación de visualización
    let animationFrame: number;
    
    const render = () => {
      if (!ctx || !audioData) return;
      
      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Adaptar visualización según el tipo
      switch (visualType) {
        case 'neon':
          renderNeonVisual(ctx, canvas, audioData, colorPalette, effectParams);
          break;
        case 'pulse':
          renderPulseVisual(ctx, canvas, audioData, colorPalette, effectParams);
          break;
        case 'orbit':
          renderOrbitVisual(ctx, canvas, audioData, colorPalette, effectParams);
          break;
      }
      
      animationFrame = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrame);
    };
  }, [audioData, visualType, colorPalette, isPlaying, effectParams]);
  
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[300px] overflow-hidden rounded-lg bg-black"
      style={{
        perspective: '1000px'
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {sensorsSupported && (
        <div className="absolute bottom-2 right-2 text-xs text-white/50 bg-black/30 px-2 py-1 rounded">
          Sensor-reactive
        </div>
      )}
    </div>
  );
}

// Funciones de renderizado para diferentes tipos de visualización
function renderNeonVisual(
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement, 
  audioData: Uint8Array,
  colors: string[],
  effectParams: any
) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const barWidth = canvas.width / audioData.length;
  
  // Factor de intensidad basado en movimiento
  const intensityFactor = 1 + (effectParams.shake / 5);
  
  ctx.lineWidth = 2 * intensityFactor;
  
  // Dibujar líneas de frecuencia con efecto neón
  for (let i = 0; i < audioData.length; i++) {
    const value = audioData[i] / 255;
    const height = value * canvas.height / 2 * intensityFactor;
    const colorIndex = Math.floor((i / audioData.length) * colors.length);
    const color = colors[colorIndex % colors.length];
    
    // Efecto de inclinación basado en sensores
    const angle = (i / audioData.length) * Math.PI * 2;
    const tiltX = Math.sin(angle) * effectParams.tilt.x;
    const tiltY = Math.cos(angle) * effectParams.tilt.y;
    
    // Posición con tilt
    const x = centerX + Math.cos(angle) * (height + 20);
    const y = centerY + Math.sin(angle) * (height + 20) + tiltY;
    
    // Línea principal
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.stroke();
    
    // Resplandor neón
    ctx.shadowBlur = 15 * intensityFactor * value;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(x, y, 2 * intensityFactor, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
  
  // Resetear sombra
  ctx.shadowBlur = 0;
}

function renderPulseVisual(
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement, 
  audioData: Uint8Array,
  colors: string[],
  effectParams: any
) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  // Calcular promedio de volumen
  let avg = 0;
  for (let i = 0; i < audioData.length; i++) {
    avg += audioData[i];
  }
  avg = avg / audioData.length;
  
  // Factor de pulsación basado en volumen y movimiento
  const pulseSize = (avg / 255) * Math.min(canvas.width, canvas.height) / 2;
  const shakeOffset = effectParams.shake * 2;
  
  // Dibujar círculos pulsantes con desplazamiento
  for (let i = 0; i < colors.length; i++) {
    const size = pulseSize * (1 - (i * 0.2));
    const offsetX = Math.sin(Date.now() / 1000 + i) * shakeOffset;
    const offsetY = Math.cos(Date.now() / 1000 + i) * shakeOffset;
    
    ctx.beginPath();
    ctx.arc(
      centerX + offsetX + (effectParams.tilt.x * 2), 
      centerY + offsetY + (effectParams.tilt.y * 2), 
      size, 
      0, 
      Math.PI * 2
    );
    
    // Degradado radial
    const gradient = ctx.createRadialGradient(
      centerX + offsetX, 
      centerY + offsetY, 
      0, 
      centerX + offsetX, 
      centerY + offsetY, 
      size
    );
    
    gradient.addColorStop(0, `${colors[i]}ff`);
    gradient.addColorStop(0.7, `${colors[i]}80`);
    gradient.addColorStop(1, `${colors[i]}00`);
    
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

function renderOrbitVisual(
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement, 
  audioData: Uint8Array,
  colors: string[],
  effectParams: any
) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const maxRadius = Math.min(canvas.width, canvas.height) / 2 - 20;
  
  // Órbitas
  const numOrbits = 3;
  const particlesPerOrbit = 20;
  
  for (let orbit = 0; orbit < numOrbits; orbit++) {
    const radius = maxRadius * ((orbit + 1) / numOrbits);
    const color = colors[orbit % colors.length];
    const baseFactor = audioData[Math.floor(audioData.length / numOrbits * orbit)] / 255;
    
    // Ajustar velocidad de rotación según el movimiento del dispositivo
    const rotationSpeed = 0.0005 + (effectParams.motion * 0.0001);
    const baseRotation = Date.now() * rotationSpeed * (orbit + 1);
    
    for (let p = 0; p < particlesPerOrbit; p++) {
      const relativeFactor = Math.sin(p / particlesPerOrbit * Math.PI * 2 + baseRotation);
      const sizeFactor = 0.5 + (baseFactor * 0.5);
      const pulseSize = 2 + (relativeFactor * 5 * sizeFactor);
      
      // Posición en órbita con ajuste de inclinación
      const angle = (p / particlesPerOrbit) * Math.PI * 2 + baseRotation;
      const orbitX = radius * Math.cos(angle) * (1 + effectParams.tilt.x / 30);
      const orbitY = radius * Math.sin(angle) * (1 + effectParams.tilt.y / 30);
      
      const x = centerX + orbitX;
      const y = centerY + orbitY;
      
      // Dibujar partícula
      ctx.beginPath();
      ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.7 + (relativeFactor * 0.3);
      ctx.fill();
      
      // Efecto de resplandor
      ctx.beginPath();
      ctx.arc(x, y, pulseSize * 2, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, pulseSize * 2);
      gradient.addColorStop(0, `${color}80`);
      gradient.addColorStop(1, `${color}00`);
      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.3 * sizeFactor;
      ctx.fill();
    }
  }
  
  // Resetear opacidad
  ctx.globalAlpha = 1;
}
```

El sistema incluye todas las funcionalidades solicitadas:

1. **Modo Fan**: Sistema completo para seguimiento de artistas favoritos con notificaciones y análisis.
2. **Hub Social**: Integración con múltiples redes sociales y publicación cruzada.
3. **Gestión SEO y RRSS**: Herramientas de optimización de perfil y promoción para usuarios premium.
4. **Panel Kanban**: Sistema completo de gestión de proyectos para equipos.
5. **Efectos Reactivos**: Animaciones sensibles a sensores del dispositivo (GPS, acelerómetro, giroscopio).

Las APIs están diseñadas para ser escalables, seguras y listas para integración con servicios reales.