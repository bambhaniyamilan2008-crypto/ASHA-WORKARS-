// Reference: javascript_auth_all_persistance integration
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Shield, Users, Activity, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = insertUserSchema.pick({ username: true, password: true });
type LoginData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof insertUserSchema>>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      phone: "",
      village: "",
    },
  });

  const onLogin = (data: LoginData) => {
    console.log("Login attempt", data.username);
    loginMutation.mutate(data);
  };

  const onRegister = (data: z.infer<typeof insertUserSchema>) => {
    console.log("Register attempt", data.username);
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">ASHA Health System</h1>
            <p className="text-muted-foreground mt-2">
              Village Health Management Platform
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>
                    Sign in to your ASHA worker account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        {...loginForm.register("username")}
                        placeholder="Enter your username"
                        data-testid="input-login-username"
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-destructive">
                          {loginForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        {...loginForm.register("password")}
                        placeholder="Enter your password"
                        data-testid="input-login-password"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                      data-testid="button-login-submit"
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Register as an ASHA worker
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        {...registerForm.register("name")}
                        placeholder="Enter your full name"
                        data-testid="input-register-name"
                      />
                      {registerForm.formState.errors.name && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-username">Username</Label>
                      <Input
                        id="reg-username"
                        {...registerForm.register("username")}
                        placeholder="Choose a username"
                        data-testid="input-register-username"
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        {...registerForm.register("password")}
                        placeholder="Create a password"
                        data-testid="input-register-password"
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          {...registerForm.register("phone")}
                          placeholder="Phone number"
                          data-testid="input-register-phone"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="village">Village</Label>
                        <Input
                          id="village"
                          {...registerForm.register("village")}
                          placeholder="Village name"
                          data-testid="input-register-village"
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                      data-testid="button-register-submit"
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex bg-primary text-primary-foreground">
        <div className="flex flex-col justify-center px-12 py-16 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold">
              Empowering Village Healthcare
            </h2>
            <p className="text-xl text-primary-foreground/80">
              Comprehensive health management system designed specifically for ASHA workers
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="bg-primary-foreground/10 rounded-lg p-4 w-fit mx-auto">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="font-semibold">Family Records</h3>
              <p className="text-sm text-primary-foreground/70">
                Track every household and family member
              </p>
            </div>

            <div className="space-y-2">
              <div className="bg-primary-foreground/10 rounded-lg p-4 w-fit mx-auto">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="font-semibold">Health Monitoring</h3>
              <p className="text-sm text-primary-foreground/70">
                Monitor pregnancies, vaccinations, and diseases
              </p>
            </div>

            <div className="space-y-2">
              <div className="bg-primary-foreground/10 rounded-lg p-4 w-fit mx-auto">
                <Activity className="h-8 w-8" />
              </div>
              <h3 className="font-semibold">Real-time Alerts</h3>
              <p className="text-sm text-primary-foreground/70">
                Get notified of urgent health situations
              </p>
            </div>

            <div className="space-y-2">
              <div className="bg-primary-foreground/10 rounded-lg p-4 w-fit mx-auto">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="font-semibold">Offline Support</h3>
              <p className="text-sm text-primary-foreground/70">
                Works without internet, syncs when online
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-primary-foreground/60 text-sm">
              Trusted by ASHA workers across India
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}