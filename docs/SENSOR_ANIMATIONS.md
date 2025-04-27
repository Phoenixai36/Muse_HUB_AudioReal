# Animaciones Reactivas a Sensores

## Introducción

Este documento detalla la implementación de animaciones y efectos visuales reactivos a los sensores del dispositivo en R3B0RN CyberGlitch Hub. Estas animaciones mejoran la experiencia de usuario al crear una interfaz que responde al movimiento físico y ubicación.

## Sensores Soportados

- **Acelerómetro**: Detecta movimiento y aceleración en tres ejes
- **Giroscopio**: Detecta orientación y rotación del dispositivo
- **GPS/Geolocalización**: Detecta ubicación, velocidad y dirección
- **Sensor de luz**: Detecta nivel de luz ambiental (en dispositivos que lo soporten)

## Hook Principal: useSensorEffects

El hook `useSensorEffects` es la base para todas las animaciones reactivas a sensores. Proporciona los siguientes datos y funcionalidades:

- Estado de los sensores y permisos
- Valores procesados de los sensores
- Parámetros de efectos calculados
- Funciones para aplicar efectos a elementos DOM

### Implementación Básica

```typescript
import { useSensorEffects } from '@/hooks/useSensorEffects';
import { useRef } from 'react';

function MyComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { 
    effectParams, 
    applyEffectsToRef, 
    isSupported 
  } = useSensorEffects({
    enableAccelerometer: true,
    enableGyroscope: true,
    enableGeolocation: true,
    enableLightSensor: false
  });
  
  // Aplicar efectos al contenedor
  applyEffectsToRef(containerRef);
  
  return (
    <div ref={containerRef} className="sensor-reactive-container">
      {/* Contenido que se animará según sensores */}
      <h2>Contenido reactivo a movimiento</h2>
      <p>Mueve tu dispositivo para ver los efectos</p>
      
      {/* Indicador opcional si los sensores están disponibles */}
      {isSupported && (
        <div className="sensor-indicator">✓ Efectos de movimiento activados</div>
      )}
    </div>
  );
}
```

## Efectos Visuales Disponibles

### 1. Efecto de Paralaje por Inclinación

Este efecto crea una sensación de profundidad 3D al inclinar el dispositivo.

```typescript
import { useSensorEffects } from '@/hooks/useSensorEffects';
import { useRef } from 'react';

function ParallaxCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const { applyEffectsToRef } = useSensorEffects();
  
  // Aplicar efectos al contenedor
  applyEffectsToRef(cardRef);
  
  return (
    <div 
      ref={cardRef}
      className="relative w-80 h-60 rounded-xl overflow-hidden bg-gradient-to-br from-purple-900 to-black"
      style={{ perspective: '1000px' }}
    >
      {/* Capas con diferentes niveles de paralaje */}
      <div className="absolute inset-0 p-6 z-20">
        <h3 className="text-2xl font-bold text-white">Efecto Paralaje</h3>
        <p className="text-white/80 mt-2">Inclina tu dispositivo para ver el efecto 3D</p>
      </div>
      
      <div 
        className="absolute inset-0 z-10 bg-cover bg-center opacity-50"
        style={{ 
          backgroundImage: 'url(/assets/cyberpunk-grid.svg)',
          transform: 'translateZ(-10px)' 
        }}
      />
      
      <div 
        className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-purple-500/30 blur-xl z-0"
        style={{ transform: 'translateZ(-20px)' }}
      />
    </div>
  );
}
```

### 2. Visualizador de Audio Reactivo a Movimiento

Combina análisis de audio con datos de sensores para crear visualizaciones que reaccionan tanto a la música como al movimiento físico.

```typescript
import { useSensorEffects } from '@/hooks/useSensorEffects';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';
import { useRef, useEffect } from 'react';

function MotionAudioVisualizer({ audioUrl, isPlaying }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { audioData, connectAudio, disconnectAudio } = useAudioAnalyzer();
  const { effectParams, isSupported } = useSensorEffects();
  
  // Conectar con audio cuando cambia URL o estado
  useEffect(() => {
    if (isPlaying && audioUrl) {
      connectAudio(audioUrl);
    } else {
      disconnectAudio();
    }
    
    return () => disconnectAudio();
  }, [audioUrl, isPlaying]);
  
  // Renderizar visualización
  useEffect(() => {
    if (!canvasRef.current || !audioData || !isPlaying) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ajustar tamaño
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Animación
    let animationFrame: number;
    const colors = ['#ff00ff', '#00ffff', '#33ff33'];
    
    const render = () => {
      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Factor de intensidad basado en movimiento del dispositivo
      const intensityFactor = 1 + (effectParams.shake / 5);
      const rotationOffset = effectParams.tilt.x / 30;
      
      // Dibujar círculos basados en datos de audio
      for (let i = 0; i < Math.min(32, audioData.length); i++) {
        const value = audioData[i] / 255;
        const angle = (i / 32) * Math.PI * 2 + rotationOffset;
        const radius = value * canvas.height / 3 * intensityFactor;
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        // Dibujar línea
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.lineWidth = 2 + (value * 3);
        ctx.strokeStyle = colors[i % colors.length];
        ctx.stroke();
        
        // Dibujar punto final
        ctx.beginPath();
        ctx.arc(x, y, 3 + (value * 5), 0, Math.PI * 2);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
      }
      
      animationFrame = requestAnimationFrame(render);
    };
    
    render();
    
    return () => cancelAnimationFrame(animationFrame);
  }, [audioData, isPlaying, effectParams]);
  
  return (
    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-black/80">
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {!isSupported && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <p className="text-white">Tu dispositivo no soporta sensores de movimiento</p>
        </div>
      )}
    </div>
  );
}
```

### 3. Efectos de Pulso basados en Geolocalización

Crea efectos visuales que cambian según la ubicación y velocidad del usuario.

```typescript
import { useSensorEffects } from '@/hooks/useSensorEffects';
import { useState, useEffect } from 'react';

function GeoReactiveEffect() {
  const { sensorState, isSupported } = useSensorEffects({
    enableGeolocation: true,
    enableAccelerometer: false,
    enableGyroscope: false
  });
  
  const [pulseSize, setPulseSize] = useState(0);
  const [pulseColor, setPulseColor] = useState('#00ffff');
  
  // Actualizar efectos basados en geolocalización
  useEffect(() => {
    if (!isSupported) return;
    
    const geo = sensorState.geolocation;
    
    // Si hay velocidad disponible, usarla para el tamaño del pulso
    if (geo.speed !== null) {
      // Normalizar velocidad (m/s) a un valor entre 0-100
      const normalizedSpeed = Math.min(100, geo.speed * 3.6); // Convert to km/h
      setPulseSize(normalizedSpeed);
    }
    
    // Cambiar color basado en dirección (si disponible)
    if (geo.heading !== null) {
      // Mapear dirección (0-360) a color
      const hue = Math.floor((geo.heading / 360) * 360);
      setPulseColor(`hsl(${hue}, 100%, 50%)`);
    }
    
    // Usar coordenadas para otros efectos si es necesario
    if (geo.latitude !== null && geo.longitude !== null) {
      // Aquí puedes implementar efectos basados en ubicación específica
      // Por ejemplo, cambiar temas según la zona
    }
  }, [sensorState.geolocation, isSupported]);
  
  return (
    <div className="relative w-full h-40 bg-black/80 rounded-lg overflow-hidden flex items-center justify-center">
      {/* Efecto de pulso basado en velocidad */}
      <div 
        className="absolute rounded-full animate-pulse"
        style={{
          width: `${pulseSize}%`,
          height: `${pulseSize}%`,
          backgroundColor: `${pulseColor}20`,
          boxShadow: `0 0 20px ${pulseColor}80`,
          transition: 'all 0.5s ease-out'
        }}
      />
      
      <div className="relative z-10 text-white text-center">
        <p className="text-lg font-bold">Sensor Geolocalización</p>
        <p className="text-sm opacity-80">
          {isSupported 
            ? sensorState.geolocation.speed !== null
              ? `Velocidad: ${Math.round((sensorState.geolocation.speed || 0) * 3.6)} km/h`
              : 'Movimiento no detectado'
            : 'Geolocalización no disponible'}
        </p>
      </div>
    </div>
  );
}
```

## Optimización del Rendimiento

Las animaciones basadas en sensores pueden consumir recursos significativos. Sigue estas prácticas para optimizar el rendimiento:

1. **Limitación de frecuencia**: Usa `requestAnimationFrame` en lugar de `setInterval` para sincronizar con la frecuencia de refresco de la pantalla.

2. **Throttling**: Limita la frecuencia de actualización de valores de sensores especialmente en dispositivos de gama baja:

```typescript
import { throttle } from 'lodash-es';

// En useSensorEffects
const throttledUpdateSensorValues = throttle(updateSensorValues, 16); // ~60fps
```

3. **Detección de visibilidad**: Detén las animaciones cuando la página no esté visible:

```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Pausar animaciones
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    } else {
      // Reiniciar animaciones
      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(updateSensorValues);
      }
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);
```

4. **Optimización de transformaciones CSS**: Usa propiedades que activan la aceleración por hardware:

```typescript
// Preferir estas propiedades
element.style.transform = 'translate3d(0, 0, 0) rotate3d(1, 1, 0, 10deg)';

// En lugar de
element.style.left = `${x}px`;
element.style.top = `${y}px`;
```

5. **Detección de capacidades**: Ofrece alternativas para dispositivos sin sensores:

```typescript
const { isSupported } = useSensorEffects();

return (
  <div>
    {isSupported ? (
      <SensorEnabledComponent />
    ) : (
      <FallbackComponent />
    )}
  </div>
);
```

## Consideraciones de Experiencia de Usuario

1. **Solicitud de permisos**: En iOS se requiere permiso explícito para acceder a los sensores. Muestra un mensaje explicativo antes de solicitarlos.

2. **Controles de accesibilidad**: Proporciona una opción para desactivar animaciones basadas en movimiento para usuarios con sensibilidad al movimiento:

```typescript
function SettingsSection() {
  const [motionEnabled, setMotionEnabled] = useState(
    localStorage.getItem('motionEffectsEnabled') !== 'false'
  );
  
  const toggleMotionEffects = () => {
    const newValue = !motionEnabled;
    setMotionEnabled(newValue);
    localStorage.setItem('motionEffectsEnabled', String(newValue));
    
    // Emitir evento para que otros componentes reaccionen
    window.dispatchEvent(new CustomEvent('motion-preference-changed', {
      detail: { enabled: newValue }
    }));
  };
  
  return (
    <div className="settings-section">
      <div className="flex items-center justify-between">
        <label htmlFor="motion-toggle">Efectos de movimiento</label>
        <Switch 
          id="motion-toggle" 
          checked={motionEnabled} 
          onCheckedChange={toggleMotionEffects} 
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Activa o desactiva los efectos visuales basados en movimiento
      </p>
    </div>
  );
}
```

3. **Intensidad adaptativa**: Ajusta la intensidad de los efectos según el dispositivo y preferencias del usuario.

```typescript
// En useSensorEffects
const intensityPreference = parseFloat(localStorage.getItem('motionIntensity') || '1.0');

// Aplicar factor de intensidad a los valores calculados
const adjustedTiltX = effectParams.tilt.x * intensityPreference;
const adjustedTiltY = effectParams.tilt.y * intensityPreference;

// Devolver valores ajustados
```

## Ejemplos de Implementación

### Modo Noche Automático basado en Sensor de Luz

```typescript
function AutoNightModeProvider({ children }) {
  const { sensorState } = useSensorEffects({
    enableLightSensor: true,
    enableAccelerometer: false,
    enableGyroscope: false,
    enableGeolocation: false
  });
  
  const { setTheme, theme } = useTheme();
  const [autoMode, setAutoMode] = useState(
    localStorage.getItem('autoNightMode') === 'true'
  );
  
  // Cambiar tema según nivel de luz ambiental
  useEffect(() => {
    if (!autoMode || sensorState.light === null) return;
    
    // Umbral de luz para cambio de tema (en lux)
    const DARK_THRESHOLD = 50;
    
    if (sensorState.light < DARK_THRESHOLD && theme !== 'dark') {
      setTheme('dark');
    } else if (sensorState.light >= DARK_THRESHOLD && theme !== 'light') {
      setTheme('light');
    }
  }, [sensorState.light, autoMode, theme, setTheme]);
  
  return (
    <AutoModeContext.Provider value={{ autoMode, setAutoMode }}>
      {children}
    </AutoModeContext.Provider>
  );
}
```

### Efecto de Interfaz Holográfica

```typescript
function HolographicCard({ children }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { effectParams, applyEffectsToRef } = useSensorEffects();
  
  // Aplicar efectos al contenedor
  applyEffectsToRef(cardRef);
  
  // Calcular efecto de brillo basado en inclinación
  const gradientPosition = {
    x: 50 + (effectParams.tilt.x * 2),
    y: 50 + (effectParams.tilt.y * 2)
  };
  
  return (
    <div 
      ref={cardRef}
      className="relative rounded-xl overflow-hidden bg-black/40 border border-cyan-500/30 p-5"
      style={{ 
        backgroundImage: `
          radial-gradient(
            circle at ${gradientPosition.x}% ${gradientPosition.y}%, 
            rgba(0, 255, 255, 0.2) 0%, 
            rgba(0, 0, 0, 0) 50%
          )
        `,
        backdropFilter: 'blur(8px)',
        boxShadow: `
          0 0 20px rgba(0, 255, 255, 0.1),
          inset 0 0 15px rgba(0, 255, 255, 0.05)
        `
      }}
    >
      {/* Líneas de escaneo holográficas */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(
              transparent 0%, 
              rgba(0, 255, 255, 0.05) 50%,
              transparent 100%
            )
          `,
          backgroundSize: '100% 4px',
          opacity: 0.5 + (effectParams.shake * 0.05)
        }}
      />
      
      {/* Contenido */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
```

## Integración con Web Audio API

Para los visualizadores de audio que reaccionan tanto a la música como al movimiento, usamos una combinación de `useSensorEffects` y Web Audio API:

```typescript
// hooks/useAudioAnalyzer.ts
import { useState, useEffect, useRef } from 'react';

export function useAudioAnalyzer() {
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number | null>(null);
  
  const connectAudio = (audioUrl: string) => {
    // Limpiar cualquier conexión previa
    disconnectAudio();
    
    // Crear elementos de audio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.src = audioUrl;
    audio.loop = true;
    
    // Conectar nodos
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyzer);
    analyzer.connect(audioContext.destination);
    
    // Configurar análisis
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Guardar referencias
    audioContextRef.current = audioContext;
    sourceNodeRef.current = source;
    analyzerRef.current = analyzer;
    audioRef.current = audio;
    
    // Iniciar reproducción
    audio.play().catch(console.error);
    
    // Función de actualización
    const updateData = () => {
      analyzer.getByteFrequencyData(dataArray);
      setAudioData(new Uint8Array(dataArray));
      frameRef.current = requestAnimationFrame(updateData);
    };
    
    // Iniciar análisis
    updateData();
  };
  
  const disconnectAudio = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    
    if (analyzerRef.current) {
      analyzerRef.current.disconnect();
      analyzerRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    
    setAudioData(null);
  };
  
  useEffect(() => {
    return disconnectAudio;
  }, []);
  
  return {
    audioData,
    connectAudio,
    disconnectAudio
  };
}
```

## Conclusión

Las animaciones reactivas a sensores proporcionan una capa adicional de inmersión y experiencia de usuario en R3B0RN CyberGlitch Hub. Este sistema está diseñado para ser eficiente, accesible y crear una experiencia visual única sin comprometer el rendimiento.