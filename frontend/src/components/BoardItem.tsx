'use client';

import { useState, useRef } from 'react';
import type { Item } from '@/lib/types';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

interface BoardItemProps {
  item: Item;
  onUpdate: (itemId: string, updates: { x?: number; y?: number; z_index?: number }) => void;
  onDelete: (itemId: string) => void;
  onBringToFront: (itemId: string) => void;
}

export default function BoardItem({ item, onUpdate, onDelete, onBringToFront }: BoardItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleDragStart = () => {
    setIsDragging(true);
    onBringToFront(item.id);
  };

  const handleDragStop = (_e: DraggableEvent, data: DraggableData) => {
    setIsDragging(false);
    onUpdate(item.id, { x: data.x, y: data.y });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this item?')) {
      onDelete(item.id);
    }
  };

  const renderContent = () => {
    switch (item.type) {
      case 'note':
        return (
          <div
            className="p-4 rounded-lg shadow-md min-w-[200px] max-w-[300px] min-h-[150px]"
            style={{
              backgroundColor: item.content.backgroundColor || '#FEF3C7',
              color: item.content.textColor || '#000',
            }}
          >
            <p className="whitespace-pre-wrap break-words text-sm">
              {item.content.text}
            </p>
          </div>
        );

      case 'image':
        return (
          <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-[400px]">
            <img
              src={item.content.url}
              alt={item.content.caption || 'Board image'}
              className="w-full h-auto object-cover"
              style={{
                maxHeight: item.content.height || 300,
              }}
            />
            {item.content.caption && (
              <div className="p-2 text-sm text-gray-700 bg-gray-50">
                {item.content.caption}
              </div>
            )}
          </div>
        );

      case 'link':
        return (
          <a
            href={item.content.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow min-w-[250px] max-w-[350px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              {item.content.favicon && (
                <img
                  src={item.content.favicon}
                  alt=""
                  className="w-6 h-6 mt-1 flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-900 truncate">
                  {item.content.title || item.content.url}
                </h3>
                {item.content.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {item.content.description}
                  </p>
                )}
                <p className="text-xs text-blue-600 mt-1 truncate">
                  {item.content.url}
                </p>
              </div>
            </div>
          </a>
        );

      default:
        return <div className="p-4 bg-gray-100 rounded">Unknown item type</div>;
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={{ x: item.x, y: item.y }}
      onStart={handleDragStart}
      onStop={handleDragStop}
      handle=".drag-handle"
    >
      <div
        ref={nodeRef}
        className="absolute cursor-move group"
        style={{ zIndex: item.z_index }}
      >
        {/* Delete button - shows on hover */}
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center text-xs font-bold hover:bg-red-600"
          aria-label="Delete item"
        >
          ×
        </button>

        {/* Drag handle - entire item is draggable */}
        <div className={`drag-handle ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
          {renderContent()}
        </div>
      </div>
    </Draggable>
  );
}
