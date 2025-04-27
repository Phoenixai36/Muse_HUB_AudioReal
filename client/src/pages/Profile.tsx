import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useMusicShare } from "@/hooks/useMusicShare";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaSpotify, FaApple, FaYoutube } from "react-icons/fa";
import { UserPlus, UserMinus, Settings, Users, Music, Heart } from "lucide-react";
import MusicPost from "@/components/MusicPost";
import { Badge } from "@/components/ui/badge";

interface ProfileProps {
  userId: number;
}

export default function Profile({ userId }: ProfileProps) {
  const { user: currentUser } = useAuth();
  const { useUser, useFollowers, useFollowing, useIsFollowing, followUser, unfollowUser } = useUserProfile();
  const { useUserMusicShares } = useMusicShare();
  
  // Get user profile
  const { 
    data: user, 
    isLoading: isUserLoading, 
    isError: isUserError 
  } = useUser(userId);
  
  // Get user's music shares
  const { 
    data: musicShares = [], 
    isLoading: isMusicSharesLoading 
  } = useUserMusicShares(userId);
  
  // Get followers and following
  const { data: followers = [] } = useFollowers(userId);
  const { data: following = [] } = useFollowing(userId);
  
  // Check if current user is following this profile
  const { isFollowing, isLoading: isCheckingFollow } = useIsFollowing(
    currentUser?.id || 0,
    userId
  );
  
  // Handle follow/unfollow
  const handleFollowToggle = () => {
    if (!currentUser || isCheckingFollow) return;
    
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
  
  if (isUserLoading) {
    return (
      <div className="max-w-3xl mx-auto p-4 animate-pulse">
        <div className="h-32 w-32 rounded-full bg-muted mx-auto"></div>
        <div className="h-8 w-48 bg-muted mt-4 mx-auto rounded"></div>
        <div className="h-4 w-32 bg-muted mt-2 mx-auto rounded"></div>
      </div>
    );
  }
  
  if (isUserError || !user) {
    return (
      <div className="max-w-3xl mx-auto p-4 text-center">
        <h2 className="text-xl font-semibold mb-2">User not found</h2>
        <p className="text-muted-foreground">This user profile may not exist or has been removed.</p>
      </div>
    );
  }
  
  const isCurrentUser = currentUser?.id === userId;

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-8">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={user.avatar || ''} alt={user.displayName} />
          <AvatarFallback className="text-2xl">{user.displayName[0]}</AvatarFallback>
        </Avatar>
        
        <h1 className="text-2xl font-bold">{user.displayName}</h1>
        <p className="text-muted-foreground">@{user.username}</p>
        
        {user.bio && (
          <p className="text-center mt-3 max-w-lg">{user.bio}</p>
        )}
        
        <div className="flex items-center mt-4 space-x-2">
          <FaSpotify className="text-green-500 h-5 w-5" />
          <FaApple className="text-white h-5 w-5" />
          <FaYoutube className="text-red-500 h-5 w-5" />
        </div>
        
        <div className="flex mt-6 space-x-4">
          <div className="text-center">
            <p className="font-semibold">{musicShares.length}</p>
            <p className="text-xs text-muted-foreground">Shares</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">{followers.length}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">{following.length}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
        </div>
        
        {!isCurrentUser && (
          <Button 
            className="mt-6" 
            variant={isFollowing ? "outline" : "default"}
            onClick={handleFollowToggle}
            disabled={isCheckingFollow || followUser.isPending || unfollowUser.isPending}
          >
            {isFollowing ? (
              <>
                <UserMinus className="mr-2 h-4 w-4" />
                Unfollow
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Follow
              </>
            )}
          </Button>
        )}
        
        {isCurrentUser && (
          <Button className="mt-6" variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>
      
      {/* Profile Tabs */}
      <Tabs defaultValue="music" className="mt-6">
        <TabsList className="grid grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="music" className="flex items-center">
            <Music className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Music Shares</span>
            <span className="sm:hidden">Shares</span>
          </TabsTrigger>
          <TabsTrigger value="likes" className="flex items-center">
            <Heart className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Liked Tracks</span>
            <span className="sm:hidden">Likes</span>
          </TabsTrigger>
          <TabsTrigger value="friends" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Following</span>
            <span className="sm:hidden">Friends</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="music">
          {isMusicSharesLoading ? (
            <div className="space-y-6 mt-6">
              {[1, 2].map((item) => (
                <div key={item} className="h-48 bg-card rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : musicShares.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">No music shares yet</h3>
              <p className="text-muted-foreground">
                {isCurrentUser 
                  ? "Share what you're listening to and it will appear here."
                  : `${user.displayName} hasn't shared any music yet.`}
              </p>
            </div>
          ) : (
            <div className="space-y-6 mt-6">
              {musicShares.map((musicShare) => (
                <MusicPost key={musicShare.id} musicShare={musicShare} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="likes">
          <div className="text-center py-10">
            <h3 className="text-lg font-medium mb-2">Liked tracks coming soon</h3>
            <p className="text-muted-foreground">
              We're still working on this feature. Check back later!
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="friends">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            {following.length === 0 ? (
              <div className="col-span-full text-center py-10">
                <h3 className="text-lg font-medium mb-2">Not following anyone yet</h3>
                <p className="text-muted-foreground">
                  {isCurrentUser 
                    ? "Follow other users to see them here."
                    : `${user.displayName} isn't following anyone yet.`}
                </p>
              </div>
            ) : (
              following.map((followedUser) => (
                <div 
                  key={followedUser.id} 
                  className="flex flex-col items-center bg-card p-4 rounded-lg border border-border"
                >
                  <Avatar className="h-16 w-16 mb-3">
                    <AvatarImage src={followedUser.avatar || ''} alt={followedUser.displayName} />
                    <AvatarFallback>{followedUser.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <h4 className="font-medium text-center">{followedUser.displayName}</h4>
                  <p className="text-xs text-muted-foreground">@{followedUser.username}</p>
                  {currentUser?.id === followedUser.id && (
                    <Badge className="mt-2" variant="outline">You</Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
