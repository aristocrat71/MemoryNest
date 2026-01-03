'use client';

import { useState, useCallback } from 'react';
import BoardItem from './BoardItem';
import Toolbar from './Toolbar';
import type { Item, NewItem } from '@/lib/types';
import { getMaxZIndex } from '@/lib/utils';

interface BoardCanvasProps {
  boardId: string;
  items: Item[];
  onCreateItem: (item: NewItem) => Promise<Item | null>;
  onUpdateItem: (itemId: string, updates: { x?: number; y?: number; z_index?: number }) => Promise<boolean>;
  onDeleteItem: (itemId: string) => Promise<boolean>;
}

export default function BoardCanvas({
  boardId,
  items,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
}: BoardCanvasProps) {
  const [isPanning, setIsPanning] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Bring item to front when clicked
  const handleBringToFront = useCallback(
    async (itemId: string) => {
      const maxZ = getMaxZIndex(items);
      const item = items.find((i) => i.id === itemId);
      
      if (item && item.z_index < maxZ) {
        await onUpdateItem(itemId, { z_index: maxZ + 1 });
      }
    },
    [items, onUpdateItem]
  );

  // Pan/zoom handlers (simplified - no zoom for MVP)
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan with middle mouse or space + left click
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault();
      setIsPanning(true);
      setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setOffset({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleAddItem = async (newItem: NewItem) => {
    await onCreateItem(newItem);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Canvas area */}
      <div
        className={`absolute inset-0 ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Transform container for pan/zoom */}
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
        >
          {/* Render all items */}
          {items.map((item) => (
            <BoardItem
              key={item.id}
              item={item}
              onUpdate={onUpdateItem}
              onDelete={onDeleteItem}
              onBringToFront={handleBringToFront}
            />
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar boardId={boardId} items={items} onAddItem={handleAddItem} />

      {/* Instructions overlay */}
      {items.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-500">
            <p className="text-2xl font-light mb-2">✨ Your board is empty</p>
            <p className="text-sm">Click the buttons below to add notes, images, or links</p>
          </div>
        </div>
      )}

      {/* Item count badge */}
      <div className="fixed top-4 right-4 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 text-sm text-gray-700 font-medium shadow-md border border-gray-100">
        {items.length} {items.length === 1 ? 'item' : 'items'}
      </div>

      {/* Pan instruction */}
      <div className="fixed top-4 left-4 bg-white/90 backdrop-blur-md rounded-xl px-3 py-2 text-xs text-gray-700 shadow-md border border-gray-100">
        Hold <kbd className="px-1.5 py-0.5 bg-gray-200 text-gray-800 rounded font-mono text-xs">Shift</kbd> + drag to pan
      </div>
    </div>
  );
}
