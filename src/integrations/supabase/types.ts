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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      beneficiaries: {
        Row: {
          allocated_budget: number | null
          consumed_budget: number | null
          created_at: string
          cse_company_id: string
          id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allocated_budget?: number | null
          consumed_budget?: number | null
          created_at?: string
          cse_company_id: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allocated_budget?: number | null
          consumed_budget?: number | null
          created_at?: string
          cse_company_id?: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_cse_company_id_fkey"
            columns: ["cse_company_id"]
            isOneToOne: false
            referencedRelation: "cse_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string
          event_id: number
          id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: number
          id?: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: number
          id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["id_event"]
          },
        ]
      }
      cse_companies: {
        Row: {
          consumed_budget: number | null
          created_at: string
          id: string
          name: string
          total_budget: number | null
          updated_at: string
        }
        Insert: {
          consumed_budget?: number | null
          created_at?: string
          id?: string
          name: string
          total_budget?: number | null
          updated_at?: string
        }
        Update: {
          consumed_budget?: number | null
          created_at?: string
          id?: string
          name?: string
          total_budget?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      event: {
        Row: {
          access: string | null
          adress: string | null
          competition: string | null
          created_at: string | null
          date: string | null
          event: string | null
          id_event: number
          link: string | null
          location: string | null
          organization: string | null
          original_price: string | null
          our_price: string | null
          sport: string | null
          stadium_id: string | null
          updated_at: string | null
        }
        Insert: {
          access?: string | null
          adress?: string | null
          competition?: string | null
          created_at?: string | null
          date?: string | null
          event?: string | null
          id_event?: number
          link?: string | null
          location?: string | null
          organization?: string | null
          original_price?: string | null
          our_price?: string | null
          sport?: string | null
          stadium_id?: string | null
          updated_at?: string | null
        }
        Update: {
          access?: string | null
          adress?: string | null
          competition?: string | null
          created_at?: string | null
          date?: string | null
          event?: string | null
          id_event?: number
          link?: string | null
          location?: string | null
          organization?: string | null
          original_price?: string | null
          our_price?: string | null
          sport?: string | null
          stadium_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_stadium_id_fkey"
            columns: ["stadium_id"]
            isOneToOne: false
            referencedRelation: "stadiums"
            referencedColumns: ["id"]
          },
        ]
      }
      Event: {
        Row: {
          Access: string | null
          Adress: string | null
          Competition: string | null
          Date: string | null
          Event: string | null
          ID_event: number
          Link: string | null
          Location: string | null
          Organization: string | null
          Original_Price: string | null
          Our_Price: string | null
          Sport: string | null
        }
        Insert: {
          Access?: string | null
          Adress?: string | null
          Competition?: string | null
          Date?: string | null
          Event?: string | null
          ID_event: number
          Link?: string | null
          Location?: string | null
          Organization?: string | null
          Original_Price?: string | null
          Our_Price?: string | null
          Sport?: string | null
        }
        Update: {
          Access?: string | null
          Adress?: string | null
          Competition?: string | null
          Date?: string | null
          Event?: string | null
          ID_event?: number
          Link?: string | null
          Location?: string | null
          Organization?: string | null
          Original_Price?: string | null
          Our_Price?: string | null
          Sport?: string | null
        }
        Relationships: []
      }
      favorite_events: {
        Row: {
          created_at: string
          event_id: number
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: number
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: number
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["id_event"]
          },
        ]
      }
      organizers: {
        Row: {
          created_at: string
          description: string | null
          id: string
          organization_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          organization_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          organization_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string
          status_badge: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role: string
          status_badge?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
          status_badge?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          created_at: string
          event_id: number | null
          final_price: number
          id: string
          original_price: number
          payment_method: string | null
          purchase_date: string
          qr_code: string | null
          quantity: number
          status: string | null
          subsidized_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id?: number | null
          final_price: number
          id?: string
          original_price: number
          payment_method?: string | null
          purchase_date?: string
          qr_code?: string | null
          quantity?: number
          status?: string | null
          subsidized_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: number | null
          final_price?: number
          id?: string
          original_price?: number
          payment_method?: string | null
          purchase_date?: string
          qr_code?: string | null
          quantity?: number
          status?: string | null
          subsidized_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["id_event"]
          },
        ]
      }
      stadiums: {
        Row: {
          address: string | null
          amenities: string[] | null
          capacity: number | null
          city: string
          contact_info: Json | null
          coordinates: Json | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          opened_year: number | null
          type: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          capacity?: number | null
          city: string
          contact_info?: Json | null
          coordinates?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          opened_year?: number | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          capacity?: number | null
          city?: string
          contact_info?: Json | null
          coordinates?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          opened_year?: number | null
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          achievements: string[] | null
          captain: string | null
          category: string
          coach: string | null
          colors: Json | null
          created_at: string
          description: string | null
          founded: number | null
          id: string
          league: string | null
          logo_url: string | null
          name: string
          organizer_name: string
          social_media: Json | null
          stadium: string | null
          stadium_id: string | null
          stats: Json | null
          updated_at: string
        }
        Insert: {
          achievements?: string[] | null
          captain?: string | null
          category: string
          coach?: string | null
          colors?: Json | null
          created_at?: string
          description?: string | null
          founded?: number | null
          id?: string
          league?: string | null
          logo_url?: string | null
          name: string
          organizer_name: string
          social_media?: Json | null
          stadium?: string | null
          stadium_id?: string | null
          stats?: Json | null
          updated_at?: string
        }
        Update: {
          achievements?: string[] | null
          captain?: string | null
          category?: string
          coach?: string | null
          colors?: Json | null
          created_at?: string
          description?: string | null
          founded?: number | null
          id?: string
          league?: string | null
          logo_url?: string | null
          name?: string
          organizer_name?: string
          social_media?: Json | null
          stadium?: string | null
          stadium_id?: string | null
          stats?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_stadium_id_fkey"
            columns: ["stadium_id"]
            isOneToOne: false
            referencedRelation: "stadiums"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
