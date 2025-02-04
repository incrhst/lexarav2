export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      agent_clients: {
        Row: {
          address: string | null
          agent_id: string | null
          client_name: string
          company_name: string
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          agent_id?: string | null
          client_name: string
          company_name: string
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          agent_id?: string | null
          client_name?: string
          company_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_clients_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      application_status_history: {
        Row: {
          application_id: string | null
          changed_by: string | null
          created_at: string | null
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["application_status"]
        }
        Insert: {
          application_id?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          status: Database["public"]["Enums"]["application_status"]
        }
        Update: {
          application_id?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["application_status"]
        }
        Relationships: [
          {
            foreignKeyName: "application_status_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          agent_id: string | null
          applicant_address: string
          applicant_country: string
          applicant_id: string | null
          applicant_name: string
          application_type: Database["public"]["Enums"]["application_type"]
          client_id: string | null
          contact_email: string
          contact_phone: string
          created_at: string | null
          filing_date: string | null
          filing_number: string | null
          goods_services_class: string[] | null
          id: string
          logo_url: string | null
          status: Database["public"]["Enums"]["application_status"]
          territory: string[] | null
          trademark_description: string | null
          trademark_name: string | null
          updated_at: string | null
          use_status: Database["public"]["Enums"]["use_status"] | null
        }
        Insert: {
          agent_id?: string | null
          applicant_address: string
          applicant_country: string
          applicant_id?: string | null
          applicant_name: string
          application_type: Database["public"]["Enums"]["application_type"]
          client_id?: string | null
          contact_email: string
          contact_phone: string
          created_at?: string | null
          filing_date?: string | null
          filing_number?: string | null
          goods_services_class?: string[] | null
          id?: string
          logo_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          territory?: string[] | null
          trademark_description?: string | null
          trademark_name?: string | null
          updated_at?: string | null
          use_status?: Database["public"]["Enums"]["use_status"] | null
        }
        Update: {
          agent_id?: string | null
          applicant_address?: string
          applicant_country?: string
          applicant_id?: string | null
          applicant_name?: string
          application_type?: Database["public"]["Enums"]["application_type"]
          client_id?: string | null
          contact_email?: string
          contact_phone?: string
          created_at?: string | null
          filing_date?: string | null
          filing_number?: string | null
          goods_services_class?: string[] | null
          id?: string
          logo_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          territory?: string[] | null
          trademark_description?: string | null
          trademark_name?: string | null
          updated_at?: string | null
          use_status?: Database["public"]["Enums"]["use_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "agent_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_data: {
        Row: {
          category: string
          created_at: string | null
          id: string
          template: Json
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          template: Json
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          template?: Json
        }
        Relationships: []
      }
      oppositions: {
        Row: {
          application_id: string | null
          created_at: string | null
          evidence_urls: string[] | null
          id: string
          opponent_id: string | null
          opponent_name: string
          reason: string
          status: Database["public"]["Enums"]["opposition_status"]
          updated_at: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          evidence_urls?: string[] | null
          id?: string
          opponent_id?: string | null
          opponent_name: string
          reason: string
          status?: Database["public"]["Enums"]["opposition_status"]
          updated_at?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          evidence_urls?: string[] | null
          id?: string
          opponent_id?: string | null
          opponent_name?: string
          reason?: string
          status?: Database["public"]["Enums"]["opposition_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oppositions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oppositions_opponent_id_fkey"
            columns: ["opponent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          company_name: string | null
          country: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_demo_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_demo_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      email_matches: {
        Args: {
          email: string
          user_id: string
        }
        Returns: boolean
      }
      ensure_user_profile: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      get_demo_mode: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_processor: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      recover_profile: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      recover_user_profile: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      register_user: {
        Args: {
          p_email: string
          p_password: string
          p_full_name: string
        }
        Returns: undefined
      }
      set_demo_password: {
        Args: {
          new_password: string
        }
        Returns: undefined
      }
      sync_user_profile: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      toggle_demo_mode: {
        Args: {
          enable: boolean
        }
        Returns: undefined
      }
      update_application_status: {
        Args: {
          application_id: string
          new_status: Database["public"]["Enums"]["application_status"]
          notes?: string
        }
        Returns: undefined
      }
      user_has_role: {
        Args: {
          user_id: string
          required_role: string
        }
        Returns: boolean
      }
      validate_profile: {
        Args: {
          profile_id: string
        }
        Returns: boolean
      }
      validate_user_profile: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      application_status:
        | "submitted"
        | "underReview"
        | "published"
        | "opposed"
        | "allowed"
        | "registered"
        | "rejected"
      application_type: "trademark" | "copyright" | "patent"
      opposition_status: "submitted" | "pending" | "approved" | "rejected"
      use_status: "inUse" | "intentToUse"
      user_role: "admin" | "processor" | "user" | "agent" | "public"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

