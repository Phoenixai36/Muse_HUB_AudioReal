import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useSocket } from "@/hooks/useSocket";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
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

  const login = async (username, password) => {
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

  const register = async (data) => {
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

  const contextValue = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}