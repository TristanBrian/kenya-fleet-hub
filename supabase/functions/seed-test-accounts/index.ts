import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestAccount {
  email: string;
  password: string;
  full_name: string;
  role: 'fleet_manager' | 'operations' | 'driver' | 'finance';
}

const testAccounts: TestAccount[] = [
  { email: "manager@safirismart.co.ke", password: "Manager2024!", full_name: "Fleet Manager", role: "fleet_manager" },
  { email: "operations@safirismart.co.ke", password: "Ops2024!", full_name: "Operations Team", role: "operations" },
  { email: "john.kamau@safirismart.co.ke", password: "Driver2024!", full_name: "John Kamau", role: "driver" },
  { email: "finance@safirismart.co.ke", password: "Finance2024!", full_name: "Finance Team", role: "finance" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting test account seeding...");
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results = [];

    for (const account of testAccounts) {
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users.find(u => u.email === account.email);

      if (existingUser) {
        // Reset password to the known demo password so quick-login always works
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password: account.password,
        });
        if (updateError) {
          console.error(`Failed to reset password for ${account.email}:`, updateError);
        }

        // Ensure user_roles entry exists
        const { data: roleExists } = await supabaseAdmin
          .from("user_roles")
          .select("id")
          .eq("user_id", existingUser.id)
          .eq("role", account.role)
          .maybeSingle();

        if (!roleExists) {
          await supabaseAdmin.from("user_roles").insert({ user_id: existingUser.id, role: account.role });
        }

        // Ensure driver record exists for driver accounts
        if (account.role === "driver") {
          const { data: driverExists } = await supabaseAdmin
            .from("drivers")
            .select("id")
            .eq("user_id", existingUser.id)
            .maybeSingle();

          if (!driverExists) {
            await supabaseAdmin.from("drivers").insert({
              user_id: existingUser.id,
              license_number: "DL-JK" + Math.floor(Math.random() * 100000),
              performance_score: 85,
              total_trips: 12,
              vehicle_id: null,
            });
          }
        }

        results.push({ email: account.email, status: "already_exists" });
        continue;
      }

      // Create the user
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: { full_name: account.full_name, role: account.role },
      });

      if (authError) {
        results.push({ email: account.email, status: "error", error: authError.message });
        continue;
      }

      if (!authUser.user) {
        results.push({ email: account.email, status: "error", error: "User creation failed" });
        continue;
      }

      // Create profile (handle duplicate gracefully)
      await supabaseAdmin
        .from("profiles")
        .upsert({ id: authUser.user.id, full_name: account.full_name, role: account.role }, { onConflict: "id" });

      // Insert role into user_roles table
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: authUser.user.id, role: account.role }, { onConflict: "user_id,role" });

      // Create driver record if role is driver
      if (account.role === "driver") {
        await supabaseAdmin.from("drivers").insert({
          user_id: authUser.user.id,
          license_number: "DL-JK" + Math.floor(Math.random() * 100000),
          performance_score: 85,
          total_trips: 12,
          vehicle_id: null,
        });
      }

      results.push({ email: account.email, status: "created", user_id: authUser.user.id });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Test accounts seeded successfully", results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
