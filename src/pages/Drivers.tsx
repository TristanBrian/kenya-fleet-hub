import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Award, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Driver {
  id: string;
  license_number: string;
  performance_score: number;
  total_trips: number;
  profiles: {
    full_name: string;
    mobile_phone: string | null;
  };
}

const Drivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from("drivers")
        .select(`
          *,
          profiles (
            full_name,
            mobile_phone
          )
        `)
        .order("performance_score", { ascending: false });

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return { label: "Mambo Poa Driver", variant: "success" as const };
    if (score >= 70) return { label: "Poa", variant: "default" as const };
    if (score >= 50) return { label: "Needs Improvement", variant: "warning" as const };
    return { label: "Hii ni Danger", variant: "destructive" as const };
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading drivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Driver Management</h1>
        <p className="text-muted-foreground">
          Monitor driver performance and behavior on Kenyan roads
        </p>
      </div>

      {drivers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No drivers registered</p>
            <p className="text-sm text-muted-foreground">
              Add drivers to your fleet to start tracking performance
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {drivers.map((driver) => {
            const badge = getPerformanceBadge(driver.performance_score);
            return (
              <Card key={driver.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{driver.profiles?.full_name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          License: {driver.license_number}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Performance Score</span>
                      <span className={`text-2xl font-bold ${getScoreColor(driver.performance_score)}`}>
                        {driver.performance_score}
                      </span>
                    </div>
                    <Progress value={driver.performance_score} className="h-2" />
                    <Badge variant={badge.variant} className="mt-2">
                      {badge.label}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Total Trips</span>
                    </div>
                    <span className="font-semibold">{driver.total_trips}</span>
                  </div>

                  {driver.profiles?.mobile_phone && (
                    <p className="text-sm text-muted-foreground pt-2 border-t">
                      📱 {driver.profiles.mobile_phone}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Drivers;
