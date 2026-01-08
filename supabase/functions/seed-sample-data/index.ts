import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    console.log("Starting sample data seeding...");

    // Sample vehicles data
    const vehicles = [
      {
        license_plate: "KBC 234Y",
        vehicle_type: "matatu",
        model: "Toyota Hiace",
        route_assigned: "Nairobi-Mombasa",
        status: "active",
        current_latitude: -1.2921,
        current_longitude: 36.8219,
        last_service_date: "2024-11-15",
        next_service_due: "2025-02-15",
        insurance_expiry: "2025-06-30",
        fuel_efficiency_kml: 6.5,
        monthly_fuel_consumption_liters: 1200,
        maintenance_status: "good",
      },
      {
        license_plate: "KDA 567B",
        vehicle_type: "truck",
        model: "Isuzu NPR",
        route_assigned: "Nairobi-Nakuru",
        status: "maintenance",
        current_latitude: -0.3031,
        current_longitude: 36.0800,
        last_service_date: "2024-10-20",
        next_service_due: "2025-01-20",
        insurance_expiry: "2025-05-15",
        fuel_efficiency_kml: 5.8,
        monthly_fuel_consumption_liters: 1800,
        maintenance_status: "due_soon",
      },
      {
        license_plate: "KBM 890C",
        vehicle_type: "matatu",
        model: "Nissan Urvan",
        route_assigned: "Thika Highway",
        status: "active",
        current_latitude: -1.0333,
        current_longitude: 37.0833,
        last_service_date: "2024-12-01",
        next_service_due: "2025-03-01",
        insurance_expiry: "2025-07-20",
        fuel_efficiency_kml: 7.2,
        monthly_fuel_consumption_liters: 950,
        maintenance_status: "good",
      },
      {
        license_plate: "KCA 123D",
        vehicle_type: "bus",
        model: "Scania K270",
        route_assigned: "Nairobi-Kisumu",
        status: "active",
        current_latitude: -0.0917,
        current_longitude: 34.7680,
        last_service_date: "2024-11-10",
        next_service_due: "2025-02-10",
        insurance_expiry: "2025-08-10",
        fuel_efficiency_kml: 4.5,
        monthly_fuel_consumption_liters: 2500,
        maintenance_status: "good",
      },
      {
        license_plate: "KAB 456E",
        vehicle_type: "truck",
        model: "Mercedes-Benz Actros",
        route_assigned: "Nairobi-Mombasa",
        status: "active",
        current_latitude: -2.7833,
        current_longitude: 38.2333,
        last_service_date: "2024-10-05",
        next_service_due: "2025-01-05",
        insurance_expiry: "2025-04-30",
        fuel_efficiency_kml: 6.0,
        monthly_fuel_consumption_liters: 2000,
        maintenance_status: "good",
      },
    ];

    // Insert vehicles
    const vehicleResults = [];
    for (const vehicle of vehicles) {
      const { data, error } = await supabaseAdmin
        .from("vehicles")
        .upsert(vehicle, { onConflict: "license_plate" })
        .select()
        .single();

      if (error && !error.message.includes("duplicate")) {
        console.error(`Error inserting vehicle ${vehicle.license_plate}:`, error);
      } else {
        vehicleResults.push(data);
      }
    }

    console.log(`Inserted ${vehicleResults.length} vehicles`);

    // Get existing drivers or create sample drivers
    const { data: existingDrivers } = await supabaseAdmin
      .from("drivers")
      .select("id, user_id")
      .limit(10);

    // Sample maintenance logs
    const maintenanceLogs = [
      {
        vehicle_id: vehicleResults[0]?.id,
        service_type: "Oil Change",
        description: "Regular oil change and filter replacement",
        date_performed: "2024-11-15",
        cost_kes: 8500,
        next_due_date: "2025-02-15",
        performed_by: "AutoCare Nairobi",
      },
      {
        vehicle_id: vehicleResults[1]?.id,
        service_type: "Major Service",
        description: "Full service including brakes, transmission, and engine check",
        date_performed: "2024-10-20",
        cost_kes: 45000,
        next_due_date: "2025-01-20",
        performed_by: "Kenya Motors",
      },
      {
        vehicle_id: vehicleResults[2]?.id,
        service_type: "Tire Replacement",
        description: "Replaced 4 tires",
        date_performed: "2024-12-01",
        cost_kes: 120000,
        next_due_date: "2025-06-01",
        performed_by: "Tire Center Thika",
      },
    ];

    // Insert maintenance logs
    for (const log of maintenanceLogs) {
      if (log.vehicle_id) {
        await supabaseAdmin.from("maintenance_logs").insert(log);
      }
    }

    console.log(`Inserted ${maintenanceLogs.length} maintenance logs`);

    // Sample fuel logs
    const fuelLogs = [
      {
        vehicle_id: vehicleResults[0]?.id,
        driver_id: existingDrivers?.[0]?.id,
        liters: 50,
        price_per_liter_kes: 185,
        station_location: "Shell Mombasa Road",
        route: "Nairobi-Mombasa",
        odometer_reading: 125000,
      },
      {
        vehicle_id: vehicleResults[1]?.id,
        driver_id: existingDrivers?.[1]?.id,
        liters: 80,
        price_per_liter_kes: 185,
        station_location: "Total Nakuru",
        route: "Nairobi-Nakuru",
        odometer_reading: 98000,
      },
      {
        vehicle_id: vehicleResults[2]?.id,
        driver_id: existingDrivers?.[0]?.id,
        liters: 40,
        price_per_liter_kes: 185,
        station_location: "Kobil Thika",
        route: "Thika Highway",
        odometer_reading: 75000,
      },
    ];

    // Insert fuel logs
    for (const log of fuelLogs) {
      if (log.vehicle_id) {
        await supabaseAdmin.from("fuel_logs").insert(log);
      }
    }

    console.log(`Inserted ${fuelLogs.length} fuel logs`);

    // Sample trips
    const trips = [
      {
        vehicle_id: vehicleResults[0]?.id,
        driver_id: existingDrivers?.[0]?.id,
        route: "Nairobi-Mombasa",
        start_location: "Nairobi",
        end_location: "Mombasa",
        start_time: new Date().toISOString(),
        estimated_duration_hours: 6.5,
        distance_km: 483.5,
        status: "in_progress",
        progress_percent: 45,
        fuel_used: 75,
      },
      {
        vehicle_id: vehicleResults[2]?.id,
        driver_id: existingDrivers?.[0]?.id,
        route: "Thika Highway",
        start_location: "Nairobi",
        end_location: "Thika",
        start_time: new Date(Date.now() - 3600000).toISOString(),
        end_time: new Date().toISOString(),
        estimated_duration_hours: 0.75,
        distance_km: 50.4,
        status: "completed",
        progress_percent: 100,
        fuel_used: 7,
      },
    ];

    // Insert trips
    for (const trip of trips) {
      if (trip.vehicle_id) {
        await supabaseAdmin.from("trips").insert(trip);
      }
    }

    console.log(`Inserted ${trips.length} trips`);

    // Sample driver behavior events
    if (existingDrivers && existingDrivers.length > 0) {
      const behaviorEvents = [
        {
          driver_id: existingDrivers[0].id,
          vehicle_id: vehicleResults[0]?.id,
          event_type: "speeding",
          severity: "medium",
          description: "Exceeded speed limit by 15 km/h",
          location_latitude: -1.5167,
          location_longitude: 37.2667,
          speed_kmh: 115,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          driver_id: existingDrivers[0].id,
          vehicle_id: vehicleResults[0]?.id,
          event_type: "harsh_braking",
          severity: "high",
          description: "Sudden brake application",
          location_latitude: -2.0833,
          location_longitude: 37.6500,
          speed_kmh: 80,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          driver_id: existingDrivers[1]?.id,
          vehicle_id: vehicleResults[1]?.id,
          event_type: "excessive_idling",
          severity: "low",
          description: "Vehicle idling for 15 minutes",
          location_latitude: -0.3031,
          location_longitude: 36.0800,
          speed_kmh: 0,
          timestamp: new Date(Date.now() - 1800000).toISOString(),
        },
      ];

      // Insert behavior events
      for (const event of behaviorEvents) {
        if (event.driver_id && event.vehicle_id) {
          await supabaseAdmin.from("driver_behavior_events").insert(event);
        }
      }

      console.log(`Inserted ${behaviorEvents.length} behavior events`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Sample data seeded successfully",
        summary: {
          vehicles: vehicleResults.length,
          maintenance_logs: maintenanceLogs.length,
          fuel_logs: fuelLogs.length,
          trips: trips.length,
          behavior_events: (existingDrivers?.length ?? 0) > 0 ? 3 : 0,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error seeding data:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

