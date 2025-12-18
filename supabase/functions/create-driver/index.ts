import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateDriverRequest {
  email: string;
  full_name: string;
  mobile_phone: string;
  license_number: string;
  vehicle_id?: string;
}

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

    const { email, full_name, mobile_phone, license_number, vehicle_id }: CreateDriverRequest = await req.json();

    // Generate a random password
    const password = `Driver${Math.random().toString(36).slice(-8)}!`;

    console.log(`Creating driver account for ${email}`);

    // Create the auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: "driver" },
    });

    if (authError) {
      console.error("Auth error:", authError);
      throw authError;
    }

    const userId = authData.user.id;
    console.log(`User created with ID: ${userId}`);

    // Update profile with mobile phone
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ mobile_phone, base_station: "Nairobi" })
      .eq("id", userId);

    if (profileError) {
      console.error("Profile update error:", profileError);
    }

    // Add driver role to user_roles table
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "driver" });

    if (roleError) {
      console.error("Role insert error:", roleError);
    }

    // Create driver record
    const { data: driverData, error: driverError } = await supabaseAdmin
      .from("drivers")
      .insert({
        user_id: userId,
        license_number,
        vehicle_id: vehicle_id || null,
        performance_score: 100,
        total_trips: 0,
      })
      .select()
      .single();

    if (driverError) {
      console.error("Driver insert error:", driverError);
      throw driverError;
    }

    console.log(`Driver record created: ${driverData.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        driver_id: driverData.id,
        credentials: { email, password },
        message: "Driver account created successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Error creating driver:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
