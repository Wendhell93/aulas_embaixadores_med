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
          status: string;
          status_changed_at: string | null;
          status_changed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          date: string;
          start_time: string;
          end_time: string;
          is_booked?: boolean;
          status?: string;
          status_changed_at?: string | null;
          status_changed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          is_booked?: boolean;
          status?: string;
          status_changed_at?: string | null;
          status_changed_by?: string | null;
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
      class_availability: {
        Row: {
          id: string;
          class_id: string;
          month: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          month: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          month?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "class_availability_class_id_fkey";
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
export type ClassAvailability = Database['public']['Tables']['class_availability']['Row'];

export type SlotStatus =
  | 'available'
  | 'booked'
  | 'completed'
  | 'cancelled_student'
  | 'no_show'
  | 'cancelled_professor';

export const SLOT_STATUS_LABELS: Record<SlotStatus, string> = {
  available: 'Disponivel',
  booked: 'Reservada',
  completed: 'Realizada',
  cancelled_student: 'Cancel. aluno',
  no_show: 'Faltou',
  cancelled_professor: 'Cancel. professor',
};

export const SLOT_STATUS_COLORS: Record<SlotStatus, string> = {
  available: 'bg-muted/20 text-muted',
  booked: 'bg-accent/20 text-accent',
  completed: 'bg-green-500/20 text-green-400',
  cancelled_student: 'bg-yellow-500/20 text-yellow-400',
  no_show: 'bg-orange-500/20 text-orange-400',
  cancelled_professor: 'bg-danger/20 text-danger',
};

export type ClassWithProfessor = Class & {
  professors: Professor;
};

export type ClassWithProfessorAndSlots = Class & {
  professors: Professor;
  class_slots: ClassSlot[];
};
