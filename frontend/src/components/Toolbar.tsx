'use client';

import { useState, useRef, useEffect } from 'react';
import type { NewItem } from '@/lib/types';
import { getRandomNoteColor, getMaxZIndex, getLinkMetadata } from '@/lib/utils';
import { uploadImage, deleteImage, initializeStorage, StorageError } from '@/lib/storage';
import type { Item } from '@/lib/types';

interface ToolbarProps {
  boardId: string;
  items: Item[];
  onAddItem: (item: NewItem) => Promise<void>;
}

export default function Toolbar({ boardId, items, onAddItem }: ToolbarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize storage on component mount
  useEffect(() => {
    initializeStorage().catch(console.error);
  }, []);

  const getNextZIndex = () => getMaxZIndex(items) + 1;

  const getRandomPosition = () => {
    const padding = 100;
    const maxX = Math.max(800, window.innerWidth - padding);
    const maxY = Math.max(600, window.innerHeight - padding);
    
    return {
      x: Math.random() * (maxX - padding) + padding,
      y: Math.random() * (maxY - padding) + padding,
    };
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    setIsAdding(true);
    const position = getRandomPosition();

    const newItem: NewItem = {
      board_id: boardId,
      type: 'note',
      content: {
        text: noteText,
        backgroundColor: getRandomNoteColor(),
      },
      x: position.x,
      y: position.y,
      z_index: getNextZIndex(),
    };

    await onAddItem(newItem);
    setNoteText('');
    setShowNoteInput(false);
    setIsAdding(false);
  };

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset any previous errors
    setUploadError(null);
    setIsAdding(true);

    try {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please select a valid image file (PNG, JPEG, GIF, or WebP)');
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image size must be less than 10MB');
      }

      // Upload to Supabase Storage
      const imageUrl = await uploadImage(file, boardId);
      const position = getRandomPosition();

      const newItem: NewItem = {
        board_id: boardId,
        type: 'image',
        content: {
          url: imageUrl,
          caption: file.name,
        },
        x: position.x,
        y: position.y,
        z_index: getNextZIndex(),
      };

      await onAddItem(newItem);
    } catch (error) {
      console.error('Image upload error:', error);
      if (error instanceof StorageError) {
        setUploadError(error.message);
      } else {
        setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
      }
    } finally {
      setIsAdding(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddLink = async () => {
    if (!linkUrl.trim()) return;

    setIsAdding(true);
    const position = getRandomPosition();

    // Get link metadata
    const metadata = await getLinkMetadata(linkUrl);

    const newItem: NewItem = {
      board_id: boardId,
      type: 'link',
      content: {
        url: linkUrl,
        title: metadata.title,
        description: metadata.description,
        favicon: metadata.favicon,
      },
      x: position.x,
      y: position.y,
      z_index: getNextZIndex(),
    };

    await onAddItem(newItem);
    setLinkUrl('');
    setShowLinkInput(false);
    setIsAdding(false);
  };

  return (
    <>
      {/* Upload Error Message */}
      {uploadError && (
        <div className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-lg z-50 text-sm mx-4 max-w-[calc(100vw-2rem)] text-center">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{uploadError}</span>
            <button 
              onClick={() => setUploadError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-xl px-2 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 z-50 border border-gray-200 max-w-[calc(100vw-2rem)]">
        {/* Add Note Button */}
        <button
          onClick={() => setShowNoteInput(!showNoteInput)}
          disabled={isAdding}
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-full transition-all text-xs sm:text-sm font-medium disabled:opacity-50 active:scale-[0.95]"
          title="Add Note"
        >
          <span>📝</span>
          <span className="hidden sm:inline">Note</span>
        </button>

        {/* Add Image Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isAdding}
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full transition-all text-xs sm:text-sm font-medium disabled:opacity-50 active:scale-[0.95]"
          title="Add Image"
        >
          <span>🖼️</span>
          <span className="hidden sm:inline">Image</span>
        </button>

        {/* Add Link Button */}
        <button
          onClick={() => setShowLinkInput(!showLinkInput)}
          disabled={isAdding}
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-full transition-all text-xs sm:text-sm font-medium disabled:opacity-50 active:scale-[0.95]"
          title="Add Link"
        >
          <span>🔗</span>
          <span className="hidden sm:inline">Link</span>
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAddImage}
          className="hidden"
        />
      </div>

      {/* Note Input Modal */}
      {showNoteInput && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-white/20">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">📝 Add a Note</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write your note..."
              className="w-full h-32 p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400 text-sm sm:text-base"
              autoFocus
            />
            <div className="flex gap-3 mt-4 sm:mt-6">
              <button
                onClick={handleAddNote}
                disabled={!noteText.trim() || isAdding}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] text-sm sm:text-base"
              >
                {isAdding ? 'Adding...' : 'Add Note'}
              </button>
              <button
                onClick={() => {
                  setShowNoteInput(false);
                  setNoteText('');
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-2.5 sm:py-3 rounded-xl font-semibold transition-all active:scale-[0.98] text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Input Modal */}
      {showLinkInput && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-white/20">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">🔗 Add a Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400 text-sm sm:text-base"
              autoFocus
            />
            <div className="flex gap-3 mt-4 sm:mt-6">
              <button
                onClick={handleAddLink}
                disabled={!linkUrl.trim() || isAdding}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] text-sm sm:text-base"
              >
                {isAdding ? 'Adding...' : 'Add Link'}
              </button>
              <button
                onClick={() => {
                  setShowLinkInput(false);
                  setLinkUrl('');
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-2.5 sm:py-3 rounded-xl font-semibold transition-all active:scale-[0.98] text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
