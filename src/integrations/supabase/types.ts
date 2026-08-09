export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      user_roles: {
        Row: {
          user_id: string;
          role: "admin";
          created_at: string;
        };
        Insert: {
          user_id: string;
          role: "admin";
          created_at?: string;
        };
        Update: {
          user_id?: string;
          role?: "admin";
          created_at?: string;
        };
        Relationships: [];
      };
      investor_catalogs: {
        Row: {
          code: string;
          name: string;
          flag: string;
          slug: string;
          currency: "CLP" | "COP" | "USD" | "EUR";
          locale: string;
          title: string;
          button_label: string;
          is_active: boolean;
          empresario_discount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          name: string;
          flag?: string;
          slug: string;
          currency: "CLP" | "COP" | "USD" | "EUR";
          locale?: string;
          title?: string;
          button_label?: string;
          is_active?: boolean;
          empresario_discount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          name?: string;
          flag?: string;
          slug?: string;
          currency?: "CLP" | "COP" | "USD" | "EUR";
          locale?: string;
          title?: string;
          button_label?: string;
          is_active?: boolean;
          empresario_discount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      investor_products: {
        Row: {
          id: string;
          catalog_code: string;
          handle: string;
          title: string;
          sku: string;
          retail_price: number;
          compare_at_price: number | null;
          mayorista_price: number;
          mayorista_is_provisional: boolean;
          mayorista_match:
            | "sku"
            | "name"
            | "estimate"
            | "estimate_family"
            | "fallback"
            | "manual"
            | null;
          image_url: string;
          gallery_urls: string[];
          tags: string[];
          categories: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          catalog_code: string;
          handle: string;
          title: string;
          sku?: string;
          retail_price: number;
          compare_at_price?: number | null;
          mayorista_price: number;
          mayorista_is_provisional?: boolean;
          mayorista_match?:
            | "sku"
            | "name"
            | "estimate"
            | "estimate_family"
            | "fallback"
            | "manual"
            | null;
          image_url?: string;
          gallery_urls?: string[];
          tags?: string[];
          categories?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          catalog_code?: string;
          handle?: string;
          title?: string;
          sku?: string;
          retail_price?: number;
          compare_at_price?: number | null;
          mayorista_price?: number;
          mayorista_is_provisional?: boolean;
          mayorista_match?:
            | "sku"
            | "name"
            | "estimate"
            | "estimate_family"
            | "fallback"
            | "manual"
            | null;
          image_url?: string;
          gallery_urls?: string[];
          tags?: string[];
          categories?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type InvestorCatalogRow = Database["public"]["Tables"]["investor_catalogs"]["Row"];
export type InvestorProductRow = Database["public"]["Tables"]["investor_products"]["Row"];
