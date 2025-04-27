import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { User, UserPlus, UserMinus, Users, Search } from "lucide-react";

export default function Friends() {
  const { user: currentUser } = useAuth();
  const { useFollowers, useFollowing, followUser, unfollowUser, useIsFollowing } = useUserProfile();
  
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get followers and following
  const { 
    data: followers = [], 
    isLoading: isFollowersLoading 
  } = useFollowers(currentUser?.id || 0);
  
  const { 
    data: following = [], 
    isLoading: isFollowingLoading 
  } = useFollowing(currentUser?.id || 0);
  
  // Mock suggested users (in a real app, this would come from an API)
  const suggestedUsers = [
    {
      id: 101,
      username: "jamiewilson",
      displayName: "Jamie Wilson",
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
  
  // Filter users based on search query
  const filteredFollowers = searchQuery
    ? followers.filter(user => 
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : followers;
    
  const filteredFollowing = searchQuery
    ? following.filter(user => 
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : following;
    
  const filteredSuggested = searchQuery
    ? suggestedUsers.filter(user => 
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : suggestedUsers;
  
  // Handle follow/unfollow
  const handleFollowToggle = (userId: number, isFollowing: boolean) => {
    if (!currentUser) return;
    
    if (isFollowing) {
      unfollowUser.mutate({
        followerId: currentUser.id,
        followingId: userId
      });
    } else {
      followUser.mutate({
        followerId: currentUser.id,
        followingId: userId
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Friends</h1>
      
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search friends by name or username..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="following">
        <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-6">
          <TabsTrigger value="following" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Following</span>
          </TabsTrigger>
          <TabsTrigger value="followers" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            <span>Followers</span>
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center">
            <UserPlus className="mr-2 h-4 w-4" />
            <span>Suggestions</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="following">
          {isFollowingLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-24 bg-card rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : filteredFollowing.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">
                {searchQuery 
                  ? `No results found for "${searchQuery}"`
                  : "You aren't following anyone yet"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? "Try a different search term"
                  : "Follow other users to see their music shares in your feed."}
              </p>
              {!searchQuery && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => document.querySelector('[value="suggestions"]')?.click()}
                >
                  Find People to Follow
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredFollowing.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between bg-card p-4 rounded-lg border border-border"
                >
                  <Link href={`/profile/${user.id}`}>
                    <a className="flex items-center">
                      <Avatar>
                        <AvatarImage src={user.avatar || ''} alt={user.displayName} />
                        <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="font-medium">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                    </a>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleFollowToggle(user.id, true)}
                    disabled={unfollowUser.isPending}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="followers">
          {isFollowersLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-24 bg-card rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : filteredFollowers.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">
                {searchQuery 
                  ? `No results found for "${searchQuery}"`
                  : "You don't have any followers yet"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? "Try a different search term"
                  : "Share more music to attract followers!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredFollowers.map((user) => {
                // Check if current user is following this follower
                const { isFollowing } = useIsFollowing(currentUser?.id || 0, user.id);
                
                return (
                  <div 
                    key={user.id} 
                    className="flex items-center justify-between bg-card p-4 rounded-lg border border-border"
                  >
                    <Link href={`/profile/${user.id}`}>
                      <a className="flex items-center">
                        <Avatar>
                          <AvatarImage src={user.avatar || ''} alt={user.displayName} />
                          <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <p className="font-medium">{user.displayName}</p>
                          <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>
                      </a>
                    </Link>
                    
                    <Button 
                      variant={isFollowing ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleFollowToggle(user.id, isFollowing)}
                      disabled={followUser.isPending || unfollowUser.isPending}
                    >
                      {isFollowing ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="suggestions">
          {filteredSuggested.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">
                {searchQuery 
                  ? `No results found for "${searchQuery}"`
                  : "No suggestions available"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? "Try a different search term"
                  : "We'll suggest more people as you use the app."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredSuggested.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between bg-card p-4 rounded-lg border border-border"
                >
                  <div className="flex items-center">
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.displayName} />
                      <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="font-medium">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                      <p className="text-xs text-primary mt-1">{user.reason}</p>
                    </div>
                  </div>
                  
                  <Button size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
