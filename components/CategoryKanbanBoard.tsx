import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, GripVertical, Plus, Paperclip, MessageCircle } from "lucide-react";

// Status badge color mapping
const statusBadgeColorMap: Record<string, string> = {
  'draft': 'bg-gray-100 text-gray-700',
  'backlog': 'bg-gray-100 text-gray-700',
  'to_do': 'bg-gray-100 text-gray-700',
  'new': 'bg-gray-100 text-gray-700',
  'requested': 'bg-gray-100 text-gray-700',
  'in_progress': 'bg-blue-100 text-blue-700',
  'working': 'bg-blue-100 text-blue-700',
  'ongoing': 'bg-blue-100 text-blue-700',
  'doing': 'bg-blue-100 text-blue-700',
  'assigned': 'bg-blue-100 text-blue-700',
  'in_review': 'bg-blue-100 text-blue-700',
  'scheduled': 'bg-blue-100 text-blue-700',
  'blocked': 'bg-yellow-100 text-yellow-700',
  'needs_input': 'bg-yellow-100 text-yellow-700',
  'needs_work': 'bg-yellow-100 text-yellow-700',
  'on_hold': 'bg-yellow-100 text-yellow-700',
  'paused': 'bg-yellow-100 text-yellow-700',
  'waiting': 'bg-yellow-100 text-yellow-700',
  'done': 'bg-green-100 text-green-700',
  'approved': 'bg-green-100 text-green-700',
  'validated': 'bg-green-100 text-green-700',
  'paid': 'bg-green-100 text-green-700',
  'completed': 'bg-green-100 text-green-700',
  'rejected': 'bg-red-100 text-red-700',
  'canceled': 'bg-red-100 text-red-700',
  'closed': 'bg-red-100 text-red-700',
  'declined': 'bg-red-100 text-red-700',
  'terminated': 'bg-red-100 text-red-700'
};

// Helper function to find status by ID
const findStatusById = (id: string) => {
  const allStatuses = [
    { id: 'draft', title: 'Draft' },
    { id: 'backlog', title: 'Backlog' },
    { id: 'to_do', title: 'To Do' },
    { id: 'new', title: 'New' },
    { id: 'requested', title: 'Requested' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'working', title: 'Working' },
    { id: 'ongoing', title: 'Ongoing' },
    { id: 'doing', title: 'Doing' },
    { id: 'assigned', title: 'Assigned' },
    { id: 'in_review', title: 'In Review' },
    { id: 'scheduled', title: 'Scheduled' },
    { id: 'blocked', title: 'Blocked' },
    { id: 'needs_input', title: 'Needs Input' },
    { id: 'needs_work', title: 'Needs Work' },
    { id: 'on_hold', title: 'On Hold' },
    { id: 'paused', title: 'Paused' },
    { id: 'waiting', title: 'Waiting' },
    { id: 'done', title: 'Done' },
    { id: 'approved', title: 'Approved' },
    { id: 'validated', title: 'Validated' },
    { id: 'paid', title: 'Paid' },
    { id: 'completed', title: 'Completed' },
    { id: 'rejected', title: 'Rejected' },
    { id: 'canceled', title: 'Canceled' },
    { id: 'closed', title: 'Closed' },
    { id: 'declined', title: 'Declined' },
    { id: 'terminated', title: 'Terminated' }
  ];
  return allStatuses.find(status => status.id === id);
};

// Helper function to generate organization avatar
function generateOrganizationAvatar(organizationName: string): { bgColor: string, abbreviation: string } {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-500'
  ];
  const colorIndex = organizationName.charCodeAt(0) % colors.length;
  const abbreviation = organizationName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  return {
    bgColor: colors[colorIndex],
    abbreviation
  };
}

// Use the same status groups as All Tasks page for consistency
const STATUS_GROUPS = [
  {
    id: "CREATED",
    title: "Created",
    subtitle: "Not started yet",
    color: "bg-gray-50 border-gray-200",
    statuses: ["draft", "backlog", "to_do", "new", "requested"]
  },
  {
    id: "ACTIVE", 
    title: "Active",
    subtitle: "In progress",
    color: "bg-blue-50 border-blue-200",
    statuses: ["in_progress", "working", "ongoing", "doing", "assigned", "in_review", "scheduled"]
  },
  {
    id: "PAUSED",
    title: "Paused", 
    subtitle: "Temporarily paused",
    color: "bg-yellow-50 border-yellow-200",
    statuses: ["blocked", "needs_input", "needs_work", "on_hold", "paused", "waiting"]
  },
  {
    id: "COMPLETED",
    title: "Completed",
    subtitle: "Successfully completed",
    color: "bg-green-50 border-green-200", 
    statuses: ["done", "approved", "validated", "paid", "completed"]
  },
  {
    id: "REJECTED",
    title: "Rejected",
    subtitle: "Rejected or canceled",
    color: "bg-red-50 border-red-200",
    statuses: ["rejected", "canceled", "closed", "declined", "terminated"]
  }
];

// Workflow rules for status transitions
const WORKFLOW_RULES = {
  "CREATED": ["ACTIVE", "PAUSED", "REJECTED"],
  "ACTIVE": ["PAUSED", "COMPLETED", "REJECTED"],
  "PAUSED": ["CREATED", "ACTIVE", "REJECTED"],
  "COMPLETED": ["REJECTED"],
  "REJECTED": ["CREATED", "ACTIVE"]
};



interface CategoryKanbanBoardProps {
  category: string;
  tasks: any[];
  onTaskUpdate?: (taskId: string, updates: any) => void;
  onTaskClick?: (task: any) => void;
}

export default function CategoryKanbanBoard({ 
  category, 
  tasks, 
  onTaskUpdate, 
  onTaskClick 
}: CategoryKanbanBoardProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [draggedTask, setDraggedTask] = useState<any>(null);

  // Use the same status groups as All Tasks page
  const statusGroups = STATUS_GROUPS;
  
  // Debug log to ensure we're using the correct status groups
  console.log(`CategoryKanbanBoard for category "${category}" using status groups:`, statusGroups.map(g => g.id));

  // Filter tasks for this category from All Tasks view
  const categoryTasks = useMemo(() => {
    return tasks.filter(task => task.category === category);
  }, [tasks, category]);

  // Get tasks for each column using the same status groups as All Tasks page
  const getColumnTasks = (statusGroup: string) => {
    // Find the status group configuration
    const group = statusGroups.find(g => g.id === statusGroup);
    if (!group) return [];
    
    // Get parent tasks that match any status in this group
    const parentTasks = categoryTasks.filter(task => group.statuses.includes(task.status));
    
    // For category views, only show parent tasks (no subtasks)
    return parentTasks;
  };

  // Handle drag end - exact same logic as All Tasks page
  const onDragEnd = (result: DropResult) => {
    console.log('=== CATEGORY DRAG END DEBUG ===');
    console.log('onDragEnd called with result:', result);
    console.log('Current categoryTasks state before update:', categoryTasks.map(t => ({ id: t.id, status: t.status, title: t.title })));
    setDraggedTask(null);
    
    const { destination, source, draggableId, type } = result;
    
    if (!destination) {
      console.log('No destination, dropping cancelled');
      return;
    }
    
    console.log(`Drag operation: ${type}, from ${source.droppableId} to ${destination.droppableId}`);
    
    // Handle task reordering within the same column
    if (destination.droppableId === source.droppableId && destination.index !== source.index) {
      console.log('Reordering task within same column');
      
      // Add visual feedback for reordering
      const movedTaskElement = document.querySelector(`[data-task-id="${draggableId}"]`);
      if (movedTaskElement) {
        // Add reorder animation
        movedTaskElement.classList.add('task-reorder-animation');
        setTimeout(() => {
          movedTaskElement.classList.remove('task-reorder-animation');
        }, 200);
      }
      
      toast.success("Task order updated");
      return;
    }
    
    // Handle task moving between columns
    if (destination.droppableId !== source.droppableId) {
      console.log(`Moving task between columns: ${source.droppableId} -> ${destination.droppableId}`);
      
      // Find task
      const task = categoryTasks.find((t) => t.id === draggableId);
      if (!task) {
        console.log(`Task ${draggableId} not found`);
        toast.error(`Task not found: ${draggableId}`);
        return;
      }
      
      console.log(`Found task: ${draggableId}, current status: ${task.status}`);

      // Basic workflow validation using the same rules as All Tasks page
      const fromGroup = source.droppableId;
      const toGroup = destination.droppableId;
      const allowedTransitions = WORKFLOW_RULES[fromGroup as keyof typeof WORKFLOW_RULES] || [];
      
      // Check if the target group is allowed for this workflow
      if (!allowedTransitions.includes(toGroup)) {
        const fromGroupTitle = fromGroup.charAt(0).toUpperCase() + fromGroup.slice(1);
        const toGroupTitle = toGroup.charAt(0).toUpperCase() + toGroup.slice(1);
        toast.error(`Cannot move task from "${fromGroupTitle}" to "${toGroupTitle}"`);
        return;
      }

      // Map the target group to appropriate All Tasks status
      const targetGroup = statusGroups.find(g => g.id === toGroup);
      const targetAllTasksStatus = targetGroup?.statuses[0] || task.status;

      // Update task status with optimistic update
      if (onTaskUpdate) {
        onTaskUpdate(draggableId, { status: targetAllTasksStatus });
        
        // Add animation and scroll to the moved task
        setTimeout(() => {
          const movedTaskElement = document.querySelector(`[data-task-id="${draggableId}"]`);
          if (movedTaskElement) {
            // Add insertion animation
            movedTaskElement.classList.add('task-insert-animation');
            
            // Scroll to the task if it's out of view
            movedTaskElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            });
            
            // Remove animation class after animation completes
            setTimeout(() => {
              movedTaskElement.classList.remove('task-insert-animation');
            }, 300);
          }
        }, 100);
        
        const toGroupTitle = toGroup.charAt(0).toUpperCase() + toGroup.slice(1);
        toast.success(`Task moved to ${toGroupTitle}`);
        
        // Additional debugging: Log the current state after the move
        setTimeout(() => {
          console.log(`=== POST-MOVE DEBUG ===`);
          console.log(`CategoryTasks state after move:`, categoryTasks.map(t => ({ id: t.id, status: t.status, title: t.title })));
          console.log(`=== END POST-MOVE DEBUG ===`);
        }, 100);
      }
    }
  };

  const onDragStart = (start: any) => {
    const task = categoryTasks.find((t) => t.id === start.draggableId);
    if (task) {
      setDraggedTask(task);
    }
  };

  const renderTaskCard = useCallback((task: any, isSubtask = false, taskIndex = 0) => {
    const showAttachments = true; // Always show attachments for category pages
    const showComments = true; // Always show comments for category pages
    
    // Calculate which fields are actually visible for this specific task
    const visibleFields = {
      taskId: true,
      name: true,
      status: true, // Show status on category pages
      description: task.description,
      tags: task.tags && task.tags.length > 0,
      organization: !isSubtask,
      assignee: task.teamMembers,
      priority: task.priority,
      dueDate: task.dueDate,
      attachments: showAttachments,
      comments: showComments,
      subtasks: task.subtasks && task.subtasks.length > 0
    };
    
    // Count visible fields to determine card complexity
    const visibleFieldCount = Object.values(visibleFields).filter(Boolean).length;
    
    // Calculate dynamic padding based on visible fields
    const getDynamicPadding = () => {
      if (isSubtask) return "p-3"; // Subtasks always compact
      if (visibleFieldCount <= 2) return "p-2"; // Very simple cards
      if (visibleFieldCount <= 4) return "p-3"; // Simple cards
      if (visibleFieldCount <= 6) return "p-4"; // Medium cards
      return "p-4"; // Complex cards
    };
    
    return (
      <Draggable key={task.id} draggableId={task.id} index={taskIndex}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="relative"
            data-task-id={task.id}
            style={{
              ...provided.draggableProps.style,
              transform: provided.draggableProps.style?.transform,
            }}
          >
                             <Card 
                   {...provided.dragHandleProps}
                   className={`kanban-card group border-[#e8e8ec] rounded-2xl w-full cursor-grab ${
                     snapshot.isDragging 
                       ? 'dragging shadow-xl shadow-black/20 border-blue-300 cursor-grabbing transition-none' 
                       : 'shadow-none hover:shadow-lg hover:shadow-black/15 hover:border-gray-300 transition-all duration-200 ease-out'
                   }`}
                 >
              <CardContent className={`${getDynamicPadding()}`}>
                {/* Parent task indicator for subtasks */}
                {isSubtask && task.parentTask && (
                  <div className="px-3 py-1 bg-gray-100 rounded-t-2xl text-xs text-gray-600 font-medium border-b border-gray-200 -mx-3 -mt-3 mb-3">
                    Part of: {task.parentTask.title}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs font-semibold text-[#60646c] mb-1">
                  <div className="flex items-center gap-1">
                    {/* Subtask indicator */}
                    {isSubtask && (
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M9 11l3 3L22 4" />
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                        <span className="text-xs text-gray-500">Subtask</span>
                      </div>
                    )}
                    {visibleFields.taskId && <span>{task.taskId}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                                         {/* Status Label - Show on category pages */}
                     {visibleFields.status && (() => {
                       const status = findStatusById(task.status);
                       if (status) {
                         return (
                           <div className="flex items-center gap-1">
                             <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusBadgeColorMap[task.status] || 'bg-gray-100 text-gray-700'}`}>
                               {status.title}
                             </span>
                           </div>
                         );
                       }
                       return null;
                     })()}
                  </div>
                </div>
                
                {/* Title (Name) */}
                {visibleFields.name && (
                  <div className="mb-1">
                    <div 
                      className="text-xs font-medium text-[#1c2024] cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => onTaskClick && onTaskClick(task)}
                    >
                      {task.title}
                    </div>
                    {/* Parent task info for subtasks */}
                    {isSubtask && task.parentTaskTitle && (
                      <div className="text-xs text-gray-500 mt-1">
                        Parent: {task.parentTaskTitle}
                      </div>
                    )}
                  </div>
                )}
                
                                 {/* Description */}
                 {visibleFields.description && (
                   <div className="text-xs text-[#8b8d98] mb-2 overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{task.description}</div>
                 )}
                
                {/* Tags */}
                {visibleFields.tags && (
                  <div className="flex flex-wrap items-center gap-1 mb-2">
                    {task.tags.slice(0, 3).map((tag: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {tag}
                      </span>
                    ))}
                    {task.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600 border border-gray-300">
                        +{task.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Org + Avatars - не показувати організацію для підзадач */}
                {((visibleFields.organization && !isSubtask) || visibleFields.assignee) && (
                  <div className="flex items-center justify-between mb-1">
                    {/* Org logo and organization - приховано для підзадач */}
                    {!isSubtask && visibleFields.organization && (
                      <div className="flex items-center gap-2">
                        {(() => {
                          const avatar = generateOrganizationAvatar(task.clientInfo || 'Default');
                          return (
                            <div className={`w-6 h-6 rounded-full ${avatar.bgColor} flex items-center justify-center text-xs text-white font-medium`}>
                              {avatar.abbreviation}
                            </div>
                          );
                        })()}
                        <span className="text-xs text-gray-600">{task.clientInfo || 'Default'}</span>
                      </div>
                    )}
                    
                    {/* Assignee avatars */}
                    {visibleFields.assignee && task.teamMembers && task.teamMembers.length > 0 && (
                      <div className="flex -space-x-1">
                        {task.teamMembers.slice(0, 3).map((member: any, idx: number) => (
                          <div 
                            key={idx}
                            className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs"
                            title={member.name}
                          >
                            {member.name.charAt(0)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Priority and Due Date */}
                {(visibleFields.priority || visibleFields.dueDate) && (
                  <div className="flex items-center justify-between mb-1">
                    {visibleFields.priority && task.priority && (
                      <div className="flex items-center gap-1">
                        {task.priority === 'high' && (
                          <span className="text-red-500 text-xs">🔥</span>
                        )}
                        <span className="text-xs text-gray-600 capitalize">{task.priority}</span>
                      </div>
                    )}
                    {visibleFields.dueDate && task.dueDate && (
                      <div className="text-xs text-gray-500">
                        Due: {task.dueDate}
                      </div>
                    )}
                  </div>
                )}
                
                
                
                {/* Attachments and Comments */}
                {(visibleFields.attachments || visibleFields.comments) && (
                  <div className="flex items-center gap-3 mt-2 w-full">
                    <div className="flex items-center gap-1 ml-auto">
                      {visibleFields.attachments && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f3f3f3] text-xs text-[#60646c]">
                          <Paperclip className="w-3 h-3" />
                          <span>{task.attachmentCount || 0}</span>
                        </span>
                      )}
                      {visibleFields.comments && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f3f3f3] text-xs text-[#60646c]">
                          <MessageCircle className="w-3 h-3" />
                          <span>{task.commentCount || 0}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </Draggable>
    );
  }, [onTaskClick]);

  const renderColumn = (column: any) => {
    const tasksInColumn = getColumnTasks(column.id);
    const isCollapsed = collapsed[column.id] || false;
    

    


    return (
      <div key={column.id} className="kanban-column">
        <div className={`drop-zone flex flex-col min-w-[320px] max-w-[380px] h-[calc(100vh-160px)] rounded-lg border p-0 transition-all duration-200 relative ${column.color}`}>
          {/* Column Header */}
          <div className="flex items-center justify-between mb-0 px-4 pt-3 pb-2 group">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm text-gray-900">{column.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {tasksInColumn.length}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-400 invisible group-hover:visible"
                onClick={() => setCollapsed(c => ({ ...c, [column.id]: !c[column.id] }))}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-400 invisible group-hover:visible"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Column Content */}
          {!isCollapsed && (
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 overflow-y-auto px-4 pb-4"
                >
                                     <div className="space-y-2">
                     {tasksInColumn.map((task, index) => (
                       <Draggable key={task.id} draggableId={task.id} index={index}>
                         {(provided, snapshot) => (
                           <div
                             ref={provided.innerRef}
                             {...provided.draggableProps}
                             {...provided.dragHandleProps}
                             className="relative"
                           >
                             {renderTaskCard(task, false, index)}
                           </div>
                         )}
                       </Draggable>
                     ))}
                   </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 px-4 pt-4 pb-4">
      <div className="group relative kanban-board-container">
        <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="COLUMN" direction="horizontal">
            {(provided) => (
              <div 
                ref={provided.innerRef} 
                {...provided.droppableProps} 
                className="kanban-scrollbar flex gap-3 min-h-[700px] overflow-x-auto horizontal-hover-scrollbar"
              >
                {statusGroups.map((column, index) => (
                  <Draggable key={column.id} draggableId={column.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="kanban-column transition-all duration-200"
                      >
                        {renderColumn(column)}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
} 