// Core TypeScript types for MemoryNest

export type ItemType = 'note' | 'image' | 'link';

export interface Board {
  id: string;
  title: string;
  secret_slug: string;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BaseItem {
  id: string;
  board_id: string;
  type: ItemType;
  x: number;
  y: number;
  z_index: number;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

// Note item content
export interface NoteContent {
  text: string;
  backgroundColor?: string;
  textColor?: string;
}

// Image item content
export interface ImageContent {
  url: string;
  caption?: string;
  width?: number;
  height?: number;
}

// Link item content
export interface LinkContent {
  url: string;
  title?: string;
  description?: string;
  favicon?: string;
}

// Discriminated union for items based on type
export type Item =
  | (BaseItem & { type: 'note'; content: NoteContent })
  | (BaseItem & { type: 'image'; content: ImageContent })
  | (BaseItem & { type: 'link'; content: LinkContent });

// Helper type for creating new items (without generated fields)
export type NewItem = Omit<Item, 'id' | 'created_at' | 'updated_at'>;

// Type for item updates (partial content)
export type ItemUpdate = Partial<Pick<Item, 'x' | 'y' | 'z_index' | 'content'>>;

// Supabase Realtime payload types
export interface RealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: Partial<T>;
  errors: string[] | null;
}
