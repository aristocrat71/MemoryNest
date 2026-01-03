'use client';

import { useState, useRef } from 'react';
import type { NewItem } from '@/lib/types';
import { getRandomNoteColor, getMaxZIndex, getLinkMetadata } from '@/lib/utils';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    setIsAdding(true);

    // For MVP, we'll use a simple data URL
    // In production, upload to Supabase Storage
    const reader = new FileReader();
    reader.onload = async (event) => {
      const position = getRandomPosition();

      const newItem: NewItem = {
        board_id: boardId,
        type: 'image',
        content: {
          url: event.target?.result as string,
          caption: file.name,
        },
        x: position.x,
        y: position.y,
        z_index: getNextZIndex(),
      };

      await onAddItem(newItem);
      setIsAdding(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsDataURL(file);
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
      {/* Toolbar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-xl px-4 py-3 flex items-center gap-3 z-50 border border-gray-200">
        {/* Add Note Button */}
        <button
          onClick={() => setShowNoteInput(!showNoteInput)}
          disabled={isAdding}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-full transition-all text-sm font-medium disabled:opacity-50 active:scale-[0.95]"
          title="Add Note"
        >
          📝 Note
        </button>

        {/* Add Image Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isAdding}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full transition-all text-sm font-medium disabled:opacity-50 active:scale-[0.95]"
          title="Add Image"
        >
          🖼️ Image
        </button>

        {/* Add Link Button */}
        <button
          onClick={() => setShowLinkInput(!showLinkInput)}
          disabled={isAdding}
          className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-full transition-all text-sm font-medium disabled:opacity-50 active:scale-[0.95]"
          title="Add Link"
        >
          🔗 Link
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
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/20">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📝 Add a Note</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write your note..."
              className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
              autoFocus
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddNote}
                disabled={!noteText.trim() || isAdding}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {isAdding ? 'Adding...' : 'Add Note'}
              </button>
              <button
                onClick={() => {
                  setShowNoteInput(false);
                  setNoteText('');
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-xl font-semibold transition-all active:scale-[0.98]"
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
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/20">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🔗 Add a Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
              autoFocus
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddLink}
                disabled={!linkUrl.trim() || isAdding}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {isAdding ? 'Adding...' : 'Add Link'}
              </button>
              <button
                onClick={() => {
                  setShowLinkInput(false);
                  setLinkUrl('');
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-xl font-semibold transition-all active:scale-[0.98]"
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
