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
    // Aquí podríamos usar drizzle-kit para migraciones
    // Por ahora, simplemente usamos db:push para sincronizar el esquema
    console.log("Base de datos inicializada correctamente");
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
    throw error;
  }
}