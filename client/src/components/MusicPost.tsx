import { useState } from "react";
import { Link } from "wouter";
import { Heart, MessageCircle, Share2, MoreVertical, Play, SkipBack, SkipForward, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FaSpotify, FaApple, FaYoutube } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { MusicShare, User, Comment as CommentType } from "@shared/schema";
import { useMusicShare } from "@/hooks/useMusicShare";
import { useUserProfile } from "@/hooks/useUserProfile";
import MusicVisualizer from "./MusicVisualizer";
import Comments from "./Comments";

interface MusicPostProps {
  musicShare: MusicShare;
  expanded?: boolean;
}

export default function MusicPost({ musicShare, expanded = false }: MusicPostProps) {
  const { user: currentUser } = useAuth();
  const { useUser } = useUserProfile();
  const { useComments, useLikes, useIsLiked, likeMusicShare, unlikeMusicShare } = useMusicShare();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComments, setShowComments] = useState(expanded);
  const [progress, setProgress] = useState(33); // 0-100 for progress bar
  
  // Fetch post author
  const { data: postAuthor, isLoading: isLoadingAuthor } = useUser(musicShare.userId);
  
  // Fetch likes and comments
  const { data: likes = [], isLoading: isLoadingLikes } = useLikes(musicShare.id);
  const { data: comments = [], isLoading: isLoadingComments } = useComments(musicShare.id);
  const { isLiked, isLoading: isCheckingLike } = useIsLiked(musicShare.id, currentUser?.id || 0);
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  const toggleLike = () => {
    if (!currentUser) return;
    
    if (isLiked) {
      unlikeMusicShare.mutate({ 
        musicShareId: musicShare.id, 
        userId: currentUser.id 
      });
    } else {
      likeMusicShare.mutate({ 
        musicShareId: musicShare.id, 
        userId: currentUser.id 
      });
    }
  };
  
  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Create the service icon component
  const ServiceIcon = () => {
    switch (musicShare.service) {
      case 'spotify':
        return <FaSpotify className="text-green-500 mr-1" />;
      case 'apple_music':
        return <FaApple className="text-white mr-1" />;
      case 'youtube_music':
        return <FaYoutube className="text-red-500 mr-1" />;
      default:
        return <FaSpotify className="text-green-500 mr-1" />;
    }
  };

  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <Link href={`/profile/${musicShare.userId}`}>
            <a className="flex items-center">
              <Avatar>
                <AvatarImage src={postAuthor?.avatar || ''} alt={postAuthor?.displayName} />
                <AvatarFallback>{postAuthor?.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="font-medium">{postAuthor?.displayName || 'Loading...'}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>{musicShare.createdAt ? formatDistanceToNow(new Date(musicShare.createdAt), { addSuffix: true }) : 'recently'}</span>
                  <span className="mx-1">•</span>
                  <ServiceIcon />
                  <span>{musicShare.service === 'spotify' ? 'Spotify' : 
                         musicShare.service === 'apple_music' ? 'Apple Music' : 
                         musicShare.service === 'youtube_music' ? 'YouTube Music' : 'Other'}</span>
                </div>
              </div>
            </a>
          </Link>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
        
        {musicShare.content && (
          <p className="mt-3 text-muted-foreground">{musicShare.content}</p>
        )}
      </div>
      
      {/* Music Player Card */}
      <div className="bg-background p-4 flex items-center space-x-4">
        <img 
          src={musicShare.albumCover || "https://placehold.co/120x120/1E2028/FFFFFF?text=Album"} 
          alt={`${musicShare.album || musicShare.title} cover`} 
          className="w-16 h-16 rounded-md"
        />
        
        <div className="flex-1">
          <h4 className="font-medium">{musicShare.title}</h4>
          <p className="text-sm text-muted-foreground">{musicShare.artist} {musicShare.album && `- ${musicShare.album}`}</p>
          
          <div className="mt-2 flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button 
              className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white p-0"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <span className="h-3 w-3 rounded-sm bg-white"></span>
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <SkipForward className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 flex items-center space-x-2">
              <span className="text-xs text-muted-foreground font-mono">1:24</span>
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-xs text-muted-foreground font-mono">4:03</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Music Visualizer */}
      {isPlaying && <MusicVisualizer />}
      
      {/* Actions */}
      <div className="p-4 flex items-center justify-between border-t border-border">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleLike}
            className="flex items-center text-muted-foreground"
          >
            <Heart 
              className={isLiked ? "text-destructive fill-destructive" : ""} 
              size={18} 
            />
            <span className="ml-1 text-sm">{likes.length}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center text-muted-foreground"
          >
            <MessageCircle size={18} />
            <span className="ml-1 text-sm">{comments.length}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center text-muted-foreground"
          >
            <Share2 size={18} />
          </Button>
        </div>
        
        <div>
          <Button variant="outline" size="sm" className="text-xs">
            <Plus className="mr-1 h-3 w-3" /> Add to Playlist
          </Button>
        </div>
      </div>
      
      {/* Comments - Conditionally rendered */}
      {showComments && (
        <Comments musicShareId={musicShare.id} comments={comments} isLoading={isLoadingComments} />
      )}
    </div>
  );
}
