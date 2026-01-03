'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useBoardItems } from '@/hooks/useBoardItems';
import BoardCanvas from '@/components/BoardCanvas';
import type { Board } from '@/lib/types';

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    items,
    loading: itemsLoading,
    error: itemsError,
    createItem,
    updateItem,
    deleteItem,
  } = useBoardItems(board?.id || null);

  // Fetch board details
  useEffect(() => {
    async function fetchBoard() {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('boards')
          .select('*')
          .eq('secret_slug', slug)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('Board not found. Please check your link.');
          } else {
            throw fetchError;
          }
          return;
        }

        setBoard(data as Board);
      } catch (err) {
        console.error('Error fetching board:', err);
        setError(err instanceof Error ? err.message : 'Failed to load board');
      } finally {
        setLoading(false);
      }
    }

    fetchBoard();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading board...</p>
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md text-center border border-gray-100">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Board not found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'This board does not exist or has been deleted.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-3 rounded-xl transition-all active:scale-[0.98]"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-900 transition-colors p-1 hover:bg-gray-100 rounded-lg flex-shrink-0"
            title="Home"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <h1 className="text-base sm:text-xl font-semibold text-gray-900 truncate">
            {board.title}
          </h1>
        </div>
      </div>

      {/* Error message */}
      {itemsError && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-3 sm:px-4 py-2 rounded-lg shadow-lg z-50 text-xs sm:text-sm mx-4 max-w-[calc(100%-2rem)]">
          {itemsError}
        </div>
      )}

      {/* Board Canvas */}
      <div className="pt-12 sm:pt-16 h-full">
        <BoardCanvas
          boardId={board.id}
          items={items}
          onCreateItem={createItem}
          onUpdateItem={updateItem}
          onDeleteItem={deleteItem}
        />
      </div>
    </div>
  );
}