import { useEffect } from "react";
import { X, Music, UserPlus, Heart, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Notification } from "@shared/schema";

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { user } = useAuth();
  
  // Get notifications
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/notifications/${user.id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch notifications");
      }
      return res.json();
    },
    enabled: !!user,
  });
  
  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const res = await apiRequest(
        "PUT", 
        `/api/notifications/read-all/${user.id}`, 
        {}
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread"] });
    }
  });
  
  // Mark single notification as read
  const markAsRead = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest(
        "PUT", 
        `/api/notifications/${id}/read`, 
        {}
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread"] });
    }
  });
  
  // Get user data for source user
  const { data: users = {} } = useQuery({
    queryKey: ["/api/notification-users"],
    queryFn: async () => {
      if (!notifications.length) return {};
      
      // Get unique user IDs
      const userIds = [...new Set(
        notifications
          .filter(n => n.sourceUserId)
          .map(n => n.sourceUserId as number)
      )];
      
      // Fetch user data for each ID
      const userPromises = userIds.map(async (id) => {
        const res = await fetch(`/api/users/${id}`, {
          credentials: "include",
        });
        if (!res.ok) return null;
        const userData = await res.json();
        return userData;
      });
      
      const userResults = await Promise.all(userPromises);
      
      // Create a map of user ID to user data
      const userMap: Record<number, any> = {};
      userResults.forEach(user => {
        if (user) {
          userMap[user.id] = user;
        }
      });
      
      return userMap;
    },
    enabled: notifications.length > 0,
  });
  
  // Mark all as read when panel opens
  useEffect(() => {
    if (user) {
      markAllAsRead.mutate();
    }
  }, [user]);
  
  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="text-destructive" />;
      case 'comment':
        return <MessageCircle className="text-primary" />;
      case 'follow':
        return <UserPlus className="text-secondary" />;
      case 'music_share':
        return <Music className="text-primary" />;
      default:
        return <Music className="text-primary" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-96 bg-card shadow-lg">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-medium">Notifications</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(100%-60px)]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => {
              const sourceUser = notification.sourceUserId 
                ? users[notification.sourceUserId] 
                : null;
                
              return (
                <div 
                  key={notification.id} 
                  className={`p-4 border-b border-border ${!notification.isRead ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    {sourceUser ? (
                      <Avatar>
                        <AvatarImage src={sourceUser.avatar || ''} alt={sourceUser.displayName} />
                        <AvatarFallback>{sourceUser.displayName?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm">
                        {notification.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.createdAt && formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
