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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const registerSchema = z.object({
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  displayName: z.string().min(2, "El nombre de perfil debe tener al menos 2 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
  avatar: z.string().url("Por favor, introduce una URL válida").optional().or(z.literal("")),
  bio: z.string().max(160, "La biografía debe tener menos de 160 caracteres").optional().or(z.literal("")),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const { register, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      displayName: "",
      password: "",
      confirmPassword: "",
      avatar: "",
      bio: "",
    },
  });
  
  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setError(null);
      await register(data);
    } catch (err: any) {
      setError(err.message || "Error al registrarse. Por favor, inténtelo de nuevo.");
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
          <CardTitle>Crear Cuenta</CardTitle>
          <CardDescription>
            Únete a la revolución de compartir música
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
                      <Input placeholder="Elige un nombre de usuario único" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre a Mostrar</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre visible para otros" {...field} />
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
                      <Input type="password" placeholder="Crea una contraseña" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirma tu contraseña" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de Foto de Perfil (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://ejemplo.com/avatar.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografía (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Una breve biografía sobre ti" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creando cuenta..." : "Registrarse"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login">
              <a className="text-primary hover:underline">Iniciar Sesión</a>
            </Link>
          </p>
        </CardFooter>
      </Card>
      
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>Al registrarte, aceptas nuestros Términos de Servicio y Política de Privacidad</p>
        <p className="mt-2">© {new Date().getFullYear()} R3B0RN Audio Social. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}
