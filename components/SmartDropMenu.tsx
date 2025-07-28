import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface SmartDropMenuProps {
  isVisible: boolean;
  hiddenColumns: Array<{
    id: string;
    title: string;
    color: string;
    taskCount: number;
  }>;
  onDrop: (columnId: string) => void;
  draggedTask: any;
}

export default function SmartDropMenu({ 
  isVisible, 
  hiddenColumns, 
  onDrop, 
  draggedTask 
}: SmartDropMenuProps) {
  if (!isVisible || hiddenColumns.length === 0) {
    return null;
  }

  // Close menu when clicking outside
  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      // This will be handled by parent component
      return;
    }
  };

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-[9999] pointer-events-none">
      <div 
        className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-2 min-w-[200px] pointer-events-auto" 
        style={{ pointerEvents: 'auto' }}
        onClick={handleOutsideClick}
      >
        <div className="text-xs font-medium text-gray-500 mb-2 px-2">
          Move to:
        </div>
        <div className="space-y-1">
          {hiddenColumns.map((column) => {
            const isDropAllowed = draggedTask ? 
              isValidTransition(draggedTask.status, column.id) : 
              true;
            
            return (
              <div
                key={column.id}
                className={`
                  relative group cursor-pointer rounded-md p-2 transition-all duration-200
                  ${isDropAllowed 
                    ? 'hover:bg-blue-50 hover:border-blue-200 border border-transparent' 
                    : 'opacity-50 cursor-not-allowed'
                  }
                `}
                onMouseUp={() => {
                  if (isDropAllowed) {
                    onDrop(column.id);
                  }
                }}
                onTouchEnd={() => {
                  if (isDropAllowed) {
                    onDrop(column.id);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${column.color.replace('bg-', 'bg-').replace('border-', 'bg-')}`} />
                    <span className="text-sm font-medium text-gray-700">
                      {column.title}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {column.taskCount}
                  </Badge>
                </div>
                
                {/* Drop indicator */}
                {isDropAllowed && (
                  <div className="absolute inset-0 border-2 border-blue-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Helper function to check if transition is valid
const isValidTransition = (fromStatus: string, toStatus: string): boolean => {
  const allowedTransitions: Record<string, string[]> = {
    "To do": ["In Progress", "Blocked", "Paused"],
    "In Progress": ["Needs Work", "Verified", "Paused", "Blocked", "To do"],
    "Needs Work": ["In Progress", "Blocked", "Paused"],
    "Verified": ["Acknowledged", "Done", "Paused", "Blocked"],
    "Acknowledged": ["Done"],
    "Paused": ["In Progress", "To do", "Blocked"],
    "Blocked": ["To do", "In Progress", "Paused"],
    "Done": ["In Progress", "Acknowledged"],
  };

  if (fromStatus === toStatus) return true;
  
  const allowedTargets = allowedTransitions[fromStatus];
  if (!allowedTargets) {
    return false;
  }
  
  return allowedTargets.includes(toStatus);
}; 