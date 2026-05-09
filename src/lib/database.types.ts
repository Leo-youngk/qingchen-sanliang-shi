export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      daily_records: {
        Row: {
          id: string
          user_id: string
          date: string
          top_three_tasks: Json
          pauses: Json
          actions: Json
          preview_for_tomorrow: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          top_three_tasks?: Json
          pauses?: Json
          actions?: Json
          preview_for_tomorrow?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          top_three_tasks?: Json
          pauses?: Json
          actions?: Json
          preview_for_tomorrow?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
