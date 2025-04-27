import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Disc, Moon, CircleDashed, CircleX, Volume2, Music } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function AudioControls() {
  const { toast } = useToast();
  
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
      effectsLevel: effects,
      effectsEnabled: {
        glitch: glitchEnabled,
        reverb: reverbEnabled,
        distortion: distortionEnabled,
        delay: delayEnabled
      },
      visualEffect: selectedVisual
    });
    
    toast({
      title: "Settings Applied",
      description: "Your audio control settings have been saved."
    });
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Music className="mr-2 h-6 w-6" />
        Audio Controls
      </h1>
      
      <div className="grid gap-6">
        {/* Sliders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary">Control de Audio</CardTitle>
            <CardDescription>Adjust the levels of different audio components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <Label>Vocales</Label>
                <span className="text-muted-foreground">{vocals}%</span>
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
                <span className="text-muted-foreground">{instrumentals}%</span>
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
                <span className="text-muted-foreground">{effects}%</span>
              </div>
              <Slider
                value={[effects]}
                onValueChange={(value) => setEffects(value[0])}
                max={100}
                step={1}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Effect Toggles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary">Efectos</CardTitle>
            <CardDescription>Toggle audio effects on or off</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="glitch-toggle" className="flex items-center">
                <Disc className="mr-2 h-4 w-4" />
                Glitch
              </Label>
              <Switch 
                id="glitch-toggle" 
                checked={glitchEnabled}
                onCheckedChange={setGlitchEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="reverb-toggle" className="flex items-center">
                <Volume2 className="mr-2 h-4 w-4" />
                Reverberación
              </Label>
              <Switch 
                id="reverb-toggle" 
                checked={reverbEnabled}
                onCheckedChange={setReverbEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="distortion-toggle" className="flex items-center">
                <CircleX className="mr-2 h-4 w-4" />
                Distorsión
              </Label>
              <Switch 
                id="distortion-toggle" 
                checked={distortionEnabled}
                onCheckedChange={setDistortionEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="delay-toggle" className="flex items-center">
                <CircleDashed className="mr-2 h-4 w-4" />
                Delay
              </Label>
              <Switch 
                id="delay-toggle" 
                checked={delayEnabled}
                onCheckedChange={setDelayEnabled}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Visual Effects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary">Efectos Visuales</CardTitle>
            <CardDescription>Select a visual effect for the music visualizer</CardDescription>
          </CardHeader>
          <CardContent>
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
            
            <div className="mt-6 flex justify-end">
              <Button onClick={handleApplyChanges}>
                Apply Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
