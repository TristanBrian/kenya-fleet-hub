import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useRole } from '@/hooks/useRole';

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
  const navigate = useNavigate();
  const { isFleetManager } = useRole();
  
  // Helper to check if token is a valid PUBLIC token (must start with pk.)
  const isValidPublicToken = (token: string) => token && token.startsWith('pk.');

  // Get token from environment variable first, then localStorage as fallback
  const envToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
  const storedToken = localStorage.getItem('mapbox_token') || '';
  
  // Only use tokens that are valid public tokens
  const validEnvToken = isValidPublicToken(envToken) ? envToken : '';
  const validStoredToken = isValidPublicToken(storedToken) ? storedToken : '';
  const initialToken = validEnvToken || validStoredToken;
  
  const [mapboxToken, setMapboxToken] = useState<string>(initialToken);
  const [isConfigured, setIsConfigured] = useState(!!initialToken);

  useEffect(() => {
    // Re-check localStorage for token changes (from Settings page)
    const checkToken = () => {
      const currentStoredToken = localStorage.getItem('mapbox_token') || '';
      const currentEnvToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
      const validCurrent = isValidPublicToken(currentEnvToken) ? currentEnvToken : 
                          isValidPublicToken(currentStoredToken) ? currentStoredToken : '';
      
      if (validCurrent && validCurrent !== mapboxToken) {
        setMapboxToken(validCurrent);
        setIsConfigured(true);
      } else if (!validCurrent) {
        setIsConfigured(false);
      }
    };

    // Check immediately and set up interval
    checkToken();
    const interval = setInterval(checkToken, 1000);
    
    return () => clearInterval(interval);
  }, [mapboxToken]);

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
          el.style.backgroundColor = 'hsl(142, 76%, 36%)'; // success green
        } else if (vehicle.status === 'maintenance') {
          el.style.backgroundColor = 'hsl(43, 96%, 56%)'; // warning yellow
        } else {
          el.style.backgroundColor = 'hsl(0, 0%, 45%)'; // gray
        }
        
        el.innerHTML = '🚛';

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${vehicle.license_plate}</h3>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Type:</strong> ${vehicle.vehicle_type}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Route:</strong> ${vehicle.route_assigned || 'Not assigned'}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Status:</strong> <span style="color: ${vehicle.status === 'active' ? 'hsl(142, 76%, 36%)' : 'hsl(43, 96%, 56%)'}; text-transform: capitalize;">${vehicle.status}</span></p>
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
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
        <MapPin className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Map Not Configured</h3>
        <p className="text-sm text-muted-foreground text-center max-w-xs mb-4">
          {isFleetManager 
            ? "Configure your Mapbox API token in Settings to enable live fleet tracking."
            : "The fleet map has not been configured yet. Please contact your Fleet Manager."}
        </p>
        {isFleetManager && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/settings')}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Go to Settings
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default KenyaFleetMap;
