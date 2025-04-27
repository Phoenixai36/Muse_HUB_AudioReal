import { useState } from "react";
import { X, Disc, Moon, CircleDashed, CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AudioControlPanelProps {
  onClose: () => void;
}

export default function AudioControlPanel({ onClose }: AudioControlPanelProps) {
  // Audio control states
  const [vocals, setVocals] = useState(90);
  const [instrumentals, setInstrumentals] = useState(60);
  const [effects, setEffects] = useState(30);
  
  // Effect toggle states
  const [glitchEnabled, setGlitchEnabled] = useState(true);
  const [reverbEnabled, setReverbEnabled] = useState(true);
  const [distortionEnabled, setDistortionEnabled] = useState(false);
  const [delayEnabled, setDelayEnabled] = useState(false);
  
  // Visual effect selection
  const [selectedVisual, setSelectedVisual] = useState('pulse');
  
  const visualEffects = [
    { id: 'glitch', label: 'Glitch', icon: Disc },
    { id: 'neon', label: 'Neon', icon: Moon },
    { id: 'pulse', label: 'Pulse', icon: CircleDashed },
    { id: 'orbit', label: 'Orbit', icon: CircleX },
  ];
  
  const handleApplyChanges = () => {
    // In a real app, we would apply these changes to an audio processing engine
    console.log('Audio settings:', {
      vocals,
      instrumentals,
      effects,
      effects: {
        glitch: glitchEnabled,
        reverb: reverbEnabled,
        distortion: distortionEnabled,
        delay: delayEnabled
      },
      visualEffect: selectedVisual
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto bg-card rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-medium">Audio Controls</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-xl font-semibold text-primary mb-4">Control de Audio</h4>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Vocales</Label>
                  <span>{vocals}%</span>
                </div>
                <Slider
                  value={[vocals]}
                  onValueChange={(value) => setVocals(value[0])}
                  max={100}
                  step={1}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Instrumentales</Label>
                  <span>{instrumentals}%</span>
                </div>
                <Slider
                  value={[instrumentals]}
                  onValueChange={(value) => setInstrumentals(value[0])}
                  max={100}
                  step={1}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Efectos</Label>
                  <span>{effects}%</span>
                </div>
                <Slider
                  value={[effects]}
                  onValueChange={(value) => setEffects(value[0])}
                  max={100}
                  step={1}
                />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-xl font-semibold text-primary mb-4">Efectos</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="glitch-toggle">Glitch</Label>
                <Switch 
                  id="glitch-toggle" 
                  checked={glitchEnabled}
                  onCheckedChange={setGlitchEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="reverb-toggle">Reverberación</Label>
                <Switch 
                  id="reverb-toggle" 
                  checked={reverbEnabled}
                  onCheckedChange={setReverbEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="distortion-toggle">Distorsión</Label>
                <Switch 
                  id="distortion-toggle" 
                  checked={distortionEnabled}
                  onCheckedChange={setDistortionEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="delay-toggle">Delay</Label>
                <Switch 
                  id="delay-toggle" 
                  checked={delayEnabled}
                  onCheckedChange={setDelayEnabled}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-xl font-semibold text-primary mb-4">Efectos Visuales</h4>
            
            <div className="grid grid-cols-2 gap-4">
              {visualEffects.map((effect) => (
                <Button
                  key={effect.id}
                  variant={selectedVisual === effect.id ? "default" : "outline"}
                  className={cn(
                    "py-3 px-4 h-auto flex flex-col items-center",
                    selectedVisual === effect.id ? "bg-primary/20 text-primary border-primary" : ""
                  )}
                  onClick={() => setSelectedVisual(effect.id)}
                >
                  <effect.icon className="mb-2 h-5 w-5" />
                  <span>{effect.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-background flex justify-end">
          <Button onClick={handleApplyChanges}>
            Apply Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
