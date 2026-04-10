export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      authorized_emails: {
        Row: {
          id: string;
          email: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      professors: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          photo_url: string | null;
          whatsapp: string | null;
          grande_area: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          photo_url?: string | null;
          whatsapp?: string | null;
          grande_area: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          photo_url?: string | null;
          whatsapp?: string | null;
          grande_area?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      classes: {
        Row: {
          id: string;
          professor_id: string;
          grande_tema: string;
          subtema: string | null;
          thumbnail_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          professor_id: string;
          grande_tema: string;
          subtema?: string | null;
          thumbnail_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          professor_id?: string;
          grande_tema?: string;
          subtema?: string | null;
          thumbnail_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "classes_professor_id_fkey";
            columns: ["professor_id"];
            isOneToOne: false;
            referencedRelation: "professors";
            referencedColumns: ["id"];
          }
        ];
      };
      class_slots: {
        Row: {
          id: string;
          class_id: string;
          date: string;
          start_time: string;
          end_time: string;
          is_booked: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          date: string;
          start_time: string;
          end_time: string;
          is_booked?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          is_booked?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "class_slots_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Professor = Database['public']['Tables']['professors']['Row'];
export type Class = Database['public']['Tables']['classes']['Row'];
export type ClassSlot = Database['public']['Tables']['class_slots']['Row'];

export type ClassWithProfessor = Class & {
  professors: Professor;
};

export type ClassWithProfessorAndSlots = Class & {
  professors: Professor;
  class_slots: ClassSlot[];
};
