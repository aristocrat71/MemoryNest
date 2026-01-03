'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getAuthSession } from '@/lib/auth';
import type { Board } from '@/lib/types';

export default function BoardsPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const session = getAuthSession();
    if (!session.isAuthenticated) {
      router.push('/');
      return;
    }

    async function fetchBoards() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('boards')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        setBoards((data as Board[]) || []);
      } catch (err) {
        console.error('Error fetching boards:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch boards');
      } finally {
        setLoading(false);
      }
    }

    fetchBoards();
  }, [router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block w-10 h-10 sm:w-12 sm:h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading boards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
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
            <span className="text-sm sm:text-base font-medium">Back</span>
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Your Boards
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          {boards.length} {boards.length === 1 ? 'board' : 'boards'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Boards Grid */}
      {boards.length === 0 ? (
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 text-center">
            <div className="text-5xl sm:text-6xl mb-4">📋</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              No boards yet
            </h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Create your first board to start collecting memories
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all active:scale-[0.98] text-sm sm:text-base"
            >
              Create Board
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {boards.map((board) => (
            <button
              key={board.id}
              onClick={() => router.push(`/b/${board.secret_slug}`)}
              className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 hover:shadow-xl hover:border-purple-200 transition-all text-left group active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                    {board.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Created {formatDate(board.created_at)}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-purple-500 transition-colors flex-shrink-0 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Active</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
