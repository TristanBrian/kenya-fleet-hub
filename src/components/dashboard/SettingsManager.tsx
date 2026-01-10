import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Settings, Link2, CheckCircle, XCircle, Map, Cloud, Database, ShieldAlert, Save, Eye, EyeOff, Fuel, Thermometer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRole } from "@/hooks/useRole";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Helper to get/set API keys from localStorage
const API_KEYS_STORAGE_KEY = 'safiri_api_keys';

interface ApiKeys {
  mapbox?: string;
  weather?: string;
  fuel?: string;
}

const getStoredApiKeys = (): ApiKeys => {
  try {
    const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const setStoredApiKeys = (keys: ApiKeys) => {
  localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
};

export const SettingsManager = () => {
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [newVehicleType, setNewVehicleType] = useState({ name: "", description: "" });
  const [newRoute, setNewRoute] = useState({ name: "", start_location: "", end_location: "", distance_km: "" });
  const { toast } = useToast();
  const { role, loading: roleLoading, isFleetManager } = useRole();

  // API key management
  const [apiKeys, setApiKeys] = useState<ApiKeys>({});
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  
  // Dialog states for API configuration
  const [configDialog, setConfigDialog] = useState<{ open: boolean; type: 'weather' | 'fuel' | null }>({ open: false, type: null });
  const [tempApiKey, setTempApiKey] = useState('');

  // Check if APIs are configured
  const isMapboxConfigured = () => {
    const envToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
    const storedToken = localStorage.getItem('mapbox_token') || '';
    return (envToken.startsWith('pk.') || storedToken.startsWith('pk.'));
  };

  // API connection status
  const [apiStatus, setApiStatus] = useState({
    mapbox: { connected: false, name: "Mapbox", description: "Real-time GPS tracking and maps", icon: Map },
    database: { connected: true, name: "Lovable Cloud", description: "Database and authentication", icon: Database },
    weather: { connected: false, name: "OpenWeather API", description: "Route weather conditions", icon: Thermometer },
    fuel: { connected: false, name: "Fuel Price API", description: "Live fuel prices in Kenya", icon: Fuel },
  });

  // Mapbox token management
  const [mapboxToken, setMapboxToken] = useState("");
  const [showMapboxToken, setShowMapboxToken] = useState(false);

  useEffect(() => {
    fetchData();
    loadApiKeys();
  }, []);

  const loadApiKeys = () => {
    const keys = getStoredApiKeys();
    const storedMapboxToken = localStorage.getItem('mapbox_token') || '';
    
    setApiKeys(keys);
    setMapboxToken(storedMapboxToken);
    
    // Update API status based on stored keys
    setApiStatus(prev => ({
      ...prev,
      mapbox: { ...prev.mapbox, connected: isMapboxConfigured() },
      weather: { ...prev.weather, connected: !!keys.weather },
      fuel: { ...prev.fuel, connected: !!keys.fuel },
    }));
  };

  const fetchData = async () => {
    const [typesRes, routesRes] = await Promise.all([
      supabase.from("vehicle_types").select("*").order("name"),
      supabase.from("routes_master").select("*").order("name"),
    ]);
    setVehicleTypes(typesRes.data || []);
    setRoutes(routesRes.data || []);
  };

  const handleSaveMapboxToken = () => {
    const token = mapboxToken.trim();
    if (!token) {
      toast({ title: "Error", description: "Please enter a token", variant: "destructive" });
      return;
    }
    
    if (!token.startsWith('pk.')) {
      toast({ 
        title: "Invalid Token", 
        description: "Mapbox public tokens must start with 'pk.' - secret tokens (sk.*) cannot be used in the browser.", 
        variant: "destructive" 
      });
      return;
    }

    setSavingKey('mapbox');
    try {
      localStorage.setItem('mapbox_token', token);
      setApiStatus(prev => ({
        ...prev,
        mapbox: { ...prev.mapbox, connected: true }
      }));
      toast({ title: "Mafanikio!", description: "Mapbox token saved. Maps will now work across the application." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save token", variant: "destructive" });
    } finally {
      setSavingKey(null);
    }
  };

  const handleRemoveMapboxToken = () => {
    localStorage.removeItem('mapbox_token');
    setMapboxToken('');
    setApiStatus(prev => ({
      ...prev,
      mapbox: { ...prev.mapbox, connected: false }
    }));
    toast({ title: "Token Removed", description: "Mapbox token has been removed." });
  };

  const handleSaveApiKey = (type: 'weather' | 'fuel') => {
    const key = tempApiKey.trim();
    if (!key) {
      toast({ title: "Error", description: "Please enter an API key", variant: "destructive" });
      return;
    }

    setSavingKey(type);
    try {
      const updatedKeys = { ...apiKeys, [type]: key };
      setStoredApiKeys(updatedKeys);
      setApiKeys(updatedKeys);
      setApiStatus(prev => ({
        ...prev,
        [type]: { ...prev[type], connected: true }
      }));
      toast({ 
        title: "Mafanikio!", 
        description: `${type === 'weather' ? 'Weather' : 'Fuel Price'} API key saved successfully.` 
      });
      setConfigDialog({ open: false, type: null });
      setTempApiKey('');
    } catch (error) {
      toast({ title: "Error", description: "Failed to save API key", variant: "destructive" });
    } finally {
      setSavingKey(null);
    }
  };

  const handleRemoveApiKey = (type: 'weather' | 'fuel') => {
    const updatedKeys = { ...apiKeys };
    delete updatedKeys[type];
    setStoredApiKeys(updatedKeys);
    setApiKeys(updatedKeys);
    setApiStatus(prev => ({
      ...prev,
      [type]: { ...prev[type], connected: false }
    }));
    toast({ title: "API Key Removed", description: `${type === 'weather' ? 'Weather' : 'Fuel Price'} API key has been removed.` });
  };

  const addVehicleType = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("vehicle_types").insert([newVehicleType]);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Mafanikio!", description: "Vehicle type added" });
      setNewVehicleType({ name: "", description: "" });
      fetchData();
    }
  };

  const deleteVehicleType = async (id: string) => {
    if (!confirm("Delete this vehicle type?")) return;
    const { error } = await supabase.from("vehicle_types").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Mafanikio!", description: "Vehicle type deleted" });
      fetchData();
    }
  };

  const addRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...newRoute,
      distance_km: newRoute.distance_km ? parseFloat(newRoute.distance_km) : null,
    };
    const { error } = await supabase.from("routes_master").insert([payload]);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Mafanikio!", description: "Route added" });
      setNewRoute({ name: "", start_location: "", end_location: "", distance_km: "" });
      fetchData();
    }
  };

  const deleteRoute = async (id: string) => {
    if (!confirm("Delete this route?")) return;
    const { error } = await supabase.from("routes_master").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Mafanikio!", description: "Route deleted" });
      fetchData();
    }
  };

  const openConfigDialog = (type: 'weather' | 'fuel') => {
    setTempApiKey(apiKeys[type] || '');
    setConfigDialog({ open: true, type });
  };

  // Show loading state
  if (roleLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Block access for non-fleet managers
  if (!isFleetManager) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Only Fleet Managers can access settings. Please contact your administrator if you need access.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getApiDialogInfo = () => {
    if (configDialog.type === 'weather') {
      return {
        title: "Configure OpenWeather API",
        description: "Add your OpenWeather API key to enable weather conditions on routes",
        placeholder: "Enter your OpenWeather API key",
        helpText: (
          <p className="text-xs text-muted-foreground">
            Get your free API key from{" "}
            <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              OpenWeatherMap
            </a>
          </p>
        ),
      };
    }
    return {
      title: "Configure Fuel Price API",
      description: "Add your API key to enable live fuel prices in Kenya",
      placeholder: "Enter your Fuel Price API key",
      helpText: (
        <p className="text-xs text-muted-foreground">
          Configure an API key for real-time fuel pricing data
        </p>
      ),
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Fleet Settings</h2>
      </div>
      
      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="integrations">
            <Link2 className="h-4 w-4 mr-2" />
            API Integrations
          </TabsTrigger>
          <TabsTrigger value="vehicles">Vehicle Types</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
        </TabsList>

        {/* API Integrations Tab */}
        <TabsContent value="integrations">
          <div className="space-y-6">
            {/* Mapbox Configuration Card */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-primary" />
                  Mapbox Configuration
                </CardTitle>
                <CardDescription>
                  Configure Mapbox for real-time fleet tracking on maps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant={apiStatus.mapbox.connected ? "default" : "secondary"} className={apiStatus.mapbox.connected ? "bg-success" : ""}>
                    {apiStatus.mapbox.connected ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Connected</>
                    ) : (
                      <><XCircle className="h-3 w-3 mr-1" /> Not Configured</>
                    )}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mapbox-token">Mapbox Public Access Token</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Get your free public token from{" "}
                    <a 
                      href="https://account.mapbox.com/access-tokens/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Mapbox Dashboard
                    </a>
                    . Use a <strong>public token</strong> (starts with <code className="bg-muted px-1 rounded">pk.</code>)
                  </p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="mapbox-token"
                        type={showMapboxToken ? "text" : "password"}
                        placeholder="pk.eyJ1..."
                        value={mapboxToken}
                        onChange={(e) => setMapboxToken(e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowMapboxToken(!showMapboxToken)}
                      >
                        {showMapboxToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button onClick={handleSaveMapboxToken} disabled={savingKey === 'mapbox'}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>

                {apiStatus.mapbox.connected && (
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm text-success font-medium">Maps are configured and ready</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRemoveMapboxToken}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Other API Connections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Connected Services
                </CardTitle>
                <CardDescription>
                  API connections for enhanced analytics and real-time data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Database - Always connected */}
                  <Card className="border-l-4 border-l-success">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-success" />
                            <span className="font-semibold">Lovable Cloud</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Database and authentication</p>
                        </div>
                        <Badge className="bg-success">
                          <CheckCircle className="h-3 w-3 mr-1" /> Connected
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Weather API */}
                  <Card className={`border-l-4 ${apiStatus.weather.connected ? "border-l-success" : "border-l-muted"}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Thermometer className={`h-4 w-4 ${apiStatus.weather.connected ? 'text-success' : 'text-muted-foreground'}`} />
                            <span className="font-semibold">OpenWeather API</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Route weather conditions</p>
                        </div>
                        <Badge variant={apiStatus.weather.connected ? "default" : "secondary"} className={apiStatus.weather.connected ? "bg-success" : ""}>
                          {apiStatus.weather.connected ? (
                            <><CheckCircle className="h-3 w-3 mr-1" /> Connected</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" /> Not Connected</>
                          )}
                        </Badge>
                      </div>
                      <div className="mt-3 flex gap-2">
                        {apiStatus.weather.connected ? (
                          <>
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => openConfigDialog('weather')}>
                              <Settings className="h-3 w-3 mr-1" /> Configure
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleRemoveApiKey('weather')}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline" className="w-full" onClick={() => openConfigDialog('weather')}>
                            <Plus className="h-3 w-3 mr-1" /> Connect API
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Fuel Price API */}
                  <Card className={`border-l-4 ${apiStatus.fuel.connected ? "border-l-success" : "border-l-muted"}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Fuel className={`h-4 w-4 ${apiStatus.fuel.connected ? 'text-success' : 'text-muted-foreground'}`} />
                            <span className="font-semibold">Fuel Price API</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Live fuel prices in Kenya</p>
                        </div>
                        <Badge variant={apiStatus.fuel.connected ? "default" : "secondary"} className={apiStatus.fuel.connected ? "bg-success" : ""}>
                          {apiStatus.fuel.connected ? (
                            <><CheckCircle className="h-3 w-3 mr-1" /> Connected</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" /> Not Connected</>
                          )}
                        </Badge>
                      </div>
                      <div className="mt-3 flex gap-2">
                        {apiStatus.fuel.connected ? (
                          <>
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => openConfigDialog('fuel')}>
                              <Settings className="h-3 w-3 mr-1" /> Configure
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleRemoveApiKey('fuel')}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline" className="w-full" onClick={() => openConfigDialog('fuel')}>
                            <Plus className="h-3 w-3 mr-1" /> Connect API
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg mt-6">
                  <h4 className="font-semibold mb-2">Analytics Data Sources</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Analytics dashboards pull data from your connected Lovable Cloud database including:
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <strong>Vehicles:</strong> Fleet status, locations, maintenance schedules</li>
                    <li>• <strong>Trips:</strong> Route performance, on-time delivery rates</li>
                    <li>• <strong>Fuel Logs:</strong> Consumption tracking, cost analysis</li>
                    <li>• <strong>Maintenance Logs:</strong> Service history, cost breakdowns</li>
                    <li>• <strong>Drivers:</strong> Performance scores, behavior metrics</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vehicle Types Tab */}
        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Types</CardTitle>
              <CardDescription>Manage the types of vehicles in your fleet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={addVehicleType} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="vehicle-type-name">Type Name *</Label>
                  <Input
                    id="vehicle-type-name"
                    name="vehicle_type_name"
                    value={newVehicleType.name}
                    onChange={(e) => setNewVehicleType({ ...newVehicleType, name: e.target.value })}
                    placeholder="e.g., Truck - 15 Ton"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle-type-description">Description</Label>
                  <Input
                    id="vehicle-type-description"
                    name="vehicle_type_description"
                    value={newVehicleType.description}
                    onChange={(e) => setNewVehicleType({ ...newVehicleType, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Type
                  </Button>
                </div>
              </form>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicleTypes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        No vehicle types found. Add one above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    vehicleTypes.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell className="font-medium">{type.name}</TableCell>
                        <TableCell>{type.description || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => deleteVehicleType(type.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Routes Tab */}
        <TabsContent value="routes">
          <Card>
            <CardHeader>
              <CardTitle>Routes</CardTitle>
              <CardDescription>Manage the routes your fleet operates on</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={addRoute} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="route-name">Route Name *</Label>
                  <Input
                    id="route-name"
                    name="route_name"
                    value={newRoute.name}
                    onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                    placeholder="e.g., Nairobi-Mombasa"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="route-start">Start Location *</Label>
                  <Input
                    id="route-start"
                    name="route_start_location"
                    value={newRoute.start_location}
                    onChange={(e) => setNewRoute({ ...newRoute, start_location: e.target.value })}
                    placeholder="e.g., Nairobi"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="route-end">End Location *</Label>
                  <Input
                    id="route-end"
                    name="route_end_location"
                    value={newRoute.end_location}
                    onChange={(e) => setNewRoute({ ...newRoute, end_location: e.target.value })}
                    placeholder="e.g., Mombasa"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="route-distance">Distance (km)</Label>
                  <Input
                    id="route-distance"
                    name="route_distance"
                    type="number"
                    value={newRoute.distance_km}
                    onChange={(e) => setNewRoute({ ...newRoute, distance_km: e.target.value })}
                    placeholder="480"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Route
                  </Button>
                </div>
              </form>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route Name</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No routes found. Add one above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    routes.map((route) => (
                      <TableRow key={route.id}>
                        <TableCell className="font-medium">{route.name}</TableCell>
                        <TableCell>{route.start_location}</TableCell>
                        <TableCell>{route.end_location}</TableCell>
                        <TableCell>{route.distance_km ? `${route.distance_km} km` : "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => deleteRoute(route.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* API Configuration Dialog */}
      <Dialog open={configDialog.open} onOpenChange={(open) => setConfigDialog({ open, type: open ? configDialog.type : null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{configDialog.type && getApiDialogInfo().title}</DialogTitle>
            <DialogDescription>
              {configDialog.type && getApiDialogInfo().description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showTokens[configDialog.type || ''] ? "text" : "password"}
                  placeholder={configDialog.type ? getApiDialogInfo().placeholder : ''}
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowTokens(prev => ({ ...prev, [configDialog.type || '']: !prev[configDialog.type || ''] }))}
                >
                  {showTokens[configDialog.type || ''] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {configDialog.type && getApiDialogInfo().helpText}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setConfigDialog({ open: false, type: null })}>
                Cancel
              </Button>
              <Button 
                onClick={() => configDialog.type && handleSaveApiKey(configDialog.type)}
                disabled={savingKey === configDialog.type}
              >
                <Save className="h-4 w-4 mr-2" />
                Save API Key
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
