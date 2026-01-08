import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Vehicle {
  id: string;
  license_plate: string;
  vehicle_type: string;
  route_assigned: string | null;
  status: string;
  current_latitude: number | null;
  current_longitude: number | null;
}

interface KenyaFleetMapProps {
  vehicles: Vehicle[];
}

const KenyaFleetMap = ({ vehicles }: KenyaFleetMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  
  // Get token from environment variable first, then localStorage as fallback
  const envToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
  const storedToken = localStorage.getItem('mapbox_token') || '';
  const initialToken = envToken || storedToken;
  
  const [mapboxToken, setMapboxToken] = useState<string>(initialToken);
  const [tokenInput, setTokenInput] = useState('');
  const [isConfigured, setIsConfigured] = useState(!!initialToken);

  useEffect(() => {
    // Update token if environment variable is set
    if (envToken && envToken !== mapboxToken) {
      setMapboxToken(envToken);
      setIsConfigured(true);
    } else if (mapboxToken) {
      setIsConfigured(true);
    }
  }, [envToken, mapboxToken]);

  const handleSaveToken = () => {
    if (tokenInput.trim()) {
      // Save to localStorage as fallback (only if env var not set)
      if (!envToken) {
        localStorage.setItem('mapbox_token', tokenInput.trim());
      }
      setMapboxToken(tokenInput.trim());
      setIsConfigured(true);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !isConfigured || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [37.9062, -0.0236], // Center of Kenya
        zoom: 6,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [isConfigured, mapboxToken]);

  // Update markers when vehicles change
  useEffect(() => {
    if (!map.current || !isConfigured) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers for vehicles with coordinates
    vehicles.forEach(vehicle => {
      if (vehicle.current_latitude && vehicle.current_longitude) {
        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'vehicle-marker';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontSize = '18px';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        
        // Color based on status
        if (vehicle.status === 'active') {
          el.style.backgroundColor = '#10b981'; // success green
        } else if (vehicle.status === 'maintenance') {
          el.style.backgroundColor = '#f59e0b'; // warning yellow
        } else {
          el.style.backgroundColor = '#6b7280'; // gray
        }
        
        el.innerHTML = '🚛';

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${vehicle.license_plate}</h3>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Type:</strong> ${vehicle.vehicle_type}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Route:</strong> ${vehicle.route_assigned || 'Not assigned'}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Status:</strong> <span style="color: ${vehicle.status === 'active' ? '#10b981' : '#f59e0b'}; text-transform: capitalize;">${vehicle.status}</span></p>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">Lat: ${vehicle.current_latitude.toFixed(4)}, Lng: ${vehicle.current_longitude.toFixed(4)}</p>
          </div>
        `);

        // Create and add marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat([vehicle.current_longitude, vehicle.current_latitude])
          .setPopup(popup)
          .addTo(map.current!);

        markers.current.push(marker);
      }
    });
  }, [vehicles, isConfigured]);

  if (!isConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configure Mapbox</CardTitle>
          <CardDescription>
            Mapbox access token is required to enable live tracking map
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {envToken ? (
              <div className="p-3 bg-success/10 border border-success/20 rounded-md">
                <p className="text-sm text-success font-medium">
                  ✓ Using Mapbox token from environment variable
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Token configured via VITE_MAPBOX_ACCESS_TOKEN
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  <strong>Option 1 (Recommended):</strong> Set <code className="bg-muted px-1 py-0.5 rounded">VITE_MAPBOX_ACCESS_TOKEN</code> in your <code className="bg-muted px-1 py-0.5 rounded">.env</code> file
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Option 2:</strong> Enter your Mapbox public token below. Get your free token from{' '}
                  <a
                    href="https://account.mapbox.com/access-tokens/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Mapbox Dashboard
                  </a>
                </p>
                <div className="flex gap-2">
                  <Input
                    id="mapbox-token-input"
                    name="mapbox_token"
                    type="text"
                    placeholder="pk.eyJ1..."
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSaveToken}>Save Token</Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default KenyaFleetMap;