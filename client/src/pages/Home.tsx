import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMusicShare } from "@/hooks/useMusicShare";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import SharePrompt from "@/components/SharePrompt";
import MusicPost from "@/components/MusicPost";
import FriendActivity from "@/components/FriendActivity";
import MusicPlayer from "@/components/MusicPlayer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { MUSIC_SERVICES } from "@/lib/constants";

export default function Home() {
  const { user } = useAuth();
  const { useFeed, createMusicShare } = useMusicShare();
  const [shareOpen, setShareOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [albumCover, setAlbumCover] = useState("");
  const [trackUrl, setTrackUrl] = useState("");
  const [service, setService] = useState("spotify");
  const [content, setContent] = useState("");
  
  // Get active daily prompt
  const { data: activePrompt } = useQuery({
    queryKey: ["/api/daily-prompts/active"],
    queryFn: async () => {
      const res = await fetch("/api/daily-prompts/active", {
        credentials: "include",
      });
      if (res.status === 404) {
        return null;
      }
      if (!res.ok) {
        throw new Error("Error al obtener el reto diario");
      }
      return res.json();
    },
  });
  
  // Get user feed
  const { 
    data: feedItems = [], 
    isLoading: isFeedLoading, 
    isError: isFeedError 
  } = useFeed(user?.id || 0);
  
  const handleShare = async () => {
    if (!user) return;
    
    try {
      await createMusicShare.mutateAsync({
        userId: user.id,
        title,
        artist,
        album,
        albumCover,
        trackUrl,
        service,
        content,
        promptId: activePrompt?.id,
      });
      
      // Reset form
      setTitle("");
      setArtist("");
      setAlbum("");
      setAlbumCover("");
      setTrackUrl("");
      setService("spotify");
      setContent("");
      
      // Close dialog
      setShareOpen(false);
    } catch (error) {
      console.error("Error al compartir música:", error);
    }
  };

  return (
    <>
      {/* Daily Share Prompt */}
      <SharePrompt onShare={() => setShareOpen(true)} />
      
      {/* Content Container */}
      <div className="flex-1 lg:flex max-w-7xl mx-auto w-full">
        {/* Main Feed */}
        <div className="flex-1 px-4 py-6 space-y-6">
          {/* Desktop Share Button */}
          <div className="hidden md:flex justify-end mb-4">
            <Dialog open={shareOpen} onOpenChange={setShareOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-white hover:bg-secondary">
                  <Plus className="mr-2 h-4 w-4" />
                  Compartir Música Ahora
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Comparte lo que estás escuchando</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título de la Canción</Label>
                      <Input 
                        id="title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Ingresa el título de la canción"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="artist">Artista</Label>
                      <Input 
                        id="artist" 
                        value={artist} 
                        onChange={(e) => setArtist(e.target.value)} 
                        placeholder="Ingresa el nombre del artista"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="album">Álbum (Opcional)</Label>
                    <Input 
                      id="album" 
                      value={album} 
                      onChange={(e) => setAlbum(e.target.value)} 
                      placeholder="Ingresa el nombre del álbum"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="albumCover">URL de Portada del Álbum (Opcional)</Label>
                    <Input 
                      id="albumCover" 
                      value={albumCover} 
                      onChange={(e) => setAlbumCover(e.target.value)} 
                      placeholder="https://ejemplo.com/portada-album.jpg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="trackUrl">URL de la Pista (Opcional)</Label>
                    <Input 
                      id="trackUrl" 
                      value={trackUrl} 
                      onChange={(e) => setTrackUrl(e.target.value)} 
                      placeholder="https://open.spotify.com/track/..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="service">Servicio de Música</Label>
                    <Select value={service} onValueChange={setService}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {MUSIC_SERVICES.map(service => (
                          <SelectItem key={service.value} value={service.value}>
                            {service.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Comentario</Label>
                    <Textarea 
                      id="content" 
                      value={content} 
                      onChange={(e) => setContent(e.target.value)} 
                      placeholder="Añade un comentario a tu compartir de música..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleShare} disabled={!title || !artist || createMusicShare.isPending}>
                    {createMusicShare.isPending ? "Compartiendo..." : "Compartir Ahora"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Feed Content */}
          {isFeedLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-64 bg-card rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : isFeedError ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Error al cargar el feed. Por favor, inténtalo de nuevo.</p>
              <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
                Actualizar
              </Button>
            </div>
          ) : feedItems.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">Tu feed está vacío</h3>
              <p className="text-muted-foreground mb-4">
                ¡Sigue a amigos o comparte tu primera publicación musical para ver contenido aquí!
              </p>
              <Button onClick={() => setShareOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Comparte Tu Primera Canción
              </Button>
            </div>
          ) : (
            <>
              {feedItems.map((musicShare) => (
                <MusicPost key={musicShare.id} musicShare={musicShare} />
              ))}
            </>
          )}
        </div>
        
        {/* Friend Activity Sidebar - visible on desktop only */}
        <FriendActivity />
      </div>
      
      {/* Now Playing Mini Player - visible on mobile only */}
      {user && (
        <MusicPlayer
          title="Reproduciendo Ahora"
          artist="Artista Actual"
          mini={true}
        />
      )}
    </>
  );
}
