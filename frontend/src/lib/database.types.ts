// This file is auto-generated - you can generate types from your Supabase schema
// by running: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts

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
      boards: {
        Row: {
          id: string
          title: string
          secret_slug: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string
          secret_slug: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          secret_slug?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      items: {
        Row: {
          id: string
          board_id: string
          type: 'note' | 'image' | 'link'
          content: Json
          x: number
          y: number
          z_index: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          board_id: string
          type: 'note' | 'image' | 'link'
          content?: Json
          x?: number
          y?: number
          z_index?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          board_id?: string
          type?: 'note' | 'image' | 'link'
          content?: Json
          x?: number
          y?: number
          z_index?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
