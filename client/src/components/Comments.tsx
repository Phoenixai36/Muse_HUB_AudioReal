import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useMusicShare } from "@/hooks/useMusicShare";
import { formatDistanceToNow } from "date-fns";
import { Comment, User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface CommentsProps {
  musicShareId: number;
  comments: Comment[];
  isLoading: boolean;
}

export default function Comments({ musicShareId, comments, isLoading }: CommentsProps) {
  const { user: currentUser } = useAuth();
  const { createComment } = useMusicShare();
  const [commentText, setCommentText] = useState("");
  
  // Get user data for all commenters
  const { data: users = {} } = useQuery({
    queryKey: ["/api/comment-users", musicShareId],
    queryFn: async () => {
      if (!comments.length) return {};
      
      // Get unique user IDs
      const userIds = [...new Set(comments.map(comment => comment.userId))];
      
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
      const userMap: Record<number, User> = {};
      userResults.forEach(user => {
        if (user) {
          userMap[user.id] = user;
        }
      });
      
      return userMap;
    },
    enabled: comments.length > 0,
  });
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim() || !currentUser) return;
    
    try {
      await createComment.mutateAsync({
        musicShareId,
        userId: currentUser.id,
        content: commentText.trim()
      });
      
      // Clear input
      setCommentText("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  return (
    <div className="border-t border-border p-4">
      <h4 className="text-sm font-medium text-muted-foreground mb-3">Comments</h4>
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex space-x-3">
            <div className="w-8 h-8 rounded-full bg-muted"></div>
            <div className="flex-1">
              <div className="bg-background p-3 rounded-lg h-20"></div>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => {
            const commentUser = users[comment.userId];
            
            return (
              <div key={comment.id} className="flex space-x-3">
                <Avatar>
                  <AvatarImage 
                    src={commentUser?.avatar || ''}
                    alt={commentUser?.displayName || 'User'} 
                  />
                  <AvatarFallback>
                    {commentUser?.displayName?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-background p-3 rounded-lg">
                    <p className="text-sm font-medium">
                      {commentUser?.displayName || 'User'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {comment.content}
                    </p>
                  </div>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground space-x-3">
                    <span>
                      {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                    <button className="hover:text-foreground">Like</button>
                    <button className="hover:text-foreground">Reply</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Comment Input */}
      <form onSubmit={handleSubmitComment} className="mt-4 flex space-x-3">
        <Avatar>
          <AvatarImage 
            src={currentUser?.avatar || ''} 
            alt={currentUser?.displayName || 'You'} 
          />
          <AvatarFallback>
            {currentUser?.displayName?.[0] || 'Y'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 relative">
          <Input
            placeholder="Add a comment..."
            className="w-full bg-background border border-border rounded-full pr-10"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={!currentUser || createComment.isPending}
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary"
            disabled={!commentText.trim() || !currentUser || createComment.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
