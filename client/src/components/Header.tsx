import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Bell, Inbox, Plus, User } from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  toggleNotifications: () => void;
}

export default function Header({ toggleNotifications }: HeaderProps) {
  const { user } = useAuth();
  
  // Get unread notifications count
  const { data: unreadNotifications } = useQuery({
    queryKey: ["/api/notifications/unread", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/notifications/unread/${user.id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch unread notifications");
      }
      return res.json();
    },
    enabled: !!user,
  });
  
  const unreadCount = unreadNotifications?.length || 0;

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden bg-background p-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-primary animate-pulse">R3B0RN</h1>
          <Badge variant="destructive" className="ml-2 text-xs">BETA</Badge>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={toggleNotifications}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-xs flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </Button>
          
          <Link href={`/profile/${user?.id}`}>
            <Button variant="ghost" size="icon">
              <Avatar className="h-8 w-8 border-2 border-primary">
                <AvatarImage src={user?.avatar || ''} alt={user?.displayName || 'User'} />
                <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </Link>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex bg-background p-4 items-center justify-between border-b border-border">
        <div className="flex items-center">
          <h2 className="text-xl font-medium">Home Feed</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleNotifications}
              className="p-2 rounded-full hover:bg-accent/20 transition"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-xs flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Button>
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="p-2 rounded-full hover:bg-accent/20 transition"
            >
              <Inbox className="h-5 w-5" />
            </Button>
          </div>
          
          <Button className="bg-primary text-white hover:bg-secondary">
            <Plus className="mr-2 h-4 w-4" />
            Share Music Now
          </Button>
        </div>
      </header>
    </>
  );
}
