"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Lock, Shield, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

// Admin login schema
const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof adminLoginSchema>>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof adminLoginSchema>) {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Demo credentials check (replace with real authentication)
      if (values.email === "admin@orbitbooking.com" && values.password === "admin123") {
        // Store auth token (in real app, use proper token management)
        localStorage.setItem("adminAuth", "true");
        localStorage.setItem("adminEmail", values.email);
        localStorage.setItem("userRole", "admin");
        
        toast({
          title: "Login Successful!",
          description: "Welcome to Orbit Booking Admin Dashboard",
        });
        
        // Redirect to admin dashboard
        setTimeout(() => {
          router.push("/admin");
        }, 500);
      } else if (values.email === "provider@orbitbooking.com" && values.password === "provider123") {
        // Provider login
        localStorage.setItem("providerAuth", "true");
        localStorage.setItem("providerEmail", values.email);
        localStorage.setItem("providerName", "John Smith");
        localStorage.setItem("userRole", "provider");
        
        toast({
          title: "Login Successful!",
          description: "Welcome to your Provider Dashboard",
        });
        
        // Redirect to provider dashboard
        setTimeout(() => {
          router.push("/provider/dashboard");
        }, 500);
      } else {
        throw new Error("Invalid credentials");
      }
      
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Admin Login Card */}
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img src="/images/orbit.png" alt="Orbit Booking" className="h-20 w-20" />
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5">
                  <Shield className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#0C2B4E' }}>Orbit Booking</h1>
            <p className="text-muted-foreground text-sm">Admin Dashboard Login</p>
          </div>

          {/* Demo Credentials Info */}
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
            <div>
              <p className="text-xs font-semibold text-primary mb-1">Admin Credentials:</p>
              <p className="text-xs text-muted-foreground">Email: admin@orbitbooking.com</p>
              <p className="text-xs text-muted-foreground">Password: admin123</p>
            </div>
            <div className="border-t border-primary/20 pt-2">
              <p className="text-xs font-semibold text-primary mb-1">Provider Credentials:</p>
              <p className="text-xs text-muted-foreground">Email: provider@orbitbooking.com</p>
              <p className="text-xs text-muted-foreground">Password: provider123</p>
            </div>
          </div>

          {/* Login Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                        <Input 
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10 h-11"
                          {...field} 
                        />
                      </div>
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
                    <FormLabel className="text-sm font-medium">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-10 pr-10 h-11"
                          {...field} 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
              </div>

              <Button 
                type="submit"
                className="w-full h-11 text-base"
                style={{ background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)', color: 'white' }}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Sign In to Admin Panel
                  </>
                )}
              </Button>
            </form>
          </Form>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                This is a secure admin area. All login attempts are monitored and logged.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Website */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          <button 
            onClick={() => router.push("/")}
            className="text-primary hover:underline font-medium"
          >
            ← Back to Website
          </button>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
