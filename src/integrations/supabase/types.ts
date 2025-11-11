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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_global: boolean | null
          recipient_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_global?: boolean | null
          recipient_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_global?: boolean | null
          recipient_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          created_at: string
          description: string
          id: string
          points_reward: number | null
          thumbnail_url: string | null
          title: string
          url: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          points_reward?: number | null
          thumbnail_url?: string | null
          title: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          points_reward?: number | null
          thumbnail_url?: string | null
          title?: string
          url?: string
        }
        Relationships: []
      }
      homework_posts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          likes: number | null
          points_required: number | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          likes?: number | null
          points_required?: number | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          likes?: number | null
          points_required?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      homework_replies: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "homework_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          id: string
          points_earned: number
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          id?: string
          points_earned: number
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          id?: string
          points_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      merch_items: {
        Row: {
          created_at: string
          description: string
          id: string
          image_url: string | null
          name: string
          price: number
          stock: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          name: string
          price: number
          stock?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          stock?: number
        }
        Relationships: []
      }
      merchandise: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          stock: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          stock?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          stock?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          points: number | null
          subscription_end_date: string | null
          subscription_id: string | null
          subscription_status: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          points?: number | null
          subscription_end_date?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          points?: number | null
          subscription_end_date?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_unlocked_posts: {
        Row: {
          id: string
          post_id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          post_id: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          post_id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_unlocked_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "homework_posts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      verify_admin_access: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
