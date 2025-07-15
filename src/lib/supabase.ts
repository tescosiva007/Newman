import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://172.205.248.111:8000'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          password: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          password?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          title: string
          body: string
          user_id: string
          created_at: string
          stores: any[]
          store_selection_type: string
        }
        Insert: {
          id?: string
          title: string
          body: string
          user_id: string
          created_at?: string
          stores?: any[]
          store_selection_type?: string
        }
        Update: {
          id?: string
          title?: string
          body?: string
          user_id?: string
          created_at?: string
          stores?: any[]
          store_selection_type?: string
        }
      }
      stores: {
        Row: {
          id: string
          name: string
          code: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          created_at?: string
        }
      }
    }
  }
}