import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface MusicEngagementOptions {
  hapticFeedback?: boolean;
  showVisualFeedback?: boolean;
  logActivity?: boolean;
  saveHistory?: boolean;
}

// Hook personalizado para mejorar el engagement con la música
export function useMusicEngagement(options: MusicEngagementOptions = {}) {
  const {
    hapticFeedback = true,
    showVisualFeedback = true,
    logActivity = false,
    saveHistory = true
  } = options;

  const [lastPlayedTrack, setLastPlayedTrack] = useState<string | null>(null);
  const [playbackHistory, setPlaybackHistory] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  // Función que proporciona feedback táctil si está disponible
  const triggerHapticFeedback = useCallback(() => {
    if (!hapticFeedback) return;
    
    if (navigator.vibrate) {
      navigator.vibrate(10); // Feedback sutil de 10ms
    }
  }, [hapticFeedback]);

  // Función para registrar la actividad de escucha
  const logPlayActivity = useCallback((trackInfo: any) => {
    if (!logActivity) return;
    
    console.log(`[Actividad Musical] Reproduciendo: ${trackInfo.title} - ${trackInfo.artist}`);
    
    // Aquí se podría expandir con análisis o seguimiento más detallado
  }, [logActivity]);

  // Función para actualizar el historial
  const updateHistory = useCallback((trackId: string) => {
    if (!saveHistory) return;
    
    setLastPlayedTrack(trackId);
    setPlaybackHistory(prev => {
      // Evita duplicados consecutivos
      if (prev.length > 0 && prev[prev.length - 1] === trackId) {
        return prev;
      }
      
      // Mantiene un historial limitado (últimas 20 canciones)
      const newHistory = [...prev, trackId];
      if (newHistory.length > 20) {
        return newHistory.slice(newHistory.length - 20);
      }
      return newHistory;
    });
  }, [saveHistory]);

  // Función principal para reproducir música con experiencia mejorada
  const playTrack = useCallback((trackInfo: any) => {
    // Feedback táctil al iniciar la reproducción
    triggerHapticFeedback();
    
    // Actualiza el estado
    setIsPlaying(true);
    
    // Feedback visual
    if (showVisualFeedback) {
      toast({
        title: "Reproduciendo ahora",
        description: `${trackInfo.title} - ${trackInfo.artist}`,
        duration: 3000,
      });
    }
    
    // Registra la actividad
    logPlayActivity(trackInfo);
    
    // Actualiza el historial
    if (trackInfo.id) {
      updateHistory(trackInfo.id);
    }
    
    // Aquí se podría integrar con APIs de servicios de música
    
    return true;
  }, [triggerHapticFeedback, showVisualFeedback, logPlayActivity, updateHistory, toast]);

  // Función para pausar la reproducción
  const pauseTrack = useCallback(() => {
    setIsPlaying(false);
    
    // Feedback táctil sutil al pausar
    if (hapticFeedback && navigator.vibrate) {
      navigator.vibrate(5);
    }
    
    return true;
  }, [hapticFeedback]);

  // Función para dar like/me gusta a una canción
  const likeTrack = useCallback((trackInfo: any) => {
    // Feedback táctil para el "like"
    if (hapticFeedback && navigator.vibrate) {
      navigator.vibrate([15, 30, 15]); // Patrón de vibración distintivo
    }
    
    // Feedback visual
    if (showVisualFeedback) {
      toast({
        title: "¡Me gusta añadido!",
        description: `Has añadido "${trackInfo.title}" a tus favoritos`,
        duration: 2000,
      });
    }
    
    return true;
  }, [hapticFeedback, showVisualFeedback, toast]);

  // Función para compartir música
  const shareTrack = useCallback((trackInfo: any) => {
    // Feedback táctil al compartir
    triggerHapticFeedback();
    
    // Feedback visual
    if (showVisualFeedback) {
      toast({
        title: "¡Música compartida!",
        description: `Has compartido "${trackInfo.title}" en tu perfil`,
        duration: 3000,
      });
    }
    
    return true;
  }, [triggerHapticFeedback, showVisualFeedback, toast]);

  // Función para obtener recomendaciones basadas en el historial
  const getRecommendations = useCallback(() => {
    // En una implementación real, esto consultaría la API para obtener recomendaciones
    // Por ahora, simula un placeholder
    return {
      based_on_history: playbackHistory.length > 0,
      recommendation_available: true
    };
  }, [playbackHistory]);

  return {
    playTrack,
    pauseTrack,
    likeTrack,
    shareTrack,
    isPlaying,
    lastPlayedTrack,
    playbackHistory,
    getRecommendations
  };
}