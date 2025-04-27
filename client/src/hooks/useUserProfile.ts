import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";

export function useUserProfile() {
  const { toast } = useToast();

  // Get user profile
  const useUser = (userId: number) => {
    return useQuery<User>({
      queryKey: ["/api/users", userId],
      queryFn: async () => {
        const res = await fetch(`/api/users/${userId}`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch user profile");
        }
        return res.json();
      },
      enabled: !!userId,
    });
  };

  // Get user's followers
  const useFollowers = (userId: number) => {
    return useQuery<User[]>({
      queryKey: ["/api/followers", userId],
      queryFn: async () => {
        const res = await fetch(`/api/followers/${userId}`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch followers");
        }
        return res.json();
      },
      enabled: !!userId,
    });
  };

  // Get user's following
  const useFollowing = (userId: number) => {
    return useQuery<User[]>({
      queryKey: ["/api/following", userId],
      queryFn: async () => {
        const res = await fetch(`/api/following/${userId}`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch following");
        }
        return res.json();
      },
      enabled: !!userId,
    });
  };

  // Follow a user
  const followUser = useMutation({
    mutationFn: async ({ followerId, followingId }: { followerId: number; followingId: number }) => {
      const res = await apiRequest("POST", "/api/follow", { followerId, followingId });
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "User followed!",
        description: "You are now following this user.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/followers", variables.followingId] });
      queryClient.invalidateQueries({ queryKey: ["/api/following", variables.followerId] });
    },
    onError: (error) => {
      toast({
        title: "Failed to follow user",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Unfollow a user
  const unfollowUser = useMutation({
    mutationFn: async ({ followerId, followingId }: { followerId: number; followingId: number }) => {
      const res = await fetch(`/api/follow/${followerId}/${followingId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to unfollow user");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "User unfollowed",
        description: "You are no longer following this user.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/followers", variables.followingId] });
      queryClient.invalidateQueries({ queryKey: ["/api/following", variables.followerId] });
    },
    onError: (error) => {
      toast({
        title: "Failed to unfollow user",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Check if user is following another user
  const useIsFollowing = (followerId: number, followingId: number) => {
    const { data: following, isLoading } = useFollowing(followerId);
    
    if (isLoading || !following) {
      return { isFollowing: false, isLoading: true };
    }
    
    const isFollowing = following.some((user) => user.id === followingId);
    return { isFollowing, isLoading: false };
  };

  // Get music services
  const useMusicServices = (userId: number) => {
    return useQuery({
      queryKey: ["/api/music-services", userId],
      queryFn: async () => {
        const res = await fetch(`/api/music-services/${userId}`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch music services");
        }
        return res.json();
      },
      enabled: !!userId,
    });
  };

  // Connect/disconnect music service
  const toggleMusicService = useMutation({
    mutationFn: async ({ serviceId, isConnected }: { serviceId: number; isConnected: boolean }) => {
      const res = await apiRequest("PUT", `/api/music-services/${serviceId}`, { isConnected });
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.isConnected ? "Service connected" : "Service disconnected",
        description: `Music service ${variables.isConnected ? "connected" : "disconnected"} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/music-services"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update music service",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  return {
    useUser,
    useFollowers,
    useFollowing,
    followUser,
    unfollowUser,
    useIsFollowing,
    useMusicServices,
    toggleMusicService,
  };
}
