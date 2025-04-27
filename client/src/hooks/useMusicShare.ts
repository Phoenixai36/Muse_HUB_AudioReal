import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MusicShare, InsertMusicShare, Comment, InsertComment } from "@shared/schema";

export function useMusicShare() {
  const { toast } = useToast();

  // Get all music shares
  const useAllMusicShares = () => {
    return useQuery<MusicShare[]>({
      queryKey: ["/api/music-shares"],
    });
  };

  // Get user feed
  const useFeed = (userId: number) => {
    return useQuery<MusicShare[]>({
      queryKey: ["/api/music-shares/feed", userId],
      queryFn: async () => {
        const res = await fetch(`/api/music-shares/feed/${userId}`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch feed");
        }
        return res.json();
      },
      enabled: !!userId,
    });
  };

  // Get user's music shares
  const useUserMusicShares = (userId: number) => {
    return useQuery<MusicShare[]>({
      queryKey: ["/api/music-shares/user", userId],
      queryFn: async () => {
        const res = await fetch(`/api/music-shares/user/${userId}`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch user's music shares");
        }
        return res.json();
      },
      enabled: !!userId,
    });
  };

  // Get prompt music shares
  const usePromptMusicShares = (promptId: number) => {
    return useQuery<MusicShare[]>({
      queryKey: ["/api/music-shares/prompt", promptId],
      queryFn: async () => {
        const res = await fetch(`/api/music-shares/prompt/${promptId}`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch prompt music shares");
        }
        return res.json();
      },
      enabled: !!promptId,
    });
  };

  // Create music share
  const createMusicShare = useMutation({
    mutationFn: async (share: InsertMusicShare) => {
      const res = await apiRequest("POST", "/api/music-shares", share);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Music shared successfully!",
        description: "Your music has been shared with your followers.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/music-shares"] });
      queryClient.invalidateQueries({ queryKey: ["/api/music-shares/feed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/music-shares/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/music-shares/prompt"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to share music",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Get comments for a music share
  const useComments = (musicShareId: number) => {
    return useQuery<Comment[]>({
      queryKey: ["/api/comments", musicShareId],
      queryFn: async () => {
        const res = await fetch(`/api/comments/${musicShareId}`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch comments");
        }
        return res.json();
      },
      enabled: !!musicShareId,
    });
  };

  // Create comment
  const createComment = useMutation({
    mutationFn: async (comment: InsertComment) => {
      const res = await apiRequest("POST", "/api/comments", comment);
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/comments", variables.musicShareId] });
    },
    onError: (error) => {
      toast({
        title: "Failed to add comment",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Like a music share
  const likeMusicShare = useMutation({
    mutationFn: async ({ musicShareId, userId }: { musicShareId: number; userId: number }) => {
      const res = await apiRequest("POST", "/api/likes", { musicShareId, userId });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/likes", variables.musicShareId] });
    },
    onError: (error) => {
      toast({
        title: "Failed to like",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Unlike a music share
  const unlikeMusicShare = useMutation({
    mutationFn: async ({ musicShareId, userId }: { musicShareId: number; userId: number }) => {
      const res = await fetch(`/api/likes/${musicShareId}/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to unlike music share");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/likes", variables.musicShareId] });
    },
    onError: (error) => {
      toast({
        title: "Failed to unlike",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Get likes for a music share
  const useLikes = (musicShareId: number) => {
    return useQuery({
      queryKey: ["/api/likes", musicShareId],
      queryFn: async () => {
        const res = await fetch(`/api/likes/${musicShareId}`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch likes");
        }
        return res.json();
      },
      enabled: !!musicShareId,
    });
  };

  // Check if user liked a music share
  const useIsLiked = (musicShareId: number, userId: number) => {
    const { data: likes, isLoading } = useLikes(musicShareId);
    
    if (isLoading || !likes) {
      return { isLiked: false, isLoading: true };
    }
    
    const isLiked = likes.some((like: any) => like.userId === userId);
    return { isLiked, isLoading: false };
  };

  return {
    useAllMusicShares,
    useFeed,
    useUserMusicShares,
    usePromptMusicShares,
    createMusicShare,
    useComments,
    createComment,
    likeMusicShare,
    unlikeMusicShare,
    useLikes,
    useIsLiked,
  };
}
