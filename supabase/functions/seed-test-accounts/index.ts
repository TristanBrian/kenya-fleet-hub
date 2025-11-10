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
  {
    email: "manager@safirismart.co.ke",
    password: "Manager2024!",
    full_name: "Fleet Manager",
    role: "fleet_manager"
  },
  {
    email: "operations@safirismart.co.ke",
    password: "Ops2024!",
    full_name: "Operations Team",
    role: "operations"
  },
  {
    email: "john.kamau@safirismart.co.ke",
    password: "Driver2024!",
    full_name: "John Kamau",
    role: "driver"
  },
  {
    email: "finance@safirismart.co.ke",
    password: "Finance2024!",
    full_name: "Finance Team",
    role: "finance"
  }
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const results = [];

    for (const account of testAccounts) {
      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
      const userExists = existingUser?.users.some(u => u.email === account.email);

      if (userExists) {
        results.push({ email: account.email, status: "already_exists" });
        continue;
      }

      // Create the user
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          full_name: account.full_name,
          role: account.role
        }
      });

      if (authError) {
        results.push({ email: account.email, status: "error", error: authError.message });
        continue;
      }

      if (!authUser.user) {
        results.push({ email: account.email, status: "error", error: "User creation failed" });
        continue;
      }

      // Insert role into user_roles table
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: authUser.user.id,
          role: account.role
        });

      if (roleError) {
        results.push({ email: account.email, status: "error", error: roleError.message });
        continue;
      }

      // Create driver record if role is driver
      if (account.role === "driver") {
        const { error: driverError } = await supabaseAdmin
          .from("drivers")
          .insert({
            user_id: authUser.user.id,
            license_number: "DL-" + Math.floor(Math.random() * 100000),
            performance_score: 85,
            total_trips: 0
          });

        if (driverError) {
          console.error("Error creating driver record:", driverError);
        }
      }

      results.push({ email: account.email, status: "created", user_id: authUser.user.id });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Test accounts seeded successfully",
        results 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
