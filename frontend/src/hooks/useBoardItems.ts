'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { deleteImage } from '@/lib/storage';
import type { Item, NewItem, ItemUpdate } from '@/lib/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useBoardItems(boardId: string | null) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Fetch items for the board
  const fetchItems = useCallback(async () => {
    if (!boardId) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('items')
        .select('*')
        .eq('board_id', boardId)
        .order('z_index', { ascending: true });

      if (fetchError) throw fetchError;

      setItems((data as Item[]) || []);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!boardId) return;

    // Fetch initial data
    fetchItems();

    // Set up realtime subscription
    const channel = supabase
      .channel(`board:${boardId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'items',
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          console.log('Item inserted:', payload);
          setItems((current) => [...current, payload.new as Item]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'items',
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          console.log('Item updated:', payload);
          setItems((current) =>
            current.map((item) =>
              item.id === payload.new.id ? (payload.new as Item) : item
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'items',
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          console.log('Item deleted:', payload);
          setItems((current) =>
            current.filter((item) => item.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Cleanup subscription on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [boardId, fetchItems]);

  // Create a new item
  const createItem = useCallback(
    async (newItem: NewItem): Promise<Item | null> => {
      try {
        const { data, error: insertError } = await supabase
          .from('items')
          .insert([newItem])
          .select()
          .single();

        if (insertError) throw insertError;

        return data as Item;
      } catch (err) {
        console.error('Error creating item:', err);
        setError(err instanceof Error ? err.message : 'Failed to create item');
        return null;
      }
    },
    []
  );

  // Update an existing item
  const updateItem = useCallback(
    async (itemId: string, updates: ItemUpdate): Promise<boolean> => {
      try {
        const { error: updateError } = await supabase
          .from('items')
          .update(updates)
          .eq('id', itemId);

        if (updateError) throw updateError;

        return true;
      } catch (err) {
        console.error('Error updating item:', err);
        setError(err instanceof Error ? err.message : 'Failed to update item');
        return false;
      }
    },
    []
  );

  // Delete an item
  const deleteItem = useCallback(async (itemId: string): Promise<boolean> => {
    try {
      // Get the item first to check if it's an image that needs storage cleanup
      const item = items.find(i => i.id === itemId);
      
      const { error: deleteError } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (deleteError) throw deleteError;

      // If it's an image item with a Supabase Storage URL, delete from storage
      if (item?.type === 'image' && item.content?.url) {
        const isSupabaseUrl = item.content.url.includes('/storage/v1/object/public/board-images/');
        if (isSupabaseUrl) {
          // Delete from storage asynchronously (don't wait or fail if this fails)
          deleteImage(item.content.url).catch(console.warn);
        }
      }

      return true;
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      return false;
    }
  }, [items]);

  return {
    items,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    refetch: fetchItems,
  };
}
