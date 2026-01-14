import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, FileDown, Loader2 } from "lucide-react";
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear } from "date-fns";
import { cn } from "@/lib/utils";

export interface ReportFilters {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  vehicleTypes: string[];
  includeSections: {
    summary: boolean;
    fuelLogs: boolean;
    maintenanceLogs: boolean;
    vehicles: boolean;
    drivers: boolean;
    routes: boolean;
    monthlyTrend: boolean;
    insights: boolean;
  };
}

interface ReportFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (filters: ReportFilters) => void;
  generating: boolean;
  vehicleTypes: string[];
  reportType: "analytics" | "finance";
}

const datePresets = [
  { label: "Last 7 Days", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: "Last 30 Days", getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: "This Month", getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: "Last 3 Months", getValue: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
  { label: "Last 6 Months", getValue: () => ({ from: subMonths(new Date(), 6), to: new Date() }) },
  { label: "This Year", getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) },
  { label: "All Time", getValue: () => ({ from: undefined, to: undefined }) },
];

export const ReportFilterDialog = ({
  open,
  onOpenChange,
  onGenerate,
  generating,
  vehicleTypes,
  reportType,
}: ReportFilterDialogProps) => {
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: undefined,
    dateTo: undefined,
    vehicleTypes: [],
    includeSections: {
      summary: true,
      fuelLogs: true,
      maintenanceLogs: true,
      vehicles: true,
      drivers: true,
      routes: true,
      monthlyTrend: true,
      insights: true,
    },
  });

  const [selectedPreset, setSelectedPreset] = useState("All Time");

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    const presetConfig = datePresets.find(p => p.label === preset);
    if (presetConfig) {
      const { from, to } = presetConfig.getValue();
      setFilters(prev => ({ ...prev, dateFrom: from, dateTo: to }));
    }
  };

  const toggleSection = (section: keyof ReportFilters["includeSections"]) => {
    setFilters(prev => ({
      ...prev,
      includeSections: {
        ...prev.includeSections,
        [section]: !prev.includeSections[section],
      },
    }));
  };

  const toggleVehicleType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      vehicleTypes: prev.vehicleTypes.includes(type)
        ? prev.vehicleTypes.filter(t => t !== type)
        : [...prev.vehicleTypes, type],
    }));
  };

  const handleGenerate = () => {
    onGenerate(filters);
  };

  const sectionLabels: { key: keyof ReportFilters["includeSections"]; label: string; description: string }[] = [
    { key: "summary", label: "Executive Summary", description: "Key metrics overview" },
    { key: "fuelLogs", label: "Fuel Transactions", description: "Detailed fuel records" },
    { key: "maintenanceLogs", label: "Maintenance Records", description: "Service history" },
    { key: "vehicles", label: "Vehicle Summary", description: "Fleet inventory" },
    { key: "drivers", label: "Driver Performance", description: "Performance rankings" },
    { key: "routes", label: "Route Analysis", description: "Route performance data" },
    { key: "monthlyTrend", label: "Monthly Trends", description: "Cost trends over time" },
    { key: "insights", label: "Strategic Insights", description: "AI recommendations" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Configure {reportType === "finance" ? "Financial" : "Analytics"} Report
          </DialogTitle>
          <DialogDescription>
            Customize your report by selecting date range, filters, and content sections.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Range Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Date Range</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {datePresets.map(preset => (
                <Button
                  key={preset.label}
                  variant={selectedPreset === preset.label ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetChange(preset.label)}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Custom date pickers */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex-1">
                <Label className="text-sm text-muted-foreground">From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => {
                        setFilters(prev => ({ ...prev, dateFrom: date }));
                        setSelectedPreset("");
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1">
                <Label className="text-sm text-muted-foreground">To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? format(filters.dateTo, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => {
                        setFilters(prev => ({ ...prev, dateTo: date }));
                        setSelectedPreset("");
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Vehicle Type Filter */}
          {vehicleTypes.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Vehicle Types</Label>
              <p className="text-sm text-muted-foreground">Leave empty to include all vehicle types</p>
              <div className="flex flex-wrap gap-2">
                {vehicleTypes.map(type => (
                  <Button
                    key={type}
                    variant={filters.vehicleTypes.includes(type) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleVehicleType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Content Sections */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Report Sections</Label>
            <p className="text-sm text-muted-foreground">Select which sections to include in the report</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sectionLabels.map(({ key, label, description }) => (
                <div
                  key={key}
                  className={cn(
                    "flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    filters.includeSections[key] ? "bg-primary/5 border-primary/30" : "bg-background"
                  )}
                  onClick={() => toggleSection(key)}
                >
                  <Checkbox
                    id={key}
                    checked={filters.includeSections[key]}
                    onCheckedChange={() => toggleSection(key)}
                  />
                  <div className="flex-1">
                    <label htmlFor={key} className="text-sm font-medium cursor-pointer">
                      {label}
                    </label>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={generating} className="gap-2">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            {generating ? "Generating..." : "Generate Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
