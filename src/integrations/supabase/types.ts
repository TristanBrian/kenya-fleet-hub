export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      drivers: {
        Row: {
          created_at: string
          harsh_braking_events: number | null
          id: string
          idle_time_hours: number | null
          license_number: string
          performance_score: number | null
          speeding_incidents: number | null
          total_trips: number | null
          updated_at: string
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          harsh_braking_events?: number | null
          id?: string
          idle_time_hours?: number | null
          license_number: string
          performance_score?: number | null
          speeding_incidents?: number | null
          total_trips?: number | null
          updated_at?: string
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          harsh_braking_events?: number | null
          id?: string
          idle_time_hours?: number | null
          license_number?: string
          performance_score?: number | null
          speeding_incidents?: number | null
          total_trips?: number | null
          updated_at?: string
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_logs: {
        Row: {
          created_at: string
          driver_id: string | null
          id: string
          liters: number
          odometer_reading: number | null
          price_per_liter_kes: number
          route: string | null
          station_location: string | null
          total_cost_kes: number | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          driver_id?: string | null
          id?: string
          liters: number
          odometer_reading?: number | null
          price_per_liter_kes: number
          route?: string | null
          station_location?: string | null
          total_cost_kes?: number | null
          vehicle_id: string
        }
        Update: {
          created_at?: string
          driver_id?: string | null
          id?: string
          liters?: number
          odometer_reading?: number | null
          price_per_liter_kes?: number
          route?: string | null
          station_location?: string | null
          total_cost_kes?: number | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fuel_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      kenyan_routes: {
        Row: {
          common_challenges: string[] | null
          created_at: string
          distance_km: number
          end_city: string
          id: string
          route_name: string
          start_city: string
          typical_duration_hours: number
        }
        Insert: {
          common_challenges?: string[] | null
          created_at?: string
          distance_km: number
          end_city: string
          id?: string
          route_name: string
          start_city: string
          typical_duration_hours: number
        }
        Update: {
          common_challenges?: string[] | null
          created_at?: string
          distance_km?: number
          end_city?: string
          id?: string
          route_name?: string
          start_city?: string
          typical_duration_hours?: number
        }
        Relationships: []
      }
      live_locations: {
        Row: {
          created_at: string | null
          heading: number | null
          id: string
          latitude: number
          longitude: number
          speed_kmh: number | null
          timestamp: string | null
          trip_id: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          speed_kmh?: number | null
          timestamp?: string | null
          trip_id?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          speed_kmh?: number | null
          timestamp?: string | null
          trip_id?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_locations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_locations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_logs: {
        Row: {
          cost_kes: number
          created_at: string
          date_performed: string
          description: string | null
          id: string
          next_due_date: string | null
          performed_by: string | null
          service_type: string
          vehicle_id: string
        }
        Insert: {
          cost_kes: number
          created_at?: string
          date_performed?: string
          description?: string | null
          id?: string
          next_due_date?: string | null
          performed_by?: string | null
          service_type: string
          vehicle_id: string
        }
        Update: {
          cost_kes?: number
          created_at?: string
          date_performed?: string
          description?: string | null
          id?: string
          next_due_date?: string | null
          performed_by?: string | null
          service_type?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          base_station: string | null
          created_at: string
          full_name: string
          id: string
          mobile_phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          base_station?: string | null
          created_at?: string
          full_name: string
          id: string
          mobile_phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          base_station?: string | null
          created_at?: string
          full_name?: string
          id?: string
          mobile_phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      routes_master: {
        Row: {
          created_at: string | null
          distance_km: number | null
          end_location: string
          id: string
          name: string
          start_location: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          distance_km?: number | null
          end_location: string
          id?: string
          name: string
          start_location: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          distance_km?: number | null
          end_location?: string
          id?: string
          name?: string
          start_location?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      trips: {
        Row: {
          created_at: string | null
          distance_km: number | null
          driver_id: string | null
          end_location: string
          end_time: string | null
          estimated_duration_hours: number | null
          id: string
          progress_percent: number | null
          route: string
          start_location: string
          start_time: string
          status: string
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          distance_km?: number | null
          driver_id?: string | null
          end_location: string
          end_time?: string | null
          estimated_duration_hours?: number | null
          id?: string
          progress_percent?: number | null
          route: string
          start_location: string
          start_time: string
          status?: string
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          distance_km?: number | null
          driver_id?: string | null
          end_location?: string
          end_time?: string | null
          estimated_duration_hours?: number | null
          id?: string
          progress_percent?: number | null
          route?: string
          start_location?: string
          start_time?: string
          status?: string
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          created_at: string
          current_latitude: number | null
          current_longitude: number | null
          fuel_efficiency_kml: number | null
          id: string
          insurance_expiry: string | null
          last_location_update: string | null
          last_service_date: string | null
          license_plate: string
          maintenance_status: string | null
          monthly_fuel_consumption_liters: number | null
          route_assigned: string | null
          status: string
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          created_at?: string
          current_latitude?: number | null
          current_longitude?: number | null
          fuel_efficiency_kml?: number | null
          id?: string
          insurance_expiry?: string | null
          last_location_update?: string | null
          last_service_date?: string | null
          license_plate: string
          maintenance_status?: string | null
          monthly_fuel_consumption_liters?: number | null
          route_assigned?: string | null
          status?: string
          updated_at?: string
          vehicle_type: string
        }
        Update: {
          created_at?: string
          current_latitude?: number | null
          current_longitude?: number | null
          fuel_efficiency_kml?: number | null
          id?: string
          insurance_expiry?: string | null
          last_location_update?: string | null
          last_service_date?: string | null
          license_plate?: string
          maintenance_status?: string | null
          monthly_fuel_consumption_liters?: number | null
          route_assigned?: string | null
          status?: string
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "fleet_manager" | "operations" | "driver" | "finance"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["fleet_manager", "operations", "driver", "finance"],
    },
  },
} as const
