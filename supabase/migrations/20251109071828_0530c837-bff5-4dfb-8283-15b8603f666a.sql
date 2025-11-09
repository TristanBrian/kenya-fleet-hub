-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  mobile_phone TEXT,
  role TEXT NOT NULL DEFAULT 'driver' CHECK (role IN ('manager', 'driver')),
  base_station TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Allow profile creation on signup"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_plate TEXT NOT NULL UNIQUE,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('matatu', 'truck', 'bus')),
  route_assigned TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
  last_service_date DATE,
  insurance_expiry DATE,
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  last_location_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Only add manager policy for now, driver policy will be added after drivers table exists
CREATE POLICY "Managers can view all vehicles"
  ON public.vehicles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

-- Create drivers table
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  license_number TEXT NOT NULL UNIQUE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  performance_score INTEGER DEFAULT 100 CHECK (performance_score >= 0 AND performance_score <= 100),
  total_trips INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can view all drivers"
  ON public.drivers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "Drivers can view their own record"
  ON public.drivers FOR SELECT
  USING (user_id = auth.uid());

-- Now add the driver policy for vehicles
CREATE POLICY "Drivers can view assigned vehicles"
  ON public.vehicles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.drivers
      WHERE user_id = auth.uid() AND vehicle_id = vehicles.id
    )
  );

-- Create kenyan_routes table
CREATE TABLE public.kenyan_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name TEXT NOT NULL UNIQUE,
  start_city TEXT NOT NULL,
  end_city TEXT NOT NULL,
  distance_km DECIMAL(10, 2) NOT NULL,
  typical_duration_hours DECIMAL(5, 2) NOT NULL,
  common_challenges TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.kenyan_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view routes"
  ON public.kenyan_routes FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Create maintenance_logs table
CREATE TABLE public.maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  description TEXT,
  date_performed DATE NOT NULL DEFAULT CURRENT_DATE,
  cost_kes DECIMAL(10, 2) NOT NULL,
  next_due_date DATE,
  performed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can view all maintenance logs"
  ON public.maintenance_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "Managers can insert maintenance logs"
  ON public.maintenance_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

-- Create fuel_logs table
CREATE TABLE public.fuel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  liters DECIMAL(10, 2) NOT NULL,
  price_per_liter_kes DECIMAL(10, 2) NOT NULL,
  total_cost_kes DECIMAL(10, 2) GENERATED ALWAYS AS (liters * price_per_liter_kes) STORED,
  station_location TEXT,
  route TEXT,
  odometer_reading INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.fuel_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can view all fuel logs"
  ON public.fuel_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "Drivers can view their fuel logs"
  ON public.fuel_logs FOR SELECT
  USING (
    driver_id IN (
      SELECT id FROM public.drivers WHERE user_id = auth.uid()
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample Kenyan routes
INSERT INTO public.kenyan_routes (route_name, start_city, end_city, distance_km, typical_duration_hours, common_challenges)
VALUES
  ('Mombasa-Nairobi Highway', 'Mombasa', 'Nairobi', 483.5, 6.5, ARRAY['Police checkpoints', 'Heavy traffic at Mtito Andei', 'Wildlife crossings']),
  ('Nairobi-Nakuru', 'Nairobi', 'Nakuru', 157.3, 2.5, ARRAY['Narrow sections', 'Fog in escarpment', 'Market day traffic']),
  ('Nakuru-Eldoret', 'Nakuru', 'Eldoret', 158.2, 3.0, ARRAY['Steep gradients', 'Livestock on road', 'Weather conditions']),
  ('Nairobi-Kisumu', 'Nairobi', 'Kisumu', 349.8, 5.5, ARRAY['Road construction', 'Checkpoint delays', 'Night driving hazards']),
  ('Thika Super Highway', 'Nairobi', 'Thika', 50.4, 0.75, ARRAY['Speed cameras', 'Rush hour congestion', 'Toll collection']);

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'driver')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();