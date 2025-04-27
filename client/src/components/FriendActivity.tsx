import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { User } from "@shared/schema";

export default function FriendActivity() {
  const { user: currentUser } = useAuth();
  const { useFollowing, followUser } = useUserProfile();
  
  // Get following
  const { data: following = [] } = useFollowing(currentUser?.id || 0);
  
  // Demo online status (in a real app, this would come from a WebSocket connection)
  const [onlineUsers] = useState<number[]>([]);
  
  // Mock suggested users (in a real app, this would come from an API)
  const suggestedUsers = [
    {
      id: 101,
      username: "jamiewilson",
      displayName: "James Wilson",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop",
      reason: "Similar music taste"
    },
    {
      id: 102,
      username: "aishajohnson",
      displayName: "Aisha Johnson",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
      reason: "Friend of Sofia"
    }
  ];
  
  // Create mock activity data for UI demo
  const friendActivities = following.map((friend: User) => {
    const randomTime = Math.floor(Math.random() * 60);
    const isOnline = onlineUsers.includes(friend.id);
    
    // Mock listening data
    const listeningTo = isOnline 
      ? ["Coldplay", "Taylor Swift", "The Weeknd", "Billie Eilish", "Drake"][Math.floor(Math.random() * 5)]
      : null;
      
    return {
      ...friend,
      isOnline,
      listeningTo,
      lastActive: isOnline 
        ? new Date() 
        : new Date(Date.now() - randomTime * 60 * 1000) // Random minutes ago
    };
  });

  return (
    <aside className="hidden lg:block w-72 bg-card border-l border-border">
      <div className="p-4 border-b border-border">
        <h3 className="font-medium">Friend Activity</h3>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          {friendActivities.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Follow friends to see their activity here
              </p>
            </div>
          ) : (
            friendActivities.map((friend) => (
              <div key={friend.id} className="flex items-start space-x-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={friend.avatar || ''} alt={friend.displayName} />
                    <AvatarFallback>{friend.displayName[0]}</AvatarFallback>
                  </Avatar>
                  {friend.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-card flex items-center justify-center">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM18 16c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <Link href={`/profile/${friend.id}`}>
                    <a className="font-medium text-sm">{friend.displayName}</a>
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {friend.isOnline && friend.listeningTo 
                      ? `Listening to ${friend.listeningTo}`
                      : `Last seen ${formatDistanceToNow(friend.lastActive, { addSuffix: true })}`
                    }
                  </p>
                  {friend.isOnline && (
                    <p className="text-xs text-primary mt-1">
                      {Math.floor(Math.random() * 30) + 1} min ago
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-6">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Suggested Friends
          </h4>
          
          <div className="space-y-4">
            {suggestedUsers.map((user) => (
              <div key={user.id} className="flex items-start space-x-3">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.displayName} />
                  <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground">{user.reason}</p>
                    </div>
                    <Button 
                      size="sm" 
                      className="text-xs"
                      onClick={() => {
                        if (currentUser) {
                          followUser.mutate({
                            followerId: currentUser.id,
                            followingId: user.id
                          });
                        }
                      }}
                      disabled={followUser.isPending}
                    >
                      <UserPlus className="mr-1 h-3 w-3" />
                      Follow
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
