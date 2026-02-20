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
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      worlds: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          color_theme: string
          icon: string
          world_type: string
          ai_personality: string
          ai_tone: string
          surface_texture: string
          is_pinned: boolean
          task_count: number
          urgent_task_count: number
          completed_today: number
          energy_used: number
          energy_limit: number
          position_x: number
          position_y: number
          position_z: number
          size_factor: number
          glow_intensity: number
          orbit_speed: number
          rotation_speed: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          color_theme?: string
          icon?: string
          world_type?: string
          ai_personality?: string
          ai_tone?: string
          surface_texture?: string
          is_pinned?: boolean
          task_count?: number
          urgent_task_count?: number
          completed_today?: number
          energy_used?: number
          energy_limit?: number
          position_x?: number
          position_y?: number
          position_z?: number
          size_factor?: number
          glow_intensity?: number
          orbit_speed?: number
          rotation_speed?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          color_theme?: string
          icon?: string
          world_type?: string
          ai_personality?: string
          ai_tone?: string
          surface_texture?: string
          is_pinned?: boolean
          task_count?: number
          urgent_task_count?: number
          completed_today?: number
          energy_used?: number
          energy_limit?: number
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          world_id: string
          moon_id: string | null
          user_id: string
          title: string
          description: string | null
          status: string
          priority: string
          energy_cost: number
          due_date: string | null
          scheduled_date: string | null
          completed_at: string | null
          parent_task_id: string | null
          tags: string[]
          notes: string | null
          is_recurring: boolean
          recurring_pattern: Json | null
          estimated_minutes: number | null
          actual_minutes: number | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          world_id: string
          moon_id?: string | null
          user_id: string
          title: string
          description?: string | null
          status?: string
          priority?: string
          energy_cost?: number
          due_date?: string | null
          scheduled_date?: string | null
          completed_at?: string | null
          parent_task_id?: string | null
          tags?: string[]
          notes?: string | null
          is_recurring?: boolean
          recurring_pattern?: Json | null
          estimated_minutes?: number | null
          actual_minutes?: number | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          status?: string
          priority?: string
          energy_cost?: number
          due_date?: string | null
          scheduled_date?: string | null
          completed_at?: string | null
          parent_task_id?: string | null
          tags?: string[]
          notes?: string | null
          is_recurring?: boolean
          recurring_pattern?: Json | null
          estimated_minutes?: number | null
          actual_minutes?: number | null
          sort_order?: number
          updated_at?: string
        }
      }
      moons: {
        Row: {
          id: string
          parent_world_id: string
          user_id: string
          name: string
          description: string | null
          color_theme: string
          icon: string
          task_count: number
          urgent_task_count: number
          completed_today: number
          energy_used: number
          energy_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_world_id: string
          user_id: string
          name: string
          description?: string | null
          color_theme?: string
          icon?: string
          task_count?: number
          urgent_task_count?: number
          completed_today?: number
          energy_used?: number
          energy_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          color_theme?: string
          icon?: string
          task_count?: number
          urgent_task_count?: number
          completed_today?: number
          energy_used?: number
          energy_limit?: number
          updated_at?: string
        }
      }
      notebook_entries: {
        Row: {
          id: string
          world_id: string | null
          moon_id: string | null
          user_id: string
          title: string
          content: string
          tags: string[]
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          world_id?: string | null
          moon_id?: string | null
          user_id: string
          title?: string
          content: string
          tags?: string[]
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          content?: string
          tags?: string[]
          is_pinned?: boolean
          updated_at?: string
        }
      }
      world_sections: {
        Row: {
          id: string
          world_id: string
          name: string
          description: string | null
          color_theme: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          world_id: string
          name: string
          description?: string | null
          color_theme?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          color_theme?: string | null
          sort_order?: number
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
      task_status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'deferred'
      task_priority: 'low' | 'medium' | 'high' | 'urgent'
      world_type: 'general' | 'finance' | 'development' | 'creative' | 'health' | 'education' | 'social' | 'gaming'
      ai_personality: 'manager' | 'coach' | 'strategist' | 'mentor' | 'analyst'
      ai_tone: 'professional' | 'friendly' | 'direct' | 'encouraging' | 'calm'
      surface_texture: 'rocky' | 'oceanic' | 'gaseous' | 'crystalline' | 'volcanic' | 'lush' | 'frozen' | 'metallic'
    }
  }
}
