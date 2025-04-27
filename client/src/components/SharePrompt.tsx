import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { DailyPrompt } from "@shared/schema";

interface SharePromptProps {
  onShare: () => void;
}

export default function SharePrompt({ onShare }: SharePromptProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });
  
  // Get active daily prompt
  const { data: prompt, isLoading } = useQuery<DailyPrompt>({
    queryKey: ["/api/daily-prompts/active"],
    queryFn: async () => {
      const res = await fetch("/api/daily-prompts/active", {
        credentials: "include",
      });
      if (res.status === 404) {
        return null;
      }
      if (!res.ok) {
        throw new Error("Error al obtener el reto diario");
      }
      return res.json();
    },
  });
  
  // Update time remaining
  useEffect(() => {
    if (!prompt) return;
    
    const endTime = new Date(prompt.endTime).getTime();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = endTime - now;
      
      if (distance <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeRemaining({ hours, minutes, seconds });
    };
    
    // Update immediately
    updateTimer();
    
    // Update every second
    const timerId = setInterval(updateTimer, 1000);
    
    return () => clearInterval(timerId);
  }, [prompt]);
  
  if (isLoading) {
    return (
      <div className="bg-primary/10 p-4 border-b border-border animate-pulse">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="h-6 w-48 bg-primary/20 rounded"></div>
          <div className="h-6 w-24 bg-primary/20 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!prompt) {
    return (
      <div className="bg-muted p-4 border-b border-border">
        <div className="max-w-3xl mx-auto text-center py-2">
          <p className="text-muted-foreground">No hay reto musical activo en este momento. ¡Vuelve más tarde!</p>
        </div>
      </div>
    );
  }
  
  // Format time remaining
  const formatTime = () => {
    const { hours, minutes, seconds } = timeRemaining;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-r from-secondary to-destructive bg-opacity-20 p-4 border-b border-border">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{prompt.title}</h3>
          <p className="text-sm text-muted-foreground">{prompt.description}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs font-mono bg-background bg-opacity-50 px-2 py-1 rounded flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            {formatTime()}
          </span>
          <span className="text-xs text-muted-foreground mt-1">Tiempo restante para compartir</span>
        </div>
      </div>
    </div>
  );
}
