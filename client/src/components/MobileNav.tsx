import { Link, useLocation } from "wouter";
import { Home, Compass, Plus, Users, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  toggleAudioControls: () => void;
}

export default function MobileNav({ toggleAudioControls }: MobileNavProps) {
  const [location] = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border px-6 py-3 z-10">
      <div className="flex justify-around">
        <Link href="/">
          <a className="flex flex-col items-center">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              location === "/" 
                ? "bg-primary/20" 
                : "bg-background"
            )}>
              <Home className={location === "/" ? "text-primary" : "text-muted-foreground"} />
            </div>
            <span className={cn(
              "mt-1 text-xs", 
              location === "/" ? "text-primary" : "text-muted-foreground"
            )}>
              Home
            </span>
          </a>
        </Link>
        
        <Link href="/discover">
          <a className="flex flex-col items-center">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center", 
              location === "/discover" 
                ? "bg-primary/20" 
                : "bg-background"
            )}>
              <Compass className={location === "/discover" ? "text-primary" : "text-muted-foreground"} />
            </div>
            <span className={cn(
              "mt-1 text-xs", 
              location === "/discover" ? "text-primary" : "text-muted-foreground"
            )}>
              Discover
            </span>
          </a>
        </Link>
        
        <Link href="/share">
          <a className="flex flex-col items-center">
            <div className="w-14 h-14 -mt-8 rounded-full bg-destructive flex items-center justify-center shadow-lg">
              <Plus className="text-white text-xl" />
            </div>
            <span className="mt-1 text-xs text-white">Share</span>
          </a>
        </Link>
        
        <Link href="/friends">
          <a className="flex flex-col items-center">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center", 
              location === "/friends" 
                ? "bg-primary/20" 
                : "bg-background"
            )}>
              <Users className={location === "/friends" ? "text-primary" : "text-muted-foreground"} />
            </div>
            <span className={cn(
              "mt-1 text-xs", 
              location === "/friends" ? "text-primary" : "text-muted-foreground"
            )}>
              Friends
            </span>
          </a>
        </Link>
        
        <Button
          variant="ghost"
          onClick={toggleAudioControls}
          className="flex flex-col items-center p-0"
        >
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center bg-background"
          )}>
            <Sliders className="text-muted-foreground" />
          </div>
          <span className="mt-1 text-xs text-muted-foreground">Audio</span>
        </Button>
      </div>
    </nav>
    
    // Mini player for mobile
  );
}
