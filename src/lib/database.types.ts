export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'processor' | 'user' | 'agent' | 'public' | 'applicant'
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'admin' | 'processor' | 'user' | 'agent' | 'public' | 'applicant'
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'processor' | 'user' | 'agent' | 'public' | 'applicant'
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          applicant_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          applicant_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          applicant_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
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
  }
} 