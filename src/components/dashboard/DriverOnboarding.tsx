import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  User, Phone, Lock, CheckCircle2, 
  ArrowRight, Shield, Truck, Eye, EyeOff
} from "lucide-react";

interface DriverOnboardingProps {
  profile: any;
  onComplete: () => void;
}

export const DriverOnboarding = ({ profile, onComplete }: DriverOnboardingProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    mobile_phone: profile?.mobile_phone || "",
    new_password: "",
    confirm_password: "",
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleUpdateProfile = async () => {
    if (!formData.full_name.trim()) {
      toast({ title: "Error", description: "Please enter your full name", variant: "destructive" });
      return;
    }

    if (!formData.mobile_phone.trim()) {
      toast({ title: "Error", description: "Please enter your phone number", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name.trim(),
          mobile_phone: formData.mobile_phone.trim(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({ title: "Mafanikio!", description: "Profile updated successfully" });
      setStep(2);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (formData.new_password.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.new_password,
      });

      if (error) throw error;

      toast({ title: "Mafanikio!", description: "Password updated successfully" });
      setStep(3);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSkipPassword = () => {
    setStep(3);
  };

  const handleComplete = async () => {
    // Mark onboarding as complete by updating a flag
    try {
      await supabase
        .from("profiles")
        .update({ base_station: profile.base_station || "Nairobi" })
        .eq("id", profile.id);
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
    onComplete();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Truck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Karibu Safiri Smart Fleet!</CardTitle>
          <CardDescription>
            {step === 1 && "Let's set up your driver profile"}
            {step === 2 && "Secure your account with a new password"}
            {step === 3 && "You're all set!"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step 1: Profile Setup */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-primary" />
                  Personal Information
                </h4>
                <p className="text-sm text-muted-foreground">
                  Please confirm your details for fleet management records.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="onboard-name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="onboard-name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="pl-10"
                      placeholder="John Kamau"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="onboard-phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="onboard-phone"
                      value={formData.mobile_phone}
                      onChange={(e) => setFormData({ ...formData, mobile_phone: e.target.value })}
                      className="pl-10"
                      placeholder="+254 7XX XXX XXX"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleUpdateProfile} className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Password Change */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Secure Your Account
                </h4>
                <p className="text-sm text-muted-foreground">
                  Change the temporary password to something only you know.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="onboard-new-password">New Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="onboard-new-password"
                      type={showPassword ? "text" : "password"}
                      value={formData.new_password}
                      onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                      className="pl-10 pr-10"
                      placeholder="Minimum 8 characters"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="onboard-confirm-password">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="onboard-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirm_password}
                      onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                      className="pl-10 pr-10"
                      placeholder="Confirm your password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button onClick={handleUpdatePassword} className="w-full" disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button onClick={handleSkipPassword} variant="ghost" className="w-full text-muted-foreground">
                  Skip for now
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Complete */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Hongera! 🎉</h3>
                <p className="text-muted-foreground">
                  Your profile is all set up. You're ready to start driving with Safiri Smart Fleet.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 text-left space-y-2">
                <h4 className="font-medium">What you can do now:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    View your assigned vehicle
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Track your trips and performance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Monitor your driver rating
                  </li>
                </ul>
              </div>

              <Button onClick={handleComplete} className="w-full" size="lg">
                <Truck className="mr-2 h-5 w-5" />
                Go to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};