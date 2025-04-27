import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Discover from "@/pages/Discover";
import Friends from "@/pages/Friends";
import AudioControls from "@/pages/AudioControls";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Layout from "@/components/Layout";
import { AuthProvider } from "@/hooks/useAuth";
import { lazy, Suspense } from "react";

function Router() {
  const [location] = useLocation();
  const isAuthPage = location === "/login" || location === "/register";

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Protected routes wrapped in Layout */}
      <Route path="/">
        {!isAuthPage ? (
          <Layout>
            <Home />
          </Layout>
        ) : (
          <Login />
        )}
      </Route>
      
      <Route path="/profile/:id">
        {(params) => (
          <Layout>
            <Profile userId={parseInt(params.id)} />
          </Layout>
        )}
      </Route>
      
      <Route path="/discover">
        <Layout>
          <Discover />
        </Layout>
      </Route>
      
      <Route path="/friends">
        <Layout>
          <Friends />
        </Layout>
      </Route>
      
      <Route path="/audio-controls">
        <Layout>
          <AudioControls />
        </Layout>
      </Route>
      
      <Route path="/settings">
        <Layout>
          <Settings />
        </Layout>
      </Route>
      
      {/* Fallback to 404 */}
      <Route>
        <Layout>
          <NotFound />
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
