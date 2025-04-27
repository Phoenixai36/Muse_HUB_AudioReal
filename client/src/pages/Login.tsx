import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FaSpotify, FaApple, FaYoutube } from "react-icons/fa";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      await login(data.username, data.password);
    } catch (err) {
      setError("Usuario o contraseña inválidos. Por favor, inténtelo de nuevo.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-primary animate-pulse">R3B0RN</h1>
        <p className="text-muted-foreground">Hub Social de Audio CyberGlitch</p>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de Usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingresa tu nombre de usuario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Ingresa tu contraseña" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">
                  O continuar con
                </span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-3 gap-3">
              <Button variant="outline" className="w-full" disabled>
                <FaSpotify className="mr-2 h-4 w-4 text-green-500" />
                Spotify
              </Button>
              <Button variant="outline" className="w-full" disabled>
                <FaApple className="mr-2 h-4 w-4" />
                Apple
              </Button>
              <Button variant="outline" className="w-full" disabled>
                <FaYoutube className="mr-2 h-4 w-4 text-red-500" />
                YouTube
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Link href="/register">
              <a className="text-primary hover:underline">Regístrate</a>
            </Link>
          </p>
        </CardFooter>
      </Card>
      
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} R3B0RN Audio Social. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}
