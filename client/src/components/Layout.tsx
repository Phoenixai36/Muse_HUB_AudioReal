import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import Header from "./Header";
import NotificationPanel from "./NotificationPanel";
import AudioControlPanel from "./AudioControlPanel";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAudioControls, setShowAudioControls] = useState(false);

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    navigate("/login");
    return null;
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showAudioControls) setShowAudioControls(false);
  };

  const toggleAudioControls = () => {
    setShowAudioControls(!showAudioControls);
    if (showNotifications) setShowNotifications(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Mobile Header */}
      <Header toggleNotifications={toggleNotifications} />
      
      {/* Sidebar - Desktop only */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
      
      {/* Mobile Navigation */}
      <MobileNav toggleAudioControls={toggleAudioControls} />
      
      {/* Notification Panel - Conditionally rendered */}
      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}

      {/* Audio Control Panel - Conditionally rendered */}
      {showAudioControls && (
        <AudioControlPanel onClose={() => setShowAudioControls(false)} />
      )}
    </div>
  );
}
