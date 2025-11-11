import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Kenyan coordinates for major routes
    const routes = {
      'Nairobi-Mombasa': [
        { lat: -1.2921, lng: 36.8219, city: 'Nairobi' },
        { lat: -1.5167, lng: 37.2667, city: 'Athi River' },
        { lat: -2.0833, lng: 37.6500, city: 'Mtito Andei' },
        { lat: -2.7833, lng: 38.2333, city: 'Voi' },
        { lat: -3.9833, lng: 39.6667, city: 'Mariakani' },
        { lat: -4.0435, lng: 39.6682, city: 'Mombasa' },
      ],
      'Nairobi-Nakuru': [
        { lat: -1.2921, lng: 36.8219, city: 'Nairobi' },
        { lat: -1.1027, lng: 36.9667, city: 'Limuru' },
        { lat: -0.7167, lng: 36.4333, city: 'Naivasha' },
        { lat: -0.3031, lng: 36.0800, city: 'Nakuru' },
      ],
      'Thika Highway': [
        { lat: -1.2921, lng: 36.8219, city: 'Nairobi' },
        { lat: -1.1694, lng: 36.9667, city: 'Ruiru' },
        { lat: -1.0395, lng: 37.0694, city: 'Juja' },
        { lat: -1.0333, lng: 37.0833, city: 'Thika' },
      ],
      'Nairobi-Kisumu': [
        { lat: -1.2921, lng: 36.8219, city: 'Nairobi' },
        { lat: -1.1027, lng: 36.9667, city: 'Limuru' },
        { lat: -0.3031, lng: 36.0800, city: 'Nakuru' },
        { lat: -0.0917, lng: 34.7680, city: 'Kisumu' },
      ],
    };

    // Get all active vehicles
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('id, license_plate, route_assigned, current_latitude, current_longitude')
      .eq('status', 'active');

    if (vehiclesError) throw vehiclesError;

    const updates = [];

    for (const vehicle of vehicles || []) {
      const route = vehicle.route_assigned as keyof typeof routes;
      
      if (!route || !routes[route]) continue;

      const routePoints = routes[route];
      
      // Get current position or start at beginning
      let currentIndex = 0;
      if (vehicle.current_latitude && vehicle.current_longitude) {
        // Find closest point on route
        let minDist = Infinity;
        routePoints.forEach((point, idx) => {
          const dist = Math.sqrt(
            Math.pow(point.lat - vehicle.current_latitude!, 2) +
            Math.pow(point.lng - vehicle.current_longitude!, 2)
          );
          if (dist < minDist) {
            minDist = dist;
            currentIndex = idx;
          }
        });
      }

      // Move to next point (simulate movement)
      const nextIndex = (currentIndex + 1) % routePoints.length;
      const nextPoint = routePoints[nextIndex];

      // Add some randomness for realistic movement
      const latOffset = (Math.random() - 0.5) * 0.01;
      const lngOffset = (Math.random() - 0.5) * 0.01;

      updates.push({
        id: vehicle.id,
        current_latitude: nextPoint.lat + latOffset,
        current_longitude: nextPoint.lng + lngOffset,
        last_location_update: new Date().toISOString(),
      });
    }

    // Batch update all vehicle locations
    for (const update of updates) {
      await supabase
        .from('vehicles')
        .update({
          current_latitude: update.current_latitude,
          current_longitude: update.current_longitude,
          last_location_update: update.last_location_update,
        })
        .eq('id', update.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        updated: updates.length,
        message: `Updated ${updates.length} vehicle locations` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});