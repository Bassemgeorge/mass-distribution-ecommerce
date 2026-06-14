export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name_ar: string;
          name_en: string;
          sku: string;
          brand: string;
          category: string;
          unit_price: number;
          pack_size: string | null;
          min_order_qty: number;
          stock_quantity: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      customers: {
        Row: {
          id: string;
          business_name: string;
          contact_name: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          area: string | null;
          customer_type: string | null;
          credit_limit: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["customers"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          status: string;
          total_amount: number;
          delivery_address: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "id" | "order_number" | "created_at"> & { id?: string; order_number?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_sku: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
        };
        Insert: Omit<Database["public"]["Tables"]["order_items"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
      };
      price_lists: {
        Row: {
          id: string;
          customer_type: string;
          product_id: string;
          special_price: number;
        };
        Insert: Omit<Database["public"]["Tables"]["price_lists"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["price_lists"]["Insert"]>;
      };
    };
  };
}

// Convenience row types
export type DbProduct    = Database["public"]["Tables"]["products"]["Row"];
export type DbCustomer   = Database["public"]["Tables"]["customers"]["Row"];
export type DbOrder      = Database["public"]["Tables"]["orders"]["Row"];
export type DbOrderItem  = Database["public"]["Tables"]["order_items"]["Row"];
export type DbPriceList  = Database["public"]["Tables"]["price_lists"]["Row"];
