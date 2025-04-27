import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useSocket } from "@/hooks/useSocket";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Función de componente sin usar JSX
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { connectWebSocket, disconnectWebSocket } = useSocket();
  
  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("r3b0rn-user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        connectWebSocket(parsedUser.id.toString());
      } catch (error) {
        console.error("Error al analizar usuario almacenado:", error);
        localStorage.removeItem("r3b0rn-user");
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      const userData = await response.json();
      
      setUser(userData);
      localStorage.setItem("r3b0rn-user", JSON.stringify(userData));
      connectWebSocket(userData.id.toString());
      setLocation("/");
    } catch (error) {
      console.error("Error de inicio de sesión:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/register", data);
      const userData = await response.json();
      
      setUser(userData);
      localStorage.setItem("r3b0rn-user", JSON.stringify(userData));
      connectWebSocket(userData.id.toString());
      setLocation("/");
    } catch (error) {
      console.error("Error de registro:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("r3b0rn-user");
    disconnectWebSocket();
    queryClient.clear();
    setLocation("/login");
  };

  // Creamos el objeto contextValue fuera del return
  const contextValue: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user)
  };

  // Usamos createElement en lugar de JSX
  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}