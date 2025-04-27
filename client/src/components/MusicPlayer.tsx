import { useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface MusicPlayerProps {
  title: string;
  artist: string;
  albumCover?: string;
  audioSrc?: string;
  onPlay?: () => void;
  onPause?: () => void;
  mini?: boolean;
}

export default function MusicPlayer({ 
  title, 
  artist, 
  albumCover, 
  audioSrc,
  onPlay,
  onPause,
  mini = false
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  
  // Audio element ref
  const [audio] = useState(new Audio(audioSrc));
  
  useEffect(() => {
    // Set up audio event listeners
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    
    // Set initial volume
    audio.volume = volume / 100;
    
    // Cleanup
    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audio, volume]);
  
  // Handle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      audio.pause();
      if (onPause) onPause();
    } else {
      audio.play();
      if (onPlay) onPlay();
    }
    setIsPlaying(!isPlaying);
  };
  
  // Handle volume change
  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    audio.volume = vol / 100;
    if (vol === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };
  
  // Handle seek
  const handleSeek = (newTime: number[]) => {
    const seekTime = newTime[0];
    audio.currentTime = (seekTime / 100) * duration;
    setCurrentTime(audio.currentTime);
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (isMuted) {
      audio.volume = volume / 100;
    } else {
      audio.volume = 0;
    }
    setIsMuted(!isMuted);
  };
  
  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // For mini player on mobile
  if (mini) {
    return (
      <div className="md:hidden fixed bottom-20 left-4 right-4 bg-card rounded-lg border border-border p-3 flex items-center shadow-lg z-10">
        <img 
          src={albumCover || "https://placehold.co/120x120/1E2028/FFFFFF?text=Album"} 
          alt={`${title} cover`} 
          className="w-10 h-10 rounded-md"
        />
        
        <div className="ml-3 flex-1 truncate">
          <p className="text-sm font-medium truncate">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{artist}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button 
            onClick={togglePlay}
            className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white p-0"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Full player
  return (
    <div className="bg-background p-4 rounded-lg border border-border">
      <div className="flex items-center space-x-4">
        <img 
          src={albumCover || "https://placehold.co/120x120/1E2028/FFFFFF?text=Album"} 
          alt={`${title} cover`} 
          className="w-16 h-16 rounded-md"
        />
        
        <div className="flex-1">
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground">{artist}</p>
          
          <div className="mt-2 flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button 
              onClick={togglePlay}
              className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white p-0"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 flex items-center space-x-2">
              <span className="text-xs text-muted-foreground font-mono">
                {formatTime(currentTime)}
              </span>
              <Slider 
                value={[isNaN(currentTime / duration) ? 0 : (currentTime / duration) * 100]} 
                onValueChange={handleSeek}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground font-mono">
                {formatTime(duration)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMute}
                className="h-8 w-8"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider 
                value={[isMuted ? 0 : volume]} 
                onValueChange={handleVolumeChange} 
                max={100}
                step={1}
                className="w-24"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
