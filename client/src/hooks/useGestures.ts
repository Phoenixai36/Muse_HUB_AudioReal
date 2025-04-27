import { useState, useRef, useEffect, useCallback } from 'react';

// Tipos de gestos soportados
export type GestureType = 
  | 'swipe-left' 
  | 'swipe-right' 
  | 'swipe-up' 
  | 'swipe-down'
  | 'long-press'
  | 'double-tap'
  | 'pinch'
  | 'rotate';

interface GestureOptions {
  swipeThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
  distanceThreshold?: number;
  velocityThreshold?: number;
  disabled?: boolean;
}

type HandlerMap = Record<GestureType, () => void>;

// Hook para gestionar gestos avanzados
export function useGestures(
  elementRef: React.RefObject<HTMLElement>,
  handlers: Partial<HandlerMap>,
  options: GestureOptions = {}
) {
  const {
    swipeThreshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
    distanceThreshold = 10,
    velocityThreshold = 0.3,
    disabled = false
  } = options;

  const [activeGesture, setActiveGesture] = useState<GestureType | null>(null);
  
  // Referencias para tracear eventos táctiles
  const touchStartPos = useRef({ x: 0, y: 0 });
  const touchEndPos = useRef({ x: 0, y: 0 });
  const touchStartTime = useRef(0);
  const lastTapTime = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const multiTouchStartDistance = useRef(0);
  const multiTouchStartAngle = useRef(0);
  
  // Calcular distancia entre dos puntos táctiles
  const getDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  // Calcular ángulo entre dos puntos táctiles
  const getAngle = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    
    return Math.atan2(
      touches[1].clientY - touches[0].clientY,
      touches[1].clientX - touches[0].clientX
    ) * 180 / Math.PI;
  };

  // Gestionar inicio de toque
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || !e.touches) return;
    
    // Capturar posición inicial
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    
    // Registrar tiempo
    const now = Date.now();
    touchStartTime.current = now;
    
    // Configurar temporizador para detección de pulsación larga
    if (handlers['long-press']) {
      longPressTimer.current = setTimeout(() => {
        setActiveGesture('long-press');
        handlers['long-press']?.();
      }, longPressDelay);
    }
    
    // Detectar doble toque
    if (handlers['double-tap'] && (now - lastTapTime.current) < doubleTapDelay) {
      setActiveGesture('double-tap');
      handlers['double-tap']?.();
      lastTapTime.current = 0; // Reiniciar para evitar triples
    } else {
      lastTapTime.current = now;
    }
    
    // Capturar datos iniciales para gestos multitoque
    if (e.touches.length >= 2) {
      multiTouchStartDistance.current = getDistance(e.touches);
      multiTouchStartAngle.current = getAngle(e.touches);
    }
    
  }, [disabled, handlers, longPressDelay, doubleTapDelay]);

  // Gestionar movimiento de toque
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || !e.touches) return;
    
    // Cancelar detección de pulsación larga si el dedo se mueve
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // Actualizar posición actual
    touchEndPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    
    // Detectar gestos multitáctiles
    if (e.touches.length >= 2) {
      // Detección de pellizco (pinch)
      if (handlers['pinch']) {
        const currentDistance = getDistance(e.touches);
        const distanceDelta = currentDistance - multiTouchStartDistance.current;
        
        if (Math.abs(distanceDelta) > distanceThreshold) {
          setActiveGesture('pinch');
          // En una implementación completa, pasaríamos el factor de escala
          handlers['pinch']?.();
        }
      }
      
      // Detección de rotación
      if (handlers['rotate']) {
        const currentAngle = getAngle(e.touches);
        const angleDelta = currentAngle - multiTouchStartAngle.current;
        
        if (Math.abs(angleDelta) > 10) { // 10 grados como umbral
          setActiveGesture('rotate');
          // En una implementación completa, pasaríamos el ángulo
          handlers['rotate']?.();
        }
      }
    }
    
  }, [disabled, handlers, distanceThreshold]);

  // Gestionar fin de toque
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (disabled) return;
    
    // Cancelar temporizador de pulsación larga
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // Calcular delta de posición
    const deltaX = touchEndPos.current.x - touchStartPos.current.x;
    const deltaY = touchEndPos.current.y - touchStartPos.current.y;
    
    // Calcular velocidad (distancia/tiempo)
    const touchDuration = Date.now() - touchStartTime.current;
    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / touchDuration;
    
    // No detectar deslizamientos si la velocidad es demasiado baja
    if (velocity < velocityThreshold) {
      setActiveGesture(null);
      return;
    }
    
    // Detectar dirección de deslizamiento
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Deslizamiento horizontal
      if (Math.abs(deltaX) > swipeThreshold) {
        if (deltaX > 0 && handlers['swipe-right']) {
          setActiveGesture('swipe-right');
          handlers['swipe-right']?.();
        } else if (deltaX < 0 && handlers['swipe-left']) {
          setActiveGesture('swipe-left');
          handlers['swipe-left']?.();
        }
      }
    } else {
      // Deslizamiento vertical
      if (Math.abs(deltaY) > swipeThreshold) {
        if (deltaY > 0 && handlers['swipe-down']) {
          setActiveGesture('swipe-down');
          handlers['swipe-down']?.();
        } else if (deltaY < 0 && handlers['swipe-up']) {
          setActiveGesture('swipe-up');
          handlers['swipe-up']?.();
        }
      }
    }
    
    // Reiniciar gesto activo después de un breve retraso
    setTimeout(() => {
      setActiveGesture(null);
    }, 200);
    
  }, [
    disabled, handlers, swipeThreshold, velocityThreshold
  ]);

  // Configurar/limpiar listeners de eventos
  useEffect(() => {
    const element = elementRef.current;
    if (!element || disabled) return;
    
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [
    elementRef, disabled, 
    handleTouchStart, handleTouchMove, handleTouchEnd
  ]);

  return {
    activeGesture,
    isGestureActive: activeGesture !== null
  };
}

// Componente de envoltorio para usar con children
export function GestureDetector({
  children,
  handlers,
  options,
}: {
  children: React.ReactNode;
  handlers: Partial<HandlerMap>;
  options?: GestureOptions;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeGesture } = useGestures(containerRef, handlers, options);
  
  return (
    <div 
      ref={containerRef} 
      className={`gesture-detector ${activeGesture ? `active-gesture-${activeGesture}` : ''}`}
      style={{ touchAction: 'none' }}
    >
      {children}
    </div>
  );
}