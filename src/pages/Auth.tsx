import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Truck, Users, UserCircle, DollarSign, Settings, Database, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) navigate("/dashboard");
      } catch (error: any) {
        toast({ variant: "destructive", title: "Connection issue", description: error?.message || "Unable to reach the backend." });
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate("/dashboard");
    });
    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { full_name: fullName, role: 'manager' } }
      });
      if (error) throw error;
      toast({ title: "Account created!", description: "Welcome to Safiri Smart Fleet." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Signup failed", description: error.message });
    } finally { setLoading(false); }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: "Welcome back!", description: "You've successfully logged in." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login failed", description: error.message });
    } finally { setLoading(false); }
  };

  const handleSeedAccounts = async () => {
    setSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke("seed-test-accounts", { body: {} });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast({ title: "Test accounts ready!", description: "All demo accounts are now available." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Seeding failed", description: error?.message || "Unable to reach the backend." });
    } finally { setSeeding(false); }
  };

  const handleQuickLogin = async (testEmail: string, testPassword: string, role: string) => {
    setLoadingAccount(role);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: testEmail, password: testPassword });
      if (error) throw error;
      toast({ title: `Logged in as ${role}`, description: "Welcome to Safiri Smart Fleet demo." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login failed", description: error.message });
    } finally { setLoadingAccount(null); }
  };

  const testAccounts = [
    { icon: Settings, role: "Fleet Manager", email: "manager@safirismart.co.ke", password: "Manager2024!", desc: "Full system access", color: "text-primary", bg: "bg-primary/10", border: "border-l-primary" },
    { icon: Users, role: "Operations", email: "operations@safirismart.co.ke", password: "Ops2024!", desc: "Vehicles & drivers", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-l-blue-500" },
    { icon: UserCircle, role: "Driver", email: "john.kamau@safirismart.co.ke", password: "Driver2024!", desc: "Trips & vehicle view", color: "text-success", bg: "bg-success/10", border: "border-l-success" },
    { icon: DollarSign, role: "Finance", email: "finance@safirismart.co.ke", password: "Finance2024!", desc: "Reports & analytics", color: "text-warning", bg: "bg-warning/10", border: "border-l-warning" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-sm shadow-xl border-primary/10">
        <CardHeader className="text-center pb-4 pt-6">
          <div className="flex justify-center mb-3">
            <div className="p-2.5 bg-primary rounded-xl">
              <Truck className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Safiri Smart Fleet</CardTitle>
          <CardDescription className="text-sm">Kenya's Fleet Management System</CardDescription>
        </CardHeader>

        <CardContent className="pb-6">
          <Tabs defaultValue="demo" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4 h-9">
              <TabsTrigger value="demo" className="text-xs">Demo</TabsTrigger>
              <TabsTrigger value="signin" className="text-xs">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="text-xs">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="demo" className="space-y-3 mt-0">
              <Button
                onClick={handleSeedAccounts}
                disabled={seeding}
                variant="outline"
                size="sm"
                className="w-full text-xs h-8"
              >
                {seeding ? <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" />Creating accounts...</> : <><Database className="mr-1.5 h-3 w-3" />Initialize Demo Accounts</>}
              </Button>

              <ScrollArea className="h-[220px] pr-1">
                <div className="space-y-2">
                  {testAccounts.map((acc) => (
                    <button
                      key={acc.role}
                      onClick={() => handleQuickLogin(acc.email, acc.password, acc.role)}
                      disabled={!!loadingAccount}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border border-l-4 ${acc.border} bg-card hover:bg-accent/50 transition-all text-left disabled:opacity-50`}
                    >
                      <div className={`p-1.5 rounded-md ${acc.bg} flex-shrink-0`}>
                        <acc.icon className={`h-4 w-4 ${acc.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-tight">{acc.role}</p>
                        <p className="text-[11px] text-muted-foreground">{acc.desc}</p>
                      </div>
                      {loadingAccount === acc.role ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>

              <p className="text-[10px] text-muted-foreground text-center">
                Click any role above to login instantly
              </p>
            </TabsContent>

            <TabsContent value="signin" className="mt-0">
              <form onSubmit={handleSignIn} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="signin-email" className="text-xs">Email</Label>
                  <Input id="signin-email" type="email" placeholder="you@company.co.ke" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signin-password" className="text-xs">Password</Label>
                  <Input id="signin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} className="h-9 text-sm" />
                </div>
                <Button type="submit" className="w-full h-9 text-sm" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Signing in...</> : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name" className="text-xs">Full Name</Label>
                  <Input id="signup-name" type="text" placeholder="John Kamau" value={fullName} onChange={(e) => setFullName(e.target.value)} required disabled={loading} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-xs">Email</Label>
                  <Input id="signup-email" type="email" placeholder="you@company.co.ke" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-xs">Password</Label>
                  <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} className="h-9 text-sm" minLength={6} />
                </div>
                <Button type="submit" className="w-full h-9 text-sm" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Creating...</> : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
