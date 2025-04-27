import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

// Tipos para diferentes flujos de usuario
type FlowStep = {
  id: string;
  completed: boolean;
  timestamp?: Date;
};

type UserFlow = {
  id: string;
  name: string;
  steps: FlowStep[];
  started?: Date;
  completed?: Date;
  currentStepIndex: number;
};

type FlowOptions = {
  autoRedirect?: boolean;
  showProgress?: boolean;
  rememberState?: boolean;
  adaptToBehavior?: boolean;
};

// Hook principal para gestionar y optimizar los flujos de usuario
export function useUserFlow(flowOptions: FlowOptions = {}) {
  const {
    autoRedirect = true,
    showProgress = true,
    rememberState = true,
    adaptToBehavior = true
  } = flowOptions;

  const [activeFlows, setActiveFlows] = useState<UserFlow[]>([]);
  const [recentlyCompletedSteps, setRecentlyCompletedSteps] = useState<FlowStep[]>([]);
  const [userBehaviorPatterns, setUserBehaviorPatterns] = useState<Record<string, number>>({});
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const userInteractionCount = useRef(0);
  const lastInteractionTime = useRef(Date.now());
  
  // Rastrea interacciones básicas del usuario para optimizar la UX
  useEffect(() => {
    if (!adaptToBehavior) return;
    
    const trackInteraction = () => {
      userInteractionCount.current += 1;
      const currentTime = Date.now();
      const timeSinceLast = currentTime - lastInteractionTime.current;
      lastInteractionTime.current = currentTime;
      
      // Analiza comportamiento para futuras optimizaciones
      if (timeSinceLast < 300) {
        // El usuario está interactuando rápidamente
        setUserBehaviorPatterns(prev => ({
          ...prev,
          rapidInteractions: (prev.rapidInteractions || 0) + 1
        }));
      }
    };
    
    // Seguimiento de interacciones básicas
    document.addEventListener('click', trackInteraction);
    document.addEventListener('touchstart', trackInteraction);
    
    return () => {
      document.removeEventListener('click', trackInteraction);
      document.removeEventListener('touchstart', trackInteraction);
    };
  }, [adaptToBehavior]);
  
  // Iniciar un nuevo flujo de usuario
  const startFlow = useCallback((flowDefinition: { id: string, name: string, steps: string[] }) => {
    const newFlow: UserFlow = {
      id: flowDefinition.id,
      name: flowDefinition.name,
      steps: flowDefinition.steps.map(step => ({ id: step, completed: false })),
      started: new Date(),
      currentStepIndex: 0
    };
    
    setActiveFlows(prev => [...prev, newFlow]);
    
    if (showProgress) {
      toast({
        title: `${newFlow.name}`,
        description: "Comenzando nuevo flujo",
        duration: 3000,
      });
    }
    
    return newFlow.id;
  }, [showProgress, toast]);
  
  // Avanzar al siguiente paso en un flujo
  const advanceFlow = useCallback((flowId: string, nextRoute?: string) => {
    setActiveFlows(prev => {
      return prev.map(flow => {
        if (flow.id !== flowId) return flow;
        
        const nextStepIndex = flow.currentStepIndex + 1;
        
        // Marca el paso actual como completado
        const updatedSteps = [...flow.steps];
        if (flow.currentStepIndex < updatedSteps.length) {
          updatedSteps[flow.currentStepIndex] = {
            ...updatedSteps[flow.currentStepIndex],
            completed: true,
            timestamp: new Date()
          };
          
          // Agrega al registro de pasos completados recientemente
          setRecentlyCompletedSteps(prev => [
            ...prev.slice(-9), // Mantiene solo los últimos 10 pasos
            updatedSteps[flow.currentStepIndex]
          ]);
        }
        
        // Verifica si todo el flujo se ha completado
        const isFlowComplete = nextStepIndex >= flow.steps.length;
        
        if (isFlowComplete) {
          // El flujo está completo
          if (showProgress) {
            toast({
              title: "¡Completado!",
              description: `${flow.name} finalizado correctamente`,
              duration: 4000,
            });
          }
          
          // Si es un flujo de incorporación o tutorial, y el usuario lo completa rápido,
          // podemos inferir que es un usuario experimentado
          const completionTime = new Date().getTime() - (flow.started?.getTime() || 0);
          if (completionTime < 60000 && flow.name.toLowerCase().includes('tutorial')) {
            setUserBehaviorPatterns(prev => ({
              ...prev,
              experiencedUser: (prev.experiencedUser || 0) + 1
            }));
          }
          
          return {
            ...flow, 
            completed: new Date(),
            steps: updatedSteps,
            currentStepIndex: nextStepIndex
          };
        }
        
        // El flujo continúa
        if (showProgress) {
          toast({
            title: "Progreso",
            description: `Paso ${nextStepIndex} de ${flow.steps.length}`,
            duration: 2000,
          });
        }
        
        // Si se proporciona una ruta para el siguiente paso, redirige a ella
        if (nextRoute && autoRedirect) {
          setLocation(nextRoute);
        }
        
        return {
          ...flow,
          steps: updatedSteps,
          currentStepIndex: nextStepIndex
        };
      });
    });
  }, [autoRedirect, setLocation, showProgress, toast]);
  
  // Abandona el flujo actual (cancelación o interrupción)
  const abandonFlow = useCallback((flowId: string) => {
    setActiveFlows(prev => prev.filter(flow => flow.id !== flowId));
    
    // Registra esto como posible comportamiento significativo
    setUserBehaviorPatterns(prev => ({
      ...prev,
      abandonedFlows: (prev.abandonedFlows || 0) + 1
    }));
    
    return true;
  }, []);
  
  // Obtiene información sobre el paso actual en un flujo
  const getCurrentStep = useCallback((flowId: string) => {
    const flow = activeFlows.find(f => f.id === flowId);
    if (!flow) return null;
    
    return {
      stepNumber: flow.currentStepIndex + 1,
      totalSteps: flow.steps.length,
      stepId: flow.steps[flow.currentStepIndex]?.id,
      progress: Math.round(((flow.currentStepIndex) / flow.steps.length) * 100)
    };
  }, [activeFlows]);
  
  // Determina si debemos optimizar para este usuario en particular
  const shouldOptimizeFlow = useCallback(() => {
    // Si el usuario abandona flujos frecuentemente, deberíamos hacer los flujos más concisos
    if ((userBehaviorPatterns.abandonedFlows || 0) > 2) {
      return { simplifiedFlow: true };
    }
    
    // Si el usuario parece experimentado, podemos omitir explicaciones detalladas
    if ((userBehaviorPatterns.experiencedUser || 0) > 0 || 
        (userBehaviorPatterns.rapidInteractions || 0) > 15) {
      return { 
        expertMode: true,
        skipTutorials: true 
      };
    }
    
    // Si el usuario interactúa lentamente, podríamos ofrecer más ayuda
    if (userInteractionCount.current < 10 && 
        (Date.now() - lastInteractionTime.current) > 30000) {
      return { 
        offerAssistance: true,
        extendedGuidance: true 
      };
    }
    
    return { standard: true };
  }, [userBehaviorPatterns]);
  
  // Rastrea impresiones (cuánto tiempo pasa el usuario viendo cada pantalla)
  const trackScreenImpression = useCallback((screenId: string) => {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      // Podría enviarse a un sistema de análisis o usarse para optimizar localmente
      console.log(`Impresión en ${screenId}: ${duration}ms`);
      
      if (duration > 10000) {
        // El usuario pasó un tiempo significativo en esta pantalla
        setUserBehaviorPatterns(prev => ({
          ...prev,
          [`engaged_${screenId}`]: (prev[`engaged_${screenId}`] || 0) + 1
        }));
      }
    };
  }, []);

  // Persiste el estado de los flujos activos para la próxima sesión
  useEffect(() => {
    if (!rememberState) return;
    
    // Al montar el componente, restaura el estado si existe
    const savedFlows = localStorage.getItem('user-flows');
    if (savedFlows) {
      try {
        const parsedFlows = JSON.parse(savedFlows);
        setActiveFlows(parsedFlows);
      } catch (e) {
        console.error('Error al restaurar flujos de usuario:', e);
      }
    }
    
    // Al actualizar el estado, guárdalo para la próxima sesión
    if (activeFlows.length > 0) {
      localStorage.setItem('user-flows', JSON.stringify(activeFlows));
    }
  }, [activeFlows, rememberState]);

  return {
    startFlow,
    advanceFlow,
    abandonFlow,
    getCurrentStep,
    activeFlows,
    recentlyCompletedSteps,
    shouldOptimizeFlow,
    trackScreenImpression,
    userBehaviorPatterns
  };
}