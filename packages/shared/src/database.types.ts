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
    PostgrestVersion: "14.17"
  }
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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
      expense_item_aliases: {
        Row: {
          alias: string
          created_at: string
          expense_item_id: string
          id: string
        }
        Insert: {
          alias: string
          created_at?: string
          expense_item_id: string
          id?: string
        }
        Update: {
          alias?: string
          created_at?: string
          expense_item_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_item_aliases_expense_item_id_fkey"
            columns: ["expense_item_id"]
            isOneToOne: false
            referencedRelation: "expense_items"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_items: {
        Row: {
          brand: string | null
          created_at: string
          default_category: Database["public"]["Enums"]["expense_category"]
          default_price_soles: number
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string
          default_category?: Database["public"]["Enums"]["expense_category"]
          default_price_soles?: number
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string
          default_category?: Database["public"]["Enums"]["expense_category"]
          default_price_soles?: number
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_movements: {
        Row: {
          affects_wallet: boolean
          amount_soles: number
          category: Database["public"]["Enums"]["expense_category"] | null
          created_at: string
          direction: Database["public"]["Enums"]["movement_direction"]
          expense_item_id: string | null
          food_item_id: string | null
          id: string
          job_id: string | null
          kcal: number | null
          label: string
          notes: string | null
          occurred_at: string
          payment_account_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          source: Database["public"]["Enums"]["movement_source"]
          updated_at: string
          user_id: string
        }
        Insert: {
          affects_wallet?: boolean
          amount_soles: number
          category?: Database["public"]["Enums"]["expense_category"] | null
          created_at?: string
          direction: Database["public"]["Enums"]["movement_direction"]
          expense_item_id?: string | null
          food_item_id?: string | null
          id?: string
          job_id?: string | null
          kcal?: number | null
          label: string
          notes?: string | null
          occurred_at?: string
          payment_account_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          source: Database["public"]["Enums"]["movement_source"]
          updated_at?: string
          user_id: string
        }
        Update: {
          affects_wallet?: boolean
          amount_soles?: number
          category?: Database["public"]["Enums"]["expense_category"] | null
          created_at?: string
          direction?: Database["public"]["Enums"]["movement_direction"]
          expense_item_id?: string | null
          food_item_id?: string | null
          id?: string
          job_id?: string | null
          kcal?: number | null
          label?: string
          notes?: string | null
          occurred_at?: string
          payment_account_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          source?: Database["public"]["Enums"]["movement_source"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_movements_expense_item_id_fkey"
            columns: ["expense_item_id"]
            isOneToOne: false
            referencedRelation: "expense_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_movements_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_movements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_movements_payment_account_id_fkey"
            columns: ["payment_account_id"]
            isOneToOne: false
            referencedRelation: "user_payment_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_movements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      food_items: {
        Row: {
          brand: string | null
          carbs_g: number | null
          created_at: string
          default_price_soles: number
          default_serving_g: number
          fat_g: number | null
          food_group: string
          id: string
          is_active: boolean
          kcal_per_100g: number
          name: string
          protein_g: number | null
          serving_label: string
          tpca_code: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          brand?: string | null
          carbs_g?: number | null
          created_at?: string
          default_price_soles?: number
          default_serving_g?: number
          fat_g?: number | null
          food_group: string
          id?: string
          is_active?: boolean
          kcal_per_100g: number
          name: string
          protein_g?: number | null
          serving_label?: string
          tpca_code?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          brand?: string | null
          carbs_g?: number | null
          created_at?: string
          default_price_soles?: number
          default_serving_g?: number
          fat_g?: number | null
          food_group?: string
          id?: string
          is_active?: boolean
          kcal_per_100g?: number
          name?: string
          protein_g?: number | null
          serving_label?: string
          tpca_code?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_medal_requirements: {
        Row: {
          job_id: string
          medal_id: string
        }
        Insert: {
          job_id: string
          medal_id: string
        }
        Update: {
          job_id?: string
          medal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_medal_requirements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_medal_requirements_medal_id_fkey"
            columns: ["medal_id"]
            isOneToOne: false
            referencedRelation: "medals"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      medals: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      player_citas: {
        Row: {
          belleza: Database["public"]["Enums"]["player_belleza"]
          bottom: Database["public"]["Enums"]["player_bottom"]
          caracteristica: string | null
          codigo_identificador: string
          color: Database["public"]["Enums"]["player_color"]
          created_at: string
          fecha: string
          figura: Database["public"]["Enums"]["player_figura"]
          id: string
          lugar: string
          paciencia_minutos: number
          persona: string
          presion: Database["public"]["Enums"]["player_presion"]
          puntaje: number
          talla: Database["public"]["Enums"]["player_talla"]
          top: Database["public"]["Enums"]["player_top"]
          updated_at: string
          user_id: string
        }
        Insert: {
          belleza?: Database["public"]["Enums"]["player_belleza"]
          bottom?: Database["public"]["Enums"]["player_bottom"]
          caracteristica?: string | null
          codigo_identificador: string
          color: Database["public"]["Enums"]["player_color"]
          created_at?: string
          fecha: string
          figura: Database["public"]["Enums"]["player_figura"]
          id?: string
          lugar: string
          paciencia_minutos?: number
          persona: string
          presion?: Database["public"]["Enums"]["player_presion"]
          puntaje?: number
          talla: Database["public"]["Enums"]["player_talla"]
          top?: Database["public"]["Enums"]["player_top"]
          updated_at?: string
          user_id: string
        }
        Update: {
          belleza?: Database["public"]["Enums"]["player_belleza"]
          bottom?: Database["public"]["Enums"]["player_bottom"]
          caracteristica?: string | null
          codigo_identificador?: string
          color?: Database["public"]["Enums"]["player_color"]
          created_at?: string
          fecha?: string
          figura?: Database["public"]["Enums"]["player_figura"]
          id?: string
          lugar?: string
          paciencia_minutos?: number
          persona?: string
          presion?: Database["public"]["Enums"]["player_presion"]
          puntaje?: number
          talla?: Database["public"]["Enums"]["player_talla"]
          top?: Database["public"]["Enums"]["player_top"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_citas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_citas_comentarios: {
        Row: {
          cita_id: string
          codigo_identificador: string
          contenido: string
          created_at: string
          fecha: string
          id: string
          orden: number | null
          tipo: Database["public"]["Enums"]["player_comentario_tipo"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cita_id: string
          codigo_identificador: string
          contenido: string
          created_at?: string
          fecha?: string
          id?: string
          orden?: number | null
          tipo: Database["public"]["Enums"]["player_comentario_tipo"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cita_id?: string
          codigo_identificador?: string
          contenido?: string
          created_at?: string
          fecha?: string
          id?: string
          orden?: number | null
          tipo?: Database["public"]["Enums"]["player_comentario_tipo"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_citas_comentarios_cita_id_fkey"
            columns: ["cita_id"]
            isOneToOne: false
            referencedRelation: "player_citas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_citas_comentarios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          experimental_profiles: string[]
          id: string
          role: Database["public"]["Enums"]["profile_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          experimental_profiles?: string[]
          id: string
          role?: Database["public"]["Enums"]["profile_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          experimental_profiles?: string[]
          id?: string
          role?: Database["public"]["Enums"]["profile_role"]
          updated_at?: string
        }
        Relationships: []
      }
      user_account_balances: {
        Row: {
          balance_soles: number
          payment_account_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_soles?: number
          payment_account_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_soles?: number
          payment_account_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_account_balances_payment_account_id_fkey"
            columns: ["payment_account_id"]
            isOneToOne: false
            referencedRelation: "user_payment_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_account_balances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_jobs: {
        Row: {
          activated_at: string | null
          created_at: string
          id: string
          job_id: string
          status: Database["public"]["Enums"]["job_status"]
          unlocked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          created_at?: string
          id?: string
          job_id: string
          status?: Database["public"]["Enums"]["job_status"]
          unlocked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          created_at?: string
          id?: string
          job_id?: string
          status?: Database["public"]["Enums"]["job_status"]
          unlocked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_medals: {
        Row: {
          id: string
          medal_id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          id?: string
          medal_id: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          id?: string
          medal_id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_medals_medal_id_fkey"
            columns: ["medal_id"]
            isOneToOne: false
            referencedRelation: "medals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_medals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_payment_accounts: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label: string
          slug: string
          sort_order: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          slug: string
          sort_order?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          slug?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_payment_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_wallet_balances: {
        Row: {
          balance_soles: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_soles?: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_soles?: number
          payment_method?: Database["public"]["Enums"]["payment_method"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_wallet_balances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      expense_category:
        | "comida_bebida"
        | "combustible_gnv"
        | "combustible_gasolina"
        | "llantas"
        | "mantenimiento"
        | "otro"
        | "app_saldo"
        | "comida"
        | "bebida"
        | "medicina"
        | "higiene"
        | "ocio"
        | "bano"
      job_status: "locked" | "unlocked" | "active"
      movement_direction: "in" | "out"
      movement_source:
        | "food"
        | "expense"
        | "income"
        | "driver_income"
        | "driver_expense"
        | "opening_balance"
      payment_method: "yape" | "plin" | "efectivo" | "otro"
      player_belleza: "regular" | "modelo"
      player_bottom: "regular" | "mega"
      player_color: "blanca" | "canela" | "negra"
      player_comentario_tipo: "dicho" | "pensamiento"
      player_figura: "bbw" | "chubby" | "vedette" | "fitness" | "delgada"
      player_presion: "cocomordan" | "regular"
      player_talla: "caballo" | "mediana" | "chata"
      player_top: "regular" | "mega"
      profile_role: "admin" | "user"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      expense_category: [
        "comida_bebida",
        "combustible_gnv",
        "combustible_gasolina",
        "llantas",
        "mantenimiento",
        "otro",
        "app_saldo",
        "comida",
        "bebida",
        "medicina",
        "higiene",
        "ocio",
        "bano",
      ],
      job_status: ["locked", "unlocked", "active"],
      movement_direction: ["in", "out"],
      movement_source: [
        "food",
        "expense",
        "income",
        "driver_income",
        "driver_expense",
        "opening_balance",
      ],
      payment_method: ["yape", "plin", "efectivo", "otro"],
      player_belleza: ["regular", "modelo"],
      player_bottom: ["regular", "mega"],
      player_color: ["blanca", "canela", "negra"],
      player_comentario_tipo: ["dicho", "pensamiento"],
      player_figura: ["bbw", "chubby", "vedette", "fitness", "delgada"],
      player_presion: ["cocomordan", "regular"],
      player_talla: ["caballo", "mediana", "chata"],
      player_top: ["regular", "mega"],
      profile_role: ["admin", "user"],
    },
  },
} as const
