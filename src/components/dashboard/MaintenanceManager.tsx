import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Wrench, Trash2, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { MaintenanceDialog } from "./MaintenanceDialog";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/hooks/useRole";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface MaintenanceLog {
  id: string;
  service_type: string;
  date_performed: string;
  cost_kes: number;
  next_due_date: string | null;
  description: string | null;
  approval_status: string;
  submitted_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  vehicles: { license_plate: string } | null;
}

export const MaintenanceManager = () => {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<MaintenanceLog | null>(null);
  const [reviewLog, setReviewLog] = useState<MaintenanceLog | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [resubmitting, setResubmitting] = useState<string | null>(null);
  const { toast } = useToast();
  const { isFinance, isFleetManager, isOperations } = useRole();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("maintenance_logs")
      .select("*, vehicles(license_plate)")
      .order("date_performed", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setLogs((data as MaintenanceLog[]) || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this maintenance log?")) return;
    const { error } = await supabase.from("maintenance_logs").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Log deleted" });
      fetchLogs();
    }
  };

  const handleApprove = async (log: MaintenanceLog) => {
    setProcessing(true);
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase
      .from("maintenance_logs")
      .update({
        approval_status: "approved",
        reviewed_by: session?.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", log.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Approved", description: `Maintenance request for ${log.vehicles?.license_plate} approved.` });
      fetchLogs();
    }
    setProcessing(false);
    setReviewLog(null);
  };

  const handleReject = async () => {
    if (!reviewLog) return;
    setProcessing(true);
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase
      .from("maintenance_logs")
      .update({
        approval_status: "rejected",
        reviewed_by: session?.user.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejectionReason || "No reason provided",
      })
      .eq("id", reviewLog.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Declined", description: `Maintenance request declined.` });
      fetchLogs();
    }
    setProcessing(false);
    setReviewLog(null);
    setRejectionReason("");
  };

  const handleResubmit = async (log: MaintenanceLog) => {
    setResubmitting(log.id);
    try {
      const { error } = await supabase
        .from("maintenance_logs")
        .update({
          approval_status: "pending",
          reviewed_by: null,
          reviewed_at: null,
          rejection_reason: null,
        })
        .eq("id", log.id);

      if (error) throw error;
      toast({ title: "Resubmitted", description: `Request for ${log.vehicles?.license_plate} has been resubmitted for approval.` });
      fetchLogs();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setResubmitting(null);
    }
  };

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;
  
  const pendingLogs = logs.filter(l => l.approval_status === "pending");
  const approvedLogs = logs.filter(l => l.approval_status === "approved");
  const rejectedLogs = logs.filter(l => l.approval_status === "rejected");
  const totalApprovedCost = approvedLogs.reduce((sum, log) => sum + Number(log.cost_kes), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Declined</Badge>;
      default:
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-8"><Wrench className="h-8 w-8 animate-pulse mx-auto text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Maintenance</h2>
          <p className="text-muted-foreground">
            {isFinance ? "Submit maintenance requests for approval" : `Approved Cost: ${formatCurrency(totalApprovedCost)}`}
          </p>
        </div>
        {isFinance && (
          <Button onClick={() => { setSelectedLog(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Submit Request
          </Button>
        )}
      </div>

      {/* Rejected Requests Banner for Finance */}
      {isFinance && rejectedLogs.length > 0 && (
        <Card className="border-l-4 border-l-destructive bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              {rejectedLogs.length} Declined Request{rejectedLogs.length > 1 ? "s" : ""}
            </CardTitle>
            <CardDescription>These requests were declined by the Fleet Manager. Review the reasons and resubmit if needed.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rejectedLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-lg border bg-background space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{log.service_type} — {log.vehicles?.license_plate || "N/A"}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(Number(log.cost_kes))} · {format(new Date(log.date_performed), "dd MMM yyyy")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={resubmitting === log.id}
                      onClick={() => handleResubmit(log)}
                    >
                      {resubmitting === log.id ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                      ) : (
                        <Plus className="h-3.5 w-3.5 mr-1" />
                      )}
                      Resubmit
                    </Button>
                  </div>
                  {log.rejection_reason && (
                    <div className="flex items-start gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-destructive">Reason for decline:</p>
                        <p className="text-xs text-muted-foreground">{log.rejection_reason}</p>
                      </div>
                    </div>
                  )}
                  {log.reviewed_at && (
                    <p className="text-[10px] text-muted-foreground">
                      Declined on {format(new Date(log.reviewed_at), "dd MMM yyyy 'at' HH:mm")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Requests Banner for Finance */}
      {isFinance && pendingLogs.length > 0 && (
        <Card className="border-l-4 border-l-info bg-info/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-info" />
              {pendingLogs.length} Awaiting Approval
            </CardTitle>
            <CardDescription>Your submitted requests are pending Fleet Manager review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                  <div>
                    <p className="text-sm font-medium">{log.service_type} — {log.vehicles?.license_plate || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(Number(log.cost_kes))} · {format(new Date(log.date_performed), "dd MMM yyyy")}
                    </p>
                  </div>
                  <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Requests Banner for Fleet Managers */}
      {(isFleetManager || isOperations) && pendingLogs.length > 0 && (
        <Card className="border-l-4 border-l-warning bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              {pendingLogs.length} Pending Approval{pendingLogs.length > 1 ? "s" : ""}
            </CardTitle>
            <CardDescription>Finance team has submitted maintenance requests requiring your review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{log.service_type} — {log.vehicles?.license_plate || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(Number(log.cost_kes))} · {format(new Date(log.date_performed), "dd MMM yyyy")}
                      {log.description && ` · ${log.description}`}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="default" onClick={() => handleApprove(log)} disabled={processing}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => { setReviewLog(log); setRejectionReason(""); }} disabled={processing}>
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Due</TableHead>
                {(isFleetManager || isOperations) && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className={log.approval_status === "rejected" ? "opacity-50" : ""}>
                  <TableCell className="font-medium">{log.vehicles?.license_plate || "N/A"}</TableCell>
                  <TableCell>{log.service_type}</TableCell>
                  <TableCell>{format(new Date(log.date_performed), "dd MMM yyyy")}</TableCell>
                  <TableCell>{formatCurrency(Number(log.cost_kes))}</TableCell>
                  <TableCell>{getStatusBadge(log.approval_status)}</TableCell>
                  <TableCell>{log.next_due_date ? format(new Date(log.next_due_date), "dd MMM yyyy") : "-"}</TableCell>
                  {(isFleetManager || isOperations) && (
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(log.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No maintenance records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <MaintenanceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        log={selectedLog}
        onSuccess={fetchLogs}
        isFinanceSubmission={isFinance}
      />

      {/* Rejection Dialog */}
      <Dialog open={!!reviewLog} onOpenChange={(open) => { if (!open) setReviewLog(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Decline Maintenance Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted text-sm">
              <p className="font-medium">{reviewLog?.service_type} — {reviewLog?.vehicles?.license_plate}</p>
              <p className="text-muted-foreground">{formatCurrency(Number(reviewLog?.cost_kes || 0))}</p>
            </div>
            <div>
              <Label>Reason for declining</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide reason for declining this request..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewLog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              Decline Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
