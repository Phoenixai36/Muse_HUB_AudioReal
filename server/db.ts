import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configuración de WebSockets para Neon Database
neonConfig.webSocketConstructor = ws;

// Verificar que la URL de la base de datos esté configurada
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL debe estar configurada. ¿Olvidaste provisionar una base de datos?"
  );
}

// Crear pool de conexiones y cliente de drizzle
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Función de utilidad para ejecutar migraciones programáticamente si es necesario
export async function runMigrations() {
  console.log("Inicializando la base de datos...");
  try {
    // Ejecutamos SQL directo para crear todas las tablas
    // Normalmente usaríamos drizzle-kit, pero para este caso lo hacemos directamente
    
    // Crear tablas utilizando schema
    // Esta consulta creará todas las tablas si no existen
    const result = await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        display_name TEXT NOT NULL,
        email TEXT UNIQUE,
        avatar TEXT,
        banner TEXT,
        bio TEXT,
        theme TEXT DEFAULT 'dark',
        default_privacy TEXT DEFAULT 'public',
        default_visualizer TEXT DEFAULT 'waveform',
        notification_preferences JSONB DEFAULT '{"likes": true, "comments": true, "follows": true, "recommendations": true}',
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        badges JSONB DEFAULT '[]',
        profile_stats JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS music_services (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        service TEXT NOT NULL,
        is_connected BOOLEAN DEFAULT false,
        access_token TEXT,
        refresh_token TEXT,
        token_expiry TIMESTAMP,
        api_key TEXT,
        sync_enabled BOOLEAN DEFAULT true,
        last_synced TIMESTAMP,
        service_user_id TEXT
      );

      CREATE TABLE IF NOT EXISTS followers (
        id SERIAL PRIMARY KEY,
        follower_id INTEGER NOT NULL REFERENCES users(id),
        following_id INTEGER NOT NULL REFERENCES users(id),
        notify_on_share BOOLEAN DEFAULT true,
        notify_on_listen BOOLEAN DEFAULT false,
        close_friend BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS daily_prompts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        theme TEXT,
        mood_tags JSONB DEFAULT '[]',
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT true,
        participant_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS music_shares (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        album TEXT,
        album_cover TEXT,
        track_url TEXT,
        service TEXT NOT NULL,
        service_track_id TEXT,
        content TEXT,
        mood TEXT,
        location JSONB DEFAULT '{}',
        privacy_level TEXT DEFAULT 'public',
        visualizer_type TEXT DEFAULT 'waveform',
        visualizer_settings JSONB DEFAULT '{}',
        custom_colors JSONB DEFAULT '{}',
        audio_snippet TEXT,
        expires_at TIMESTAMP,
        prompt_id INTEGER REFERENCES daily_prompts(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        music_share_id INTEGER NOT NULL REFERENCES music_shares(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        attachment_url TEXT,
        parent_id INTEGER REFERENCES comments(id),
        reaction_count JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        music_share_id INTEGER NOT NULL REFERENCES music_shares(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        reaction_type TEXT DEFAULT 'like',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        source_id INTEGER,
        source_user_id INTEGER REFERENCES users(id),
        action_url TEXT,
        image_url TEXT,
        priority TEXT DEFAULT 'normal',
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP,
        delivery_status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS playlists (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        cover_image TEXT,
        owner_id INTEGER NOT NULL REFERENCES users(id),
        is_collaborative BOOLEAN DEFAULT false,
        privacy_level TEXT DEFAULT 'public',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS playlist_members (
        id SERIAL PRIMARY KEY,
        playlist_id INTEGER NOT NULL REFERENCES playlists(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        can_edit BOOLEAN DEFAULT true,
        can_invite BOOLEAN DEFAULT false,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS playlist_tracks (
        id SERIAL PRIMARY KEY,
        playlist_id INTEGER NOT NULL REFERENCES playlists(id),
        music_share_id INTEGER REFERENCES music_shares(id),
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        album TEXT,
        album_cover TEXT,
        track_url TEXT,
        service TEXT NOT NULL,
        service_track_id TEXT,
        added_by INTEGER NOT NULL REFERENCES users(id),
        position INTEGER NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS listening_sessions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        host_id INTEGER NOT NULL REFERENCES users(id),
        is_active BOOLEAN DEFAULT true,
        current_track_url TEXT,
        current_track_title TEXT,
        current_track_artist TEXT,
        current_track_album TEXT,
        current_track_cover TEXT,
        current_position INTEGER DEFAULT 0,
        is_playing BOOLEAN DEFAULT false,
        playlist_id INTEGER REFERENCES playlists(id),
        privacy_level TEXT DEFAULT 'public',
        max_participants INTEGER DEFAULT 10,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS session_participants (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES listening_sessions(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        left_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        last_heartbeat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS session_chat (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES listening_sessions(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        message TEXT NOT NULL,
        message_type TEXT DEFAULT 'text',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS listening_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        track_title TEXT NOT NULL,
        track_artist TEXT NOT NULL,
        track_album TEXT,
        track_url TEXT,
        service_track_id TEXT,
        service TEXT NOT NULL,
        listened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        listen_duration INTEGER,
        is_shared BOOLEAN DEFAULT false,
        music_share_id INTEGER REFERENCES music_shares(id)
      );

      CREATE TABLE IF NOT EXISTS music_recommendations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        track_title TEXT NOT NULL,
        track_artist TEXT NOT NULL,
        track_album TEXT,
        album_cover TEXT,
        track_url TEXT,
        service TEXT NOT NULL,
        service_track_id TEXT,
        confidence REAL,
        reason TEXT,
        source_type TEXT,
        source_id INTEGER,
        is_viewed BOOLEAN DEFAULT false,
        is_saved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_moods (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        mood TEXT NOT NULL,
        mood_emoji TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
        language TEXT DEFAULT 'es',
        theme TEXT DEFAULT 'dark',
        accent_color TEXT DEFAULT '#8A2BE2',
        font_size_scale REAL DEFAULT 1.0,
        is_reduced_motion BOOLEAN DEFAULT false,
        is_high_contrast BOOLEAN DEFAULT false,
        audio_quality_preference TEXT DEFAULT 'high',
        data_usage_preference TEXT DEFAULT 'auto',
        autoplay_enabled BOOLEAN DEFAULT true,
        visualizer_enabled BOOLEAN DEFAULT true,
        last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS custom_visualizers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        settings JSONB DEFAULT '{}',
        colors JSONB DEFAULT '[]',
        is_public BOOLEAN DEFAULT false,
        usage_count INTEGER DEFAULT 0,
        preview_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Base de datos inicializada correctamente");
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
    throw error;
  }
}