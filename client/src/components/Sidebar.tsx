import { Home, Compass, Users, Sliders, Settings } from "lucide-react";
import { FaSpotify, FaApple, FaYoutube } from "react-icons/fa";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/discover", icon: Compass, label: "Discover" },
    { href: "/friends", icon: Users, label: "Friends" },
    { href: "/audio-controls", icon: Sliders, label: "Audio Controls" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  const musicServices = [
    { icon: FaSpotify, label: "Spotify", color: "text-green-500" },
    { icon: FaApple, label: "Apple Music", color: "text-white" },
    { icon: FaYoutube, label: "YouTube Music", color: "text-red-500" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-background border-r border-border">
      <div className="p-5">
        <h1 className="text-2xl font-semibold text-primary animate-pulse">R3B0RN</h1>
        <p className="text-xs text-muted-foreground">CyberGlitch Audio Social Hub</p>
      </div>
      
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a 
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg transition",
                  location === item.href
                    ? "text-primary bg-primary/20 border-l-4 border-primary"
                    : "text-muted-foreground hover:bg-primary/10"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                <span>{item.label}</span>
              </a>
            </Link>
          ))}
        </div>
        
        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            My Music Services
          </h3>
          <div className="mt-2 space-y-1">
            {musicServices.map((service) => (
              <a 
                key={service.label}
                href="#" 
                className="flex items-center px-3 py-2 rounded-lg text-muted-foreground hover:bg-primary/10 transition"
              >
                <service.icon className={cn("mr-3 h-5 w-5", service.color)} />
                <span>{service.label}</span>
              </a>
            ))}
          </div>
        </div>
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src={user?.avatar || ''} alt={user?.displayName} />
            <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{user?.displayName || 'User'}</p>
            <p className="text-xs text-muted-foreground">@{user?.username}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
