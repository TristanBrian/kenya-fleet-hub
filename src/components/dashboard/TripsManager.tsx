import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface Trip {
  id: string;
  route: string;
  start_location: string;
  end_location: string;
  status: string;
  start_time: string;
  progress_percent: number;
}

export const TripsManager = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .order("start_time", { ascending: false })
      .limit(50);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setTrips(data || []);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      in_progress: "default",
      completed: "secondary",
      cancelled: "outline"
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace('_', ' ')}</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8"><MapPin className="h-8 w-8 animate-pulse mx-auto text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Trips</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Trips</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">{trip.route}</TableCell>
                  <TableCell>{trip.start_location}</TableCell>
                  <TableCell>{trip.end_location}</TableCell>
                  <TableCell>{format(new Date(trip.start_time), "dd MMM, HH:mm")}</TableCell>
                  <TableCell>{trip.progress_percent}%</TableCell>
                  <TableCell>{getStatusBadge(trip.status)}</TableCell>
                </TableRow>
              ))}
              {trips.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No trips found.
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
