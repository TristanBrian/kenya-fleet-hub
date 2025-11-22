import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface Driver {
  id: string;
  license_number: string;
  performance_score: number;
  total_trips: number;
  profiles: { full_name: string; mobile_phone: string | null } | null;
}

export const DriversManager = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from("drivers")
      .select("*, profiles(full_name, mobile_phone)")
      .order("performance_score", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setDrivers(data || []);
    }
    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  if (loading) {
    return <div className="text-center py-8"><User className="h-8 w-8 animate-pulse mx-auto text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Drivers</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Driver Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Total Trips</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{driver.profiles?.full_name || "N/A"}</TableCell>
                  <TableCell>{driver.license_number}</TableCell>
                  <TableCell>{driver.profiles?.mobile_phone || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Progress value={driver.performance_score} className="w-20 h-2" />
                      <span className={`font-bold ${getScoreColor(driver.performance_score)}`}>
                        {driver.performance_score}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{driver.total_trips}</TableCell>
                </TableRow>
              ))}
              {drivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No drivers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
