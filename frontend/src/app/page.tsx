'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { generateSecretSlug, getRandomNoteColor } from '@/lib/utils';
import { login, logout, getAuthSession } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const [boardTitle, setBoardTitle] = useState('');
  const [slugToOpen, setSlugToOpen] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const session = getAuthSession();
    setIsAuthenticated(session.isAuthenticated);
    if (!session.isAuthenticated) {
      setShowLoginModal(true);
    }
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);

    const result = await login(userId, password);
    if (result.success) {
      setIsAuthenticated(true);
      setShowLoginModal(false);
      setUserId('');
      setPassword('');
    } else {
      setLoginError(result.error || 'Login failed');
    }

    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setShowLoginModal(true);
  };

  const handleCreateBoard = async () => {
    if (!boardTitle.trim()) {
      setError('Please enter a board name');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const secretSlug = generateSecretSlug();

      const { data, error: createError } = await supabase
        .from('boards')
        .insert([
          {
            title: boardTitle,
            secret_slug: secretSlug,
          },
        ])
        .select()
        .single();

      if (createError) throw createError;

      // Navigate to the new board
      router.push(`/b/${secretSlug}`);
    } catch (err) {
      console.error('Error creating board:', err);
      setError(err instanceof Error ? err.message : 'Failed to create board');
      setIsCreating(false);
    }
  };

  const handleOpenBoard = () => {
    if (!slugToOpen.trim()) {
      setError('Please enter a board link or code');
      return;
    }

    // Extract slug from full URL or use as-is
    let slug = slugToOpen.trim();
    const urlMatch = slug.match(/\/b\/([^/?]+)/);
    if (urlMatch) {
      slug = urlMatch[1];
    }

    router.push(`/b/${slug}`);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-100 rounded-full blur-[120px] opacity-50"></div>
      
      <main className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2 sm:mb-3">
            ✨ MemoryNest
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Your shared digital scrapbook
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {isAuthenticated && (
          <>
            {/* Create Board Section */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                Create a new board
              </h2>
              <input
                type="text"
                value={boardTitle}
                onChange={(e) => setBoardTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
                placeholder="Board name (e.g., Our Memories)"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base"
              />
              <button
                onClick={handleCreateBoard}
                disabled={isCreating || !boardTitle.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-sm sm:text-base"
              >
                {isCreating ? 'Creating...' : 'Create Board'}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-4 sm:mb-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-500 text-xs sm:text-sm">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* View Boards Button */}
            <button
              onClick={() => router.push('/boards')}
              className="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-purple-300 text-gray-900 font-semibold py-3 rounded-xl transition-all mb-6 flex items-center justify-center gap-2 active:scale-[0.98] text-sm sm:text-base"
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
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              View All Boards
            </button>

            {/* Logout Button */}
            <div className="flex justify-center">
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm underline underline-offset-2 transition-colors"
              >
                Logout
              </button>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8 text-gray-500 text-xs sm:text-sm">
          <p>
            Create a private board to share memories, notes, and moments
          </p>
        </div>
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full border border-white/20">
            <div className="text-center mb-8">
              <div className="text-4xl mb-2">🏠</div>
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome Home
              </h2>
              <p className="text-gray-500 mt-2">Please sign in to access your nest</p>
            </div>

            {loginError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <span>⚠️</span> {loginError}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  User ID
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="your@email.com"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-gray-900 placeholder:text-gray-300"
                  disabled={isLoggingIn}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-gray-900 placeholder:text-gray-300"
                  disabled={isLoggingIn}
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={isLoggingIn || !userId.trim() || !password.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-purple-200 disabled:opacity-50 disabled:shadow-none mt-4 active:scale-[0.98]"
              >
                {isLoggingIn ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
