import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useState, useMemo, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Settings, X, Search, ChevronLeft, ChevronUp, Clock, ChevronDown as ChevronDownIcon, Layers, Paperclip, MessageCircle, MoreHorizontal, Flag, Expand, Minimize2, GripVertical, Grid3X3 } from "lucide-react";
import { Paperclip as PaperclipIcon, MessageCircle as MessageCircleIcon } from "lucide-react";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import TaskPreview from "./TaskPreview";
import StatusSelectionPopup from "./StatusSelectionPopup";
import TaskActionButtons from "./TaskActionButtons";
// smart-drop-menu: removed SmartDropMenu import
import React from "react";
import { FixedSizeList as List } from 'react-window';

// Types for Smart Preview functionality


// New status system with 5 main states
const STATES = [
  { 
    id: "created", 
    title: "Created", 
    color: "bg-gray-50 border-gray-200",
    icon: "📋",
    description: "Not started yet"
  },
  { 
    id: "active", 
    title: "Active", 
    color: "bg-gray-50 border-gray-200",
    icon: "🔄",
    description: "In progress"
  },
  { 
    id: "paused", 
    title: "Paused", 
    color: "bg-gray-50 border-gray-200",
    icon: "⏸️",
    description: "Temporarily paused"
  },
  { 
    id: "completed", 
    title: "Completed", 
    color: "bg-gray-50 border-gray-200",
    icon: "✅",
    description: "Successfully completed"
  },
  { 
    id: "terminated", 
    title: "Terminated", 
    color: "bg-gray-50 border-gray-200",
    icon: "❌",
    description: "Negatively completed"
  },
];

// Detailed statuses for each state
const STATUSES = {
  created: [
    { id: "draft", title: "Draft", color: "bg-gray-100 text-gray-700" },
    { id: "backlog", title: "Backlog", color: "bg-gray-100 text-gray-700" },
    { id: "to_do", title: "To Do", color: "bg-gray-100 text-gray-700" },
    { id: "new", title: "New", color: "bg-gray-100 text-gray-700" },
  ],
  active: [
    { id: "in_progress", title: "In Progress", color: "bg-blue-100 text-blue-700" },
    { id: "working", title: "Working", color: "bg-blue-100 text-blue-700" },
    { id: "ongoing", title: "Ongoing", color: "bg-blue-100 text-blue-700" },
    { id: "doing", title: "Doing", color: "bg-blue-100 text-blue-700" },
    { id: "assigned", title: "Assigned", color: "bg-blue-100 text-blue-700" },
  ],
  paused: [
    { id: "blocked", title: "Blocked", color: "bg-yellow-100 text-yellow-700" },
    { id: "needs_input", title: "Needs Input", color: "bg-yellow-100 text-yellow-700" },
    { id: "needs_work", title: "Needs Work", color: "bg-yellow-100 text-yellow-700" },
    { id: "on_hold", title: "On Hold", color: "bg-yellow-100 text-yellow-700" },
  ],
  completed: [
    { id: "done", title: "Done", color: "bg-green-100 text-green-700" },
    { id: "approved", title: "Approved", color: "bg-green-100 text-green-700" },
    { id: "validated", title: "Validated", color: "bg-green-100 text-green-700" },
  ],
  terminated: [
    { id: "rejected", title: "Rejected", color: "bg-red-100 text-red-700" },
    { id: "canceled", title: "Canceled", color: "bg-red-100 text-red-700" },
    { id: "closed", title: "Closed", color: "bg-red-100 text-red-700" },
  ],
};

// New transition system for states
const allowedTransitions: Record<string, string[]> = {
  // Created -> Active, Paused
  "to_do": ["in_progress", "blocked"],
  "draft": ["in_progress", "blocked"],
  "backlog": ["in_progress", "blocked"],
  "new": ["in_progress", "blocked"],
  
  // Active -> Completed, Paused, Terminated
  "in_progress": ["done", "blocked", "rejected"],
  "working": ["done", "blocked", "rejected"],
  "ongoing": ["done", "blocked", "rejected"],
  "doing": ["done", "blocked", "rejected"],
  "assigned": ["done", "blocked", "rejected"],
  
  // Paused -> Active, Created, Terminated
  "blocked": ["in_progress", "to_do", "rejected"],
  "needs_input": ["in_progress", "to_do", "rejected"],
  "needs_work": ["in_progress", "to_do", "rejected"],
  "on_hold": ["in_progress", "to_do", "rejected"],
  
  // Completed -> Active (for review/fixes)
  "done": ["in_progress", "blocked"],
  
  // Terminated -> Active (for restoration)
  "rejected": ["in_progress", "to_do"],
  "canceled": ["in_progress", "to_do"],
  "closed": ["in_progress", "to_do"],
};

// Function to get status group
const getStatusGroup = (statusId: string): string => {
  // Use stage mapping from updated mock tasks data
  for (const [group, statuses] of Object.entries(updatedMockTasks.stage_mapping)) {
    if ((statuses as string[]).includes(statusId)) {
      return group.toUpperCase();
    }
  }
  return 'CREATED'; // Default fallback
};

// Function to get group abbreviation (first letter uppercase, rest lowercase)
const getGroupAbbreviation = (groupId: string): string => {
  if (groupId.length === 0) return '';
  return groupId.charAt(0).toUpperCase() + groupId.slice(1).toLowerCase();
};

// Centralized workflow configuration - Updated to match actual status values in data
const WORKFLOW_CONFIG = {
  // Core status transitions using actual status values from data
  "draft": ["to_do", "in_progress", "rejected"],
  "to_do": ["in_progress", "waiting", "rejected"],
  "in_progress": ["in_review", "done", "blocked", "waiting", "rejected"],
  "in_review": ["approved", "done", "rejected", "needs_input"],
  "approved": ["done", "rejected"],
  "done": ["approved", "rejected"], // Can be reopened if needed
  "waiting": ["in_progress", "to_do", "rejected"],
  "blocked": ["in_progress", "to_do", "rejected"],
  "needs_input": ["in_progress", "to_do", "rejected"],
  "scheduled": ["in_progress", "to_do", "rejected"],
  "rejected": ["to_do", "in_progress"], // Can be reopened
  "canceled": ["to_do", "in_progress"], // Can be reopened
  "terminated": ["to_do", "in_progress"], // Can be reopened
  
  // Legacy mappings for backward compatibility
  "archived": [],
  "paused": ["in_progress", "done"],
  "active": ["paused", "done", "rejected"],
  "created": ["active", "paused", "rejected"]
};

// Status rules from status_rules (1).json with additional statuses from mock data
const STATUS_RULES: Record<string, string[]> = WORKFLOW_CONFIG;

const isValidTransition = (fromStatus: string, toStatus: string, parentStatus?: string): boolean => {
  console.log(`isValidTransition called: ${fromStatus} -> ${toStatus} (parent: ${parentStatus})`);
  
  // Allow dropping in the same status
  if (fromStatus === toStatus) {
    console.log('Same status, transition allowed');
    return true;
  }
  
  // Business logic: If parent task is rejected, subtask cannot move to certain statuses
  if (parentStatus === "rejected") {
    const blockedTransitions = ["to_do", "in_progress", "in_review", "approved"];
    if (blockedTransitions.includes(toStatus)) {
      console.log('Transition blocked: parent is rejected');
      return false;
    }
  }
  
  // Business logic: If parent task is done, subtask can only move to archived
  if (parentStatus === "done") {
    if (toStatus !== "archived") {
      console.log('Transition blocked: parent is done, can only move to archived');
      return false;
    }
  }
  
  // Check if the transition is allowed according to status rules
  const allowedTransitions = STATUS_RULES[fromStatus];
  if (allowedTransitions && allowedTransitions.includes(toStatus)) {
    console.log('Transition allowed by status rules');
    return true;
  }
  
  // Fallback to group-based transitions for backward compatibility
  const fromGroup = getStatusGroup(fromStatus);
  const toGroup = getStatusGroup(toStatus);
  
  console.log(`Group-based check: ${fromGroup} -> ${toGroup}`);
  
  // Define valid workflow transitions for group-based logic
  const validGroupTransitions: Record<string, string[]> = {
    'CREATED': ['ACTIVE', 'PAUSED', 'REJECTED'], // Can move to active, paused, or rejected
    'ACTIVE': ['PAUSED', 'COMPLETED', 'REJECTED'], // Can move to paused, completed, or rejected
    'PAUSED': ['CREATED', 'ACTIVE', 'REJECTED'], // Can move back to created, active, or rejected
    'COMPLETED': ['REJECTED'], // Can only move to rejected
    'REJECTED': ['CREATED', 'ACTIVE'] // Can move back to created or active
  };
  
  const isValid = validGroupTransitions[fromGroup]?.includes(toGroup) || false;
  console.log(`Group transition result: ${isValid}`);
  
  return isValid;
};

// Get all available transitions for a given status
const getAvailableTransitions = (fromStatus: string): string[] => {
  return STATUS_RULES[fromStatus] || [];
};

// Load status rules from JSON file (for future use)
const loadStatusRules = async (): Promise<Record<string, string[]>> => {
  try {
    const response = await fetch('/status_rules (1).json');
    const rules = await response.json();
    return rules;
  } catch (error) {
    console.warn('Failed to load status rules from file, using default rules:', error);
    return STATUS_RULES;
  }
};

// Get workflow visualization data
const getWorkflowVisualization = () => {
  const nodes: Array<{ id: string; label: string; type: 'start' | 'process' | 'end' }> = [];
  const edges: Array<{ from: string; to: string }> = [];
  
  Object.entries(STATUS_RULES).forEach(([status, transitions]) => {
    // Add node
    let type: 'start' | 'process' | 'end' = 'process';
    if (transitions.length === 0) {
      type = 'end';
    } else if (['Idea', 'Planning', 'To Do'].includes(status)) {
      type = 'start';
    }
    
    nodes.push({ id: status, label: status, type });
    
    // Add edges
    transitions.forEach(toStatus => {
      edges.push({ from: status, to: toStatus });
    });
  });
  
  return { nodes, edges };
};

// Validate workflow rules for consistency
const validateWorkflowRules = () => {
  const issues: string[] = [];
  
  // Check for circular references
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  const hasCycle = (status: string): boolean => {
    if (recursionStack.has(status)) {
      issues.push(`Circular reference detected: ${status} -> ${status}`);
      return true;
    }
    
    if (visited.has(status)) {
      return false;
    }
    
    visited.add(status);
    recursionStack.add(status);
    
    const transitions = STATUS_RULES[status] || [];
    for (const nextStatus of transitions) {
      if (hasCycle(nextStatus)) {
        return true;
      }
    }
    
    recursionStack.delete(status);
    return false;
  };
  
  // Check each status for cycles
  Object.keys(STATUS_RULES).forEach(status => {
    if (!visited.has(status)) {
      hasCycle(status);
    }
  });
  
  // Check for unreachable statuses
  const reachable = new Set<string>();
  Object.values(STATUS_RULES).flat().forEach(status => {
    reachable.add(status);
  });
  
  Object.keys(STATUS_RULES).forEach(status => {
    if (!reachable.has(status) && STATUS_RULES[status].length > 0) {
      issues.push(`Unreachable status: ${status}`);
    }
  });
  
  return issues;
};

// Export current status rules as JSON
const exportStatusRules = () => {
  return JSON.stringify(STATUS_RULES, null, 2);
};

// Import status rules from JSON string
const importStatusRules = (jsonString: string) => {
  try {
    const rules = JSON.parse(jsonString);
    // Validate the imported rules
    if (typeof rules === 'object' && rules !== null) {
      Object.entries(rules).forEach(([status, transitions]) => {
        if (!Array.isArray(transitions)) {
          throw new Error(`Invalid transitions for status ${status}: must be an array`);
        }
      });
      return rules;
    }
    throw new Error('Invalid JSON structure');
  } catch (error) {
    console.error('Failed to import status rules:', error);
    toast.error('Failed to import status rules. Please check the JSON format.');
    return null;
  }
};

// Get all subtasks for a specific parent task (to be used within component scope)
const getSubtasksForParent = (parentTaskId: string, tasks: any[]) => {
  const parentTask = tasks.find((task: any) => task.id === parentTaskId);
  if (!parentTask || !parentTask.subtasks) return [];
  
  return parentTask.subtasks.map((subtask: any) => ({
    ...subtask,
    parentTask: {
      id: parentTask.id,
      title: parentTask.title,
      taskId: parentTask.taskId,
      category: parentTask.category
    },
    isSubtask: true
  }));
};

// Import updated mock tasks data
import updatedMockTasks from '../updated_mock_tasks.json';

const originalTasks = updatedMockTasks.tasks;

// Seeded random number generator for consistent results
const seededRandom = (seed: number) => {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
};

// Generate additional tasks for performance testing
const generateAdditionalTasks = () => {
  const additionalTasks = [];
  const categories = ["Budget", "Philanthropy", "Investment", "Legal", "Travel", "Food", "HR", "Accounting"];
  const priorities = ["Emergency", "High", "Normal", "Low"];
  const statuses = ["to_do", "in_progress", "blocked", "done", "rejected", "draft", "backlog", "new", "working", "ongoing", "doing", "assigned", "needs_input", "needs_work", "on_hold", "approved", "validated", "canceled", "closed"];
  const departments = ["Finance", "Legal", "Investment", "HR", "Operations"];
  const organizations = ["Acme Inc.", "Global Ventures LLC", "Stellar Foundation"];
  const assignees = [
    { name: "Erin George", initials: "EG", department: "Investment" },
    { name: "Marley Bergson", initials: "MB", department: "Finance" },
    { name: "Justin's team", initials: "JT", department: "Legal" },
    { name: "Cheyenne Calzoni", initials: "CC", department: "Philanthropy" },
    { name: "Gretchen's team", initials: "GT", department: "Legal" },
    { name: "Giana Levin", initials: "GL", department: "HR" },
    { name: "Aviation Team", initials: "AT", department: "Legal" },
    { name: "James Saris", initials: "JS", department: "HR" },
    { name: "Sarah Mitchell", initials: "SM", department: "Finance" },
    { name: "Michael Chen", initials: "MC", department: "Legal" },
    { name: "Investment Committee", initials: "IC", department: "Investment" },
    { name: "Lisa Rodriguez", initials: "LR", department: "HR" },
    { name: "Property Team", initials: "PT", department: "Investment" },
    { name: "Compliance Team", initials: "CT", department: "Legal" }
  ];

  // Default subtasks for each category
  const defaultSubtasksByCategory: Record<string, string[]> = {
    "Budget": [
      "Analyze current expenses",
      "Set budget categories", 
      "Review with stakeholders",
      "Finalize budget document",
      "Present to board"
    ],
    "Philanthropy": [
      "Research potential recipients",
      "Evaluate impact metrics",
      "Prepare donation proposal",
      "Coordinate with partners",
      "Track outcomes"
    ],
    "Investment": [
      "Conduct market research",
      "Analyze risk factors",
      "Prepare investment memo",
      "Review legal documents",
      "Execute investment"
    ],
    "Legal": [
      "Review contracts",
      "Conduct due diligence",
      "Prepare legal documents",
      "Coordinate with counsel",
      "Finalize agreements"
    ],
    "Travel": [
      "Book accommodations",
      "Arrange transportation",
      "Prepare travel documents",
      "Coordinate schedules",
      "Submit expense reports"
    ],
    "Food": [
      "Plan menu options",
      "Source ingredients",
      "Coordinate with vendors",
      "Manage dietary restrictions",
      "Track food costs"
    ],
    "HR": [
      "Screen candidates",
      "Conduct interviews",
      "Check references",
      "Prepare offer letters",
      "Onboard new hires"
    ],
    "Accounting": [
      "Review financial statements",
      "Prepare tax documents",
      "Reconcile accounts",
      "Audit expenses",
      "Generate reports"
    ]
  };

  for (let i = 17; i <= 46; i++) {
    // Use a deterministic seed based on the task index
    const random = seededRandom(i * 12345);
    
    // Distribute categories more realistically
    const categoryDistribution = [
      // Budget (18%)
      "Budget", "Budget", "Budget", "Budget", "Budget", "Budget", "Budget", "Budget", "Budget",
      
      // Philanthropy (12%)
      "Philanthropy", "Philanthropy", "Philanthropy", "Philanthropy", "Philanthropy", "Philanthropy",
      
      // Investment (15%)
      "Investment", "Investment", "Investment", "Investment", "Investment", "Investment", "Investment",
      
      // Legal (9%)
      "Legal", "Legal", "Legal", "Legal", "Legal",
      
      // Travel (9%)
      "Travel", "Travel", "Travel", "Travel", "Travel",
      
      // Food (12%)
      "Food", "Food", "Food", "Food", "Food", "Food",
      
      // HR (12%)
      "HR", "HR", "HR", "HR", "HR", "HR",
      
      // Accounting (15%)
      "Accounting", "Accounting", "Accounting", "Accounting", "Accounting", "Accounting", "Accounting"
    ];
    
    const category = categoryDistribution[Math.floor(random() * categoryDistribution.length)];
    // Distribute priorities more realistically
    const priorityDistribution = [
      // Emergency (5%)
      "Emergency", "Emergency", "Emergency",
      
      // High (25%)
      "High", "High", "High", "High", "High", "High", "High", "High", "High", "High", "High", "High",
      
      // Normal (50%)
      "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal",
      "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal", "Normal",
      "Normal", "Normal", "Normal", "Normal", "Normal",
      
      // Low (20%)
      "Low", "Low", "Low", "Low", "Low", "Low", "Low", "Low", "Low", "Low"
    ];
    
    const priority = priorityDistribution[Math.floor(random() * priorityDistribution.length)];
    
    // Distribute statuses more evenly across different states
    const statusDistribution = [
      // Created states (30%)
      "draft", "backlog", "to_do", "new",
      "draft", "backlog", "to_do", "new",
      "draft", "backlog", "to_do", "new",
      
      // Active states (40%)
      "in_progress", "working", "ongoing", "doing", "assigned",
      "in_progress", "working", "ongoing", "doing", "assigned",
      "in_progress", "working", "ongoing", "doing", "assigned",
      "in_progress", "working", "ongoing", "doing", "assigned",
      
      // Paused states (20%)
      "blocked", "needs_input", "needs_work", "on_hold",
      "blocked", "needs_input", "needs_work", "on_hold",
      
      // Completed states (8%)
      "done", "approved", "validated",
      
      // Terminated states (2%)
      "rejected", "canceled", "closed"
    ];
    
    const status = statusDistribution[Math.floor(random() * statusDistribution.length)];
    const department = departments[Math.floor(random() * departments.length)];
    const assignee = assignees[Math.floor(random() * assignees.length)];
    
    // Always generate 3-5 subtasks for each task
    const subtaskCount = Math.floor(random() * 3) + 3; // 3-5 subtasks
    const defaultSubtasks = defaultSubtasksByCategory[category] || [
      "Research and planning",
      "Implementation",
      "Review and testing",
      "Documentation",
      "Final approval"
    ];
    
    // Use deterministic dates based on the seed
    const dueDate = new Date(Date.now() + random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const lastStatusChange = new Date(Date.now() - random() * 7 * 24 * 60 * 60 * 1000).toISOString();

    const task = {
      id: `gen-${i}`,
      taskId: `GEN-${category.substring(0, 3).toUpperCase()}-${String(i).padStart(3, '0')}`,
      title: `Task ${i}: ${category} Management - ${Math.floor(random() * 1000000).toString(36)}`,
      priority,
      category,
      assignee,
      teamMembers: [
        assignee,
        ...Array.from({ length: Math.floor(random() * 5) }, (_, j) => ({
          name: `Team Member ${j + 1}`,
          initials: `TM${j + 1}`,
          avatarUrl: `https://randomuser.me/api/portraits/${random() > 0.5 ? 'men' : 'women'}/${70 + j}.jpg`
        }))
      ],
      subtasks: Array.from({ length: subtaskCount }, (_, j) => ({
        id: `gen-${i}-${j + 1}`,
        taskId: `GEN-${category.substring(0, 3).toUpperCase()}-${String(i).padStart(3, '0')}-${j + 1}`,
        title: defaultSubtasks[j] || `Subtask ${j + 1} for Task ${i}`,
        status: "draft", // All subtasks start with draft status
        assignee,
        dueDate: new Date(Date.now() + (j + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Each subtask has a different due date
      })),
      tags: [category.toLowerCase(), priority.toLowerCase()],
      dueDate,
      progress: Math.floor(random() * 100),
      department,
      type: "Task",
      clientInfo: organizations[Math.floor(random() * organizations.length)],
      description: `This is task ${i} in the ${category} category. It involves managing ${category.toLowerCase()} related activities and ensuring proper completion within the specified timeframe. The task requires coordination with multiple stakeholders and careful attention to detail.`,
      status,
      attachmentCount: Math.floor(random() * 20),
      commentCount: Math.floor(random() * 50),
      lastStatusChange,
    };

    additionalTasks.push(task);
  }

  return additionalTasks;
};

// Combine original tasks with generated ones
const initialTasks = [
  ...originalTasks,
  ...generateAdditionalTasks(),
  // Add test task with subtasks in draft status for testing
  {
    id: "test-draft-task",
    taskId: "TEST-001",
    title: "Test Draft Task with Subtasks",
    category: "Budget",
    status: "draft",
    stage: "Created",
    priority: "High",
    assignee: { name: "Test User", initials: "TU", department: "Test" },
    teamMembers: [
      { name: "Test User", initials: "TU", avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg" }
    ],
    subtasks: [
      {
        id: "test-subtask-1",
        taskId: "TEST-001-1",
        title: "Test Subtask 1",
        status: "draft",
        category: "Budget",
        assignee: { name: "Test User", initials: "TU", department: "Test" },
        dueDate: "2024-12-15"
      },
      {
        id: "test-subtask-2",
        taskId: "TEST-001-2",
        title: "Test Subtask 2",
        status: "draft",
        category: "Budget",
        assignee: { name: "Test User", initials: "TU", department: "Test" },
        dueDate: "2024-12-20"
      }
    ],
    tags: ["test", "draft"],
    dueDate: "2024-12-30",
    progress: 0,
    department: "Test",
    type: "Task",
    clientInfo: "Test Client",
    description: "This is a test task with subtasks in draft status to test the subtask expansion functionality.",
    attachmentCount: 0,
    commentCount: 0,
    lastStatusChange: "2024-11-15T10:00:00Z"
  }
];

export { initialTasks };

// Function to get main statuses for categories
const getMainStatuses = () => {
  return [
    // CREATED - Not started, draft, backlog
    { id: "draft", title: "Draft", color: "bg-gray-100 text-gray-700", group: "CREATED" },
    { id: "backlog", title: "Backlog", color: "bg-gray-100 text-gray-700", group: "CREATED" },
    { id: "to_do", title: "To Do", color: "bg-gray-100 text-gray-700", group: "CREATED" },
    { id: "new", title: "New", color: "bg-gray-100 text-gray-700", group: "CREATED" },
    { id: "requested", title: "Requested", color: "bg-gray-100 text-gray-700", group: "CREATED" },
    
    // ACTIVE - In progress, working, under review
    { id: "in_progress", title: "In Progress", color: "bg-blue-100 text-blue-700", group: "ACTIVE" },
    { id: "working", title: "Working", color: "bg-blue-100 text-blue-700", group: "ACTIVE" },
    { id: "ongoing", title: "Ongoing", color: "bg-blue-100 text-blue-700", group: "ACTIVE" },
    { id: "doing", title: "Doing", color: "bg-blue-100 text-blue-700", group: "ACTIVE" },
    { id: "assigned", title: "Assigned", color: "bg-blue-100 text-blue-700", group: "ACTIVE" },
    { id: "in_review", title: "In Review", color: "bg-blue-100 text-blue-700", group: "ACTIVE" },
    { id: "scheduled", title: "Scheduled", color: "bg-blue-100 text-blue-700", group: "ACTIVE" },
    
    // PAUSED - Blocked, on hold, needs work
    { id: "blocked", title: "Blocked", color: "bg-yellow-100 text-yellow-700", group: "PAUSED" },
    { id: "needs_input", title: "Needs Input", color: "bg-yellow-100 text-yellow-700", group: "PAUSED" },
    { id: "needs_work", title: "Needs Work", color: "bg-yellow-100 text-yellow-700", group: "PAUSED" },
    { id: "on_hold", title: "On Hold", color: "bg-yellow-100 text-yellow-700", group: "PAUSED" },
    { id: "paused", title: "Paused", color: "bg-yellow-100 text-yellow-700", group: "PAUSED" },
    { id: "waiting", title: "Waiting", color: "bg-yellow-100 text-yellow-700", group: "PAUSED" },
    
    // COMPLETED - Done, validated, approved
    { id: "done", title: "Done", color: "bg-green-100 text-green-700", group: "COMPLETED" },
    { id: "approved", title: "Approved", color: "bg-green-100 text-green-700", group: "COMPLETED" },
    { id: "validated", title: "Validated", color: "bg-green-100 text-green-700", group: "COMPLETED" },
    { id: "paid", title: "Paid", color: "bg-green-100 text-green-700", group: "COMPLETED" },
    { id: "completed", title: "Completed", color: "bg-green-100 text-green-700", group: "COMPLETED" },
    
    // REJECTED - Rejected, cancelled, failed
    { id: "rejected", title: "Rejected", color: "bg-red-100 text-red-700", group: "REJECTED" },
    { id: "canceled", title: "Canceled", color: "bg-red-100 text-red-700", group: "REJECTED" },
    { id: "closed", title: "Closed", color: "bg-red-100 text-red-700", group: "REJECTED" },
    { id: "declined", title: "Declined", color: "bg-red-100 text-red-700", group: "REJECTED" },
    { id: "terminated", title: "Terminated", color: "bg-red-100 text-red-700", group: "REJECTED" },
  ];
};

// Create color map for states
const stateColorMap = Object.fromEntries(
  STATES.map((s) => [s.id, s.color])
);

// Create color map for statuses - column backgrounds are light gray, badges keep their colors
const statusColorMap = Object.fromEntries(
  getMainStatuses().map(status => [status.id, "bg-gray-100 border-gray-200"]) // Light gray background for all columns
);

// Create color map for status badges - preserves original colors for badges
const statusBadgeColorMap = Object.fromEntries(
  getMainStatuses().map(status => [status.id, status.color]) // Original colors for badges
);

// Function to get all statuses
const getAllStatuses = () => {
  const allStatuses = getMainStatuses();
  console.log('getAllStatuses called, returning:', allStatuses.map(s => ({ id: s.id, title: s.title })));
  return allStatuses;
};

// Function to find status by ID
const findStatusById = (id: string) => {
  const status = getAllStatuses().find(s => s.id === id);
  console.log(`findStatusById("${id}") returned:`, status ? { id: status.id, title: status.title } : null);
  return status;
};

// Function to find state by status
const findStateByStatus = (statusId: string) => {
  // Check main statuses
  const mainStatus = getMainStatuses().find(s => s.id === statusId);
  if (mainStatus) {
    // Map group to state
    const groupToStateMap: Record<string, string> = {
      'CREATED': 'created',
      'ACTIVE': 'active', 
      'PAUSED': 'paused',
      'COMPLETED': 'completed',
      'REJECTED': 'terminated'
    };
    const stateId = groupToStateMap[mainStatus.group];
    return STATES.find(s => s.id === stateId);
  }
  
  return null;
};

// Categories that should show statuses instead of states
const STATUS_BASED_CATEGORIES = ["Philanthropy", "Investment", "Legal", "Budget", "Food", "HR", "Accounting", "Travel"];

// Function to check if category should show statuses
const shouldShowStatuses = (category: string) => {
  return STATUS_BASED_CATEGORIES.includes(category);
};

  // Function to get available statuses for a group
  const getAvailableStatusesForGroup = (groupId: string): any[] => {
    const allStatuses = getMainStatuses();
    return allStatuses.filter(status => status.group === groupId);
  };

  // Function to get group name by status
  const getGroupNameByStatus = (statusId: string): string => {
    const status = getMainStatuses().find(s => s.id === statusId);
    return status?.group || 'UNKNOWN';
  };



const CARD_FIELDS = [
  { key: "taskId", label: "Task ID", pinned: false },
  { key: "organization", label: "Organization", pinned: false },
  { key: "priority", label: "Priority", pinned: true },
  { key: "category", label: "Category", pinned: true },
  { key: "assignee", label: "Assignee", pinned: true },
  { key: "tags", label: "Tags", pinned: true },
  { key: "dueDate", label: "Due date", pinned: true },
  { key: "description", label: "Description", pinned: true },
];

// Function to generate unique color from text
function generateColorFromText(text: string): string {
  // Simple hash for text
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert hash to color index - пастельні кольори
  const colors = [
    'from-blue-200 via-blue-300 to-blue-400',
    'from-purple-200 via-purple-300 to-purple-400', 
    'from-pink-200 via-pink-300 to-pink-400',
    'from-green-200 via-green-300 to-green-400',
    'from-yellow-200 via-yellow-300 to-yellow-400',
    'from-red-200 via-red-300 to-red-400',
    'from-indigo-200 via-indigo-300 to-indigo-400',
    'from-teal-200 via-teal-300 to-teal-400',
    'from-orange-200 via-orange-300 to-orange-400',
    'from-cyan-200 via-cyan-300 to-cyan-400',
    'from-emerald-200 via-emerald-300 to-emerald-400',
    'from-violet-200 via-violet-300 to-violet-400',
    'from-rose-200 via-rose-300 to-rose-400',
    'from-sky-200 via-sky-300 to-sky-400',
    'from-lime-200 via-lime-300 to-lime-400'
  ];
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// Function to generate organization avatar with abbreviation
function generateOrganizationAvatar(organizationName: string): { bgColor: string, abbreviation: string } {
  // Simple hash for consistent color
  let hash = 0;
  for (let i = 0; i < organizationName.length; i++) {
    const char = organizationName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  // Light gray color variations
  const grayColors = [
    'bg-gray-100',
    'bg-gray-150', 
    'bg-gray-200',
    'bg-gray-250',
    'bg-gray-300',
    'bg-slate-100',
    'bg-slate-150',
    'bg-slate-200',
    'bg-slate-250',
    'bg-slate-300'
  ];
  
  const colorIndex = Math.abs(hash) % grayColors.length;
  
  // Generate abbreviation (first letter of each word)
  const words = organizationName.split(' ');
  const abbreviation = words.map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2);
  
  return {
    bgColor: grayColors[colorIndex],
    abbreviation: abbreviation
  };
}



// Hook for detecting visible and hidden columns




const KanbanBoard = forwardRef<{ getActiveQuickFiltersCount: () => number }, {
  showSettings?: boolean,
  setShowSettings?: (v: boolean) => void,
  cardFields?: Record<string, boolean>,
  setCardFields?: (v: Record<string, boolean>) => void,
  onTaskClick?: (task: any) => void,
  onTaskUpdate?: (updatedTask: any) => void,
  onExpandAll?: () => void,
  onCollapseAll?: () => void,
  onFiltersChange?: (count: number) => void,
  activeCategory?: string,
}>(({
  showSettings: showSettingsProp,
  setShowSettings: setShowSettingsProp,
  cardFields: cardFieldsProp,
  setCardFields: setCardFieldsProp,
  onTaskClick,
  onTaskUpdate,
  onExpandAll,
  onCollapseAll,
  onFiltersChange,
  activeCategory = "All tasks",
}, ref) => {
  // Use a consistent "now" time to prevent hydration mismatches
  const [now] = useState(() => new Date());
  
  const [tasks, setTasks] = useState(initialTasks);
  const [draggedTask, setDraggedTask] = useState<null | any>(null);
  const [internalShowSettings, internalSetShowSettings] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const showSettings = showSettingsProp !== undefined ? showSettingsProp : internalShowSettings;
  const setShowSettings = setShowSettingsProp || internalSetShowSettings;
  const [settingsSearch, setSettingsSearch] = useState("");
  const [grouped, setGrouped] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [internalCardFields, internalSetCardFields] = useState<Record<string, boolean>>(() => {
    const obj: Record<string, boolean> = {};
    CARD_FIELDS.forEach(f => {
      // Show all fields by default except Tags
      obj[f.key] = f.key !== 'tags';
    });
    return obj;
  });
  const cardFields = cardFieldsProp || internalCardFields;
  const setCardFields = setCardFieldsProp || internalSetCardFields;
  // Collapsed columns state
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [expandedSubtasks, setExpandedSubtasks] = useState<Record<string, boolean>>({});
  const [highlightedSubtasks, setHighlightedSubtasks] = useState<Set<string>>(new Set());
  const [columnMenuOpen, setColumnMenuOpen] = useState<Record<string, boolean>>({});
  
  // smart-drop-menu: removed Smart Drop Menu states
  
  // Status selection popup state
  const [statusSelectionPopup, setStatusSelectionPopup] = useState<{
    isOpen: boolean;
    task: any;
    fromStatus: string;
    toStatus: string;
    availableStatuses: any[];
    destinationIndex?: number;
    sourceIndex?: number;
    sourceDroppableId?: string;
    destinationDroppableId?: string;
  }>({
    isOpen: false,
    task: null,
    fromStatus: '',
    toStatus: '',
    availableStatuses: [],
    destinationIndex: undefined,
    sourceIndex: undefined,
    sourceDroppableId: '',
    destinationDroppableId: ''
  });
  
  // New state for column order - all 5 groups
  const [columnOrder, setColumnOrder] = useState<string[]>([
    "draft",      // CREATED group
    "in_progress", // ACTIVE group  
    "blocked",    // PAUSED group
    "done",       // COMPLETED group
    "rejected"    // REJECTED group
  ]);

  // New state for status order (for status-based categories)
  const [statusOrder, setStatusOrder] = useState<string[]>([
    "to_do", 
    "in_progress", 
    "needs_work", 
    "blocked",
    "done",
    "validated"
  ]);

  // State for task order within columns
  const [taskOrder, setTaskOrder] = useState<Record<string, string[]>>({});

  // Task management states
  const [showArchived, setShowArchived] = useState(false);
  const [agingFilter, setAgingFilter] = useState<string>("all"); // "all", "7days", "14days", "30days"
  
  // Archive settings
  const [autoArchiveEnabled, setAutoArchiveEnabled] = useState(true);
  const [autoArchiveDays, setAutoArchiveDays] = useState(30);
  const [autoArchiveCompleted, setAutoArchiveCompleted] = useState(true);
  const [autoArchiveCompletedDays, setAutoArchiveCompletedDays] = useState(7);
  
  // Bulk selection
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  
  // Quick filters
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

  // Performance optimization for large datasets
  const [virtualizationEnabled, setVirtualizationEnabled] = useState(false);
  const [taskCardHeight, setTaskCardHeight] = useState(180); // Card height with 8px spacing

  // Group management states
  const [pinnedGroups, setPinnedGroups] = useState<Set<string>>(new Set());
  const [groupNames, setGroupNames] = useState<Record<string, string>>({});
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");


  // Відстежуємо зміни в швидких фільтрах і повідомляємо батьківський компонент
  useEffect(() => {
    const activeCount = Object.values(quickFilters).filter(Boolean).length;
    onFiltersChange?.(activeCount);
  }, [quickFilters, onFiltersChange]);



  // Auto-enable virtualization for large datasets
  useEffect(() => {
    const totalTasks = tasks.length;
    if (totalTasks > 100) {
      setVirtualizationEnabled(true);
      console.log(`Enabling virtualization for ${totalTasks} tasks`);
    }
  }, [tasks.length]);

  // Don't reset collapsed state when category changes - let users control it
  // useEffect(() => {
  //   setCollapsed({});
  // }, [activeCategory]);

  // Clear selection when category changes
  useEffect(() => {
    clearSelection();
  }, [activeCategory]);

  // Debounced search for better performance
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Validate workflow rules on component mount
  useEffect(() => {
    const issues = validateWorkflowRules();
    if (issues.length > 0) {
      console.warn('Workflow validation issues:', issues);
      toast.warning(`Workflow validation found ${issues.length} issue(s). Check console for details.`);
    }
  }, []);





  // Quick filter functions
  const isOnHold = (task: any) => {
    // Check if task is in PAUSED group (blocked, needs_work, needs_input, on_hold)
    const statusGroup = getStatusGroup(task.status);
    return statusGroup === "PAUSED";
  };

  const isHighPriority = (task: any) => {
    return task.priority === "High" || task.priority === "Emergency";
  };

  const isAssignedToMe = (task: any) => {
    // Mock current user - in real app this would come from auth context
    const currentUser = "Erin George";
    return task.assignee?.name === currentUser;
  };

  const isCreatedByMe = (task: any) => {
    // Mock current user - in real app this would come from auth context
    const currentUser = "Erin George";
    return task.assignee?.name === currentUser; // Using assignee as creator for demo
  };

  const isUnassigned = (task: any) => {
    return !task.assignee || !task.assignee.name;
  };

  const isStalled = (task: any) => {
    // Task is stalled if it hasn't been updated for 7+ days
    const lastUpdated = task.lastStatusChange || task.createdAt || now.toISOString();
    const daysDiff = Math.floor((now.getTime() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 7;
  };

  const isOverdue = (task: any) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate < now;
  };

  const isDueSoon = (task: any) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const daysDiff = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 0 && daysDiff <= 3; // Due within 3 days
  };

  const isRecentlyUpdated = (task: any) => {
    const lastUpdated = task.lastStatusChange || task.createdAt || now.toISOString();
    const daysDiff = Math.floor((now.getTime() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 1; // Updated within 1 day
  };

  const toggleQuickFilter = (filterName: string) => {
    setQuickFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

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
      stalled: false,
    });
  };

  const getActiveQuickFiltersCount = () => {
    return Object.values(quickFilters).filter(Boolean).length;
  };



  const toggleGroupPin = (groupId: string) => {
    setPinnedGroups(prev => {
      const newPinned = new Set(prev);
      if (newPinned.has(groupId)) {
        newPinned.delete(groupId);
      } else {
        newPinned.add(groupId);
      }
      return newPinned;
    });
  };



  const updateGroupName = (groupId: string, newName: string) => {
    setGroupNames(prev => ({
      ...prev,
      [groupId]: newName
    }));
    setEditingGroupId(null);
  };

  const getGroupDisplayName = (groupId: string, defaultName: string) => {
    return groupNames[groupId] || defaultName;
  };

  // Get ordered statuses based on current order and category
  const orderedStatuses = useMemo(() => {
    let statuses;
    // If we should show statuses for this category, return statuses in custom order
    if (shouldShowStatuses(activeCategory)) {
      // Filter statuses based on category
      let filteredStatusOrder = statusOrder;
      
      // For "Created" category, only show statuses that belong to CREATED group
      if (activeCategory === "Created") {
        filteredStatusOrder = statusOrder.filter(statusId => {
          const status = findStatusById(statusId);
          return status && getStatusGroup(statusId) === "CREATED";
        });
        console.log(`Filtered statusOrder for "Created" category:`, filteredStatusOrder);
      }
      // For "Active" category, only show statuses that belong to ACTIVE group
      else if (activeCategory === "Active") {
        filteredStatusOrder = statusOrder.filter(statusId => {
          const status = findStatusById(statusId);
          return status && getStatusGroup(statusId) === "ACTIVE";
        });
        console.log(`Filtered statusOrder for "Active" category:`, filteredStatusOrder);
      }
      // For "Paused" category, only show statuses that belong to PAUSED group
      else if (activeCategory === "Paused") {
        filteredStatusOrder = statusOrder.filter(statusId => {
          const status = findStatusById(statusId);
          return status && getStatusGroup(statusId) === "PAUSED";
        });
        console.log(`Filtered statusOrder for "Paused" category:`, filteredStatusOrder);
      }
      // For "Completed" category, only show statuses that belong to COMPLETED group
      else if (activeCategory === "Completed") {
        filteredStatusOrder = statusOrder.filter(statusId => {
          const status = findStatusById(statusId);
          return status && getStatusGroup(statusId) === "COMPLETED";
        });
        console.log(`Filtered statusOrder for "Completed" category:`, filteredStatusOrder);
      }
      // For "Rejected" category, only show statuses that belong to REJECTED group
      else if (activeCategory === "Rejected") {
        filteredStatusOrder = statusOrder.filter(statusId => {
          const status = findStatusById(statusId);
          return status && getStatusGroup(statusId) === "REJECTED";
        });
        console.log(`Filtered statusOrder for "Rejected" category:`, filteredStatusOrder);
      }
      
      statuses = filteredStatusOrder.map(id => findStatusById(id)).filter(Boolean);
      console.log(`Category "${activeCategory}" should show statuses. statusOrder:`, statusOrder);
      console.log(`Found statuses:`, statuses.map(s => s ? { id: s.id, title: s.title } : null).filter(Boolean));
    } else {
      // Otherwise, return states
      statuses = columnOrder.map(id => findStatusById(id)).filter(Boolean);
      console.log(`Category "${activeCategory}" should show states. columnOrder:`, columnOrder);
      console.log(`Found states:`, statuses.map(s => s ? { id: s.id, title: s.title } : null).filter(Boolean));
    }
    
    // Sort: pinned groups first, then others
    const sortedStatuses = statuses.sort((a, b) => {
      if (!a || !b) return 0;
      const aPinned = pinnedGroups.has(a.id);
      const bPinned = pinnedGroups.has(b.id);
      
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
    
    console.log(`Final orderedStatuses for "${activeCategory}":`, sortedStatuses.map(s => s ? { id: s.id, title: s.title } : null).filter(Boolean));
    return sortedStatuses;
  }, [statusOrder, columnOrder, activeCategory, pinnedGroups]);



  // Search and filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    console.log('filteredTasks memo - initial tasks count:', filtered.length);
    console.log('filteredTasks memo - activeCategory:', activeCategory);

    // Category filter
    if (activeCategory && activeCategory !== "All tasks") {
      console.log('filteredTasks memo - applying category filter for:', activeCategory);
      console.log('filteredTasks memo - sample tasks before filter:', filtered.slice(0, 3).map(t => ({ id: t.id, category: t.category, title: t.title })));
      
      // Filter parent tasks by category
      filtered = filtered.filter(task => task.category === activeCategory);
      
      // For category-specific pages, also filter subtasks to only include those whose parent is in the current category
      if (activeCategory !== "All tasks") {
        filtered = filtered.map(task => {
          if (task.subtasks) {
            // Only include subtasks whose parent task is in the current category
            const filteredSubtasks = task.subtasks.filter((subtask: any) => {
              // The subtask should inherit the parent's category
              return true; // Since we've already filtered parent tasks by category
            });
            return {
              ...task,
              subtasks: filteredSubtasks
            };
          }
          return task;
        });
      }
      
      console.log('filteredTasks memo - after category filter, count:', filtered.length, 'category:', activeCategory);
      console.log('filteredTasks memo - sample tasks after filter:', filtered.slice(0, 3).map(t => ({ id: t.id, category: t.category, title: t.title })));
    }

    // Archive filter
    if (!showArchived) {
      filtered = filtered.filter(task => !('archived' in task ? task.archived : false));
    }

    // Quick filters - apply all active filters
    const activeFilters = Object.entries(quickFilters).filter(([_, isActive]) => isActive);
    
    if (activeFilters.length > 0) {
      // Group filters by type: some work as AND, others as OR
      const assignmentFilters = ['assignedToMe', 'createdByMe', 'unassigned'];
      const priorityFilters = ['highPriority', 'overdue', 'dueSoon', 'recentlyUpdated', 'onHold', 'stalled'];
      
      const assignmentFilterActive = activeFilters.some(([key]) => assignmentFilters.includes(key));
      const priorityFilterActive = activeFilters.some(([key]) => priorityFilters.includes(key));
      
      if (assignmentFilterActive) {
        // Assignment filters work as OR (show tasks that match any of the selected assignment filters)
        const assignmentConditions = activeFilters
          .filter(([key]) => assignmentFilters.includes(key))
          .map(([key]) => {
            switch (key) {
              case 'assignedToMe': return isAssignedToMe;
              case 'createdByMe': return isCreatedByMe;
              case 'unassigned': return isUnassigned;
              default: return () => false;
            }
          });
        
        filtered = filtered.filter(task => 
          assignmentConditions.some(condition => condition(task))
        );
      }
      
      if (priorityFilterActive) {
        // Priority filters work as OR (show tasks that match any of the selected priority filters)
        const priorityConditions = activeFilters
          .filter(([key]) => priorityFilters.includes(key))
          .map(([key]) => {
            switch (key) {
              case 'highPriority': return isHighPriority;
              case 'overdue': return isOverdue;
              case 'dueSoon': return isDueSoon;
              case 'recentlyUpdated': return isRecentlyUpdated;
              case 'onHold': return isOnHold;
              case 'stalled': return isStalled;
              default: return () => false;
            }
          });
        
        filtered = filtered.filter(task => 
          priorityConditions.some(condition => condition(task))
        );
      }
    }

    // Optimized search filter with multi-term matching
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      const searchTerms = searchLower.split(' ').filter(term => term.length > 0);
      
      filtered = filtered.filter(task => {
        const taskText = [
          task.title,
          task.taskId,
          task.assignee?.name,
          task.description
        ].join(' ').toLowerCase();
        
        return searchTerms.every(term => taskText.includes(term));
      });
    }
    
    return filtered;
  }, [tasks, debouncedSearch, showArchived, agingFilter, quickFilters, activeCategory]);

  // Memoized column tasks for better performance
  const memoizedColumnTasks = useMemo(() => {
    const result: Record<string, any[]> = {};
    orderedStatuses.forEach(status => {
      if (status) {
        result[status.id] = getColumnTasks(status.id);
      }
    });
    return result;
  }, [filteredTasks, columnOrder, taskOrder, orderedStatuses]);

  // smart-drop-menu: removed checkForHiddenColumns function

  // Task management functions
  const archiveTask = (taskId: string) => {
    setTasks(prev => 
      prev.map(t => 
        t.id === taskId ? { ...t, archived: true, archivedAt: now.toISOString() } : t
      )
    );
  };

  const unarchiveTask = (taskId: string) => {
    setTasks(prev => 
      prev.map(t => 
        t.id === taskId ? { ...t, archived: false, archivedAt: null } : t
      )
    );
  };



  // Bulk operations
  const toggleTaskSelection = useCallback((taskId: string) => {
    console.log(`toggleTaskSelection called for taskId: ${taskId}`);
    console.log(`Current selectedTasks before toggle:`, Array.from(selectedTasks));
    
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      const wasSelected = newSet.has(taskId);
      
      if (wasSelected) {
        newSet.delete(taskId);
        console.log(`Removed taskId ${taskId} from selection`);
      } else {
        newSet.add(taskId);
        console.log(`Added taskId ${taskId} to selection`);
      }
      
      const result = Array.from(newSet);
      console.log(`New selectedTasks after toggle:`, result);
      return newSet;
    });
  }, [selectedTasks]);

  const selectAllTasks = () => {
    const allTaskIds = filteredTasks.map(task => task.id);
    // Also include subtask IDs
    const allSubtaskIds = filteredTasks.flatMap(task => 
      task.subtasks ? task.subtasks.map((subtask: any) => subtask.id) : []
    );
    const allIds = [...allTaskIds, ...allSubtaskIds];
    setSelectedTasks(new Set(allIds));
  };

  const clearSelection = () => {
    setSelectedTasks(new Set());
  };

  // Select all tasks in a specific column
  const selectAllTasksInColumn = (columnId: string, clearPrevious = false) => {
    const columnTasks = getColumnTasks(columnId);
    const columnTaskIds = columnTasks.map(task => task.id);
    // Also include subtask IDs from tasks in this column
    const columnSubtaskIds = columnTasks.flatMap(task => 
      task.subtasks ? task.subtasks.map((subtask: any) => subtask.id) : []
    );
    const allIds = [...columnTaskIds, ...columnSubtaskIds];
    setSelectedTasks(prev => {
      const newSelected = clearPrevious ? new Set<string>() : new Set(prev);
      allIds.forEach(id => newSelected.add(id));
      return newSelected;
    });
  };

  // Check if all tasks in a column are selected
  const areAllTasksInColumnSelected = (columnId: string) => {
    const columnTasks = getColumnTasks(columnId);
    const columnTaskIds = columnTasks.map(task => task.id);
    const columnSubtaskIds = columnTasks.flatMap(task => 
      task.subtasks ? task.subtasks.map((subtask: any) => subtask.id) : []
    );
    const allIds = [...columnTaskIds, ...columnSubtaskIds];
    return allIds.length > 0 && allIds.every(id => selectedTasks.has(id));
  };

  // Check if some tasks in a column are selected
  const areSomeTasksInColumnSelected = (columnId: string) => {
    const columnTasks = getColumnTasks(columnId);
    const columnTaskIds = columnTasks.map(task => task.id);
    const columnSubtaskIds = columnTasks.flatMap(task => 
      task.subtasks ? task.subtasks.map((subtask: any) => subtask.id) : []
    );
    const allIds = [...columnTaskIds, ...columnSubtaskIds];
    return allIds.some(id => selectedTasks.has(id));
  };

  const bulkArchive = () => {
    setTasks(prev => 
      prev.map(task => {
        // Check if main task is selected
        if (selectedTasks.has(task.id)) {
          return { ...task, archived: true, archivedAt: new Date().toISOString() };
        }
        // Check if any subtasks are selected
        if (task.subtasks) {
          const updatedSubtasks = task.subtasks.map((subtask: any) => 
            selectedTasks.has(subtask.id) ? { ...subtask, archived: true, archivedAt: new Date().toISOString() } : subtask
          );
          return { ...task, subtasks: updatedSubtasks };
        }
        return task;
      })
    );
    clearSelection();
  };

  const bulkUnarchive = () => {
    setTasks(prev => 
      prev.map(task => {
        // Check if main task is selected
        if (selectedTasks.has(task.id)) {
          return { ...task, archived: false, archivedAt: null };
        }
        // Check if any subtasks are selected
        if (task.subtasks) {
          const updatedSubtasks = task.subtasks.map((subtask: any) => 
            selectedTasks.has(subtask.id) ? { ...subtask, archived: false, archivedAt: null } : subtask
          );
          return { ...task, subtasks: updatedSubtasks };
        }
        return task;
      })
    );
    clearSelection();
  };

  const bulkDelete = () => {
    setTasks(prev => 
      prev.map(task => {
        // If main task is selected, remove it entirely
        if (selectedTasks.has(task.id)) {
          return null as any;
        }
        // If subtasks are selected, remove them
        if (task.subtasks) {
          const updatedSubtasks = task.subtasks.filter((subtask: any) => !selectedTasks.has(subtask.id));
          return { ...task, subtasks: updatedSubtasks };
        }
        return task;
      }).filter((task): task is any => task !== null)
    );
    clearSelection();
  };


  
  // Grouped/flat view
  function getColumnTasks(status: string) {
    console.log(`getColumnTasks called for status: ${status}`);
    console.log(`Current filteredTasks:`, filteredTasks.map(t => ({ id: t.id, status: t.status, title: t.title })));
    let tasksInColumn: any[] = [];
    
    // Get the group for this status
    const statusGroup = getStatusGroup(status);
    console.log(`Status group for ${status}: ${statusGroup}`);
    
    // For category-specific pages, filter by exact status match
    // For "All tasks" page, filter by status group
    const parentTasksInStatus = filteredTasks.filter(t => {
      let matches;
      if (activeCategory === "All tasks") {
        // On "All tasks" page, show tasks by status group
        const taskGroup = getStatusGroup(t.status);
        matches = taskGroup === statusGroup;
      } else {
        // On category pages, show tasks by exact status match
        matches = t.status === status;
      }
      
      if (matches) {
        console.log(`Found parent task: ${t.id} (${t.title}) with status ${t.status} in group ${getStatusGroup(t.status)}`);
      }
      return matches;
    });
    console.log(`Parent tasks in status ${status}: ${parentTasksInStatus.length}`);

    // Get all subtasks that belong to the same group/status
    const subtasksInStatus: any[] = [];
    
    // Only show subtasks as separate elements when they are in a different status than their parent
    // and when the parent task is not in the same column
    filteredTasks.forEach(parentTask => {
      if (parentTask.subtasks) {
        parentTask.subtasks.forEach((subtask: any) => {
          let subtaskMatches;
          if (activeCategory === "All tasks") {
            // On "All tasks" page, filter subtasks by status group
            const subtaskGroup = getStatusGroup(subtask.status);
            subtaskMatches = subtaskGroup === statusGroup;
          } else {
            // On category pages, filter subtasks by exact status match
            subtaskMatches = subtask.status === status;
          }
          
          if (subtaskMatches) {
            // Check if parent task is also in the same column
            const parentTaskInSameColumn = parentTasksInStatus.some(pt => pt.id === parentTask.id);
            
            // Only show subtask as separate item if parent is NOT in the same column
            // This prevents duplicate rendering
            if (!parentTaskInSameColumn) {
              // Special logic for "Created" column on "All Tasks" view
              if (activeCategory === "All tasks" && statusGroup === "CREATED") {
                // In "Created" column, NEVER show subtasks as separate cards
                // They should only appear when parent task is expanded
                console.log(`Hiding subtask ${subtask.id} in "Created" column - subtasks should always stay with parent`);
                return; // Skip this subtask
              }
              
              // For category-specific pages, ensure subtask belongs to the correct category
              if (activeCategory !== "All tasks" && parentTask.category !== activeCategory) {
                console.log(`Hiding subtask ${subtask.id} - parent task category (${parentTask.category}) doesn't match active category (${activeCategory})`);
                return; // Skip this subtask
              }
              
              // Add parent task info to subtask for display
              const subtaskWithParent = {
                ...subtask,
                parentTask: {
                  id: parentTask.id,
                  title: parentTask.title,
                  taskId: parentTask.taskId,
                  category: parentTask.category,
                  status: parentTask.status // Include parent status for business logic validation
                },
                isSubtask: true
              };
              subtasksInStatus.push(subtaskWithParent);
              console.log(`Found subtask: ${subtask.id} (${subtask.title}) with status ${subtask.status} in group ${getStatusGroup(subtask.status)}`);
            } else {
              console.log(`Hiding subtask ${subtask.id} - parent task ${parentTask.id} is in the same column`);
            }
          }
        });
      }
    });
    console.log(`Subtasks in status ${status}: ${subtasksInStatus.length}`);

    // Combine parent tasks and subtasks
    tasksInColumn = [...parentTasksInStatus, ...subtasksInStatus];
    console.log(`Total tasks in column ${status}: ${tasksInColumn.length}`);

    // Debug logging for category pages
    if (activeCategory !== "All tasks" && tasksInColumn.length === 0) {
      console.log(`No tasks found for status "${status}" in category "${activeCategory}"`);
      console.log(`Available statuses in filteredTasks:`, [...new Set(filteredTasks.map(t => t.status))]);
      console.log(`Total filteredTasks:`, filteredTasks.length);
    }

    // Apply custom order if exists
    const columnOrder = taskOrder[status];
    if (columnOrder && columnOrder.length > 0) {
      // Create a map for quick lookup
      const taskMap = new Map(tasksInColumn.map(task => [task.id, task]));
      
      // Sort based on custom order
      const orderedTasks: any[] = [];
      columnOrder.forEach(taskId => {
        const task = taskMap.get(taskId);
        if (task) {
          orderedTasks.push(task);
          taskMap.delete(taskId);
        }
      });
      
      // Add remaining tasks that weren't in the order
      taskMap.forEach(task => orderedTasks.push(task));
      
      return orderedTasks;
    }
    
    return tasksInColumn;
  }

  // 1. Start dragging (onDragStart) - Простий підхід
  const onDragStart = (start: any) => {
    const task = tasks.find((t) => t.id === start.draggableId);
    if (task) {
      setDraggedTask(task);
    }
  };

  // 4. End dragging (onDragEnd) - Enhanced logging and debugging
  const onDragEnd = (result: DropResult) => {
    console.log('=== DRAG END DEBUG ===');
    console.log('onDragEnd called with result:', result);
    console.log('Current tasks state before update:', tasks.map(t => ({ id: t.id, status: t.status, title: t.title })));
    setDraggedTask(null);
    
    const { destination, source, draggableId, type } = result;
    
    if (!destination) {
      console.log('No destination, dropping cancelled');
      return;
    }
    
    console.log(`Drag operation: ${type}, from ${source.droppableId} to ${destination.droppableId}`);
    
    // Handle column reordering
    if (type === "COLUMN") {
      if (destination.droppableId === source.droppableId && destination.index === source.index) return;
      
      // Update the appropriate order based on category
      if (shouldShowStatuses(activeCategory)) {
        const newStatusOrder = Array.from(statusOrder);
        const [removed] = newStatusOrder.splice(source.index, 1);
        newStatusOrder.splice(destination.index, 0, removed);
        
        setStatusOrder(newStatusOrder);
        toast.success("Status order updated");
      } else {
        const newColumnOrder = Array.from(columnOrder);
        const [removed] = newColumnOrder.splice(source.index, 1);
        newColumnOrder.splice(destination.index, 0, removed);
        
        setColumnOrder(newColumnOrder);
        toast.success("Column order updated");
      }
      return;
    }
    
    // Handle task reordering within the same column
    if (destination.droppableId === source.droppableId && destination.index !== source.index) {
      console.log('Reordering task within same column');
      const columnId = destination.droppableId;
      const columnTasks = getColumnTasks(columnId);
      
      // Update task order for this column
      setTaskOrder(prev => {
        const currentOrder = prev[columnId] || columnTasks.map(t => t.id);
        const newOrder = Array.from(currentOrder);
        const [removed] = newOrder.splice(source.index, 1);
        newOrder.splice(destination.index, 0, removed);
        
        return {
          ...prev,
          [columnId]: newOrder
        };
      });
      
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
      
      // Find task or subtask
      let task = tasks.find((t) => t.id === draggableId);
      let isSubtask = false;
      if (!task) {
        console.log(`Task ${draggableId} not found, looking for subtask...`);
        for (const t of tasks) {
          if (t.subtasks) {
            const st = t.subtasks.find((st: any) => st.id === draggableId);
            if (st) {
              console.log(`Found subtask ${draggableId} in task ${t.id}`);
              // Inherit missing fields from parent for type safety
              task = { ...t, ...st };
              isSubtask = true;
              break;
            }
          }
        }
      }
      if (!task) {
        console.log(`Neither task nor subtask found for ${draggableId}`);
        toast.error(`Task not found: ${draggableId}`);
        return;
      }
      console.log(`Found ${isSubtask ? 'subtask' : 'task'}: ${draggableId}, current status: ${task.status}`);
      
      // Check if we need to show status selection popup
      if (shouldShowStatusSelection(task.status, destination.droppableId)) {
        console.log('Showing status selection popup');
        const fromGroup = getGroupNameByStatus(task.status);
        const toGroup = getGroupNameByStatus(destination.droppableId);
        const availableStatuses = getAvailableStatusesForGroup(toGroup);
        
        // Filter available statuses based on workflow transitions
        let parentStatus: string | undefined;
        if (isSubtask) {
          // Find the parent task to get its status for business logic validation
          const parentTask = tasks.find(t => t.subtasks?.some((st: any) => st.id === draggableId));
          parentStatus = parentTask?.status;
        }
        
        const validStatuses = availableStatuses.filter(status => 
          isValidTransition(task.status, status.id, parentStatus)
        );
        
        if (validStatuses.length > 0) {
          setStatusSelectionPopup({
            isOpen: true,
            task,
            fromStatus: task.status,
            toStatus: destination.droppableId,
            availableStatuses: validStatuses,
            destinationIndex: destination.index,
            sourceIndex: source.index,
            sourceDroppableId: source.droppableId,
            destinationDroppableId: destination.droppableId
          });
          return; // Don't proceed with the move yet
        }
      }
      
      // Check workflow transitions for all categories
      let parentStatus: string | undefined;
      if (isSubtask) {
        // Find the parent task to get its status for business logic validation
        const parentTask = tasks.find(t => t.subtasks?.some((st: any) => st.id === draggableId));
        parentStatus = parentTask?.status;
      }
      
      console.log(`Checking transition: ${task.status} -> ${destination.droppableId} (parent: ${parentStatus})`);
      
      if (!isValidTransition(task.status, destination.droppableId, parentStatus)) {
        const fromStatus = findStatusById(task.status)?.title || task.status;
        const toStatus = findStatusById(destination.droppableId)?.title || destination.droppableId;
        
        // Provide more specific error messages for business logic violations
        if (parentStatus === "Rejected" || parentStatus === "rejected") {
          toast.error(`Cannot move subtask from "${fromStatus}" to "${toStatus}" because parent task is rejected`);
        } else if (parentStatus === "Done" || parentStatus === "done") {
          toast.error(`Cannot move subtask from "${fromStatus}" to "${toStatus}" because parent task is done`);
        } else {
          toast.error(`Cannot move task from "${fromStatus}" to "${toStatus}"`);
        }
        return;
      }
      
      // Update task status with optimistic update
      if (isSubtask) {
        console.log(`Moving subtask ${draggableId} from ${task.status} to ${destination.droppableId}`);
        setTasks(prev => {
          const newTasks = prev.map(t => ({
            ...t,
            subtasks: t.subtasks ? t.subtasks.map((st: any) => st.id === draggableId ? { ...st, status: destination.droppableId } : st) : [],
          }));
          console.log(`Updated tasks state:`, newTasks.map(t => ({ id: t.id, subtasks: t.subtasks?.map((st: any) => ({ id: st.id, status: st.status })) })));
          return newTasks;
        });
        
        // Force a re-render by updating the task order
        setTaskOrder(prev => {
          const newOrder = { ...prev };
          // Remove from source column
          if (newOrder[source.droppableId]) {
            newOrder[source.droppableId] = newOrder[source.droppableId].filter(id => id !== draggableId);
          }
          // Add to destination column
          if (newOrder[destination.droppableId]) {
            newOrder[destination.droppableId] = [draggableId, ...newOrder[destination.droppableId]];
          } else {
            newOrder[destination.droppableId] = [draggableId];
          }
          console.log(`Updated task order:`, newOrder);
          return newOrder;
        });
      } else {
        console.log(`Moving task ${draggableId} from ${task.status} to ${destination.droppableId}`);
        setTasks(prev => {
          const newTasks = prev.map(t => t.id === draggableId ? { ...t, status: destination.droppableId } : t);
          console.log(`Updated tasks state:`, newTasks.map(t => ({ id: t.id, status: t.status })));
          return newTasks;
        });
        
        // Force a re-render by updating the task order
        setTaskOrder(prev => {
          const newOrder = { ...prev };
          // Remove from source column
          if (newOrder[source.droppableId]) {
            newOrder[source.droppableId] = newOrder[source.droppableId].filter(id => id !== draggableId);
          }
          // Add to destination column
          if (newOrder[destination.droppableId]) {
            newOrder[destination.droppableId] = [draggableId, ...newOrder[destination.droppableId]];
          } else {
            newOrder[destination.droppableId] = [draggableId];
          }
          console.log(`Updated task order:`, newOrder);
          return newOrder;
        });
      }
      
      // Update task order in destination column
      setTaskOrder(prev => {
        const destinationColumnTasks = getColumnTasks(destination.droppableId);
        const currentOrder = prev[destination.droppableId] || destinationColumnTasks.map(t => t.id);
        const newOrder = Array.from(currentOrder);
        
        // Insert the moved task at the specified position
        newOrder.splice(destination.index, 0, draggableId);
        
        return {
          ...prev,
          [destination.droppableId]: newOrder
        };
      });
      
      toast.success(`Task moved to ${destination.droppableId}`);
      
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
      
      // Additional debugging: Log the current state after the move
      setTimeout(() => {
        console.log(`=== POST-MOVE DEBUG ===`);
        console.log(`Tasks state after move:`, tasks.map(t => ({ id: t.id, status: t.status, title: t.title })));
        console.log(`Task order after move:`, taskOrder);
        console.log(`Filtered tasks:`, filteredTasks.map(t => ({ id: t.id, status: t.status, title: t.title })));
        console.log(`=== END POST-MOVE DEBUG ===`);
      }, 100);
      
      // Test function to manually change a task status (for debugging)
      const testStatusChange = () => {
        console.log('=== TEST STATUS CHANGE ===');
        setTasks(prev => {
          const newTasks = prev.map(t => 
            t.id === 'T1' ? { ...t, status: 'done' } : t
          );
          console.log('Test status change - new tasks:', newTasks.map(t => ({ id: t.id, status: t.status })));
          return newTasks;
        });
      };
      
      // Expose test function globally for debugging
      (window as any).testStatusChange = testStatusChange;
    }
  };
  
  // smart-drop-menu: removed all Smart Drop Menu related functions and effects

  // Handle status selection popup confirmation
  const handleStatusSelectionConfirm = (selectedStatus: string) => {
    const { task, fromStatus, toStatus, destinationIndex, sourceDroppableId, destinationDroppableId } = statusSelectionPopup;
    
    if (!task) return;
    
    // Find if it's a subtask
    let isSubtask = false;
    let parentTask = null;
    
    if (!tasks.find(t => t.id === task.id)) {
      // It's a subtask
      isSubtask = true;
      parentTask = tasks.find(t => t.subtasks?.some((st: any) => st.id === task.id));
    }
    
    // Update task status
    if (isSubtask && parentTask) {
      setTasks(prev => {
        const newTasks = prev.map(t => ({
          ...t,
          subtasks: t.subtasks ? t.subtasks.map((st: any) => st.id === task.id ? { ...st, status: selectedStatus } : st) : [],
        }));
        return newTasks;
      });
      
      // Show success message for subtask move
      const fromGroup = getGroupNameByStatus(fromStatus);
      const toGroup = getGroupNameByStatus(selectedStatus);
      toast.success(`Subtask "${task.title}" moved from ${fromGroup} to ${toGroup}`);
    } else {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: selectedStatus } : t));
      
      // Show success message for main task move
      const fromGroup = getGroupNameByStatus(fromStatus);
      const toGroup = getGroupNameByStatus(selectedStatus);
      toast.success(`Task "${task.title}" moved from ${fromGroup} to ${toGroup}`);
    }
    
    // Update task order with proper insertion at destination index
    setTaskOrder(prev => {
      const newOrder = { ...prev };
      
      // Remove from source column if it exists
      if (sourceDroppableId && newOrder[sourceDroppableId]) {
        newOrder[sourceDroppableId] = newOrder[sourceDroppableId].filter(id => id !== task.id);
      }
      
      // Insert at the correct position in destination column
      if (destinationIndex !== undefined) {
        const destinationColumnTasks = getColumnTasks(selectedStatus);
        const currentOrder = newOrder[selectedStatus] || destinationColumnTasks.map(t => t.id);
        const newDestinationOrder = Array.from(currentOrder);
        
        // Insert the task at the specified destination index
        newDestinationOrder.splice(destinationIndex, 0, task.id);
        
        newOrder[selectedStatus] = newDestinationOrder;
      } else {
        // Fallback: add to the beginning if no destination index
        const destinationColumnTasks = getColumnTasks(selectedStatus);
        const currentOrder = newOrder[selectedStatus] || destinationColumnTasks.map(t => t.id);
        newOrder[selectedStatus] = [task.id, ...currentOrder];
      }
      
      return newOrder;
    });
    
    // Add animation and scroll to the newly inserted task after a short delay
    setTimeout(() => {
      const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
      if (taskElement) {
        // Add insertion animation
        taskElement.classList.add('task-insert-animation');
        
        // Scroll to the task
        taskElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        
        // Remove animation class after animation completes
        setTimeout(() => {
          taskElement.classList.remove('task-insert-animation');
        }, 300);
      }
    }, 100);
  };

  // Handle status selection popup close
  const handleStatusSelectionClose = () => {
    setStatusSelectionPopup({
      isOpen: false,
      task: null,
      fromStatus: '',
      toStatus: '',
      availableStatuses: [],
      destinationIndex: undefined,
      sourceIndex: undefined,
      sourceDroppableId: '',
      destinationDroppableId: ''
    });
  };

  // Function to check if drag should show status selection popup
  const shouldShowStatusSelection = (fromStatus: string, toStatus: string): boolean => {
    // Show status selection popup for all categories when moving between different statuses
    if (fromStatus !== toStatus) {
      const toGroup = getStatusGroup(toStatus);
      const availableStatuses = getAvailableStatusesForGroup(toGroup);
      return availableStatuses.length > 0; // Show popup if there are any statuses to choose from
    }
    
    return false;
  };





  // Function to render subtask content with identical structure to main tasks
  const renderSubtaskContent = useCallback((subtask: any, isSubtask: boolean) => {
    const showAttachments = cardFields.attachments;
    const showComments = cardFields.comments;
    
    // Calculate which fields are actually visible for this specific subtask
    const visibleFields = {
      taskId: cardFields.taskId,
      name: cardFields.name !== false,
      status: cardFields.status !== false, // Show status on all tabs now
      description: cardFields.description && subtask.description,
      tags: cardFields.tags && subtask.tags && subtask.tags.length > 0,
      organization: cardFields.organization,
      assignee: cardFields.assignee && subtask.teamMembers,
      priority: cardFields.priority,
      dueDate: cardFields.dueDate,
      attachments: showAttachments,
      comments: showComments,
    };
    
    // Count visible fields to determine card complexity
    const visibleFieldCount = Object.values(visibleFields).filter(Boolean).length;
    const isSimple = visibleFieldCount <= 3; // Simple if 3 or fewer fields visible
    
    // Calculate dynamic padding based on visible fields
    const getDynamicPadding = () => {
      if (visibleFieldCount <= 2) return "p-2"; // Very simple cards
      if (visibleFieldCount <= 4) return "p-3"; // Simple cards
      if (visibleFieldCount <= 6) return "p-4"; // Medium cards
      return "p-4"; // Complex cards
    };

    // Find parent task if this is a subtask
    let parentTask = null;
    if (isSubtask) {
      parentTask = tasks.find(t => t.subtasks && t.subtasks.some((st: any) => st.id === subtask.id));
    }

    return (
      <div className={`${getDynamicPadding()} ${selectedTasks.has(subtask.id) ? 'bg-blue-50 border border-blue-200 rounded-lg' : ''}`}>
        {/* Subtask label */}
        {isSubtask && (
          <div className="flex items-center gap-1 mb-1">
            <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
            <span className="text-xs text-gray-500">Subtask</span>
          </div>
        )}
          {/* ID line */}
          <div className="flex items-center justify-between text-xs font-semibold text-[#60646c] mb-1">
            <div className="flex items-center gap-1">
              {cardFields.taskId && <span>{subtask.taskId}</span>}
            </div>
            <div className="flex items-center gap-1">
              {/* Status Label - Show only on "All tasks" tab */}
              {cardFields.status !== false && activeCategory === "All tasks" && (() => {
                const status = findStatusById(subtask.status);
                if (status) {
                  return (
                    <div className="flex items-center gap-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusBadgeColorMap[subtask.status] || status.color}`}>
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
          {cardFields.name !== false && (
            <div className="mb-1">
              <div 
                className="text-xs font-medium text-[#1c2024] cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => onTaskClick && onTaskClick(subtask)}
              >
                {subtask.title}
              </div>
            {/* Parent task info for subtasks */}
            {isSubtask && parentTask && (
              <div className="text-xs text-gray-400 mt-0.5">
                Parent: <span className="font-semibold">{parentTask.taskId}</span> {parentTask.title}
              </div>
            )}
            </div>
          )}
          
          {/* Description */}
          {cardFields.description && subtask.description && (
            <div className="text-xs text-[#8b8d98] mb-2 line-clamp-3">{subtask.description}</div>
          )}
          
          {/* Tags */}
          {cardFields.tags && subtask.tags && subtask.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mb-2">
              {subtask.tags.slice(0, 3).map((tag: string, index: number) => (
                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  {tag}
                </span>
              ))}
              {subtask.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600 border border-gray-300">
                  +{subtask.tags.length - 3}
                </span>
              )}
            </div>
          )}
          
          {/* Assignee avatars */}
          {cardFields.assignee && subtask.teamMembers && (
            <div className="flex items-center justify-between mb-1">
              <div className="flex -space-x-2 ml-0">
                {subtask.teamMembers.slice(0, 3).map((member: any, index: number) => (
                  <img key={index} src={member.avatarUrl} alt={member.name} className="w-6 h-6 rounded-full border-2 border-white" />
                ))}
                {subtask.teamMembers.length > 3 && (
                  <span className="w-6 h-6 rounded-full bg-[#f3f3f3] text-xs text-[#60646c] flex items-center justify-center border-2 border-white">
                    +{subtask.teamMembers.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Priority, Due */}
          {(cardFields.priority || cardFields.dueDate) && (
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {/* Priority - invisible but takes space when hidden */}
                <div className={`flex items-center gap-2 ${cardFields.priority ? '' : 'invisible'}`}>
                  {/* Different icons for each priority */}
                  {subtask.priority === "Emergency" && (
                    <div className="flex">
                      <ChevronUp className="w-4 h-4 text-gray-600 -mr-1" />
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                  {subtask.priority === "High" && (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  )}
                  {(subtask.priority === "Normal" || !subtask.priority) && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minus w-4 h-4 text-gray-600">
                      <path d="M5 12h14"></path>
                    </svg>
                  )}
                  {subtask.priority === "Low" && (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                  <span className="text-xs font-medium text-[#1c2024]">{subtask.priority || "Normal"}</span>
                </div>
              </div>
              {/* Due date */}
              {cardFields.dueDate && (
                <div className="text-xs text-[#1c2024] flex items-center gap-1">
                  <span>Due:</span>
                  <span className="font-medium">{subtask.dueDate}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Attachments + Comments */}
          {(showAttachments || showComments) && (
            <div className="flex items-center gap-3 mt-2 w-full">
              <div className="flex items-center gap-1 ml-auto">
                {showAttachments && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f3f3f3] text-xs text-[#60646c]">
                    <Paperclip className="w-3 h-3" />
                    <span>{subtask.attachmentCount || 0}</span>
                  </span>
                )}
                {showComments && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f3f3f3] text-xs text-[#60646c]">
                    <MessageCircle className="w-3 h-3" />
                    <span>{subtask.commentCount || 0}</span>
                  </span>
                )}
              </div>
            </div>
          

        )}
        
        {/* Hover buttons for subtasks - removed */}
        </div>
    );
  }, [cardFields, activeCategory, selectedTasks, onTaskClick, tasks]);





  // Optimized card rendering with virtualization support
  const renderCard = useCallback((task: any, isSubtask = false, taskIndex = 0) => {
    const showSubtasks = task.subtasks && task.subtasks.length > 0;
    const showAttachments = cardFields.attachments;
    const showComments = cardFields.comments;
    
    // Calculate which fields are actually visible for this specific task
    const visibleFields = {
      taskId: cardFields.taskId,
      name: cardFields.name !== false,
      status: cardFields.status !== false && activeCategory === "All tasks", // Show status only on "All tasks" tab
      description: cardFields.description && task.description,
      tags: cardFields.tags && task.tags && task.tags.length > 0,
      organization: cardFields.organization && !isSubtask,
      assignee: cardFields.assignee && task.teamMembers,
      priority: cardFields.priority,
      dueDate: cardFields.dueDate,
      attachments: showAttachments,
      comments: showComments,
      subtasks: showSubtasks
    };
    
    // Count visible fields to determine card complexity
    const visibleFieldCount = Object.values(visibleFields).filter(Boolean).length;
    const isSimple = visibleFieldCount <= 3; // Simple if 3 or fewer fields visible
    
    // Calculate dynamic padding based on visible fields
    const getDynamicPadding = () => {
      if (isSubtask) return "p-3"; // Subtasks always compact
      if (visibleFieldCount <= 2) return "p-2"; // Very simple cards
      if (visibleFieldCount <= 4) return "p-3"; // Simple cards
      if (visibleFieldCount <= 6) return "p-4"; // Medium cards
      return "p-4"; // Complex cards
    };
    
    // Show subtask count for parent tasks in both modes
    const subtasksCount = task.subtasks?.length || 0;
    
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
                    : selectedTasks.has(task.id)
                    ? 'shadow-lg shadow-blue-200 border-blue-300 bg-blue-50 transition-all duration-200 ease-out'
                    : highlightedSubtasks.has(task.id)
                    ? 'shadow-lg shadow-blue-200 border-blue-300 bg-blue-50 transition-all duration-200 ease-out'
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
                    {cardFields.taskId && <span>{task.taskId}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Status Label - Show on all tabs now */}
                    {cardFields.status !== false && (() => {
                      const status = findStatusById(task.status);
                      if (status) {
                        return (
                          <div className="flex items-center gap-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusBadgeColorMap[task.status] || status.color}`}>
                              {status.title}
                            </span>

                          </div>
                        );
                      }
                      return null;
                    })()}
                    {/* Archive button */}
                    {/* Archive button hidden */}
                    {/* {!isSubtask && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          if ('archived' in task && task.archived) {
                            unarchiveTask(task.id);
                          } else {
                            archiveTask(task.id);
                          }
                        }}
                        title={('archived' in task && task.archived) ? 'Unarchive' : 'Archive'}
                      >
                        {('archived' in task && task.archived) ? '📦' : '📁'}
                      </Button>
                    )} */}
                  </div>
                </div>
                {/* Title (Name) */}
                {cardFields.name !== false && (
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
                {cardFields.description && task.description && (
                  <div className="text-xs text-[#8b8d98] mb-2 line-clamp-3">{task.description}</div>
                )}
                {/* Tags */}
                {cardFields.tags && task.tags && task.tags.length > 0 && (
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
                {((cardFields.organization && !isSubtask) || cardFields.assignee) && (
                  <div className="flex items-center justify-between mb-1">
                    {/* Org logo and organization - приховано для підзадач */}
                    {!isSubtask && (
                      <div className={`flex items-center gap-2 ${cardFields.organization ? '' : 'invisible'}`}>
                        {(() => {
                          const avatar = generateOrganizationAvatar(task.clientInfo || 'Default');
                          return (
                            <span className={`w-6 h-6 rounded-full ${avatar.bgColor} flex items-center justify-center text-xs font-semibold text-gray-700`}>
                              {avatar.abbreviation}
                            </span>
                          );
                        })()}
                        <span className="text-xs text-[#1c2024] font-medium mr-2">{task.clientInfo}</span>
                      </div>
                    )}
                    {/* Assignee avatars - aligned to the right */}
                    {cardFields.assignee && task.teamMembers && (
                      <div className={`flex -space-x-2 ${isSubtask ? 'ml-0' : 'ml-auto'}`}>
                        {task.teamMembers.slice(0, 3).map((member: any, index: number) => (
                          <img key={index} src={member.avatarUrl} alt={member.name} className="w-6 h-6 rounded-full border-2 border-white" />
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
                {(cardFields.priority || cardFields.dueDate) && (
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {/* Priority - invisible but takes space when hidden */}
                      <div className={`flex items-center gap-2 ${cardFields.priority ? '' : 'invisible'}`}>
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
                          <ChevronDown className="w-4 h-4 text-[#16a34a]" />
                        )}
                        <span className={`text-xs font-medium ${
                          task.priority === "Emergency" ? "text-red-600" :
                          task.priority === "High" ? "text-orange-600" :
                          task.priority === "Low" ? "text-[#16a34a]" :
                          "text-blue-600"
                        }`}>{task.priority || "Normal"}</span>
                      </div>
                    </div>
                    {/* Due date */}
                    {cardFields.dueDate && (
                      <div className="text-xs text-[#8b8d98] flex items-center gap-1">
                        <span>Due:</span>
                        <span className="text-[#1c2024] font-medium">{task.dueDate}</span>
                      </div>
                    )}
                  </div>
                )}
                {/* Subtasks + Attachments + Comments в один рядок */}
                {(subtasksCount > 0 || showAttachments || showComments) && (
                  <div className="flex items-center gap-3 mt-2 w-full">

                    <div className="flex items-center gap-1 ml-auto">
                      {showAttachments && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f3f3f3] text-xs text-[#60646c]">
                          <Paperclip className="w-3 h-3" />
                          <span>{task.attachmentCount || 0}</span>
                        </span>
                      )}
                      {showComments && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f3f3f3] text-xs text-[#60646c]">
                          <MessageCircle className="w-3 h-3" />
                          <span>{task.commentCount || 0}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Hover buttons - removed */}
              </CardContent>
            </Card>
          </div>
        )}
      </Draggable>
    );
  }, [cardFields, selectedTasks, expandedSubtasks, onTaskClick]);

  // Functions for expand/collapse all groups
  const expandAllGroups = () => {
    const newCollapsed: Record<string, boolean> = {};
    orderedStatuses.forEach(status => {
      if (status) {
        newCollapsed[status.id] = false;
      }
    });
    setCollapsed(newCollapsed);
    
    // Expand all subtasks
    const allTaskIds = filteredTasks.map(task => task.id);
    const newExpandedSubtasks: Record<string, boolean> = {};
    allTaskIds.forEach(taskId => {
      newExpandedSubtasks[taskId] = true;
    });
    setExpandedSubtasks(newExpandedSubtasks);
    
    toast.success("All groups expanded and subtasks grouped");
    if (onExpandAll) onExpandAll();
  };

  const collapseAllGroups = () => {
    const newCollapsed: Record<string, boolean> = {};
    orderedStatuses.forEach(status => {
      if (status) {
        newCollapsed[status.id] = true;
      }
    });
    setCollapsed(newCollapsed);
    
    // Collapse all subtasks
    setExpandedSubtasks({});
    
    toast.success("All groups collapsed and subtasks ungrouped");
    if (onCollapseAll) onCollapseAll();
  };

  // Expose functions to parent component
  React.useEffect(() => {
    (window as any).kanbanExpandAll = expandAllGroups;
    (window as any).kanbanCollapseAll = collapseAllGroups;
  }, [expandAllGroups, collapseAllGroups]);

  // Expose functions via ref
  useImperativeHandle(ref, () => ({
    getActiveQuickFiltersCount
  }), [quickFilters]);



  // Відображення Kanban колонок
  const renderColumns = () => {
    console.log(`renderColumns called for category "${activeCategory}"`);
    console.log(`shouldShowStatuses(${activeCategory}):`, shouldShowStatuses(activeCategory));
    console.log(`orderedStatuses length:`, orderedStatuses.length);
    
    if (shouldShowStatuses(activeCategory)) {
      // Дозволяємо drag&drop колонок
      return (
        <Droppable droppableId="board" type="COLUMN" direction="horizontal">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="kanban-scrollbar flex gap-3 min-h-[700px] overflow-x-auto horizontal-hover-scrollbar">
              {orderedStatuses.map((column, index) => {
                if (!column) return null;
                const columnTasks = getColumnTasks(column.id);
                // Check workflow transitions for all categories
                const isDropDisabled = draggedTask ? !isValidTransition(draggedTask.status, column.id) : false;
                // Allow collapse/expand on all pages
                const isCollapsed = collapsed[column.id] || false;
                // For status-based categories, use status colors directly
                const groupColor = shouldShowStatuses(activeCategory) 
                  ? (statusColorMap[column.id] || "bg-white border-gray-200")
                  : (statusColorMap[column.id] || "bg-white border-gray-200");

                return (
                  <Draggable
                    key={column.id}
                    draggableId={column.id}
                    index={index}
                  >
                    {(draggableProvided, draggableSnapshot) => (
                      <div
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                        className="kanban-column transition-all duration-200"
                        data-column-id={column.id}
                      >
                        <Droppable
                          key={column.id}
                          droppableId={column.id}
                          isDropDisabled={isDropDisabled}
                        >
                          {(droppableProvided, droppableSnapshot) => (
                            isCollapsed ? (
                              <div
                                ref={droppableProvided.innerRef}
                                {...droppableProvided.droppableProps}
                                className={`drop-zone flex flex-col items-center justify-center min-w-[72px] max-w-[72px] h-[300px] rounded-lg border p-0 cursor-pointer select-none relative group ${groupColor} ${droppableSnapshot.isDraggingOver ? 'drag-over' : ''} ${isDropDisabled && draggedTask ? "drop-disabled" : ""}`}
                                onClick={() => setCollapsed(c => ({ ...c, [column.id]: false }))}
                              >
                                {/* Drag handle for collapsed column - positioned above */}
                                {shouldShowStatuses(activeCategory) && (
                                  <div
                                    {...draggableProvided.dragHandleProps}
                                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab p-1 rounded hover:bg-gray-100 bg-white shadow-sm border border-gray-200"
                                    title="Drag column"
                                  >
                                    <GripVertical className="w-3 h-3 text-gray-400" />
                                  </div>
                                )}
                                  
                                  <div className="flex flex-col items-center justify-start w-full h-full pt-8 pb-4 group/collapsed group/column-header">
                                                                                        {(() => {
                                              const state = findStateByStatus(column.id);
                                              const columnGroup = getStatusGroup(column.id);
                                              const groupAbbreviation = getGroupAbbreviation(columnGroup);
                                              
                                              // Map status to group display names
                                              const getGroupDisplayName = (statusId: string) => {
                                                const statusGroup = getStatusGroup(statusId);
                                                switch (statusGroup) {
                                                  case 'CREATED': return 'Created';
                                                  case 'ACTIVE': return 'Active';
                                                  case 'PAUSED': return 'Paused';
                                                  case 'COMPLETED': return 'Completed';
                                                  case 'REJECTED': return 'Rejected';
                                                  default: return groupAbbreviation;
                                                }
                                              };
                                              
                                              // For status-based categories, show status title and available statuses
                                              const displayTitle = getGroupDisplayName(column.id);
                                              const statusGroup = getStatusGroup(column.id);
                                              const availableStatuses = getAvailableStatusesForGroup(statusGroup);
                                              
                                              return (
                                                <div className="flex flex-col items-center gap-1">
                                                  <span className="font-medium text-xs text-[#1c2024] mb-2 text-center" style={{ writingMode: "vertical-rl", textOrientation: "mixed", letterSpacing: "0.05em" }}>
                                                    {displayTitle}
                                                  </span>
                                                  
                                                  {/* Show available statuses as small badges */}
                                                  {availableStatuses.length > 1 && (
                                                    <div className="flex flex-col gap-1 items-center">
                                                      {availableStatuses.slice(0, 3).map((status: any) => (
                                                        <div 
                                                          key={status.id}
                                                          className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-60"
                                                          title={`Available: ${status.title}`}
                                                        />
                                                      ))}
                                                      {availableStatuses.length > 3 && (
                                                        <div 
                                                          className="w-1.5 h-1.5 bg-gray-400 rounded-full opacity-40"
                                                          title={`+${availableStatuses.length - 3} more statuses`}
                                                        />
                                                      )}
                                                    </div>
                                                  )}

                                                  {pinnedGroups.has(column.id) && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full" title="Pinned group"></div>
                                                  )}
                                                </div>
                                              );
                                            })()}
                                    <div className="flex flex-col items-center gap-2 mb-3">
                                      <span className="bg-white text-black text-xs font-semibold rounded-xl px-4 py-1 shadow border border-gray-200 text-center">{columnTasks.length}</span>
                                      {areSomeTasksInColumnSelected(column.id) && (
                                        <span className={`bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl px-2 py-1 shadow border border-blue-200 transition-opacity ${
                                          areSomeTasksInColumnSelected(column.id) 
                                            ? 'opacity-100' 
                                            : 'opacity-0 group-hover/collapsed:opacity-100'
                                        }`}>
                                          {(() => {
                                            const columnTasks = getColumnTasks(column.id);
                                            const taskCount = columnTasks.filter(task => selectedTasks.has(task.id)).length;
                                            const subtaskCount = columnTasks.flatMap(task => 
                                              task.subtasks ? task.subtasks.filter((subtask: any) => selectedTasks.has(subtask.id)) : []
                                            ).length;
                                            return taskCount + subtaskCount;
                                          })()}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="rounded-full hover:bg-[#e0e2e7] text-gray-400 opacity-0 group-hover/column-header:opacity-100 transition-opacity"
                                        onClick={e => {
                                          e.stopPropagation();
                                          setCollapsed(c => ({ ...c, [column.id]: false }));
                                        }}
                                        title="Expand group"
                                      >
                                        <span className="sr-only">Expand</span>
                                        <ChevronRight className="w-5 h-5" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="rounded-full hover:bg-[#e0e2e7] text-gray-400 opacity-0 group-hover/column-header:opacity-100 transition-opacity"
                                        onClick={e => {
                                          e.stopPropagation();
                                          // Trigger modal open with status
                                          if (typeof window !== "undefined" && window.dispatchEvent) {
                                            window.dispatchEvent(new CustomEvent("openCreateTaskModal", { detail: { status: column.id } }));
                                          }
                                        }}
                                        title="Add task"
                                      >
                                        <span className="sr-only">Add task</span>
                                        <span>+</span>
                                      </Button>
                                      <Popover 
                                        open={columnMenuOpen[column.id]} 
                                        onOpenChange={(open) => setColumnMenuOpen(prev => ({ ...prev, [column.id]: open }))}
                                      >
                                        <PopoverTrigger asChild>
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            className="rounded-full hover:bg-[#e0e2e7] text-gray-400 opacity-0 group-hover/column-header:opacity-100 transition-opacity"
                                            title="More actions"
                                            onClick={e => { e.stopPropagation(); }}
                                          >
                                            <span className="sr-only">More</span>
                                            <span className="text-xs">...</span>
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-48 p-1" align="end">
                                          <div className="space-y-1">
                                            <Button
                                              variant="ghost"
                                              className="w-full justify-start text-xs font-normal px-2 py-1 h-auto"
                                              onClick={() => {
                                                setCollapsed(prev => ({ ...prev, [column.id]: !prev[column.id] }));
                                                setColumnMenuOpen(prev => ({ ...prev, [column.id]: false }));
                                              }}
                                            >
                                              {collapsed[column.id] ? 'Expand group' : 'Collapse group'}
                                            </Button>
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                  </div>
                                  {provided.placeholder}
                                </div>
                              ) : (
                                <div
                                  ref={droppableProvided.innerRef}
                                  {...droppableProvided.droppableProps}
                                  className={`drop-zone flex flex-col min-w-[320px] max-w-[380px] h-[calc(100vh-160px)] rounded-lg border p-0 transition-all duration-200 relative ${
                                    groupColor
                                  } ${
                                    droppableSnapshot.isDraggingOver ? 'drag-over' : ''
                                  } ${
                                    isDropDisabled && draggedTask
                                      ? "drop-disabled"
                                      : ""
                                  }`}
                                  style={{
                                    borderWidth: droppableSnapshot.isDraggingOver ? '2px' : '1px',
                                    borderStyle: 'solid',
                                  }}
                                >

                                  <div className="relative group">
                                    {/* Drag handle for column reordering - positioned above the header */}
                                    {shouldShowStatuses(activeCategory) && (
                                      <div
                                        {...draggableProvided.dragHandleProps}
                                        className="absolute -top-1 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab p-1 rounded hover:bg-gray-100 bg-white shadow-sm border border-gray-200"
                                        title="Drag column"
                                      >
                                        <GripVertical className="w-3 h-3 text-gray-400" />
                                      </div>
                                    )}
                                    <div className={`flex items-center justify-between mb-0 px-4 pt-3 pb-2 group`}>
                                      <div className="flex items-center gap-1 group/header">
                                        {(() => {
                                          const state = findStateByStatus(column.id);
                                          const columnGroup = getStatusGroup(column.id);
                                          const groupAbbreviation = getGroupAbbreviation(columnGroup);
                                          
                                          // Map status to group display names
                                          const getGroupDisplayName = (statusId: string) => {
                                            const statusGroup = getStatusGroup(statusId);
                                            switch (statusGroup) {
                                              case 'CREATED': return 'Created';
                                              case 'ACTIVE': return 'Active';
                                              case 'PAUSED': return 'Paused';
                                              case 'COMPLETED': return 'Completed';
                                              case 'REJECTED': return 'Rejected';
                                              default: return groupAbbreviation;
                                            }
                                          };
                                          
                                          // For status-based categories, show status title directly
                                          const displayTitle = shouldShowStatuses(activeCategory) ? column.title : getGroupDisplayName(column.id);
                                          const displayDescription = shouldShowStatuses(activeCategory) ? groupAbbreviation : "";
                                          return (
                                            <div className="flex items-center gap-2 group/column-header">
                                              <div>
                                                <h3 className="font-medium text-xs text-[#1c2024]">{displayTitle}</h3>
                                              </div>
                                              {pinnedGroups.has(column.id) && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" title="Pinned group"></div>
                                              )}
                                            </div>
                                          );
                                        })()}
                                        <div className="flex items-center gap-1">
                                          <Badge className="text-xs px-2 py-0.5 h-5 min-w-5 flex items-center justify-center">{columnTasks.length}</Badge>
                                                                              {areSomeTasksInColumnSelected(column.id) && (
                                      <Badge className={`text-xs px-2 py-0.5 h-5 min-w-5 flex items-center justify-center bg-blue-100 text-blue-700 border-blue-200 transition-opacity ${
                                        areSomeTasksInColumnSelected(column.id) 
                                          ? 'opacity-100' 
                                          : 'opacity-0 group-hover/header:opacity-100'
                                      }`}>
                                        {(() => {
                                          const columnTasks = getColumnTasks(column.id);
                                          const taskCount = columnTasks.filter(task => selectedTasks.has(task.id)).length;
                                          const subtaskCount = columnTasks.flatMap(task => 
                                            task.subtasks ? task.subtasks.filter((subtask: any) => selectedTasks.has(subtask.id)) : []
                                          ).length;
                                          return taskCount + subtaskCount;
                                        })()}
                                      </Badge>
                                    )}
                                        </div>

                                      </div>
                                      <div className="flex items-center gap-2">
                                        {/* Collapse button */}
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-8 w-8 rounded-full hover:bg-gray-100 text-gray-400 invisible group-hover:visible transition-all duration-200`}
                                          onClick={e => {
                                            e.stopPropagation();
                                            setCollapsed(c => ({ ...c, [column.id]: true }));
                                          }}
                                          title="Collapse group"
                                        >
                                          <span className="sr-only">Collapse</span>
                                          <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        {/* Add task button */}
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-8 w-8 rounded-full hover:bg-gray-100 text-gray-400 invisible group-hover:visible transition-all duration-200`}
                                          onClick={e => {
                                            e.stopPropagation();
                                            // Trigger modal open with status
                                            if (typeof window !== "undefined" && window.dispatchEvent) {
                                              window.dispatchEvent(new CustomEvent("openCreateTaskModal", { detail: { status: column.id } }));
                                            }
                                          }}
                                          title="Add task"
                                            >
                                              <span className="sr-only">Add task</span>
                                              <span>+</span>
                                            </Button>

                                      </div>
                                    </div>
                                  </div>
                                  {!collapsed[column.id] && (
                                    <div className="flex-1 overflow-y-auto px-4 pb-4 hover-scrollbar">
                                      {columnTasks.length === 0 && (
                                        <div className="text-xs text-gray-400 flex-1 flex items-center justify-center">No tasks</div>
                                      )}
                                      {virtualizationEnabled && columnTasks.length > 50 ? (
                                        <List
                                          height={600}
                                          itemCount={columnTasks.length}
                                          itemSize={taskCardHeight}
                                          width="100%"
                                          itemData={columnTasks}
                                        >
                                          {({ index, style, data }) => (
                                            <div style={{ ...style, paddingBottom: '8px' }}>
                                              {renderCard(data[index], false, index)}
                                            </div>
                                          )}
                                        </List>
                                      ) : (
                                        <div className="space-y-2">
                                          {columnTasks.map((task: any, idx: number) => {
                                            // Check if this is a subtask
                                            if (task.isSubtask) {
                                              // Render subtask with parent indicator
                                              return (
                                                <Draggable key={task.id} draggableId={task.id} index={idx}>
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
                                                      <div 
                                                        className={`kanban-card group border-[#e8e8ec] rounded-2xl w-full cursor-grab bg-white border-l-2 border-l-gray-300 shadow-sm ${
                                                          snapshot.isDragging 
                                                            ? 'dragging shadow-xl shadow-black/20 border-blue-300 cursor-grabbing transition-none' 
                                                            : highlightedSubtasks.has(task.id)
                                                            ? 'shadow-lg shadow-blue-200 border-blue-300 bg-blue-50'
                                                            : 'shadow-none hover:shadow-lg hover:shadow-black/15 hover:border-gray-300 transition-all duration-200 ease-out'
                                                          }`}
                                                      >
                                                        {/* Parent task indicator inside card */}
                                                        <div className="px-3 py-1 bg-gray-100 rounded-t-2xl text-xs text-gray-600 font-medium border-b border-gray-200">
                                                          Part of: {task.parentTask.title}
                                                        </div>
                                                        <div {...provided.dragHandleProps}>
                                                          {renderSubtaskContent(task, true)}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  )}
                                                </Draggable>
                                              );
                                            } else {
                                              // Render parent task
                                              const elements = [];
                                              elements.push(renderCard(task, false, idx));
                                              
                                                                                            // Always show subtasks under parent task
                                              if (task.subtasks && task.subtasks.length > 0) {
                                                console.log(`✅ ALWAYS SHOWING subtasks for task ${task.id}:`, task.subtasks.length, 'subtasks');
                                                
                                                // Add visual separator
                                                elements.push(
                                                  <div key={`separator-${task.id}`} className="my-2 border-l-2 border-gray-200 ml-4 h-8"></div>
                                                );
                                                
                                                task.subtasks.forEach((subtask: any, subtaskIdx: number) => {
                                                  console.log(`Rendering subtask ${subtask.id} under parent ${task.id} with index ${idx + 1 + subtaskIdx}`);
                                                  // Show all subtasks under parent task for better UX
                                                  elements.push(
                                                    <Draggable key={subtask.id} draggableId={subtask.id} index={idx + 1 + subtaskIdx}>
                                                      {(provided, snapshot) => (
                                                        <div
                                                          ref={provided.innerRef}
                                                          {...provided.draggableProps}
                                                          className="relative ml-6"
                                                          data-task-id={subtask.id}
                                                          style={{
                                                            ...provided.draggableProps.style,
                                                            transform: provided.draggableProps.style?.transform,
                                                          }}
                                                        >
                                                          <div 
                                                            className={`kanban-card group border-[#e8e8ec] rounded-2xl w-full cursor-grab bg-white border-l-2 border-l-gray-300 shadow-sm ${
                                                              snapshot.isDragging 
                                                                ? 'dragging shadow-xl shadow-black/20 border-blue-300 cursor-grabbing transition-none' 
                                                                : highlightedSubtasks.has(subtask.id)
                                                                ? 'shadow-lg shadow-blue-200 border-blue-300 bg-blue-50'
                                                                : 'shadow-none hover:shadow-lg hover:shadow-black/15 hover:border-gray-300 transition-all duration-200 ease-out'
                                                            }`}
                                                          >
                                                            {/* Parent task indicator inside card */}
                                                            <div className="px-3 py-1 bg-gray-100 rounded-t-2xl text-xs text-gray-600 font-medium border-b border-gray-200">
                                                              Part of: {task.title}
                                                            </div>
                                                            <div {...provided.dragHandleProps}>
                                                              {renderSubtaskContent(subtask, true)}
                                                            </div>
                                                          </div>
                                                        </div>
                                                      )}
                                                    </Draggable>
                                                  );
                                                });
                                              } else {
                                                console.log(`❌ Task ${task.id} has no subtasks. subtasks:`, task.subtasks?.length || 0);
                                              }
                                              
                                              return elements;
                                            }
                                          }).flat()}
                                        </div>
                                      )}
                                      {provided.placeholder}
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                          </Droppable>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
      );
    } else {
      // Просто map без drag&drop
      return (
        <div className="kanban-scrollbar flex gap-3 min-h-[700px] overflow-x-auto horizontal-hover-scrollbar">
          {orderedStatuses.map((column, index) => {
            if (!column) return null;
            const columnTasks = getColumnTasks(column.id);
            // Check workflow transitions for all categories
            const isDropDisabled = draggedTask ? !isValidTransition(draggedTask.status, column.id) : false;
            // Allow collapse/expand on all pages
            const isCollapsed = collapsed[column.id] || false;
            // For status-based categories, use status colors directly
            const groupColor = shouldShowStatuses(activeCategory) 
              ? (statusColorMap[column.id] || "bg-white border-gray-200")
              : (statusColorMap[column.id] || "bg-white border-gray-200");

            return (
              <div
                key={column.id}
                className="kanban-column transition-all duration-200"
                data-column-id={column.id}
              >
                    <Droppable
                      key={column.id}
                      droppableId={column.id}
                      isDropDisabled={isDropDisabled}
                    >
                      {(provided, snapshot) => (
                        isCollapsed ? (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`drop-zone flex flex-col items-center justify-center min-w-[72px] max-w-[72px] h-[300px] rounded-lg border p-0 cursor-pointer select-none relative group ${groupColor} ${snapshot.isDraggingOver ? 'drag-over' : ''} ${isDropDisabled && draggedTask ? "drop-disabled" : ""}`}
                            onClick={() => setCollapsed(c => ({ ...c, [column.id]: false }))}
                          >
                            
                            <div className="flex flex-col items-center justify-start w-full h-full pt-8 pb-4 group/collapsed group/column-header">
                                                                                          {(() => {
                                            const state = findStateByStatus(column.id);
                                            // For status-based categories, show status title directly
                                            const displayTitle = shouldShowStatuses(activeCategory) ? column.title : (state?.title || column.title);
                                            return (
                                              <span className="font-medium text-xs text-[#1c2024] mb-2 text-center" style={{ writingMode: "vertical-rl", textOrientation: "mixed", letterSpacing: "0.05em" }}>
                                                {displayTitle}
                                              </span>
                                            );
                                          })()}
                              <div className="flex flex-col items-center gap-2 mb-3">
                                <span className="bg-white text-black text-xs font-semibold rounded-xl px-4 py-1 shadow border border-gray-200 text-center">{columnTasks.length}</span>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="rounded-full hover:bg-[#e0e2e7] text-gray-400 opacity-0 group-hover/column-header:opacity-100 transition-opacity"
                                onClick={e => {
                                  e.stopPropagation();
                                  setCollapsed(c => ({ ...c, [column.id]: false }));
                                }}
                                title="Expand group"
                              >
                                <span className="sr-only">Expand</span>
                                <ChevronRight className="w-5 h-5" />
                              </Button>
                              <Popover 
                                open={columnMenuOpen[column.id]} 
                                onOpenChange={(open) => setColumnMenuOpen(prev => ({ ...prev, [column.id]: open }))}
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="rounded-full hover:bg-[#e0e2e7] text-gray-400 opacity-0 group-hover/column-header:opacity-100 transition-opacity"
                                    title="More actions"
                                    onClick={e => { e.stopPropagation(); }}
                                  >
                                    <span className="sr-only">More</span>
                                    <span className="text-xs">...</span>
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-1" align="end">
                                  <div className="space-y-1">
                                    <Button
                                      variant="ghost"
                                      className="w-full justify-start text-xs font-normal px-2 py-1 h-auto"
                                      onClick={() => {
                                        setCollapsed(prev => ({ ...prev, [column.id]: !prev[column.id] }));
                                        setColumnMenuOpen(prev => ({ ...prev, [column.id]: false }));
                                      }}
                                    >
                                      {collapsed[column.id] ? 'Expand group' : 'Collapse group'}
                                    </Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                            {provided.placeholder}
                          </div>
                        ) : (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`drop-zone flex flex-col min-w-[320px] max-w-[380px] h-[calc(100vh-160px)] rounded-lg border p-0 transition-all duration-200 relative ${
                              groupColor
                            } ${
                              snapshot.isDraggingOver ? 'drag-over' : ''
                            } ${
                              isDropDisabled && draggedTask
                                ? "drop-disabled"
                                : ""
                            }`}
                            style={{
                              borderWidth: snapshot.isDraggingOver ? '2px' : '1px',
                              borderStyle: 'solid',
                            }}
                          >

                            <div className={`relative`}>
                              <div className="flex items-center justify-between mb-0 px-4 pt-3 pb-2 group">
                                <div className="flex items-center gap-1 group/header">
                                  {(() => {
                                    const state = findStateByStatus(column.id);
                                    // For status-based categories, show status title directly
                                    const displayTitle = shouldShowStatuses(activeCategory) ? column.title : (state?.title || column.title);
                                    const displayDescription = shouldShowStatuses(activeCategory) ? "" : (state?.description || "");
                                    return (
                                      <div>
                                        <h3 className="font-medium text-xs text-[#1c2024]">{displayTitle}</h3>
                                        <p className="text-xs text-[#60646c]">{displayDescription}</p>
                                      </div>
                                    );
                                  })()}
                                  <div className="flex items-center gap-1">
                                    <Badge className="text-xs px-2 py-0.5 h-5 min-w-5 flex items-center justify-center">{columnTasks.length}</Badge>
                                    {areSomeTasksInColumnSelected(column.id) && (
                                      <Badge className={`text-xs px-2 py-0.5 h-5 min-w-5 flex items-center justify-center bg-blue-100 text-blue-700 border-blue-200 transition-opacity ${
                                        areSomeTasksInColumnSelected(column.id) 
                                          ? 'opacity-100' 
                                          : 'opacity-0 group-hover/header:opacity-100'
                                      }`}>
                                        {(() => {
                                          const columnTasks = getColumnTasks(column.id);
                                          const taskCount = columnTasks.filter(task => selectedTasks.has(task.id)).length;
                                          const subtaskCount = columnTasks.flatMap(task => 
                                            task.subtasks ? task.subtasks.filter((subtask: any) => selectedTasks.has(subtask.id)) : []
                                          ).length;
                                          return taskCount + subtaskCount;
                                        })()}
                                      </Badge>
                                    )}
                                  </div>

                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-8 w-8 rounded-full hover:bg-gray-100 text-gray-400 invisible group-hover:visible transition-all duration-200`}
                                    onClick={e => {
                                      e.stopPropagation();
                                      setCollapsed(c => ({ ...c, [column.id]: true }));
                                    }}
                                    title="Collapse group"
                                  >
                                    <span className="sr-only">Collapse</span>
                                    <ChevronLeft className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-8 w-8 rounded-full hover:bg-gray-100 text-gray-400 invisible group-hover:visible transition-all duration-200`}
                                    onClick={e => {
                                      e.stopPropagation();
                                      // Trigger modal open with status
                                      if (typeof window !== "undefined" && window.dispatchEvent) {
                                        window.dispatchEvent(new CustomEvent("openCreateTaskModal", { detail: { status: column.id } }));
                                      }
                                    }}
                                    title="Add task"
                                  >
                                    <span className="sr-only">Add task</span>
                                    <span>+</span>
                                  </Button>
                                  <Popover 
                                    open={columnMenuOpen[column.id]} 
                                    onOpenChange={(open) => setColumnMenuOpen(prev => ({ ...prev, [column.id]: open }))}
                                  >
                                    <PopoverTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-8 w-8 rounded-full hover:bg-gray-100 text-gray-400 invisible group-hover:visible transition-all duration-200`}
                                        title="More actions"
                                        onClick={e => { e.stopPropagation(); }}
                                      >
                                        <span className="sr-only">More</span>
                                        <span className="text-xs">...</span>
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48 p-1" align="end">
                                      <div className="space-y-1">
                                        <Button
                                          variant="ghost"
                                          className="w-full justify-start text-xs font-normal px-2 py-1.5 h-auto"
                                          onClick={() => {
                                            setCollapsed(prev => ({ ...prev, [column.id]: !prev[column.id] }));
                                            setColumnMenuOpen(prev => ({ ...prev, [column.id]: false }));
                                          }}
                                        >
                                          {collapsed[column.id] ? 'Expand group' : 'Collapse group'}
                                        </Button>

                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                            </div>
                            {!collapsed[column.id] && (
                              <div className="flex-1 overflow-y-auto px-4 pb-4 hover-scrollbar">
                                {columnTasks.length === 0 && (
                                  <div className="text-xs text-gray-400 flex-1 flex items-center justify-center">No tasks</div>
                                )}
                                {virtualizationEnabled && columnTasks.length > 50 ? (
                                  <List
                                    height={600}
                                    itemCount={columnTasks.length}
                                    itemSize={taskCardHeight}
                                    width="100%"
                                    itemData={columnTasks}
                                  >
                                    {({ index, style, data }) => (
                                      <div style={{ ...style, paddingBottom: '8px' }}>
                                        {renderCard(data[index], false, index)}
                                      </div>
                                    )}
                                  </List>
                                ) : (
                                  <div className="space-y-2">
                                    {columnTasks.map((task: any, idx: number) => {
                                      // Check if this is a subtask
                                      const isSubtask = task.isSubtask;
                                      
                                      // If this is a subtask, render it with parent indicator
                                      if (isSubtask) {
                                        return (
                                          <div key={task.id}>
                                            {renderCard(task, isSubtask, idx)}
                                          </div>
                                        );
                                      }
                                      
                                      // If this is a parent task, render it normally
                                      return (
                                        <div key={task.id}>
                                          {renderCard(task, isSubtask, idx)}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                                {provided.placeholder}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </Droppable>
                  </div>
            );
          })}
        </div>
      );
    }
  };

  return (
    <TooltipProvider>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex flex-col h-full w-full relative kanban-board-container">



        {/* Quick Filters - Above Metrics */}
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



        {/* Kanban scroll area with padding */}

        {/* Kanban scroll area with padding */}
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
            {renderColumns()}
          </div>
        </div>
      </div>
      
      {/* smart-drop-menu: removed Smart Drop Menu component */}
      
      {/* Rename Group Modal */}
      {showRenameModal && editingGroupId && (
        <Dialog open={showRenameModal} onOpenChange={setShowRenameModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Rename Group</DialogTitle>
              <DialogDescription>
                Enter a new name for this group. The change will be applied immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="group-name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter group name..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateGroupName(editingGroupId, newGroupName);
                      setShowRenameModal(false);
                    }
                    if (e.key === 'Escape') {
                      setShowRenameModal(false);
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRenameModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  updateGroupName(editingGroupId, newGroupName);
                  setShowRenameModal(false);
                }}
              >
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Status Selection Popup */}
      <StatusSelectionPopup
        isOpen={statusSelectionPopup.isOpen}
        onClose={handleStatusSelectionClose}
        onConfirm={handleStatusSelectionConfirm}
        availableStatuses={statusSelectionPopup.availableStatuses}
        taskTitle={statusSelectionPopup.task?.title || ''}
        fromGroup={getGroupNameByStatus(statusSelectionPopup.fromStatus)}
        toGroup={getGroupNameByStatus(statusSelectionPopup.toStatus)}
      />
        </DragDropContext>
    </TooltipProvider>
  );
});

export default KanbanBoard;