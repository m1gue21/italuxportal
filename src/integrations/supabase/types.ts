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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_bootstrap: {
        Row: {
          claimed_at: string
          claimed_by: string
          id: boolean
        }
        Insert: {
          claimed_at?: string
          claimed_by: string
          id?: boolean
        }
        Update: {
          claimed_at?: string
          claimed_by?: string
          id?: boolean
        }
        Relationships: []
      }
      benefits: {
        Row: {
          activo: boolean
          created_at: string
          description: string
          icon: string
          id: string
          image_opacity: number
          image_url: string | null
          orden: number
          title: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          description: string
          icon?: string
          id?: string
          image_opacity?: number
          image_url?: string | null
          orden?: number
          title: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          description?: string
          icon?: string
          id?: string
          image_opacity?: number
          image_url?: string | null
          orden?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          addresses: Json
          button_variant: Database["public"]["Enums"]["country_button_variant"]
          code: string
          created_at: string
          display_order: number
          flag: string
          id: string
          is_active: boolean
          label_side: string
          map_x: number
          map_y: number
          name: string
          show_on_map: boolean
          show_subtitle: boolean
          subtitle: string | null
          updated_at: string
          website_icon: string | null
          website_label: string | null
          website_url: string
          whatsapp_icon: string | null
          whatsapp_label: string | null
          whatsapp_url: string
        }
        Insert: {
          addresses?: Json
          button_variant?: Database["public"]["Enums"]["country_button_variant"]
          code: string
          created_at?: string
          display_order?: number
          flag: string
          id?: string
          is_active?: boolean
          label_side?: string
          map_x?: number
          map_y?: number
          name: string
          show_on_map?: boolean
          show_subtitle?: boolean
          subtitle?: string | null
          updated_at?: string
          website_icon?: string | null
          website_label?: string | null
          website_url: string
          whatsapp_icon?: string | null
          whatsapp_label?: string | null
          whatsapp_url: string
        }
        Update: {
          addresses?: Json
          button_variant?: Database["public"]["Enums"]["country_button_variant"]
          code?: string
          created_at?: string
          display_order?: number
          flag?: string
          id?: string
          is_active?: boolean
          label_side?: string
          map_x?: number
          map_y?: number
          name?: string
          show_on_map?: boolean
          show_subtitle?: boolean
          subtitle?: string | null
          updated_at?: string
          website_icon?: string | null
          website_label?: string | null
          website_url?: string
          whatsapp_icon?: string | null
          whatsapp_label?: string | null
          whatsapp_url?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          orden: number
          pregunta: string
          respuesta: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          orden?: number
          pregunta: string
          respuesta: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          orden?: number
          pregunta?: string
          respuesta?: string
          updated_at?: string
        }
        Relationships: []
      }
      section_texts: {
        Row: {
          bg_image_url: string | null
          bg_opacity: number | null
          created_at: string
          cta_icon: string | null
          cta_label: string | null
          cta_url: string | null
          eyebrow: string | null
          id: string
          link2_label: string | null
          link2_url: string | null
          logo_url: string | null
          section_key: string
          show_logo: boolean
          show_social_facebook: boolean
          show_social_instagram: boolean
          show_social_tiktok: boolean
          show_social_whatsapp: boolean
          show_title: boolean
          social_facebook: string | null
          social_facebook_icon: string | null
          social_instagram: string | null
          social_instagram_icon: string | null
          social_tiktok: string | null
          social_tiktok_icon: string | null
          social_whatsapp: string | null
          social_whatsapp_icon: string | null
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          bg_image_url?: string | null
          bg_opacity?: number | null
          created_at?: string
          cta_icon?: string | null
          cta_label?: string | null
          cta_url?: string | null
          eyebrow?: string | null
          id?: string
          link2_label?: string | null
          link2_url?: string | null
          logo_url?: string | null
          section_key: string
          show_logo?: boolean
          show_social_facebook?: boolean
          show_social_instagram?: boolean
          show_social_tiktok?: boolean
          show_social_whatsapp?: boolean
          show_title?: boolean
          social_facebook?: string | null
          social_facebook_icon?: string | null
          social_instagram?: string | null
          social_instagram_icon?: string | null
          social_tiktok?: string | null
          social_tiktok_icon?: string | null
          social_whatsapp?: string | null
          social_whatsapp_icon?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          bg_image_url?: string | null
          bg_opacity?: number | null
          created_at?: string
          cta_icon?: string | null
          cta_label?: string | null
          cta_url?: string | null
          eyebrow?: string | null
          id?: string
          link2_label?: string | null
          link2_url?: string | null
          logo_url?: string | null
          section_key?: string
          show_logo?: boolean
          show_social_facebook?: boolean
          show_social_instagram?: boolean
          show_social_tiktok?: boolean
          show_social_whatsapp?: boolean
          show_title?: boolean
          social_facebook?: string | null
          social_facebook_icon?: string | null
          social_instagram?: string | null
          social_instagram_icon?: string | null
          social_tiktok?: string | null
          social_tiktok_icon?: string | null
          social_whatsapp?: string | null
          social_whatsapp_icon?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_bootstrap_claimed: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin"
      country_button_variant: "gold" | "light"
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
      app_role: ["admin"],
      country_button_variant: ["gold", "light"],
    },
  },
} as const
