import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaSpotify, FaApple, FaYoutube } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Save, LogOut, User, Music, Bell, Globe, Shield, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";

export default function Settings() {
  const { user, logout } = useAuth();
  const { useMusicServices, toggleMusicService } = useUserProfile();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  // Form states
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [newSharesNotification, setNewSharesNotification] = useState(true);
  const [commentNotification, setCommentNotification] = useState(true);
  
  // Privacy settings
  const [publicProfile, setPublicProfile] = useState(true);
  const [showListeningActivity, setShowListeningActivity] = useState(true);
  
  // Get music services
  const { data: musicServices = [] } = useMusicServices(user?.id || 0);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would save the profile to the backend
    toast({
      title: "Settings Saved",
      description: "Your profile settings have been updated.",
    });
  };
  
  const handleToggleService = (serviceId: number, isConnected: boolean) => {
    toggleMusicService.mutate({ serviceId, isConnected });
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>Update your personal information and profile picture</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 mb-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatar || ''} alt={displayName} />
                  <AvatarFallback className="text-2xl">{displayName[0] || 'U'}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <Label htmlFor="avatar">Profile Picture URL</Label>
                  <Input 
                    id="avatar" 
                    value={avatar} 
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a URL for your profile picture
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input 
                  id="displayName" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={user?.username} 
                  disabled 
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Username cannot be changed
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end">
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Connected Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Music className="mr-2 h-5 w-5" />
              Connected Music Services
            </CardTitle>
            <CardDescription>Manage your connected music streaming services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaSpotify className="text-green-500 h-6 w-6 mr-3" />
                <div>
                  <p>Spotify</p>
                  <p className="text-xs text-muted-foreground">Connect to share what you're listening to</p>
                </div>
              </div>
              
              <Switch 
                checked={musicServices.find(s => s.service === 'spotify')?.isConnected || false}
                onCheckedChange={(checked) => {
                  const service = musicServices.find(s => s.service === 'spotify');
                  if (service) {
                    handleToggleService(service.id, checked);
                  }
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaApple className="text-white h-6 w-6 mr-3" />
                <div>
                  <p>Apple Music</p>
                  <p className="text-xs text-muted-foreground">Connect to share what you're listening to</p>
                </div>
              </div>
              
              <Switch 
                checked={musicServices.find(s => s.service === 'apple_music')?.isConnected || false}
                onCheckedChange={(checked) => {
                  const service = musicServices.find(s => s.service === 'apple_music');
                  if (service) {
                    handleToggleService(service.id, checked);
                  }
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaYoutube className="text-red-500 h-6 w-6 mr-3" />
                <div>
                  <p>YouTube Music</p>
                  <p className="text-xs text-muted-foreground">Connect to share what you're listening to</p>
                </div>
              </div>
              
              <Switch 
                checked={musicServices.find(s => s.service === 'youtube_music')?.isConnected || false}
                onCheckedChange={(checked) => {
                  const service = musicServices.find(s => s.service === 'youtube_music');
                  if (service) {
                    handleToggleService(service.id, checked);
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>Configure how and when you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p>Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch 
                checked={emailNotifications} 
                onCheckedChange={setEmailNotifications} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p>Push Notifications</p>
                <p className="text-xs text-muted-foreground">Receive notifications on your device</p>
              </div>
              <Switch 
                checked={pushNotifications} 
                onCheckedChange={setPushNotifications} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p>New Music Shares</p>
                <p className="text-xs text-muted-foreground">Get notified when friends share music</p>
              </div>
              <Switch 
                checked={newSharesNotification} 
                onCheckedChange={setNewSharesNotification} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p>Comments & Likes</p>
                <p className="text-xs text-muted-foreground">Get notified about interactions on your shares</p>
              </div>
              <Switch 
                checked={commentNotification} 
                onCheckedChange={setCommentNotification} 
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Privacy Settings
            </CardTitle>
            <CardDescription>Control who can see your activity and information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p>Public Profile</p>
                <p className="text-xs text-muted-foreground">Allow others to see your profile</p>
              </div>
              <Switch 
                checked={publicProfile} 
                onCheckedChange={setPublicProfile} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p>Show Listening Activity</p>
                <p className="text-xs text-muted-foreground">Let friends see what you're currently listening to</p>
              </div>
              <Switch 
                checked={showListeningActivity} 
                onCheckedChange={setShowListeningActivity} 
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize your app appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p>Dark Mode</p>
                <p className="text-xs text-muted-foreground">Toggle between light and dark themes</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme("light")}
                  className={theme === "light" ? "border-primary text-primary" : ""}
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme("dark")}
                  className={theme === "dark" ? "border-primary text-primary" : ""}
                >
                  <Moon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Logout */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="mr-2 h-5 w-5" />
              Account Actions
            </CardTitle>
            <CardDescription>Manage your account access</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              onClick={logout}
              className="w-full sm:w-auto"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
