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
      admins: {
        Row: {
          created_at: string | null
          email: string
          id: number
          name: string
          owner_group_id: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: number
          name: string
          owner_group_id: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: number
          name?: string
          owner_group_id?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'public_admins_owner_group_id_fkey'
            columns: ['owner_group_id']
            isOneToOne: false
            referencedRelation: 'owner_groups'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'public_admins_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      cleaners: {
        Row: {
          created_at: string | null
          email: string
          id: number
          is_deleted: number | null
          line_access_token: string | null
          name: string
          owner_group_id: number | null
          tel: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: number
          is_deleted?: number | null
          line_access_token?: string | null
          name: string
          owner_group_id?: number | null
          tel?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: number
          is_deleted?: number | null
          line_access_token?: string | null
          name?: string
          owner_group_id?: number | null
          tel?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'public_cleaners_owner_group_id_fkey'
            columns: ['owner_group_id']
            isOneToOne: false
            referencedRelation: 'owner_groups'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'public_cleaners_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      cleaning_schedules: {
        Row: {
          cleaner_id: number
          cleaning_status_id: number
          created_at: string | null
          end_datetime: string
          guest_house_id: number
          id: number
          start_datetime: string
          updated_at: string | null
        }
        Insert: {
          cleaner_id: number
          cleaning_status_id: number
          created_at?: string | null
          end_datetime: string
          guest_house_id: number
          id?: number
          start_datetime: string
          updated_at?: string | null
        }
        Update: {
          cleaner_id?: number
          cleaning_status_id?: number
          created_at?: string | null
          end_datetime?: string
          guest_house_id?: number
          id?: number
          start_datetime?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'public_cleaning_schedules_cleaner_id_fkey'
            columns: ['cleaner_id']
            isOneToOne: false
            referencedRelation: 'cleaners'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'public_cleaning_schedules_cleaning_status_id_fkey'
            columns: ['cleaning_status_id']
            isOneToOne: false
            referencedRelation: 'cleaning_status'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'public_cleaning_schedules_guest_house_id_fkey'
            columns: ['guest_house_id']
            isOneToOne: false
            referencedRelation: 'guest_houses'
            referencedColumns: ['id']
          },
        ]
      }
      cleaning_status: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      guest_houses: {
        Row: {
          created_at: string | null
          id: number
          is_deleted: number | null
          name: string
          owner_group_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_deleted?: number | null
          name: string
          owner_group_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          is_deleted?: number | null
          name?: string
          owner_group_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'public_guest_houses_owner_group_id_fkey'
            columns: ['owner_group_id']
            isOneToOne: false
            referencedRelation: 'owner_groups'
            referencedColumns: ['id']
          },
        ]
      }
      owner_groups: {
        Row: {
          created_at: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stay_schedules: {
        Row: {
          amenities_info: string | null
          bag_recieve_info: string | null
          created_at: string | null
          end_datetime: string
          guest_house_id: number | null
          guest_name: string
          id: number
          numbers_of_guests: string
          others: string | null
          start_datetime: string
          updated_at: string | null
        }
        Insert: {
          amenities_info?: string | null
          bag_recieve_info?: string | null
          created_at?: string | null
          end_datetime: string
          guest_house_id?: number | null
          guest_name: string
          id?: number
          numbers_of_guests: string
          others?: string | null
          start_datetime: string
          updated_at?: string | null
        }
        Update: {
          amenities_info?: string | null
          bag_recieve_info?: string | null
          created_at?: string | null
          end_datetime?: string
          guest_house_id?: number | null
          guest_name?: string
          id?: number
          numbers_of_guests?: string
          others?: string | null
          start_datetime?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'public_stay_schedules_guest_house_id_fkey'
            columns: ['guest_house_id']
            isOneToOne: false
            referencedRelation: 'guest_houses'
            referencedColumns: ['id']
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never
