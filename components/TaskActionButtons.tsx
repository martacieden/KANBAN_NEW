import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

interface TaskActionButtonsProps {
  task: any;
  isSubtask?: boolean;
  onEdit?: (task: any) => void;
  onArchive?: (taskId: string) => void;
  onUnarchive?: (taskId: string) => void;
  onMoreOptions?: (task: any) => void;
  className?: string;
  alwaysVisible?: boolean;
}

export default function TaskActionButtons({
  task,
  isSubtask = false,
  onEdit,
  onArchive,
  onUnarchive,
  onMoreOptions,
  className = "",
  alwaysVisible = false // Changed back to false - buttons only visible on hover
}: TaskActionButtonsProps) {
  const isArchived = 'archived' in task && task.archived;
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(task);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isArchived) {
      onUnarchive?.(task.id);
    } else {
      onArchive?.(task.id);
    }
  };

  const handleMoreOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoreOptions?.(task);
  };

  const baseClasses = "flex items-center gap-1";
  const visibilityClasses = alwaysVisible 
    ? "opacity-100" 
    : "opacity-0 group-hover:opacity-100 transition-opacity duration-200";

  return (
    <div className={`absolute top-2 right-2 ${baseClasses} ${visibilityClasses} ${className}`}>
      {/* Edit button */}
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
        onClick={handleEdit}
        title={`Edit ${isSubtask ? 'subtask' : 'task'}`}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </Button>
      
      {/* Archive/Unarchive button */}
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
        onClick={handleArchive}
        title={isArchived ? 'Unarchive' : 'Archive'}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      </Button>
      
      {/* More options button */}
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
        onClick={handleMoreOptions}
        title="More options"
      >
        <MoreHorizontal className="w-3 h-3" />
      </Button>
    </div>
  );
} 