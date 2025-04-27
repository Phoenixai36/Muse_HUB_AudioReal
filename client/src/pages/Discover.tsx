import { useState } from "react";
import { useMusicShare } from "@/hooks/useMusicShare";
import { Search, TrendingUp, Clock, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MusicPost from "@/components/MusicPost";
import { MusicShare } from "@shared/schema";

export default function Discover() {
  const { useAllMusicShares } = useMusicShare();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get all music shares
  const { 
    data: allShares = [], 
    isLoading, 
    isError 
  } = useAllMusicShares();
  
  // Filter shares based on search query
  const filteredShares = searchQuery 
    ? allShares.filter((share: MusicShare) => 
        share.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        share.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (share.album && share.album.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : allShares;
    
  // Sort shares for different tabs
  const trendingShares = [...filteredShares].sort((a, b) => {
    // Mock algorithm - in a real app this would use a more complex scoring system
    // For now, just sort by most recent
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  const recentShares = [...filteredShares].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Discover Music</h1>
      
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search songs, artists, or albums..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="trending">
        <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-6">
          <TabsTrigger value="trending" className="flex items-center">
            <TrendingUp className="mr-2 h-4 w-4" />
            <span>Trending</span>
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            <span>Recent</span>
          </TabsTrigger>
          <TabsTrigger value="friends" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            <span>Friends</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="trending">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-64 bg-card rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Failed to load trending music. Please try again.</p>
              <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
                Refresh
              </Button>
            </div>
          ) : trendingShares.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">No trending music found</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `No results found for "${searchQuery}". Try a different search.`
                  : "Check back later for trending music."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {trendingShares.map((share: MusicShare) => (
                <MusicPost key={share.id} musicShare={share} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recent">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-64 bg-card rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Failed to load recent music. Please try again.</p>
              <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
                Refresh
              </Button>
            </div>
          ) : recentShares.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">No recent music found</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `No results found for "${searchQuery}". Try a different search.`
                  : "Be the first to share some music!"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {recentShares.map((share: MusicShare) => (
                <MusicPost key={share.id} musicShare={share} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="friends">
          <div className="text-center py-10">
            <h3 className="text-lg font-medium mb-2">Friend recommendations coming soon</h3>
            <p className="text-muted-foreground">
              We're still working on this feature. Check back later!
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
