import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, ChevronLeft, GripVertical, Plus, Paperclip, MessageCircle, ChevronUp, ChevronDown as ChevronDownIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { 
  CATEGORY_STATUS_MAPPING, 
  mapCategoryStatusToGlobalStatuses,
  mapGlobalStatusToCategoryStatus,
  getCategoryStatuses 
} from '../config/task-mapping';
import { 
  syncCategoryStatusChange,
  syncGlobalStatusChange,
  validateStatusTransition,
  getMappingInfo
} from '../lib/task-mapping-utils';
import { useCategorySettings } from '../contexts/CategorySettingsContext';

// Status badge color mapping
const statusBadgeColorMap: Record<string, string> = {
  'draft': 'bg-gray-100 text-gray-700',
  'to_do': 'bg-gray-100 text-gray-700',
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
  'pause_it': 'bg-yellow-100 text-yellow-700',
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
    { id: 'to_do', title: 'To Do' },
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
    { id: 'pause_it', title: 'Paused' },
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
    'bg-gray-250', 'bg-slate-300', 'bg-gray-300', 'bg-gray-200'
  ];
  const colorIndex = organizationName.charCodeAt(0) % colors.length;
  const abbreviation = organizationName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  return {
    bgColor: colors[colorIndex],
    abbreviation
  };
}

// Category-specific status groups - optimized workflows
const CATEGORY_STATUS_GROUPS = {
  "Budget": [
    {
      id: "to_do",
      title: "To Do",
      subtitle: "Planning & Preparation",
    color: "bg-gray-50 border-gray-200",
      statuses: ["to_do", "draft", "requested", "new", "backlog"]
    },
    {
      id: "in_progress", 
      title: "In Progress",
      subtitle: "Active Work",
    color: "bg-blue-50 border-blue-200",
      statuses: ["in_progress", "working", "assigned", "ongoing", "doing", "scheduled"]
    },
    {
      id: "in_review",
      title: "In Review",
      subtitle: "Under Review",
    color: "bg-yellow-50 border-yellow-200",
      statuses: ["in_review", "needs_input", "needs_work", "blocked", "on_hold", "paused", "waiting", "pause_it"]
    },
    {
      id: "approved",
      title: "Approved",
      subtitle: "Approved & Completed",
      color: "bg-green-50 border-green-200", 
      statuses: ["approved", "done", "validated", "completed", "paid", "closed"]
    },
    {
      id: "rejected",
      title: "Rejected",
      subtitle: "Rejected or Canceled",
      color: "bg-red-50 border-red-200",
      statuses: ["rejected", "canceled", "declined", "terminated"]
    }
  ],
  "Legal": [
    {
      id: "draft",
      title: "Draft",
      subtitle: "Initial Draft",
      color: "bg-gray-50 border-gray-200",
      statuses: ["draft", "to_do", "new", "backlog", "requested"]
    },
    {
      id: "in_review", 
      title: "Legal Review",
      subtitle: "Under Legal Review",
      color: "bg-blue-50 border-blue-200",
      statuses: ["in_review", "in_progress", "working", "assigned", "ongoing", "doing", "scheduled"]
    },
    {
      id: "pending",
      title: "Pending Approval",
      subtitle: "Awaiting Approval",
      color: "bg-yellow-50 border-yellow-200",
      statuses: ["needs_input", "on_hold", "waiting", "blocked", "paused", "needs_work"]
    },
    {
      id: "finalized",
      title: "Finalized",
      subtitle: "Completed & Signed",
      color: "bg-green-50 border-green-200", 
      statuses: ["approved", "done", "completed", "validated", "paid", "closed"]
    },
    {
      id: "rejected",
      title: "Rejected",
      subtitle: "Rejected or Canceled",
      color: "bg-red-50 border-red-200",
      statuses: ["rejected", "canceled", "declined", "terminated"]
    }
  ],
  "HR": [
    {
      id: "open",
      title: "Open",
      subtitle: "New Positions",
      color: "bg-gray-50 border-gray-200",
      statuses: ["to_do", "new", "requested", "draft", "backlog"]
    },
    {
      id: "screening", 
      title: "Screening",
      subtitle: "Candidate Screening",
      color: "bg-blue-50 border-blue-200",
      statuses: ["in_progress", "working", "assigned", "ongoing", "doing", "scheduled"]
    },
    {
      id: "interviewing",
      title: "Interviewing",
      subtitle: "Interview Process",
      color: "bg-yellow-50 border-yellow-200",
      statuses: ["in_review", "ongoing", "doing", "needs_input", "on_hold", "waiting", "blocked", "paused", "needs_work"]
    },
    {
      id: "hired",
      title: "Hired",
      subtitle: "Successfully Hired",
      color: "bg-green-50 border-green-200", 
      statuses: ["approved", "done", "completed", "validated", "paid", "closed"]
    },
    {
      id: "rejected",
      title: "Rejected",
      subtitle: "Candidate Rejected",
      color: "bg-red-50 border-red-200",
      statuses: ["rejected", "canceled", "declined", "terminated"]
    }
  ],
  "Philanthropy": [
    {
      id: "proposal",
      title: "Proposal",
      subtitle: "Grant Proposal",
      color: "bg-gray-50 border-gray-200",
      statuses: ["to_do", "draft", "new", "backlog", "requested"]
    },
    {
      id: "evaluation", 
      title: "Evaluation",
      subtitle: "Under Evaluation",
      color: "bg-blue-50 border-blue-200",
      statuses: ["in_progress", "in_review", "working", "assigned", "ongoing", "doing", "scheduled"]
    },
    {
      id: "approved",
      title: "Approved",
      subtitle: "Grant Approved",
      color: "bg-green-50 border-green-200", 
      statuses: ["approved", "done", "validated", "needs_input", "on_hold", "waiting", "blocked", "paused", "needs_work"]
    },
    {
      id: "funded",
      title: "Funded",
      subtitle: "Funds Disbursed",
      color: "bg-green-100 border-green-300", 
      statuses: ["completed", "paid", "closed"]
    },
    {
      id: "rejected",
      title: "Rejected",
      subtitle: "Grant Rejected",
      color: "bg-red-50 border-red-200",
      statuses: ["rejected", "canceled", "declined", "terminated"]
    }
  ],
  "Investment": [
    {
      id: "research",
      title: "Research",
      subtitle: "Market Research",
      color: "bg-gray-50 border-gray-200",
      statuses: ["to_do", "draft", "new", "backlog", "requested"]
    },
    {
      id: "analysis", 
      title: "Analysis",
      subtitle: "Financial Analysis",
      color: "bg-blue-50 border-blue-200",
      statuses: ["in_progress", "in_review", "working", "assigned", "ongoing", "doing", "scheduled"]
    },
    {
      id: "decision",
      title: "Decision",
      subtitle: "Investment Decision",
      color: "bg-yellow-50 border-yellow-200",
      statuses: ["needs_input", "on_hold", "waiting", "blocked", "paused", "needs_work"]
    },
    {
      id: "executed",
      title: "Executed",
      subtitle: "Investment Executed",
      color: "bg-green-50 border-green-200", 
      statuses: ["approved", "done", "completed", "validated", "paid", "closed"]
    },
    {
      id: "rejected",
      title: "Rejected",
      subtitle: "Investment Rejected",
      color: "bg-red-50 border-red-200",
      statuses: ["rejected", "canceled", "declined", "terminated"]
    }
  ],
  "Food": [
    {
      id: "planning",
      title: "Planning",
      subtitle: "Menu Planning",
      color: "bg-gray-50 border-gray-200",
      statuses: ["to_do", "draft", "new", "backlog", "requested"]
    },
    {
      id: "preparation", 
      title: "Preparation",
      subtitle: "Food Preparation",
      color: "bg-blue-50 border-blue-200",
      statuses: ["in_progress", "working", "assigned", "ongoing", "doing", "scheduled"]
    },
    {
      id: "serving",
      title: "Serving",
      subtitle: "Food Service",
      color: "bg-yellow-50 border-yellow-200",
      statuses: ["in_review", "ongoing", "doing", "needs_input", "on_hold", "waiting", "blocked", "paused", "needs_work"]
    },
    {
      id: "completed",
    title: "Completed",
      subtitle: "Service Completed",
    color: "bg-green-50 border-green-200", 
      statuses: ["done", "approved", "completed", "validated", "paid", "closed"]
    },
    {
      id: "cancelled",
      title: "Cancelled",
      subtitle: "Service Cancelled",
      color: "bg-red-50 border-red-200",
      statuses: ["rejected", "canceled", "declined", "terminated"]
    }
  ],
  "Accounting": [
    {
      id: "pending",
      title: "Pending",
      subtitle: "Pending Processing",
      color: "bg-gray-50 border-gray-200",
      statuses: ["to_do", "draft", "new", "backlog", "requested"]
    },
    {
      id: "processing", 
      title: "Processing",
      subtitle: "Under Processing",
      color: "bg-blue-50 border-blue-200",
      statuses: ["in_progress", "working", "assigned", "ongoing", "doing", "scheduled"]
    },
    {
      id: "review",
      title: "Review",
      subtitle: "Under Review",
      color: "bg-yellow-50 border-yellow-200",
      statuses: ["in_review", "needs_input", "needs_work", "blocked", "on_hold", "paused", "waiting"]
    },
    {
      id: "completed",
      title: "Completed",
      subtitle: "Processing Completed",
      color: "bg-green-50 border-green-200", 
      statuses: ["done", "approved", "completed", "validated", "paid", "closed"]
    },
    {
      id: "rejected",
      title: "Rejected",
      subtitle: "Processing Rejected",
      color: "bg-red-50 border-red-200",
      statuses: ["rejected", "canceled", "declined", "terminated"]
    }
  ],
  "Travel": [
    {
      id: "planning",
      title: "Planning",
      subtitle: "Trip Planning",
      color: "bg-gray-50 border-gray-200",
      statuses: ["to_do", "draft", "new", "backlog", "requested"]
    },
    {
      id: "booking", 
      title: "Booking",
      subtitle: "Making Bookings",
      color: "bg-blue-50 border-blue-200",
      statuses: ["in_progress", "working", "assigned", "ongoing", "doing", "scheduled"]
    },
    {
      id: "confirmed",
      title: "Confirmed",
      subtitle: "Travel Confirmed",
      color: "bg-green-50 border-green-200", 
      statuses: ["approved", "done", "completed", "validated", "paid", "closed", "in_review", "needs_input", "on_hold", "waiting", "blocked", "paused", "needs_work"]
    },
    {
      id: "cancelled",
      title: "Cancelled",
      subtitle: "Travel Cancelled",
      color: "bg-red-50 border-red-200",
      statuses: ["rejected", "canceled", "declined", "terminated"]
    }
  ]
};

// Default status groups for unknown categories
const DEFAULT_STATUS_GROUPS = [
  {
    id: "to_do",
    title: "To Do",
    subtitle: "Not started",
    color: "bg-gray-50 border-gray-200",
    statuses: ["to_do", "draft", "new", "backlog", "requested"]
  },
  {
    id: "in_progress", 
    title: "In Progress",
    subtitle: "Active work",
    color: "bg-blue-50 border-blue-200",
    statuses: ["in_progress", "working", "assigned", "ongoing", "doing", "scheduled"]
  },
      {
      id: "review",
      title: "Review",
      subtitle: "Under review",
      color: "bg-yellow-50 border-yellow-200",
      statuses: ["in_review", "needs_input", "needs_work", "blocked", "on_hold", "paused", "waiting", "pause_it"]
    },
  {
    id: "completed",
    title: "Completed",
    subtitle: "Finished",
    color: "bg-green-50 border-green-200", 
    statuses: ["done", "approved", "completed", "validated", "paid", "closed"]
  },
  {
    id: "rejected",
    title: "Rejected",
    subtitle: "Rejected or canceled",
    color: "bg-red-50 border-red-200",
    statuses: ["rejected", "canceled", "declined", "terminated"]
  }
];

interface CategoryKanbanBoardProps {
  category: string;
  tasks: any[];
  onTaskUpdate?: (taskId: string, updates: any) => void;
  onTaskClick?: (task: any) => void;
  onFiltersChange?: (count: number) => void;
  cardFields?: Record<string, boolean>;
}

export default function CategoryKanbanBoard({ 
  category, 
  tasks, 
  onTaskUpdate, 
  onTaskClick,
  onFiltersChange,
  cardFields = {}
}: CategoryKanbanBoardProps) {
  const { getCategorySettings, getCategoryGroups } = useCategorySettings();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [draggedTask, setDraggedTask] = useState<any>(null);
  const [expandedSubtasks, setExpandedSubtasks] = useState<Record<string, boolean>>({});

  // Quick filters state
  const [quickFilters, setQuickFilters] = useState<Record<string, boolean>>({
    assignedToMe: false,
    createdByMe: false,
    overdue: false,
    unassigned: false,
    dueSoon: false,
    recentlyUpdated: false,
    onHold: false,
    highPriority: false,
    stalled: false,
  });
  
  const [agingFilter, setAgingFilter] = useState('all');
  const [now, setNow] = useState<Date | null>(null);
  
  // Set now time after component mounts to avoid hydration mismatch
  useEffect(() => {
    setNow(new Date());
  }, []);
  
  // Синхронізуємо з tasks prop
  useEffect(() => {
    console.log(`🔄 CategoryKanbanBoard: tasks prop updated, length: ${tasks.length}`);
  }, [tasks]);
  
  // Відстежуємо зміни в швидких фільтрах і повідомляємо батьківський компонент
  useEffect(() => {
    const activeCount = Object.values(quickFilters).filter(Boolean).length;
    onFiltersChange?.(activeCount);
  }, [quickFilters, onFiltersChange]);

  // Stalled period filter state
  const [stalledPeriod, setStalledPeriod] = useState<string>('all');
  
  // Get category-specific status groups
  const getCategoryStatusGroups = (categoryName: string) => {
    console.log(`CategoryKanbanBoard: Looking for category "${categoryName}"`);
    console.log(`CategoryKanbanBoard: Available category keys:`, Object.keys(CATEGORY_STATUS_GROUPS));
    
    // Also log unique categories from tasks
    const uniqueCategories = [...new Set(tasks.map(task => task.category))];
    console.log(`CategoryKanbanBoard: Unique categories in tasks:`, uniqueCategories);
    
    // Use hardcoded status groups for now
    const statusGroups = CATEGORY_STATUS_GROUPS[categoryName as keyof typeof CATEGORY_STATUS_GROUPS];
    
    if (statusGroups && Array.isArray(statusGroups)) {
      console.log(`Using optimized status groups for category: ${categoryName}`);
      console.log(`Status groups:`, statusGroups);
      return statusGroups;
    }
    
    console.log(`Using default status groups for category: ${categoryName}`);
    return DEFAULT_STATUS_GROUPS;
  };

  // Filter tasks for this category
  const categoryTasks = useMemo(() => {
    console.log(`CategoryKanbanBoard: Received ${tasks.length} total tasks`);
    console.log(`CategoryKanbanBoard: Looking for category "${category}"`);
    console.log(`CategoryKanbanBoard: Sample tasks:`, tasks.slice(0, 3).map(t => ({ id: t.id, title: t.title, status: t.status, category: t.category })));
    
    const filtered = tasks.filter(task => task.category === category);
    console.log(`CategoryKanbanBoard: Filtered ${filtered.length} tasks for category "${category}"`);
    console.log(`CategoryKanbanBoard: Available tasks:`, filtered.map(t => ({ id: t.id, title: t.title, status: t.status, category: t.category })));
    return filtered;
  }, [tasks, category]);

  // Generate status groups based on category
  const statusGroups = useMemo(() => {
    return getCategoryStatusGroups(category);
  }, [category]);

  // Get category settings and apply them
  const categorySettings = useMemo(() => {
    return getCategorySettings(category);
  }, [category, getCategorySettings]);

  // Filter enabled statuses based on category settings
  const enabledStatusGroups = useMemo(() => {
    const settings = getCategorySettings(category);
    return statusGroups
      .filter(status => status && settings.enabledGroups[status.id] !== false)
      .sort((a, b) => {
        const aIndex = settings.groupOrder.indexOf(a.id);
        const bIndex = settings.groupOrder.indexOf(b.id);
        return aIndex - bIndex;
      });
  }, [statusGroups, category, getCategorySettings]);
  
  // Use enabled status groups for display
  const displayGroups = useMemo(() => {
    return enabledStatusGroups;
  }, [enabledStatusGroups]);

  // Collapse all groups function
  const collapseAllGroups = useCallback(() => {
    console.log(`CategoryKanbanBoard collapseAllGroups called for category: ${category}`);
    const newCollapsed: Record<string, boolean> = {};
    
    // Використовуємо displayGroups для категорійних сторінок
    console.log(`Processing ${displayGroups.length} groups for collapse:`, displayGroups.map((g: any) => g?.id));
    
    displayGroups.forEach((group: any) => {
      if (group) {
        newCollapsed[group.id] = true;
      }
    });
    setCollapsed(newCollapsed);
    
    // Collapse all subtasks
    setExpandedSubtasks({});
    
    console.log(`CategoryKanbanBoard collapsed all subtasks`);
    toast.success("All groups collapsed and subtasks ungrouped");
  }, [displayGroups, category]);

  // Expand all groups function
  const expandAllGroups = useCallback(() => {
    console.log(`CategoryKanbanBoard expandAllGroups called for category: ${category}`);
    const newCollapsed: Record<string, boolean> = {};
    
    // Використовуємо displayGroups для категорійних сторінок
    console.log(`Processing ${displayGroups.length} groups for expand:`, displayGroups.map((g: any) => g?.id));
    
    displayGroups.forEach((group: any) => {
      if (group) {
        newCollapsed[group.id] = false;
      }
    });
    setCollapsed(newCollapsed);
    
    // Expand all subtasks
    const allTaskIds = categoryTasks.map(task => task.id);
    const newExpandedSubtasks: Record<string, boolean> = {};
    allTaskIds.forEach(taskId => {
      newExpandedSubtasks[taskId] = true;
    });
    setExpandedSubtasks(newExpandedSubtasks);
    
    console.log(`CategoryKanbanBoard expanded ${Object.keys(newExpandedSubtasks).length} subtasks`);
    toast.success("All groups expanded and subtasks grouped");
  }, [displayGroups, categoryTasks, category]);

  // Set global functions for the collapse/expand all buttons
  useEffect(() => {
    (window as any).kanbanCollapseAll = collapseAllGroups;
    (window as any).kanbanExpandAll = expandAllGroups;
    
    return () => {
      delete (window as any).kanbanCollapseAll;
      delete (window as any).kanbanExpandAll;
    };
  }, [collapseAllGroups, expandAllGroups]);

  // Debug log to ensure we're using the correct status groups
  console.log(`CategoryKanbanBoard for category "${category}" using status groups:`, enabledStatusGroups.filter((g: any) => g).map((g: any) => g.id));

  // Quick filter helper functions
  const isOnHold = (task: any) => {
    return ['blocked', 'needs_input', 'needs_work', 'on_hold', 'paused', 'waiting'].includes(task.status);
  };

  const isHighPriority = (task: any) => {
    return task.priority === 'high' || task.priority === 'High';
  };

  const isAssignedToMe = (task: any) => {
    return task.teamMembers && task.teamMembers.some((member: any) => 
      member.name === 'Current User' || member.name === 'Marley Bergson'
    );
  };

  const isCreatedByMe = (task: any) => {
    return task.assignee && task.assignee.name === 'Current User';
  };

  const isUnassigned = (task: any) => {
    return !task.teamMembers || task.teamMembers.length === 0;
  };

  const isStalled = (task: any) => {
    if (!now) return false;
    const lastUpdate = task.lastStatusChange ? new Date(task.lastStatusChange) : now;
    const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (stalledPeriod === 'all') return daysSinceUpdate > 7;
    if (stalledPeriod === '7') return daysSinceUpdate > 7;
    if (stalledPeriod === '14') return daysSinceUpdate > 14;
    if (stalledPeriod === '30') return daysSinceUpdate > 30;
    
    return daysSinceUpdate > 7;
  };

  const isOverdue = (task: any) => {
    if (!task.dueDate || !now) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate < now && !['done', 'completed', 'approved'].includes(task.status);
  };

  const isDueSoon = (task: any) => {
    if (!task.dueDate || !now) return false;
    const dueDate = new Date(task.dueDate);
    const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilDue <= 3 && daysUntilDue >= 0 && !['done', 'completed', 'approved'].includes(task.status);
  };

  const isRecentlyUpdated = (task: any) => {
    if (!task.lastStatusChange || !now) return false;
    const lastUpdate = new Date(task.lastStatusChange);
    const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate <= 1;
  };

  // Quick filter toggle function
  const toggleQuickFilter = (filterName: string) => {
    setQuickFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  // Clear all quick filters
  const clearAllQuickFilters = () => {
    setQuickFilters({
      assignedToMe: false,
      createdByMe: false,
      overdue: false,
      unassigned: false,
      dueSoon: false,
      recentlyUpdated: false,
      onHold: false,
      highPriority: false,
      stalled: false
    });
    setStalledPeriod('all');
  };

  // Get active quick filters count
  const getActiveQuickFiltersCount = () => {
    return Object.values(quickFilters).filter(Boolean).length;
  };

  // Update filters count for parent component
  useEffect(() => {
    const activeCount = Object.values(quickFilters).filter(Boolean).length;
    if (onFiltersChange) {
      onFiltersChange(activeCount);
    }
  }, [quickFilters, onFiltersChange]);

  // Apply quick filters to tasks
  const filteredCategoryTasks = useMemo(() => {
    let filtered = categoryTasks;

    const activeFilters = Object.entries(quickFilters).filter(([_, isActive]) => isActive);
    
    if (activeFilters.length > 0) {
      filtered = filtered.filter(task => {
        return activeFilters.every(([filterName, isActive]) => {
          if (!isActive) return true;
          
          switch (filterName) {
            case 'assignedToMe':
              return isAssignedToMe(task);
            case 'createdByMe':
              return isCreatedByMe(task);
            case 'overdue':
              return isOverdue(task);
            case 'unassigned':
              return isUnassigned(task);
            case 'dueSoon':
              return isDueSoon(task);
            case 'recentlyUpdated':
              return isRecentlyUpdated(task);
            case 'onHold':
              return isOnHold(task);
            case 'highPriority':
              return isHighPriority(task);
            case 'stalled':
              return isStalled(task);
            default:
              return true;
          }
        });
      });
    }

    return filtered;
  }, [categoryTasks, quickFilters, stalledPeriod]);

  // Get tasks for each column
  const getColumnTasks = (statusId: string) => {
    console.log(`getColumnTasks called for status: ${statusId}`);
    console.log(`Current filteredTasks:`, filteredCategoryTasks.map(t => ({ id: t.id, status: t.status, title: t.title })));
    
    // Find the status group that matches this column
    const statusGroup = statusGroups.find(group => group && group.id === statusId);
    console.log(`Found status group for ${statusId}:`, statusGroup);
    
    if (statusGroup && statusGroup.statuses && Array.isArray(statusGroup.statuses)) {
      // Filter tasks that have any of the statuses in this group
      const parentTasks = filteredCategoryTasks.filter(task => 
        statusGroup.statuses.includes(task.status)
      );
      console.log(`getColumnTasks for ${statusId}: Found ${parentTasks.length} tasks with statuses ${statusGroup.statuses.join(', ')}`);
      parentTasks.forEach(task => {
        console.log(`Found parent task: ${task.id} (${task.title}) with status ${task.status} in group ${statusId}`);
      });
      return parentTasks;
    }
    
    // Fallback: filter by exact status match
    const parentTasks = filteredCategoryTasks.filter(task => task.status === statusId);
    console.log(`getColumnTasks for ${statusId}: Found ${parentTasks.length} tasks with exact status match`);
    return parentTasks;
  };

  // Handle drag end
  const onDragEnd = (result: DropResult) => {
    console.log('=== CATEGORY DRAG END DEBUG ===');
    console.log('onDragEnd called with result:', result);
    setDraggedTask(null);
    
    const { destination, source, draggableId, type } = result;
    
    if (!destination) {
      console.log('No destination, dropping cancelled');
      toast.info("Переміщення скасовано");
      return;
    }
    
    console.log(`Drag operation: ${type}, from ${source.droppableId} to ${destination.droppableId}`);
    
    if (type === "COLUMN") {
      toast.info("Column reordering is now available through Group Settings");
      return;
    }
    
    if (destination.droppableId === source.droppableId && destination.index !== source.index) {
      console.log('Reordering task within same column');
      
      const movedTaskElement = document.querySelector(`[data-task-id="${draggableId}"]`);
      if (movedTaskElement) {
        movedTaskElement.classList.add('task-reorder-animation');
        setTimeout(() => {
          movedTaskElement.classList.remove('task-reorder-animation');
        }, 200);
      }
      
      toast.success("Порядок завдань оновлено");
      return;
    }
    
    if (destination.droppableId !== source.droppableId) {
      console.log(`Moving task between columns: ${source.droppableId} -> ${destination.droppableId}`);
      
      const task = categoryTasks.find((t) => t.id === draggableId);
      if (!task) {
        console.log(`Task ${draggableId} not found`);
        toast.error(`Task not found: ${draggableId}`);
        return;
      }
      
      // ВАЛІДАЦІЯ: Перевіряємо чи можна перемістити завдання між цими групами
      const sourceGroup = statusGroups && statusGroups.length > 0 ? statusGroups.find((g: any) => g && g.id === source.droppableId) : null;
      const targetGroup = statusGroups && statusGroups.length > 0 ? statusGroups.find((g: any) => g && g.id === destination.droppableId) : null;
      
      if (!sourceGroup || !targetGroup) {
        console.log(`Invalid groups: source=${source.droppableId}, target=${destination.droppableId}`);
        toast.error("Неможливо перемістити завдання між цими групами");
        return;
      }
      
      // Use new validation function with category context
      if (!validateStatusTransition(task.status, destination.droppableId, category)) {
        const fromStatus = findStatusById(task.status)?.title || task.status;
        const toStatus = findStatusById(destination.droppableId)?.title || destination.droppableId;
        toast.error(`Cannot move task from "${fromStatus}" to "${toStatus}"`);
        return;
      }

      console.log(`✅ Valid move: ${sourceGroup.title} -> ${targetGroup.title}`);
      console.log(`Found task: ${draggableId}, current status: ${task.status}`);

      const fromGroup = source.droppableId;
      const toGroup = destination.droppableId;
      
      // Find the target status group (використовуємо вже знайдену targetGroup)
      
              // Choose the most appropriate status from the target group
        let targetAllTasksStatus = task.status; // Keep current status as fallback
        
        if (targetGroup && targetGroup.statuses && Array.isArray(targetGroup.statuses)) {
          console.log(`🎯 Selecting status for group: ${targetGroup.title}`);
          console.log(`Available statuses in target group: ${targetGroup.statuses.join(', ')}`);
        // Try to find a status that matches the group's primary purpose
        const primaryStatuses = {
          'to_do': ['to_do', 'draft', 'new', 'backlog', 'requested'],
          'in_progress': ['in_progress', 'working', 'assigned', 'ongoing', 'doing', 'scheduled'],
          'in_review': ['in_review', 'needs_input', 'needs_work', 'blocked', 'on_hold', 'paused', 'waiting', 'pause_it'],
          'approved': ['approved', 'done', 'validated', 'completed', 'paid', 'closed'],
          'rejected': ['rejected', 'canceled', 'declined', 'terminated'],
          // Category-specific group mappings
          'draft': ['draft', 'to_do', 'new', 'backlog', 'requested'],
          'open': ['to_do', 'new', 'requested', 'draft', 'backlog'],
          'screening': ['in_progress', 'working', 'assigned', 'ongoing', 'doing', 'scheduled'],
          'interviewing': ['in_review', 'ongoing', 'doing', 'needs_input', 'on_hold', 'waiting', 'blocked', 'paused', 'needs_work'],
          'hired': ['approved', 'done', 'completed', 'validated', 'paid', 'closed'],
          'proposal': ['to_do', 'draft', 'new', 'backlog', 'requested'],
          'evaluation': ['in_progress', 'in_review', 'working', 'assigned', 'ongoing', 'doing', 'scheduled'],
          'funded': ['completed', 'paid', 'closed'],
          'research': ['to_do', 'draft', 'new', 'backlog', 'requested'],
          'analysis': ['in_progress', 'in_review', 'working', 'assigned', 'ongoing', 'doing', 'scheduled'],
          'decision': ['needs_input', 'on_hold', 'waiting', 'blocked', 'paused', 'needs_work'],
          'executed': ['approved', 'done', 'completed', 'validated', 'paid', 'closed'],
          'planning': ['to_do', 'draft', 'new', 'backlog', 'requested'],
          'preparation': ['in_progress', 'working', 'assigned', 'ongoing', 'doing', 'scheduled'],
          'serving': ['in_review', 'ongoing', 'doing', 'needs_input', 'on_hold', 'waiting', 'blocked', 'paused', 'needs_work'],
          'completed': ['done', 'approved', 'completed', 'validated', 'paid', 'closed'],
          'cancelled': ['rejected', 'canceled', 'declined', 'terminated'],
          'pending': ['to_do', 'draft', 'new', 'backlog', 'requested'],
          'processing': ['in_progress', 'working', 'assigned', 'ongoing', 'doing', 'scheduled'],
          'review': ['in_review', 'needs_input', 'needs_work', 'blocked', 'on_hold', 'paused', 'waiting'],
          'booking': ['in_progress', 'working', 'assigned', 'ongoing', 'doing', 'scheduled'],
          'confirmed': ['approved', 'done', 'completed', 'validated', 'paid', 'closed', 'in_review', 'needs_input', 'on_hold', 'waiting', 'blocked', 'paused', 'needs_work']
        };
        
        // Get the primary status for this group
        const groupPrimaryStatus = targetGroup.id;
        const availableStatuses = primaryStatuses[groupPrimaryStatus as keyof typeof primaryStatuses] || targetGroup.statuses;
        
        // Choose the first available status from the target group
        targetAllTasksStatus = availableStatuses[0] || (targetGroup.statuses && targetGroup.statuses[0]) || task.status;
        
        console.log(`Moving task to group: ${toGroup}`);
        console.log(`Available statuses in group: ${targetGroup.statuses.join(', ')}`);
        console.log(`Selected status: ${targetAllTasksStatus}`);
      }

      if (onTaskUpdate) {
        // КРИТИЧНО ВАЖЛИВА ЛОГІКА: Оновлюємо статус завдання з синхронізацією
        console.log(`🔄 UPDATING TASK STATUS: ${draggableId} -> ${targetAllTasksStatus}`);
        
        // Map category status to global status for synchronization
        let globalStatus = targetAllTasksStatus;
        const categoryStatusMapping = targetGroup && targetGroup.id ? mapCategoryStatusToGlobalStatuses(category, targetGroup.id) : null;
        if (categoryStatusMapping && categoryStatusMapping.length > 0) {
          globalStatus = categoryStatusMapping[0];
          console.log(`🔄 Mapped category status "${targetGroup.id}" to global status "${globalStatus}"`);
        }
        
        // Оновлюємо завдання в глобальному стані через callback
        // Передаємо taskId та updates відповідно до інтерфейсу
        onTaskUpdate(draggableId, { status: globalStatus });
        
        // Візуальні ефекти для користувача
        setTimeout(() => {
          const movedTaskElement = document.querySelector(`[data-task-id="${draggableId}"]`);
          if (movedTaskElement) {
            movedTaskElement.classList.add('task-insert-animation');
            
            movedTaskElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            });
            
            setTimeout(() => {
              movedTaskElement.classList.remove('task-insert-animation');
            }, 300);
          }

          // Анімація для цільової групи
          const targetColumn = document.querySelector(`[data-droppable-id="${destination.droppableId}"]`);
          if (targetColumn) {
            targetColumn.classList.add('group-transition-highlight');
            setTimeout(() => {
              targetColumn.classList.remove('group-transition-highlight');
            }, 800);
          }

          // Анімація для початкової групи
          const sourceColumn = document.querySelector(`[data-droppable-id="${source.droppableId}"]`);
          if (sourceColumn) {
            sourceColumn.classList.add('group-transition-highlight');
            setTimeout(() => {
              sourceColumn.classList.remove('group-transition-highlight');
            }, 800);
          }
        }, 100);
        
        // Інформування користувача про переміщення
        const fromGroup = statusGroups && statusGroups.length > 0 ? statusGroups.find(g => g && g.id === source.droppableId) : null;
        const toGroupTitle = targetGroup && targetGroup.title ? targetGroup.title : toGroup.charAt(0).toUpperCase() + toGroup.slice(1);
        const fromGroupTitle = fromGroup && fromGroup.title ? fromGroup.title : source.droppableId.charAt(0).toUpperCase() + source.droppableId.slice(1);
        const statusTitle = findStatusById(targetAllTasksStatus)?.title || targetAllTasksStatus;
        const oldStatusTitle = findStatusById(task.status)?.title || task.status;
        
        // Детальне повідомлення про переміщення
        toast.success(
          `✅ Завдання "${task.title}" переміщено з "${fromGroupTitle}" до "${toGroupTitle}"`,
          {
            duration: 4000,
            description: `Статус змінено з "${oldStatusTitle}" на "${statusTitle}"`
          }
        );
        
        // Діагностика після переміщення
        setTimeout(() => {
          console.log(`=== POST-MOVE DEBUG ===`);
          console.log(`Task ${draggableId} moved from ${source.droppableId} to ${destination.droppableId}`);
          console.log(`Status changed from ${task.status} to ${targetAllTasksStatus}`);
          console.log(`CategoryTasks state after move:`, categoryTasks.map(t => ({ id: t.id, status: t.status, title: t.title })));
          
          // Перевіряємо чи завдання дійсно змінило статус
          const updatedTask = categoryTasks.find(t => t.id === draggableId);
          if (updatedTask) {
            console.log(`✅ Task status updated successfully: ${updatedTask.status}`);
          } else {
            console.log(`⚠️ Task not found in updated state`);
          }
          
          console.log(`=== END POST-MOVE DEBUG ===`);
        }, 100);
      }
    }
  };

  const onDragStart = (start: any) => {
    console.log('🚀 Drag start:', start);
    const task = categoryTasks.find((t) => t.id === start.draggableId);
    if (task) {
      console.log('📋 Found task to drag:', task.title);
      setDraggedTask(task);
    } else {
      console.log('❌ Task not found for draggableId:', start.draggableId);
    }
  };

  const renderTaskCard = useCallback((task: any, isSubtask = false, taskIndex = 0) => {
    if (!task || !task.id) {
      console.warn('Invalid task:', task);
      return null;
    }
    const showAttachments = cardFields.attachments;
    const showComments = cardFields.comments;
    
    const visibleFields = {
      taskId: cardFields.taskId,
      name: cardFields.name !== false,
      status: false,
      description: cardFields.description && task.description,
      tags: cardFields.tags && task.tags && task.tags.length > 0,
      organization: cardFields.organization && !isSubtask,
      assignee: cardFields.assignee && task.teamMembers,
      priority: cardFields.priority,
      dueDate: cardFields.dueDate,
      attachments: showAttachments,
      comments: showComments,
      subtasks: task.subtasks && Array.isArray(task.subtasks) && task.subtasks.length > 0
    };
    
    const visibleFieldCount = Object.values(visibleFields).filter(Boolean).length;
    
    const getDynamicPadding = () => {
      if (isSubtask) return "p-3";
      if (visibleFieldCount <= 2) return "p-2";
      if (visibleFieldCount <= 4) return "p-3";
      if (visibleFieldCount <= 6) return "p-4";
      return "p-4";
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
                   className={`kanban-card group border-[#e8e8ec] rounded-2xl w-full cursor-grab shadow-none hover:shadow-lg hover:shadow-black/15 hover:border-gray-300 transition-all duration-200 ease-out ${
                     snapshot.isDragging 
                       ? 'dragging shadow-xl shadow-black/20 border-blue-300 cursor-grabbing transition-none' 
                       : ''
                   }`}
                   tabIndex={0}
                   role="button"
                   aria-describedby={`rfd-hidden-text-${task.id}`}
                   data-rfd-drag-handle-draggable-id={task.id}
              data-rfd-drag-handle-context-id={`category-${category.toLowerCase()}`}
              draggable={true}
                 >
                            <div {...provided.dragHandleProps} style={{ cursor: 'grab' }}>
              <CardContent className={`${getDynamicPadding()}`}>
                {isSubtask && task.parentTask && task.parentTask.title && (
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
                    {visibleFields.taskId && <span>{task.taskId || task.id || 'Unknown'}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Status Label - Show only category-specific statuses */}
                    {cardFields.status !== false && (() => {
                      if (category === "All tasks") {
                        // On All tasks page, show individual status
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
                      } else {
                        // On category pages, show only the group name, not individual statuses
                        const statusGroups = getCategoryStatusGroups(category);
                        const statusGroup = statusGroups && statusGroups.length > 0 ? statusGroups.find(group => 
                          group && group.statuses && group.statuses.includes(task.status)
                        ) : null;
                        if (statusGroup) {
                          // Show the group name, not the individual status
                          return (
                            <div className="flex items-center gap-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusGroup.color || 'bg-gray-100 text-gray-700'}`}>
                                {statusGroup.title}
                              </span>
                            </div>
                          );
                        } else {
                          // Fallback: show individual status if no group found
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
                        }
                      }
                      return null;
                    })()}
                  </div>
                </div>
                
                {visibleFields.name && (
                  <div className="mb-1">
                    <div 
                      className="text-xs font-medium text-[#1c2024] cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => onTaskClick && onTaskClick(task)}
                    >
                      {task.title || task.id}
                    </div>
                    {isSubtask && task.parentTaskTitle && typeof task.parentTaskTitle === 'string' && (
                      <div className="text-xs text-gray-500 mt-1">
                        Parent: {task.parentTaskTitle}
                      </div>
                    )}
                  </div>
                )}
                
                 {visibleFields.description && task.description && typeof task.description === 'string' && (
                   <div className="text-xs text-[#8b8d98] mb-2 overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{task.description}</div>
                 )}
                
                {visibleFields.tags && task.tags && Array.isArray(task.tags) && (
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
                            <span className={`w-6 h-6 rounded-full ${avatar.bgColor} flex items-center justify-center text-xs font-semibold text-gray-700`}>
                              {avatar.abbreviation}
                            </span>
                          );
                        })()}
                          <span className="text-xs text-[#1c2024] font-medium mr-2">{task.clientInfo || 'Default'}</span>
                      </div>
                    )}
                    {/* Assignee avatars - aligned to the right */}
                    {visibleFields.assignee && task.teamMembers && Array.isArray(task.teamMembers) && (
                      <div className={`flex -space-x-2 ${isSubtask ? 'ml-0' : 'ml-auto'}`}>
                        {task.teamMembers.slice(0, 3).map((member: any, index: number) => (
                          <img 
                            key={index}
                            alt={member.name}
                            className="w-6 h-6 rounded-full border-2 border-white"
                            src={member.avatar || `https://randomuser.me/api/portraits/${member.gender || 'men'}/${index + 1}.jpg`}
                          />
                        ))}
                        {task.teamMembers.length > 3 && (
                          <span className="w-6 h-6 rounded-full bg-[#f3f3f3] text-xs text-[#60646c] flex items-center justify-center border-2 border-white">
                            +{task.teamMembers.length - 3}
                          </span>
                        )}
                        </div>
                      )}
                  </div>
                )}
                
                {/* Priority, Due */}
                {(visibleFields.priority || visibleFields.dueDate) && (
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {/* Priority - invisible but takes space when hidden */}
                      <div className={`flex items-center gap-2 ${visibleFields.priority ? '' : 'invisible'}`}>
                        {/* Different icons for each priority */}
                        {task.priority === "Emergency" && (
                          <div className="flex">
                            <ChevronUp className="w-4 h-4 text-red-600 -mr-1" />
                            <ChevronUp className="w-4 h-4 text-red-600" />
                          </div>
                        )}
                        {task.priority === "High" && (
                          <ChevronUp className="w-4 h-4 text-orange-600" />
                        )}
                        {(task.priority === "Normal" || !task.priority) && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minus w-4 h-4 text-blue-600">
                              <path d="M5 12h14"></path>
                            </svg>
                          )}
                        {task.priority === "Low" && (
                          <ChevronDownIcon className="w-4 h-4 text-[#16a34a]" />
                        )}
                          <span className={`text-xs font-medium ${
                          task.priority === "Emergency" ? "text-red-600" :
                          task.priority === "High" ? "text-orange-600" :
                          task.priority === "Low" ? "text-[#16a34a]" :
                          "text-blue-600"
                        }`}>{task.priority && typeof task.priority === 'string' ? task.priority : "Normal"}</span>
                        </div>
                    </div>
                    {/* Due date */}
                    {visibleFields.dueDate && (
                      <div className="text-xs text-[#8b8d98] flex items-center gap-1">
                        <span>Due:</span>
                        <span className="text-[#1c2024] font-medium">{task.dueDate && typeof task.dueDate === 'string' ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Subtasks + Attachments + Comments в один рядок */}
                {((task.subtasks && Array.isArray(task.subtasks) && task.subtasks.length > 0) || (visibleFields.attachments && task.attachmentCount && typeof task.attachmentCount === 'number' && task.attachmentCount > 0) || (visibleFields.comments && task.commentCount && typeof task.commentCount === 'number' && task.commentCount > 0)) && (
                  <div className="flex items-center gap-3 mt-2 w-full">
                    <div className="flex items-center gap-1 ml-auto">
                      {visibleFields.attachments && task.attachmentCount && typeof task.attachmentCount === 'number' && task.attachmentCount > 0 && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f3f3f3] text-xs text-[#60646c]">
                          <Paperclip className="w-3 h-3" />
                          <span>{task.attachmentCount}</span>
                        </span>
                      )}
                      {visibleFields.comments && task.commentCount && typeof task.commentCount === 'number' && task.commentCount > 0 && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f3f3f3] text-xs text-[#60646c]">
                          <MessageCircle className="w-3 h-3" />
                          <span>{task.commentCount}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {visibleFields.subtasks && task.subtasks && Array.isArray(task.subtasks) && task.subtasks.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-[#8b8d98]">
                      <span>Subtasks: {task.subtasks.length}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </div>
            </Card>
          </div>
        )}
      </Draggable>
    );
  }, [cardFields, category, onTaskClick]);

  const renderColumn = (column: any) => {
    if (!column || !column.id) {
      console.warn('Invalid column:', column);
      return null;
    }
    const tasks = getColumnTasks(column.id);
    const isCollapsed = collapsed[column.id];
    
    console.log(`CategoryKanbanBoard renderColumn: ${column.id}, isCollapsed: ${isCollapsed}, tasks count: ${tasks?.length || 0}`);
    
    return (
      <div key={column.id} className="flex-shrink-0">
        <Droppable droppableId={column.id} type="TASK">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              data-droppable-id={column.id}
              className={`drop-zone flex flex-col rounded-lg border p-0 transition-all duration-200 relative bg-gray-50 ${
                snapshot.isDraggingOver ? 'drag-over' : ''
              } ${
                isCollapsed 
                  ? 'min-w-[72px] max-w-[72px] h-[300px] cursor-pointer' 
                  : 'min-w-[320px] max-w-[380px] h-[calc(100vh-160px)]'
              }`}
              style={{
                borderWidth: snapshot.isDraggingOver ? '2px' : '1px',
                borderStyle: 'solid',
              }}
              onClick={isCollapsed ? () => setCollapsed(prev => ({ ...prev, [column.id]: false })) : undefined}
            >
              {isCollapsed ? (
                // Collapsed state - similar to KanbanBoard
                <div className="flex flex-col items-center justify-center w-full h-full pt-8 pb-4 group/collapsed">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-medium text-xs text-[#1c2024] mb-2 text-center" style={{ writingMode: "vertical-rl", textOrientation: "mixed", letterSpacing: "0.05em" }}>
                      {column.title || column.id}
                    </span>
                    
                    <div className="flex flex-col items-center gap-2 mb-3">
                      <span className="bg-white text-black text-xs font-semibold rounded-xl px-4 py-1 shadow border border-gray-200 text-center">
                        {tasks ? tasks.length : 0}
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCollapsed(prev => ({ ...prev, [column.id]: false }));
                        }}
                        className="h-6 w-6 p-0 opacity-0 group-hover/collapsed:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // Expanded state
                <>
                  <div className="flex items-center justify-between mb-0 px-4 pt-3 pb-2 group">
                    <div className="flex items-center gap-1 group/header">
                      <div className="flex items-center gap-2 group/column-header">
                        <div>
                          <h3 className="font-medium text-xs text-[#1c2024]">{column.title || column.id}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className="text-xs px-2 py-0.5 h-5 min-w-5 flex items-center justify-center">
                          {tasks ? tasks.length : 0}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCollapsed(prev => ({ ...prev, [column.id]: !prev[column.id] }))}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 px-4 pb-4">
                    {tasks && tasks.length > 0 ? tasks.map((task, index) => renderTaskCard(task, false, index)) : (
                      <div className="text-xs text-gray-400 flex-1 flex items-center justify-center">No tasks</div>
                    )}
                    {provided.placeholder}
                  </div>
                </>
              )}
            </div>
          )}
        </Droppable>
      </div>
    );
  };

  return (
    <div className="h-full">
      {/* Quick Filters - Above Kanban */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-2">
            
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="px-6 flex flex-wrap gap-2 mb-2 justify-between -space-x-1">
          
          {/* Left side - Filter buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => toggleQuickFilter('assignedToMe')}
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 -mr-1 ${
                quickFilters.assignedToMe 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Assigned to me
              {quickFilters.assignedToMe && (
                <svg 
                  className="w-3 h-3 ml-1 cursor-pointer" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  onClick={e => {
                    e.stopPropagation();
                    toggleQuickFilter('assignedToMe');
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
            
            <button
              onClick={() => toggleQuickFilter('createdByMe')}
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 -mr-1 ${
                quickFilters.createdByMe 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Created by me
              {quickFilters.createdByMe && (
                <svg 
                  className="w-3 h-3 ml-1 cursor-pointer" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  onClick={e => {
                    e.stopPropagation();
                    toggleQuickFilter('createdByMe');
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
            
            <button
              onClick={() => toggleQuickFilter('overdue')}
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 -mr-1 ${
                quickFilters.overdue 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Overdue
              {quickFilters.overdue && (
                <svg 
                  className="w-3 h-3 ml-1 cursor-pointer" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  onClick={e => {
                    e.stopPropagation();
                    toggleQuickFilter('overdue');
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
            
            <button
              onClick={() => toggleQuickFilter('unassigned')}
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 -mr-1 ${
                quickFilters.unassigned 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Unassigned
              {quickFilters.unassigned && (
                <svg 
                  className="w-3 h-3 ml-1 cursor-pointer" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  onClick={e => {
                    e.stopPropagation();
                    toggleQuickFilter('unassigned');
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
            
            <button
              onClick={() => toggleQuickFilter('dueSoon')}
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 -mr-1 ${
                quickFilters.dueSoon 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Due Soon
              {quickFilters.dueSoon && (
                <svg 
                  className="w-3 h-3 ml-1 cursor-pointer" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  onClick={e => {
                    e.stopPropagation();
                    toggleQuickFilter('dueSoon');
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
            
            <button
              onClick={() => toggleQuickFilter('recentlyUpdated')}
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 -mr-1 ${
                quickFilters.recentlyUpdated 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Recently Updated
              {quickFilters.recentlyUpdated && (
                <svg 
                  className="w-3 h-3 ml-1 cursor-pointer" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  onClick={e => {
                    e.stopPropagation();
                    toggleQuickFilter('recentlyUpdated');
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
            
            <button
              onClick={() => toggleQuickFilter('onHold')}
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 -mr-1 ${
                quickFilters.onHold 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              On Hold
              {quickFilters.onHold && (
                <svg 
                  className="w-3 h-3 ml-1 cursor-pointer" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  onClick={e => {
                    e.stopPropagation();
                    toggleQuickFilter('onHold');
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
            
            <button
              onClick={() => toggleQuickFilter('highPriority')}
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 -mr-1 ${
                quickFilters.highPriority 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              High Priority
              {quickFilters.highPriority && (
                <svg 
                  className="w-3 h-3 ml-1 cursor-pointer" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  onClick={e => {
                    e.stopPropagation();
                    toggleQuickFilter('highPriority');
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
            
            <button
              onClick={() => toggleQuickFilter('stalled')}
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 -mr-1 ${
                quickFilters.stalled 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Stalled task
              {quickFilters.stalled && (
                <svg 
                  className="w-3 h-3 ml-1 cursor-pointer" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  onClick={e => {
                    e.stopPropagation();
                    toggleQuickFilter('stalled');
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Right side - Stalled Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-700">Stalled (per):</label>
            <select 
              value={agingFilter}
              onChange={(e) => setAgingFilter(e.target.value)}
              className="text-xs border border-gray-300 rounded pl-2 pr-2 py-1 bg-white"
            >
              <option value="all">Select period</option>
              <option value="7">7+ Days</option>
              <option value="14">14+ Days</option>
              <option value="30">30+ Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="px-6 mb-2">
        <div className="border-t border-gray-200"></div>
      </div>

      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <div className="flex-1 px-4 pt-4 pb-4">
          <style jsx>{`
            /* Simple drag and drop styles */
            [data-rbd-draggable-id] {
              cursor: grab;
            }
            
            [data-rbd-draggable-id]:active {
              cursor: grabbing;
            }
            
            /* Simple card styles */
            .kanban-card {
              margin-bottom: 8px;
            }
            
            /* Simple drop zone highlighting */
            .drop-zone.drag-over {
              background-color: rgba(59, 130, 246, 0.1);
            }
            
            /* Simple column styles */
            .kanban-column {
              transition: all 0.2s ease;
            }
            
            .drop-zone {
              position: relative;
              min-height: 100px;
              background-color: rgba(59, 130, 246, 0.05);
            }
            
            /* Light gray background for all column containers */
            .drop-zone {
              background-color: rgb(243, 244, 246) !important;
            }
          `}</style>
          <div
            className="group relative kanban-board-container"
            onMouseEnter={e => e.currentTarget.classList.add('kanban-scroll-hover')}
            onMouseLeave={e => e.currentTarget.classList.remove('kanban-scroll-hover')}
          >
            <div className="kanban-scrollbar flex gap-3 min-h-[700px] overflow-x-auto horizontal-hover-scrollbar">
              {displayGroups.filter((group: any) => group).map(renderColumn)}
                      </div>
          </div>
              </div>
        </DragDropContext>
    </div>
  );
} 