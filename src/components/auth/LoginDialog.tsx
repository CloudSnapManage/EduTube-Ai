
"use client";

import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"], // path of error
});
type SignupFormValues = z.infer<typeof signupSchema>;

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { login, signup, loading: authLoading, error: authError, clearError } = useAuth();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = React.useState("login");

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  React.useEffect(() => {
    // Clear errors when dialog opens or tab changes
    clearError();
    loginForm.reset();
    signupForm.reset();
  }, [open, currentTab, clearError, loginForm, signupForm]);

  const handleLogin: SubmitHandler<LoginFormValues> = async (data) => {
    const user = await login(data.email, data.password);
    if (user) {
      toast({ title: "Login Successful!", description: `Welcome back, ${user.email}` });
      onOpenChange(false); // Close dialog on successful login
    }
  };

  const handleSignup: SubmitHandler<SignupFormValues> = async (data) => {
    const user = await signup(data.email, data.password);
    if (user) {
      toast({ title: "Signup Successful!", description: `Welcome, ${user.email}! You are now logged in.` });
      onOpenChange(false); // Close dialog on successful signup
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{currentTab === "login" ? "Login to Your Account" : "Create an Account"}</DialogTitle>
          <DialogDescription>
            {currentTab === "login" 
              ? "Access your saved content and preferences." 
              : "Join EduTube AI to unlock more features."}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full" onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" placeholder="m@example.com" {...loginForm.register("email")} disabled={authLoading} />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" {...loginForm.register("password")} disabled={authLoading} />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              {authError && currentTab === 'login' && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
              <DialogFooter>
                <Button type="submit" className="w-full" disabled={authLoading}>
                  {authLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" type="email" placeholder="m@example.com" {...signupForm.register("email")} disabled={authLoading} />
                {signupForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{signupForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input id="signup-password" type="password" {...signupForm.register("password")} disabled={authLoading} />
                 {signupForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{signupForm.formState.errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <Input id="signup-confirm-password" type="password" {...signupForm.register("confirmPassword")} disabled={authLoading} />
                {signupForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">{signupForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
               {authError && currentTab === 'signup' && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Sign Up Failed</AlertTitle>
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
              <DialogFooter>
                <Button type="submit" className="w-full" disabled={authLoading}>
                  {authLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign Up
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
