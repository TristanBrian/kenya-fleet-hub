import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Truck, Users, UserCircle, DollarSign, Settings, Database } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            role: 'manager'
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "Welcome to Safiri Smart Fleet. You've been logged in.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeedAccounts = async () => {
    setSeeding(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seed-test-accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to seed accounts');

      toast({
        title: "Test accounts created!",
        description: "All test accounts are now ready to use.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Seeding failed",
        description: error.message,
      });
    } finally {
      setSeeding(false);
    }
  };

  const handleQuickLogin = async (testEmail: string, testPassword: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (error) throw error;

      toast({
        title: "Test account login successful!",
        description: "Welcome to Safiri Smart Fleet demo.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Quick login failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const testAccounts = [
    {
      icon: Settings,
      role: "Fleet Manager",
      email: "manager@safirismart.co.ke",
      password: "Manager2024!",
      description: "Full access to all dashboards and features",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Users,
      role: "Operations Team",
      email: "operations@safirismart.co.ke",
      password: "Ops2024!",
      description: "Vehicle and driver management access",
      color: "text-info",
      bgColor: "bg-info/10"
    },
    {
      icon: UserCircle,
      role: "Driver",
      email: "john.kamau@safirismart.co.ke",
      password: "Driver2024!",
      description: "Limited view of assigned vehicle and trips",
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      icon: DollarSign,
      role: "Finance Team",
      email: "finance@safirismart.co.ke",
      password: "Finance2024!",
      description: "Analytics and financial reports only",
      color: "text-warning",
      bgColor: "bg-warning/10"
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-xl border-primary/10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-primary rounded-2xl">
              <Truck className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-primary">Safiri Smart Fleet</CardTitle>
            <CardDescription className="text-lg mt-2">Karibu! Welcome to Kenya's leading fleet management system</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="test" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="test">Test Accounts</TabsTrigger>
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="test" className="space-y-4">
              <Alert className="border-primary/20 bg-primary/5">
                <Truck className="h-4 w-4" />
                <AlertTitle>Quick Demo Access</AlertTitle>
                <AlertDescription>
                  Select a test account below to instantly explore different dashboard views
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleSeedAccounts} 
                disabled={seeding}
                className="w-full mb-3"
                variant="outline"
              >
                {seeding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating test accounts...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Create All Test Accounts
                  </>
                )}
              </Button>

              <div className="space-y-3">
                {testAccounts.map((account, index) => (
                  <Card key={index} className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${account.bgColor}`}>
                            <account.icon className={`h-5 w-5 ${account.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-sm">{account.role}</h3>
                              <Badge variant="outline" className="text-xs">Demo</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{account.description}</p>
                            <div className="text-xs space-y-1">
                              <p className="font-mono text-muted-foreground">{account.email}</p>
                              <p className="font-mono text-muted-foreground">{account.password}</p>
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handleQuickLogin(account.email, account.password)}
                          disabled={loading}
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="manager@safiri.co.ke"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Kamau"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="manager@safiri.co.ke"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
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
