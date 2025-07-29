import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useState, useMemo, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Settings, X, Search, ChevronLeft, ChevronUp, Clock, ChevronDown as ChevronDownIcon, Layers, Paperclip, MessageCircle, MoreHorizontal, Flag, Expand, Minimize2, GripVertical } from "lucide-react";
import { Paperclip as PaperclipIcon, MessageCircle as MessageCircleIcon } from "lucide-react";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import TaskPreview from "./TaskPreview";
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
    color: "bg-blue-50 border-blue-200",
    icon: "🔄",
    description: "In progress"
  },
  { 
    id: "paused", 
    title: "Paused", 
    color: "bg-yellow-50 border-yellow-200",
    icon: "⏸️",
    description: "Temporarily paused"
  },
  { 
    id: "completed", 
    title: "Completed", 
    color: "bg-green-50 border-green-200",
    icon: "✅",
    description: "Successfully completed"
  },
  { 
    id: "terminated", 
    title: "Terminated", 
    color: "bg-red-50 border-red-200",
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
  "to_do": ["in_progress", "blocked", "on_hold"],
  "draft": ["in_progress", "blocked", "on_hold"],
  "backlog": ["in_progress", "blocked", "on_hold"],
  "new": ["in_progress", "blocked", "on_hold"],
  
  // Active -> Completed, Paused, Terminated
  "in_progress": ["done", "approved", "validated", "blocked", "needs_work", "on_hold"],
  "working": ["done", "approved", "validated", "blocked", "needs_work", "on_hold"],
  "ongoing": ["done", "approved", "validated", "blocked", "needs_work", "on_hold"],
  "doing": ["done", "approved", "validated", "blocked", "needs_work", "on_hold"],
  "assigned": ["done", "approved", "validated", "blocked", "needs_work", "on_hold"],
  
  // Paused -> Active, Created, Terminated
  "blocked": ["in_progress", "to_do", "rejected", "canceled"],
  "needs_input": ["in_progress", "to_do", "rejected", "canceled"],
  "needs_work": ["in_progress", "to_do", "rejected", "canceled"],
  "on_hold": ["in_progress", "to_do", "rejected", "canceled"],
  
  // Completed -> Active (for review/fixes)
  "done": ["in_progress", "approved", "validated"],
  "approved": ["in_progress", "done", "validated"],
  "validated": ["in_progress", "done", "approved"],
  
  // Terminated -> Active (for restoration)
  "rejected": ["in_progress", "to_do"],
  "canceled": ["in_progress", "to_do"],
  "closed": ["in_progress", "to_do"],
};

const isValidTransition = (fromStatus: string, toStatus: string): boolean => {
  // Allow dropping in the same status
  if (fromStatus === toStatus) return true;
  
  // Check if the transition is allowed
  const allowedTargets = allowedTransitions[fromStatus];
  if (!allowedTargets) {
    return false;
  }
  
  return allowedTargets.includes(toStatus);
};

const originalTasks = [
  {
    id: "1",
    taskId: "FCLT-771",
    title: "Update Calls, Distributions",
    priority: "Emergency",
    category: "Budget",
    assignee: { name: "Marley Bergson", initials: "MB", department: "Finance" },
    teamMembers: [
      { name: "Marley Bergson", initials: "MB", avatarUrl: "https://randomuser.me/api/portraits/women/1.jpg" },
      { name: "Sarah Chen", initials: "SC", avatarUrl: "https://randomuser.me/api/portraits/women/2.jpg" },
      { name: "David Kim", initials: "DK", avatarUrl: "https://randomuser.me/api/portraits/men/3.jpg" },
    ],
    subtasks: [
      { id: "1-1", taskId: "FCLT-771-1", title: "Review call schedule", status: "to_do", assignee: { name: "Marley Bergson", initials: "MB", department: "Finance" }, dueDate: "2024-11-12" },
      { id: "1-2", taskId: "FCLT-771-2", title: "Confirm distribution amounts", status: "to_do", assignee: { name: "Marley Bergson", initials: "MB", department: "Finance" }, dueDate: "2024-11-12" },
    ],
    tags: ["finance", "urgent"],
    dueDate: "2024-11-12",
    progress: 80,
    department: "Finance",
    type: "Task",
    clientInfo: "Acme Inc.",
    description: "Update calls and distributions for Q4. Review quarterly performance and adjust distribution schedules accordingly.",
    status: "to_do",
    attachmentCount: 5,
    commentCount: 12,
    lastStatusChange: "2024-11-01T10:00:00Z",
  },
  {
    id: "2",
    taskId: "INVST-344",
    title: "Renew insurance on Sand Lane",
    priority: "Low",
    category: "Investment",
    assignee: { name: "Justin's team", initials: "JT", department: "Legal" },
    teamMembers: [
      { name: "Justin Miller", initials: "JM", avatarUrl: "https://randomuser.me/api/portraits/men/4.jpg" },
      { name: "Emily Rodriguez", initials: "ER", avatarUrl: "https://randomuser.me/api/portraits/women/5.jpg" },
    ],
    subtasks: [
      { id: "2-1", taskId: "INVST-344-1", title: "Collect insurance quotes", status: "to_do", assignee: { name: "Justin's team", initials: "JT", department: "Legal" }, dueDate: "2024-11-12" },
      { id: "2-2", taskId: "INVST-344-2", title: "Review policy terms", status: "to_do", assignee: { name: "Justin's team", initials: "JT", department: "Legal" }, dueDate: "2024-11-12" },
    ],
    tags: ["insurance", "property"],
    dueDate: "2024-11-12",
    progress: 100,
    department: "Legal",
    type: "Task",
    clientInfo: "Global Ventures LLC",
    description: "Renew property insurance for Sand Lane property. Compare quotes from multiple providers and ensure adequate coverage. This is a longer description to demonstrate how the text will be clamped to a maximum of three lines in the card. Any extra text will be hidden and replaced with an ellipsis. We need to evaluate different insurance companies, their coverage options, deductibles, and premium costs. The property is located in a high-risk area, so we need comprehensive coverage including flood, fire, and liability insurance. Additionally, we should consider umbrella policies for extra protection.",
    status: "to_do",
    attachmentCount: 3,
    commentCount: 7,
    lastStatusChange: "2024-11-05T14:30:00Z",
  },
  {
    id: "3",
    taskId: "LFST-133",
    title: "Define goals",
    priority: "Low",
    category: "Philanthropy",
    assignee: { name: "Cheyenne Calzoni", initials: "CC", department: "Philanthropy" },
    teamMembers: [
      { name: "Cheyenne Calzoni", initials: "CC", avatarUrl: "https://randomuser.me/api/portraits/women/6.jpg" },
    ],
    subtasks: [],
    tags: ["planning"],
    dueDate: "2024-11-12",
    progress: 40,
    department: "Philanthropy",
    type: "Task",
    clientInfo: "Stellar Foundation",
    description: "Define philanthropic goals for 2025. Focus on education and environmental initiatives.",
    status: "to_do",
    attachmentCount: 8,
    commentCount: 15,
  },
  {
    id: "4",
    taskId: "INVST-83",
    title: "Set up family office budget",
    priority: "Normal",
    category: "Investment",
    assignee: { name: "Erin George", initials: "EG", department: "Investment" },
    teamMembers: [
      { name: "Erin George", initials: "EG", avatarUrl: "https://randomuser.me/api/portraits/women/7.jpg" },
      { name: "Michael Thompson", initials: "MT", avatarUrl: "https://randomuser.me/api/portraits/men/8.jpg" },
      { name: "Lisa Wang", initials: "LW", avatarUrl: "https://randomuser.me/api/portraits/women/9.jpg" },
      { name: "James Wilson", initials: "JW", avatarUrl: "https://randomuser.me/api/portraits/men/10.jpg" },
      { name: "Anna Martinez", initials: "AM", avatarUrl: "https://randomuser.me/api/portraits/women/11.jpg" },
    ],
    subtasks: [
      { id: "4-1", taskId: "INVST-83-1", title: "Analyze current expenses", status: "in_progress", assignee: { name: "Erin George", initials: "EG", department: "Investment" }, dueDate: "2024-11-12" },
      { id: "4-2", taskId: "INVST-83-2", title: "Set budget categories", status: "validated", assignee: { name: "Erin George", initials: "EG", department: "Investment" }, dueDate: "2024-11-15" },
      { id: "4-3", taskId: "INVST-83-3", title: "Review with stakeholders", status: "to_do", assignee: { name: "Erin George", initials: "EG", department: "Investment" }, dueDate: "2024-11-20" },
      { id: "4-4", taskId: "INVST-83-4", title: "Finalize budget document", status: "to_do", assignee: { name: "Erin George", initials: "EG", department: "Investment" }, dueDate: "2024-11-25" },
      { id: "4-5", taskId: "INVST-83-5", title: "Present to board", status: "to_do", assignee: { name: "Erin George", initials: "EG", department: "Investment" }, dueDate: "2024-11-30" },
    ],
    tags: ["budget", "planning"],
    dueDate: "2024-11-12",
    progress: 60,
    department: "Investment",
    type: "Task",
    clientInfo: "TechCorp Solutions",
    description: "Set up comprehensive family office budget for next fiscal year with detailed expense tracking.",
    status: "in_progress",
    attachmentCount: 12,
    commentCount: 23,
    lastStatusChange: "2024-11-08T09:15:00Z",
  },
  {
    id: "6",
    taskId: "INVST-773",
    title: "Screening and approving tenants",
    priority: "High",
    category: "Investment",
    assignee: { name: "Gretchen's team", initials: "GT", department: "Legal" },
    teamMembers: [
      { name: "Gretchen Taylor", initials: "GT", avatarUrl: "https://randomuser.me/api/portraits/women/12.jpg" },
      { name: "Robert Johnson", initials: "RJ", avatarUrl: "https://randomuser.me/api/portraits/men/13.jpg" },
      { name: "Maria Garcia", initials: "MG", avatarUrl: "https://randomuser.me/api/portraits/women/14.jpg" },
      { name: "Tom Anderson", initials: "TA", avatarUrl: "https://randomuser.me/api/portraits/men/15.jpg" },
      { name: "Sophie Brown", initials: "SB", avatarUrl: "https://randomuser.me/api/portraits/women/16.jpg" },
      { name: "Alex Davis", initials: "AD", avatarUrl: "https://randomuser.me/api/portraits/men/17.jpg" },
      { name: "Nina Patel", initials: "NP", avatarUrl: "https://randomuser.me/api/portraits/women/18.jpg" },
    ],
    subtasks: [
      { id: "6-1", taskId: "INVST-773-1", title: "Background checks", status: "in_progress", assignee: { name: "Gretchen's team", initials: "GT", department: "Legal" }, dueDate: "2024-11-15" },
      { id: "6-2", taskId: "INVST-773-2", title: "Credit verification", status: "in_progress", assignee: { name: "Gretchen's team", initials: "GT", department: "Legal" }, dueDate: "2024-11-18" },
      { id: "6-3", taskId: "INVST-773-3", title: "Reference calls", status: "to_do", assignee: { name: "Gretchen's team", initials: "GT", department: "Legal" }, dueDate: "2024-11-20" },
    ],
    tags: ["tenants", "screening"],
    dueDate: "2024-11-12",
    progress: 70,
    department: "Legal",
    type: "Task",
    clientInfo: "Metropolitan Holdings",
    description: "Complete tenant screening process for multiple properties including background and credit checks. This comprehensive process involves multiple steps and detailed verification procedures. We need to conduct thorough background checks, verify employment history, check credit scores, contact previous landlords, and ensure all applicants meet our strict criteria. The screening process must comply with fair housing laws and regulations. We also need to verify income requirements (typically 3x rent), check for any criminal history, and assess the overall reliability of potential tenants. Documentation must be properly maintained for legal compliance and future reference.",
    status: "in_progress",
    attachmentCount: 18,
    commentCount: 31,
  },
  {
    id: "7",
    taskId: "HR-678",
    title: "Home Security Enhancement",
    priority: "Normal",
    category: "HR",
    assignee: { name: "Giana Levin", initials: "GL", department: "HR" },
    teamMembers: [
      { name: "Giana Levin", initials: "GL", avatarUrl: "https://randomuser.me/api/portraits/women/19.jpg" },
      { name: "Kevin O'Connor", initials: "KO", avatarUrl: "https://randomuser.me/api/portraits/men/20.jpg" },
      { name: "Diana Foster", initials: "DF", avatarUrl: "https://randomuser.me/api/portraits/women/21.jpg" },
      { name: "Ryan Clarke", initials: "RC", avatarUrl: "https://randomuser.me/api/portraits/men/22.jpg" },
    ],
    subtasks: [],
    tags: ["security"],
    dueDate: "2024-11-12",
    progress: 50,
    department: "HR",
    type: "Task",
    clientInfo: "Acme Inc.",
    description: "Upgrade home security systems including cameras, alarms, and access control.",
    status: "in_progress",
    attachmentCount: 2,
    commentCount: 4,
  },
  {
    id: "8",
    taskId: "RLST-234",
    title: "Challenger 350 Aircraft Purchase",
    priority: "Low",
    category: "Legal",
    assignee: { name: "Aviation Team", initials: "AT", department: "Legal" },
    teamMembers: [
      { name: "Captain Jake Morrison", initials: "JM", avatarUrl: "https://randomuser.me/api/portraits/men/23.jpg" },
      { name: "Elena Vasquez", initials: "EV", avatarUrl: "https://randomuser.me/api/portraits/women/24.jpg" },
      { name: "Marcus Webb", initials: "MW", avatarUrl: "https://randomuser.me/api/portraits/men/25.jpg" },
      { name: "Samantha Lee", initials: "SL", avatarUrl: "https://randomuser.me/api/portraits/women/26.jpg" },
      { name: "Oliver Grant", initials: "OG", avatarUrl: "https://randomuser.me/api/portraits/men/27.jpg" },
      { name: "Zoe Carter", initials: "ZC", avatarUrl: "https://randomuser.me/api/portraits/women/28.jpg" },
    ],
    subtasks: [
      { id: "8-1", taskId: "RLST-234-1", title: "Aircraft inspection", status: "needs_work", assignee: { name: "Aviation Team", initials: "AT", department: "Legal" }, dueDate: "2024-11-25" },
      { id: "8-2", taskId: "RLST-234-2", title: "Insurance setup", status: "to_do", assignee: { name: "Aviation Team", initials: "AT", department: "Legal" }, dueDate: "2024-12-01" },
    ],
    tags: ["aircraft", "purchase"],
    dueDate: "2024-11-12",
    progress: 30,
    department: "Legal",
    type: "Task",
    clientInfo: "Global Ventures LLC",
    description: "Complete purchase of Challenger 350 aircraft including inspection, documentation, and registration.",
    status: "needs_work",
    attachmentCount: 25,
    commentCount: 8,
  },
  {
    id: "9",
    taskId: "HR-543-1",
    title: "Upgrade IT Infrastructure",
    priority: "High",
    category: "HR",
    assignee: { name: "Marley Bergson", initials: "MB", department: "HR" },
    teamMembers: [
      { name: "Marley Bergson", initials: "MB", avatarUrl: "https://randomuser.me/api/portraits/women/29.jpg" },
      { name: "Tech Lead Sam", initials: "TS", avatarUrl: "https://randomuser.me/api/portraits/men/30.jpg" },
    ],
    subtasks: [],
    tags: ["IT", "upgrade"],
    dueDate: "2024-11-12",
    progress: 60,
    department: "HR",
    type: "Task",
    clientInfo: "Stellar Foundation",
    description: "Comprehensive IT infrastructure upgrade including servers, networking, and security systems.",
    status: "needs_work",
    attachmentCount: 7,
    commentCount: 19,
  },
  {
    id: "10",
    taskId: "HR-543-2",
    title: "Annual Employee Training Program",
    priority: "Emergency",
    category: "HR",
    assignee: { name: "James Saris", initials: "JS", department: "HR" },
    teamMembers: [
      { name: "James Saris", initials: "JS", avatarUrl: "https://randomuser.me/api/portraits/men/31.jpg" },
      { name: "Training Coord Amy", initials: "TA", avatarUrl: "https://randomuser.me/api/portraits/women/32.jpg" },
      { name: "HR Specialist Ben", initials: "HB", avatarUrl: "https://randomuser.me/api/portraits/men/33.jpg" },
      { name: "Learning Expert Chloe", initials: "LC", avatarUrl: "https://randomuser.me/api/portraits/women/34.jpg" },
      { name: "Development Lead Dan", initials: "DD", avatarUrl: "https://randomuser.me/api/portraits/men/35.jpg" },
      { name: "Program Manager Eve", initials: "PE", avatarUrl: "https://randomuser.me/api/portraits/women/36.jpg" },
      { name: "Content Creator Felix", initials: "CF", avatarUrl: "https://randomuser.me/api/portraits/men/37.jpg" },
      { name: "Quality Lead Grace", initials: "QG", avatarUrl: "https://randomuser.me/api/portraits/women/38.jpg" },
    ],
    subtasks: [
      { id: "10-1", taskId: "HR-543-2-1", title: "Design curriculum", status: "needs_work", assignee: { name: "James Saris", initials: "JS", department: "HR" }, dueDate: "2024-11-20" },
      { id: "10-2", taskId: "HR-543-2-2", title: "Book venues", status: "to_do", assignee: { name: "James Saris", initials: "JS", department: "HR" }, dueDate: "2024-11-25" },
      { id: "10-3", taskId: "HR-543-2-3", title: "Invite speakers", status: "to_do", assignee: { name: "James Saris", initials: "JS", department: "HR" }, dueDate: "2024-11-30" },
    ],
    tags: ["training", "employee"],
    dueDate: "2024-11-12",
    progress: 20,
    department: "HR",
    type: "Task",
    clientInfo: "TechCorp Solutions",
    description: "Organize comprehensive annual employee training program covering compliance, skills development, and team building. This extensive program will include multiple modules designed to enhance employee capabilities and ensure regulatory compliance. The training will cover topics such as workplace safety, diversity and inclusion, cybersecurity awareness, professional development, leadership skills, and industry-specific regulations. We need to coordinate with external trainers, book appropriate venues, prepare training materials, and ensure all employees can attend their required sessions. The program should be engaging, interactive, and measurable with clear learning outcomes and assessment criteria.",
    status: "needs_work",
    attachmentCount: 14,
    commentCount: 27,
  },
  {
    id: "11",
    taskId: "FIN-892",
    title: "Quarterly Tax Preparation",
    priority: "High",
    category: "Finance",
    assignee: { name: "Sarah Mitchell", initials: "SM", department: "Finance" },
    teamMembers: [
      { name: "Sarah Mitchell", initials: "SM", avatarUrl: "https://randomuser.me/api/portraits/women/39.jpg" },
      { name: "Tax Expert Carlos", initials: "TC", avatarUrl: "https://randomuser.me/api/portraits/men/40.jpg" },
      { name: "Accountant Helen", initials: "AH", avatarUrl: "https://randomuser.me/api/portraits/women/41.jpg" },
    ],
    subtasks: [
      { id: "11-1", taskId: "FIN-892-1", title: "Gather financial documents", status: "validated", assignee: { name: "Sarah Mitchell", initials: "SM", department: "Finance" }, dueDate: "2024-11-18" },
      { id: "11-2", taskId: "FIN-892-2", title: "Review deductions", status: "validated", assignee: { name: "Sarah Mitchell", initials: "SM", department: "Finance" }, dueDate: "2024-11-22" },
    ],
    tags: ["tax", "quarterly"],
    dueDate: "2024-11-28",
    progress: 85,
    department: "Finance",
    type: "Task",
    clientInfo: "Metropolitan Holdings",
    description: "Prepare and file quarterly tax returns with detailed documentation and compliance review.",
    status: "validated",
    attachmentCount: 22,
    commentCount: 16,
  },
  {
    id: "12",
    taskId: "LEG-445",
    title: "Contract Review and Approval",
    priority: "Normal",
    category: "Legal",
    assignee: { name: "Michael Chen", initials: "MC", department: "Legal" },
    teamMembers: [
      { name: "Michael Chen", initials: "MC", avatarUrl: "https://randomuser.me/api/portraits/men/42.jpg" },
    ],
    subtasks: [],
    tags: ["contract", "review"],
    dueDate: "2024-11-25",
    progress: 95,
    department: "Legal",
    type: "Task",
    clientInfo: "Acme Inc.",
    description: "Review vendor contracts for compliance and negotiate better terms where possible.",
    status: "validated",
    attachmentCount: 6,
    commentCount: 9,
  },
  {
    id: "13",
    taskId: "INV-678",
    title: "Portfolio Rebalancing Q4",
    priority: "Emergency",
    category: "Investment",
    assignee: { name: "Investment Committee", initials: "IC", department: "Investment" },
    teamMembers: [
      { name: "Portfolio Manager Ivan", initials: "PI", avatarUrl: "https://randomuser.me/api/portraits/men/43.jpg" },
      { name: "Analyst Julia", initials: "AJ", avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg" },
      { name: "Risk Manager Kyle", initials: "RK", avatarUrl: "https://randomuser.me/api/portraits/men/45.jpg" },
      { name: "Strategist Luna", initials: "SL", avatarUrl: "https://randomuser.me/api/portraits/women/46.jpg" },
      { name: "Quant Expert Max", initials: "QM", avatarUrl: "https://randomuser.me/api/portraits/men/47.jpg" },
      { name: "Research Lead Nora", initials: "RN", avatarUrl: "https://randomuser.me/api/portraits/women/48.jpg" },
      { name: "Senior Advisor Oscar", initials: "SO", avatarUrl: "https://randomuser.me/api/portraits/men/49.jpg" },
      { name: "Data Scientist Petra", initials: "DP", avatarUrl: "https://randomuser.me/api/portraits/women/50.jpg" },
      { name: "Market Expert Quinn", initials: "MQ", avatarUrl: "https://randomuser.me/api/portraits/men/51.jpg" },
    ],
    subtasks: [
      { id: "13-1", taskId: "INV-678-1", title: "Market analysis", status: "to_do", assignee: { name: "Investment Committee", initials: "IC", department: "Investment" }, dueDate: "2024-11-30" },
    ],
    tags: ["portfolio", "rebalancing"],
    dueDate: "2024-12-05",
    progress: 90,
    department: "Investment",
    type: "Task",
    clientInfo: "Global Ventures LLC",
    description: "Complete portfolio rebalancing based on Q4 market conditions and risk assessment.",
    status: "to_do",
    attachmentCount: 35,
    commentCount: 42,
  },
  {
    id: "14",
    taskId: "HR-789",
    title: "Performance Review Cycle",
    priority: "Normal",
    category: "HR",
    assignee: { name: "Lisa Rodriguez", initials: "LR", department: "HR" },
    teamMembers: [
      { name: "Lisa Rodriguez", initials: "LR", avatarUrl: "https://randomuser.me/api/portraits/women/52.jpg" },
      { name: "HR Partner Rachel", initials: "HR", avatarUrl: "https://randomuser.me/api/portraits/women/53.jpg" },
      { name: "Manager Steve", initials: "MS", avatarUrl: "https://randomuser.me/api/portraits/men/54.jpg" },
    ],
    subtasks: [],
    tags: ["performance", "review"],
    dueDate: "2024-12-01",
    progress: 100,
    department: "HR",
    type: "Task",
    clientInfo: "Stellar Foundation",
    description: "Conduct annual performance reviews for all department heads and key personnel.",
    status: "to_do",
    attachmentCount: 11,
    commentCount: 33,
  },
  {
    id: "15",
    taskId: "PROP-123",
    title: "Real Estate Due Diligence",
    priority: "Low",
    category: "Investment",
    assignee: { name: "Property Team", initials: "PT", department: "Investment" },
    teamMembers: [
      { name: "Property Lead Tom", initials: "PT", avatarUrl: "https://randomuser.me/api/portraits/men/55.jpg" },
      { name: "Inspector Uma", initials: "IU", avatarUrl: "https://randomuser.me/api/portraits/women/56.jpg" },
      { name: "Appraiser Victor", initials: "AV", avatarUrl: "https://randomuser.me/api/portraits/men/57.jpg" },
      { name: "Legal Advisor Wendy", initials: "LW", avatarUrl: "https://randomuser.me/api/portraits/women/58.jpg" },
      { name: "Finance Expert Xavier", initials: "FX", avatarUrl: "https://randomuser.me/api/portraits/men/59.jpg" },
    ],
    subtasks: [
      { id: "15-1", taskId: "PROP-123-1", title: "Property inspection", status: "done", assignee: { name: "Property Team", initials: "PT", department: "Investment" }, dueDate: "2024-11-10" },
      { id: "15-2", taskId: "PROP-123-2", title: "Market valuation", status: "done", assignee: { name: "Property Team", initials: "PT", department: "Investment" }, dueDate: "2024-11-12" },
    ],
    tags: ["real-estate", "due-diligence"],
    dueDate: "2024-11-15",
    progress: 100,
    department: "Investment",
    type: "Task",
    clientInfo: "TechCorp Solutions",
    description: "Complete due diligence for commercial real estate acquisition including environmental and structural assessments.",
    status: "done",
    attachmentCount: 28,
    commentCount: 18,
  },
  {
    id: "16",
    taskId: "COMP-456",
    title: "Compliance Audit Preparation",
    priority: "High",
    category: "Legal",
    assignee: { name: "Compliance Team", initials: "CT", department: "Legal" },
    teamMembers: [
      { name: "Compliance Lead Yara", initials: "CY", avatarUrl: "https://randomuser.me/api/portraits/women/60.jpg" },
      { name: "Auditor Zack", initials: "AZ", avatarUrl: "https://randomuser.me/api/portraits/men/61.jpg" },
      { name: "Legal Counsel Alice", initials: "LA", avatarUrl: "https://randomuser.me/api/portraits/women/62.jpg" },
      { name: "Risk Officer Bob", initials: "RB", avatarUrl: "https://randomuser.me/api/portraits/men/63.jpg" },
      { name: "Documentation Expert Claire", initials: "DC", avatarUrl: "https://randomuser.me/api/portraits/women/64.jpg" },
      { name: "Process Manager Derek", initials: "PD", avatarUrl: "https://randomuser.me/api/portraits/men/65.jpg" },
      { name: "Quality Assurance Emma", initials: "QE", avatarUrl: "https://randomuser.me/api/portraits/women/66.jpg" },
      { name: "Regulatory Expert Frank", initials: "RF", avatarUrl: "https://randomuser.me/api/portraits/men/67.jpg" },
      { name: "Analyst Georgia", initials: "AG", avatarUrl: "https://randomuser.me/api/portraits/women/68.jpg" },
      { name: "Coordinator Henry", initials: "CH", avatarUrl: "https://randomuser.me/api/portraits/men/69.jpg" },
    ],
    subtasks: [],
    tags: ["compliance", "audit"],
    dueDate: "2024-11-08",
    progress: 100,
    department: "Legal",
    type: "Task",
    clientInfo: "Metropolitan Holdings",
    description: "Prepare all documentation and processes for annual compliance audit by regulatory authorities. This critical project requires meticulous preparation and coordination across multiple departments. We need to gather all required documentation, ensure all processes are properly documented and compliant with current regulations, prepare staff for interviews with auditors, and create comprehensive reports demonstrating our adherence to industry standards. The audit preparation involves reviewing internal controls, updating policies and procedures, conducting mock audits, and addressing any potential compliance gaps. All documentation must be organized, easily accessible, and demonstrate continuous improvement in our compliance framework.",
    status: "done",
    attachmentCount: 45,
    commentCount: 52,
  },
];

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
  const statuses = ["to_do", "in_progress", "blocked", "done", "rejected"];
  const departments = ["Finance", "Legal", "Investment", "HR", "Operations"];
  const organizations = ["Acme Inc.", "Global Ventures LLC", "Stellar Foundation", "TechCorp Solutions", "Metropolitan Holdings"];
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

  for (let i = 17; i <= 350; i++) {
    // Use a deterministic seed based on the task index
    const random = seededRandom(i * 12345);
    
    const category = categories[Math.floor(random() * categories.length)];
    const priority = priorities[Math.floor(random() * priorities.length)];
    const status = statuses[Math.floor(random() * statuses.length)];
    const department = departments[Math.floor(random() * departments.length)];
    const assignee = assignees[Math.floor(random() * assignees.length)];
    const hasSubtasks = random() > 0.7;
    const isOverdue = random() > 0.8;
    const isStuck = random() > 0.9;
    
    // Use deterministic dates based on the seed
    const dueDate = isOverdue 
      ? new Date(Date.now() - random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : new Date(Date.now() + random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const lastStatusChange = isStuck
      ? new Date(Date.now() - random() * 20 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() - random() * 7 * 24 * 60 * 60 * 1000).toISOString();

    const task = {
      id: i.toString(),
      taskId: `${category.substring(0, 3).toUpperCase()}-${String(i).padStart(3, '0')}`,
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
      subtasks: hasSubtasks ? Array.from({ length: Math.floor(random() * 4) + 1 }, (_, j) => ({
        id: `${i}-${j + 1}`,
        taskId: `${category.substring(0, 3).toUpperCase()}-${String(i).padStart(3, '0')}-${j + 1}`,
        title: `Subtask ${j + 1} for Task ${i}`,
        status: statuses[Math.floor(random() * statuses.length)],
        assignee,
        dueDate
      })) : [],
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
  ...generateAdditionalTasks()
];

export { initialTasks };

// Create color map for states
const stateColorMap = Object.fromEntries(
  STATES.map((s) => [s.id, s.color])
);

// Create color map for statuses
const statusColorMap = Object.fromEntries(
  Object.entries(STATUSES).flatMap(([state, statuses]) =>
    statuses.map(status => [status.id, status.color])
  )
);

// Function to get all statuses
const getAllStatuses = () => {
  return Object.entries(STATUSES).flatMap(([state, statuses]) => statuses);
};

// Function to find status by ID
const findStatusById = (id: string) => {
  return getAllStatuses().find(s => s.id === id);
};

// Function to find state by status
const findStateByStatus = (statusId: string) => {
  for (const [stateId, statuses] of Object.entries(STATUSES)) {
    if (statuses.some(s => s.id === statusId)) {
      return STATES.find(s => s.id === stateId);
    }
  }
  return null;
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
  
  // Convert hash to color index
  const colors = [
    'from-blue-400 via-blue-500 to-blue-600',
    'from-purple-400 via-purple-500 to-purple-600', 
    'from-pink-400 via-pink-500 to-pink-600',
    'from-green-400 via-green-500 to-green-600',
    'from-yellow-400 via-yellow-500 to-yellow-600',
    'from-red-400 via-red-500 to-red-600',
    'from-indigo-400 via-indigo-500 to-indigo-600',
    'from-teal-400 via-teal-500 to-teal-600',
    'from-orange-400 via-orange-500 to-orange-600',
    'from-cyan-400 via-cyan-500 to-cyan-600'
  ];
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
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
  const [columnMenuOpen, setColumnMenuOpen] = useState<Record<string, boolean>>({});
  
  // smart-drop-menu: removed Smart Drop Menu states
  
  // New state for column order
  const [columnOrder, setColumnOrder] = useState<string[]>([
    "to_do", 
    "in_progress", 
    "blocked", 
    "done", 
    "rejected"
  ]);

  // State for task order within columns
  const [taskOrder, setTaskOrder] = useState<Record<string, string[]>>({});

  // Task management states
  const [showArchived, setShowArchived] = useState(false);
  const [agingFilter, setAgingFilter] = useState<string>("all"); // "all", "7days", "14days", "30days"
  const [stuckTasksFilter, setStuckTasksFilter] = useState(false);
  
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
  });

  // Performance optimization for large datasets
  const [virtualizationEnabled, setVirtualizationEnabled] = useState(false);
  const [taskCardHeight, setTaskCardHeight] = useState(180); // Card height with 8px spacing

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

  // Debounced search for better performance
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);





  // Quick filter functions
  const isOverdue = (task: any) => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < now;
  };

  const isDueSoon = (task: any) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const diffDays = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  const isRecentlyUpdated = (task: any) => {
    const lastUpdated = task.lastStatusChange || task.createdAt || now.toISOString();
    const daysDiff = Math.floor((now.getTime() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 2;
  };

  const isOnHold = (task: any) => {
    return task.status === "blocked" || task.status === "needs_work";
  };

  const isHighPriority = (task: any) => {
    return task.priority === "High";
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
    });
  };

  const getActiveQuickFiltersCount = () => {
    return Object.values(quickFilters).filter(Boolean).length;
  };

  // Get ordered statuses based on current order
  const orderedStatuses = useMemo(() => {
    return columnOrder.map(id => findStatusById(id)).filter(Boolean);
  }, [columnOrder]);

  // Helper functions for filtering
  const getTaskAge = (task: any) => {
    const lastUpdated = task.lastStatusChange || task.createdAt || now.toISOString();
    const daysDiff = Math.floor((now.getTime() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff;
  };

  const isTaskStuck = (task: any) => {
    const age = getTaskAge(task);
    return age >= 7; // Task is stuck if not updated for 7+ days
  };

  // Search and filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Archive filter
    if (!showArchived) {
      filtered = filtered.filter(task => !('archived' in task ? task.archived : false));
    }

    // Aging filter
    if (agingFilter !== "all") {
      const days = parseInt(agingFilter);
      filtered = filtered.filter(task => {
        const age = getTaskAge(task);
        return age >= days;
      });
    }

    // Stuck tasks filter
    if (stuckTasksFilter) {
      filtered = filtered.filter(isTaskStuck);
    }

    // Quick filters
    if (quickFilters.assignedToMe) {
      filtered = filtered.filter(isAssignedToMe);
    }
    if (quickFilters.createdByMe) {
      filtered = filtered.filter(isCreatedByMe);
    }
    if (quickFilters.overdue) {
      filtered = filtered.filter(isOverdue);
    }
    if (quickFilters.unassigned) {
      filtered = filtered.filter(isUnassigned);
    }
    if (quickFilters.dueSoon) {
      filtered = filtered.filter(isDueSoon);
    }
    if (quickFilters.recentlyUpdated) {
      filtered = filtered.filter(isRecentlyUpdated);
    }
    if (quickFilters.onHold) {
      filtered = filtered.filter(isOnHold);
    }
    if (quickFilters.highPriority) {
      filtered = filtered.filter(isHighPriority);
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
  }, [tasks, debouncedSearch, showArchived, agingFilter, stuckTasksFilter, quickFilters]);

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

  // Auto-archive functions
  const autoArchiveOldTasks = () => {
    if (!autoArchiveEnabled) return;
    
    setTasks(prev => 
      prev.map(task => {
        const age = getTaskAge(task);
        const isCompleted = task.status === "done" || task.status === "approved" || task.status === "validated";
        
        // Auto-archive old tasks
        if (age >= autoArchiveDays && !('archived' in task ? task.archived : false)) {
          return { ...task, archived: true, archivedAt: new Date().toISOString() };
        }
        
        // Auto-archive completed tasks after delay
        if (autoArchiveCompleted && isCompleted && !('archived' in task ? task.archived : false)) {
          const completedAge = getTaskAge(task);
          if (completedAge >= autoArchiveCompletedDays) {
            return { ...task, archived: true, archivedAt: new Date().toISOString() };
          }
        }
        
        return task;
      })
    );
  };

  // Bulk operations
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const selectAllTasks = () => {
    const allTaskIds = filteredTasks.map(task => task.id);
    setSelectedTasks(new Set(allTaskIds));
  };

  const clearSelection = () => {
    setSelectedTasks(new Set());
  };

  // Select all tasks in a specific column
  const selectAllTasksInColumn = (columnId: string) => {
    const columnTaskIds = getColumnTasks(columnId).map(task => task.id);
    setSelectedTasks(prev => {
      const newSelected = new Set(prev);
      columnTaskIds.forEach(id => newSelected.add(id));
      return newSelected;
    });
  };

  // Check if all tasks in a column are selected
  const areAllTasksInColumnSelected = (columnId: string) => {
    const columnTaskIds = getColumnTasks(columnId).map(task => task.id);
    return columnTaskIds.length > 0 && columnTaskIds.every(id => selectedTasks.has(id));
  };

  // Check if some tasks in a column are selected
  const areSomeTasksInColumnSelected = (columnId: string) => {
    const columnTaskIds = getColumnTasks(columnId).map(task => task.id);
    return columnTaskIds.some(id => selectedTasks.has(id));
  };

  const bulkArchive = () => {
    setTasks(prev => 
      prev.map(task => 
        selectedTasks.has(task.id) ? { ...task, archived: true, archivedAt: new Date().toISOString() } : task
      )
    );
    clearSelection();
  };

  const bulkUnarchive = () => {
    setTasks(prev => 
      prev.map(task => 
        selectedTasks.has(task.id) ? { ...task, archived: false, archivedAt: null } : task
      )
    );
    clearSelection();
  };

  const bulkDelete = () => {
    setTasks(prev => prev.filter(task => !selectedTasks.has(task.id)));
    clearSelection();
  };

  const getTaskMetrics = () => {
    const activeTasks = tasks.filter(t => !('archived' in t ? t.archived : false));
    const blockedTasks = activeTasks.filter(t => t.status === "blocked" || t.status === "needs_work");
    const stuckTasks = activeTasks.filter(isTaskStuck);
    const doneTasks = activeTasks.filter(t => t.status === "done");
    const validatedTasks = activeTasks.filter(t => t.status === "validated");

    return {
      total: activeTasks.length,
      blocked: blockedTasks.length,
      stuck: stuckTasks.length,
      done: doneTasks.length,
      validated: validatedTasks.length,
      doneNotValidated: doneTasks.length - validatedTasks.length
    };
  };
  
  // Grouped/flat view
  function getColumnTasks(status: string) {
    let tasksInColumn: any[] = [];
    
    if (grouped) {
      tasksInColumn = filteredTasks.filter(t => t.status === status);
    } else {
      // Flat: all tasks and subtasks in this status
      const all: any[] = [];
      filteredTasks.forEach(t => {
        if (t.status === status) all.push(t);
        if (t.subtasks) t.subtasks.forEach((st: any) => {
          if (st.status === status) {
            // Inherit missing fields from parent for display/type safety
            all.push({
              ...t,
              ...st,
              parentTaskId: t.taskId,
              parentTitle: t.title,
              isSubtaskInFlat: true, // Mark as subtask in flat view
            });
          }
        });
      });
      tasksInColumn = all;
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

  // 1. Start dragging (onDragStart) - Block horizontal scroll
  const onDragStart = (start: any) => {
    setIsDragging(true);
    
    // 🔒 Set horizontal scroll blocking
    const dragContainer = document.querySelector('.kanban-board-container');
    const body = document.body;
    
    if (dragContainer) {
      dragContainer.classList.add('dragging');
    }
    
    body.classList.add('dragging');
    
    if (start.type === 'COLUMN') {
      setDraggedTask(null);
      return;
    }
    
    // Fast task finding
    let task = tasks.find((t) => t.id === start.draggableId);
    if (!task) {
      for (const t of tasks) {
        if (t.subtasks) {
          const st = t.subtasks.find((st: any) => st.id === start.draggableId);
          if (st) {
            task = { ...t, ...st };
            break;
          }
        }
      }
    }
    
    setDraggedTask(task || null);
    
    // smart-drop-menu: removed checkForHiddenColumns call
  };

  // 4. End dragging (onDragEnd) - Restore scroll
  const onDragEnd = (result: DropResult) => {
    setIsDragging(false);
    
    // 🔓 Disable scroll blocking
    const endContainer = document.querySelector('.kanban-board-container');
    
    if (endContainer) {
      endContainer.classList.remove('dragging');
    }
    
    document.body.classList.remove('dragging');
    
    const wasTaskDrag = draggedTask !== null;
    setDraggedTask(null);
    
    const { destination, source, draggableId, type } = result;
    
    if (!destination) {
      return;
    }
    
    // Handle preview drops - only for task drags
    if (destination.droppableId.startsWith('preview-') && wasTaskDrag) {
      const columnId = destination.droppableId.replace('preview-', '');
      destination.droppableId = columnId;
    }
    
    // Handle column reordering
    if (type === 'COLUMN') {
      if (destination.index === source.index) {
        return;
      }
      
      const newColumnOrder = Array.from(columnOrder);
      const [reorderedColumn] = newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, reorderedColumn);
      
      setColumnOrder(newColumnOrder);
      return;
    }
    
    // Handle task movement - only if it was a task drag
    if (!wasTaskDrag) {
      return;
    }
    
    // If same position, do nothing
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }
    
    // Allow movement within the same column without any restrictions
    const isMovingWithinSameColumn = destination.droppableId === source.droppableId;
    
    // Find task or subtask
    let task = tasks.find((t) => t.id === draggableId);
    let isSubtask = false;
    let parentTaskId = null;
    
    if (!task) {
      for (const t of tasks) {
        if (t.subtasks) {
          const st = t.subtasks.find((st: any) => st.id === draggableId);
          if (st) {
            task = { ...t, ...st };
            isSubtask = true;
            parentTaskId = t.id;
            break;
          }
        }
      }
    }
    
    if (!task) {
      return;
    }
    
    // Check if transition is valid (only when moving between different columns)
    if (!isMovingWithinSameColumn && !isValidTransition(task.status, destination.droppableId)) {
      toast.error(`Cannot move task from ${task.status} to ${destination.droppableId}`);
      return;
    }
    
    // Update task order within columns
    const updateTaskOrder = (columnId: string, isMovingWithinSameColumn: boolean = false) => {
      const currentTasks = getColumnTasks(columnId);
      const newOrder = currentTasks.map(t => t.id);
      
      if (isMovingWithinSameColumn) {
        // For same column movement, we need to handle the reordering differently
        const draggedTaskIndex = newOrder.indexOf(draggableId);
        if (draggedTaskIndex > -1) {
          newOrder.splice(draggedTaskIndex, 1);
        }
        // Insert at the new position
        newOrder.splice(destination.index, 0, draggableId);
      } else {
        // For cross-column movement, just add to the destination
        if (!newOrder.includes(draggableId)) {
          newOrder.splice(destination.index, 0, draggableId);
        }
      }
      
      setTaskOrder(prev => ({
        ...prev,
        [columnId]: newOrder
      }));
    };
    
    // Update order for both source and destination columns
    if (destination.droppableId === source.droppableId) {
      // Moving within the same column
      updateTaskOrder(destination.droppableId, true);
    } else {
      // Moving between different columns
      updateTaskOrder(source.droppableId, false);
      updateTaskOrder(destination.droppableId, false);
    }
    
    // Ultra-fast task status update (only when moving between different columns)
    const newStatus = destination.droppableId;
    
    // Only update status if moving between different columns
    if (!isMovingWithinSameColumn) {
      if (isSubtask) {
        setTasks(prev => 
          prev.map(t => ({
            ...t,
            subtasks: t.subtasks ? t.subtasks.map((st: any) => 
              st.id === draggableId ? { ...st, status: newStatus } : st
            ) : [],
          }))
        );
      } else {
        setTasks(prev => 
          prev.map(t => 
            t.id === draggableId ? { ...t, status: newStatus } : t
          )
        );
      }
    }
    
    // Immediate state reset
    setIsDragging(false);
    setDraggedTask(null);
    
    // smart-drop-menu: removed Smart Drop Menu state reset
    
    // Callback after state update (only when status changes)
    if (onTaskUpdate && !isMovingWithinSameColumn) {
      const updatedTask = { ...task, status: newStatus };
      onTaskUpdate(updatedTask);
    }
  };
  
  // smart-drop-menu: removed all Smart Drop Menu related functions and effects





  // Optimized card rendering with virtualization support
  const renderCard = useCallback((task: any, isSubtask = false, taskIndex = 0) => {
    const showSubtasks = task.subtasks && task.subtasks.length > 0;
    const showAttachments = cardFields.attachments;
    const showComments = cardFields.comments;
    
    // Calculate which fields are actually visible for this specific task
    const visibleFields = {
      taskId: cardFields.taskId,
      name: cardFields.name !== false,
      status: cardFields.status !== false,
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
            style={provided.draggableProps.style}
          >
              <Card 
                {...provided.dragHandleProps}
                className={`kanban-card group border-[#e8e8ec] rounded-2xl w-full cursor-grab ${
                  snapshot.isDragging 
                    ? 'dragging shadow-xl shadow-black/20 border-blue-300 cursor-grabbing transition-none' 
                    : isTaskStuck(task)
                  ? 'shadow-none hover:shadow-lg hover:shadow-black/15 hover:border-yellow-300 border-yellow-200 transition-all duration-200 ease-out'
                  : 'shadow-none hover:shadow-lg hover:shadow-black/15 hover:border-gray-300 transition-all duration-200 ease-out'
                }`}
              >

              <CardContent className={`${getDynamicPadding()} ${task.isSubtaskInFlat ? "bg-blue-50/30 border-l-4 border-l-blue-400" : ""} ${isSubtask ? "bg-gray-50/50 border-l-2 border-l-gray-300 shadow-sm" : ""}`}>


                                {/* ID line */}
                {cardFields.taskId && (
                  <div className="flex items-center justify-between text-xs font-semibold text-[#60646c] mb-1">
                    <div className="flex items-center gap-1">
                      {/* Bulk selection checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedTasks.has(task.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleTaskSelection(task.id);
                        }}
                        className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      {/* Subtask indicator for grouped view */}
                      {isSubtask && !task.isSubtaskInFlat && (
                        <svg className="w-3 h-3 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                          <path d="M6 9l6 0" />
                          <path d="M4 5l4 0" />
                          <path d="M6 5v11a1 1 0 0 0 1 1h5" />
                          <path d="M12 7m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z" />
                          <path d="M12 15m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z" />
                        </svg>
                      )}
                      <span>{task.taskId}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Stuck task indicator */}
                      {isTaskStuck(task) && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          ⏰ {getTaskAge(task)}d
                        </span>
                      )}
                      {/* Overdue indicator */}
                      {isOverdue(task) && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          ⚠️ Overdue
                        </span>
                      )}
                      {/* Due soon indicator */}
                      {isDueSoon(task) && !isOverdue(task) && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          🔔 Due Soon
                        </span>
                      )}
                      {/* Status Label */}
                      {cardFields.status !== false && (() => {
                        const status = findStatusById(task.status);
                        if (status) {
                          return (
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${status.color}`}>
                              {status.title}
                            </span>
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
                )}
                {/* Title (Name) */}
                {cardFields.name !== false && (
                  <div className="mb-1">
                    <div 
                      className={`${isSubtask ? "text-sm" : "text-base"} font-semibold text-[#1c2024] cursor-pointer hover:text-blue-600 transition-colors`}
                      onClick={() => onTaskClick && onTaskClick(task)}
                    >
                      {task.title}
                    </div>
                  </div>
                )}
                

                {/* Description */}
                {cardFields.description && task.description && (
                  <div className="text-sm text-[#8b8d98] mb-2 line-clamp-3">{task.description}</div>
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
                        <span className={`w-6 h-6 rounded-full bg-gradient-to-br ${generateColorFromText(task.clientInfo || 'default')} flex items-center justify-center`}>
                          <span className="sr-only">Org</span>
                        </span>
                        <span className="text-sm text-[#1c2024] font-medium mr-2">{task.clientInfo}</span>
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
                            <ChevronUp className="w-4 h-4 text-gray-600 -mr-1" />
                            <ChevronUp className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                        {task.priority === "High" && (
                          <ChevronUp className="w-4 h-4 text-gray-600" />
                        )}
                        {(task.priority === "Normal" || !task.priority) && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minus w-4 h-4 text-gray-600">
                            <path d="M5 12h14"></path>
                          </svg>
                        )}
                        {task.priority === "Low" && (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        )}
                        <span className="text-sm font-medium text-[#1c2024]">{task.priority || "Normal"}</span>
                      </div>
                    </div>
                    {/* Due date */}
                    {cardFields.dueDate && (
                      <div className="text-sm text-[#1c2024] flex items-center gap-1">
                        <span>Due:</span>
                        <span className="font-medium">{task.dueDate}</span>
                      </div>
                    )}
                  </div>
                )}
                {/* Subtasks + Attachments + Comments в один рядок */}
                {(subtasksCount > 0 || showAttachments || showComments) && (
                  <div className="flex items-center gap-3 mt-2 w-full">
                    {subtasksCount > 0 && (
                      <div 
                        className="flex items-center gap-1 cursor-pointer select-none hover:bg-gray-100 rounded px-0.5 py-0 transition-colors duration-100 ease-out"
                        onClick={() => setExpandedSubtasks(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                      >
                        {expandedSubtasks[task.id] ? (
                          <ChevronDown className="w-4 h-4 text-[#8b8d98]" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-[#8b8d98]" />
                        )}
                        <span className="font-medium text-sm text-[#1c2024]">{subtasksCount} subtasks</span>
                      </div>
                    )}
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
              </CardContent>
            </Card>
            {/* Render subtasks when expanded */}
            {expandedSubtasks[task.id] && task.subtasks && task.subtasks.map((subtask: any, subtaskIndex: number) => (
              <div key={subtask.id} className="ml-6 mt-2">
                {renderCard(subtask, true, subtaskIndex)}
              </div>
            ))}
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
    toast.success("All groups expanded");
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
    toast.success("All groups collapsed");
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

  // Auto-archive on component mount and when settings change
  useEffect(() => {
    autoArchiveOldTasks();
  }, [autoArchiveEnabled, autoArchiveDays, autoArchiveCompleted, autoArchiveCompletedDays]);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full w-full relative kanban-board-container">
        {/* Bulk operations overmenu */}
        {selectedTasks.size > 0 && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">{selectedTasks.size} selected</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={bulkArchive}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  Archive
                </button>
                <button
                  onClick={bulkUnarchive}
                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  Unarchive
                </button>
                <button
                  onClick={bulkDelete}
                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
              <button
                onClick={clearSelection}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}


        {/* Quick Filters - Above Metrics */}
        <div className="px-2 pt-2 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-2">
              
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="px-6 flex flex-wrap gap-2 mb-2">

            <button
              onClick={() => toggleQuickFilter('assignedToMe')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
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
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
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
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
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
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
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
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
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
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
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
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
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
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
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
          </div>
        </div>

        {/* Separator */}
        <div className="px-6 mb-2">
          <div className="border-t border-gray-200"></div>
        </div>

        {/* Compact Metrics */}
        <div className="px-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-base font-semibold text-gray-900">{getTaskMetrics().total}</span>
                <span className="text-sm text-gray-600">Total</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-base font-semibold text-gray-900">{getTaskMetrics().blocked}</span>
                <span className="text-sm text-gray-600">Blocked</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-base font-semibold text-gray-900">{getTaskMetrics().stuck}</span>
                <span className="text-sm text-gray-600">Stuck</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-base font-semibold text-gray-900">{getTaskMetrics().done}</span>
                <span className="text-sm text-gray-600">Done</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-base font-semibold text-gray-900">{getTaskMetrics().validated}</span>
                <span className="text-sm text-gray-600">Validated</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-base font-semibold text-gray-900">{getTaskMetrics().doneNotValidated}</span>
                <span className="text-sm text-gray-600">Not Validated</span>
              </div>
            </div>
            
            {/* Filters on the right */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700">Aging:</label>
                <select
                  value={agingFilter}
                  onChange={(e) => setAgingFilter(e.target.value)}
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All Tasks</option>
                  <option value="7">7+ Days</option>
                  <option value="14">14+ Days</option>
                  <option value="30">30+ Days</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={stuckTasksFilter}
                  onCheckedChange={setStuckTasksFilter}
                  id="stuck-tasks"
                />
                <label htmlFor="stuck-tasks" className="text-xs text-gray-600">
                  Stuck Only
                </label>
              </div>


            </div>
          </div>
        </div>

        {/* Divider under metrics */}
        <div className="px-6 mb-2">
          <div className="border-t border-gray-200"></div>
        </div>

        {/* Kanban scroll area with padding */}

        {/* Kanban scroll area with padding */}
        <div className="flex-1 px-4 pt-4 pb-4">
          <style>{`
            .kanban-scrollbar {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            .kanban-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .kanban-scroll-hover .kanban-scrollbar {
              overflow-x: auto !important;
              scrollbar-width: thin;
              scrollbar-color: #d1d5db transparent;
            }
            .kanban-scroll-hover .kanban-scrollbar::-webkit-scrollbar {
              display: block;
              height: 8px;
              background: transparent;
            }
            .kanban-scroll-hover .kanban-scrollbar::-webkit-scrollbar-thumb {
              background: #d1d5db;
              border-radius: 8px;
            }
            .kanban-scroll-hover .kanban-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            
            /* Improved drag animations */
            .kanban-card {
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              will-change: transform, box-shadow;
              transform-origin: center;
              margin-bottom: 8px; /* Consistent spacing between cards */
            }
            
            /* Ensure consistent spacing between cards */
            .kanban-card:last-child {
              margin-bottom: 0;
            }
            
            .kanban-card:hover {
              transform: translateY(-0.5px);
            }
            
            .kanban-card.dragging {
              transform: scale(1.02);
              box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
              z-index: 99999;
              pointer-events: none;
              border: 2px solid rgb(59, 130, 246);
              opacity: 1 !important;
              visibility: visible !important;
              display: block !important;
            }
            
            /* Better drag preview positioning */
            [data-rbd-draggable-id] {
              cursor: grab;
            }
            
            [data-rbd-draggable-id]:active {
              cursor: grabbing;
            }
            
            /* Ensure drag preview follows cursor accurately */
            [data-rbd-draggable-context-id] [data-rbd-draggable-id] {
              transform: none !important;
            }
            
            /* Ensure drag preview follows cursor exactly */
            [data-rbd-draggable-id][data-rbd-dragging="true"] {
              transform: scale(1.02) !important;
              box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
              z-index: 99999 !important;
              transition: none !important;
              pointer-events: none !important;
              opacity: 1 !important;
              visibility: visible !important;
              position: relative !important;
              will-change: transform !important;
            }
            
            /* Prevent drag preview from disappearing */
            [data-rbd-draggable-id][data-rbd-dragging="true"] * {
              opacity: 1 !important;
              visibility: visible !important;
              pointer-events: none !important;
            }
            
            /* Ensure drag preview container is visible */
            [data-rbd-draggable-context-id] {
              opacity: 1 !important;
              visibility: visible !important;
            }
            
            /* Better drag preview positioning - exact cursor following */
            [data-rbd-draggable-id][data-rbd-dragging="true"] {
              transform: scale(1.02) !important;
              box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
              z-index: 99999 !important;
              transition: none !important;
              pointer-events: none !important;
              opacity: 1 !important;
              visibility: visible !important;
              position: relative !important;
            }
            
            /* Ensure drag preview is positioned exactly at cursor */
            [data-rbd-draggable-id][data-rbd-dragging="true"] * {
              pointer-events: none !important;
              user-select: none !important;
            }
            
            /* Force drag preview to be visible */
            [data-rbd-draggable-id][data-rbd-dragging="true"] .kanban-card {
              opacity: 1 !important;
              visibility: visible !important;
              display: block !important;
            }
            
            .kanban-column {
              transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .kanban-column.dragging {
              opacity: 0.9;
              transform: scale(1.01);
            }
            
            /* Smooth drop zone animations */
            .drop-zone {
              transition: all 0.05s ease-out;
              position: relative;
              min-height: 100px;
            }
            
            /* Jira-style highlighting for valid drop zones */
            .drop-zone:not(.drop-disabled) {
              background-color: rgba(59, 130, 246, 0.05);
              border-color: rgba(59, 130, 246, 0.2);
            }
            
            .drop-zone.drag-over {
              background-color: rgba(59, 130, 246, 0.2);
              border-color: rgb(59, 130, 246);
              box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
              transform: scale(1.01);
            }
            
            .drop-zone.drop-disabled {
              opacity: 0.3;
              cursor: not-allowed;
              background-color: rgba(0, 0, 0, 0.05);
              border-color: rgba(0, 0, 0, 0.1);
              filter: grayscale(50%);
            }
            
            /* Better drop indicator */
            .drop-indicator {
              position: absolute;
              left: 0;
              right: 0;
              height: 2px;
              background-color: rgb(59, 130, 246);
              border-radius: 1px;
              z-index: 10;
              pointer-events: none;
            }
            
            /* Drop zone hover effect */
            .drop-zone:hover {
              background-color: rgba(59, 130, 246, 0.1);
            }
            
            /* Prevent text selection during drag */
            .dragging * {
              user-select: none;
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
            }
            
            /* Fix kanban board during drag */
            .kanban-board-container.dragging {
              overflow: hidden !important;
              pointer-events: none;
            }
            
            /* Ensure drag preview is always visible and follows cursor */
            .react-beautiful-dnd-dragging {
              opacity: 1 !important;
              visibility: visible !important;
              z-index: 99999 !important;
              pointer-events: none !important;
              position: fixed !important;
            }
            
            /* Ensure drag preview stays visible during column transitions */
            [data-rbd-droppable-id] {
              opacity: 1 !important;
              visibility: visible !important;
            }
            
            /* Prevent any element from hiding during drag */
            *[data-rbd-dragging="true"] {
              opacity: 1 !important;
              visibility: visible !important;
              display: block !important;
            }
            
            /* Force drag preview to be visible */
            [data-rbd-draggable-id][data-rbd-dragging="true"] {
              opacity: 1 !important;
              visibility: visible !important;
              display: block !important;
              position: relative !important;
              z-index: 99999 !important;
            }
            
            /* Ensure drag preview element is visible */
            [data-rbd-drag-handle-draggable-id] {
              opacity: 1 !important;
              visibility: visible !important;
            }
            
            /* Force all drag previews to be visible */
            [data-rbd-draggable-id] {
              opacity: 1 !important;
              visibility: visible !important;
            }
            
            /* Ensure drag preview is positioned correctly */
            .react-beautiful-dnd-dragging {
              pointer-events: none !important;
              z-index: 1000 !important;
              transition: none !important;
              transform-origin: center !important;
            }
            
            .kanban-board-container.dragging .kanban-scrollbar {
              pointer-events: none !important;
              overflow: hidden !important;
            }
            
            .kanban-board-container.dragging .kanban-column {
              pointer-events: none;
            }
            
            .kanban-board-container.dragging .kanban-card:not(.dragging) {
              pointer-events: none;
            }
            
            /* smart-drop-menu: removed Smart Drop Menu CSS styles */
            
            /* 7. Dragged card should appear above everything */
            .kanban-board-container [data-rbd-draggable-id] {
              z-index: 99999 !important;
            }
            
            /* Ensure dragged card is always on top */
            .kanban-board-container [data-rbd-draggable-id][data-rbd-draggable-context-id] {
              z-index: 99999 !important;
            }
            
            /* 8. Force dragged elements to be on top */
            .kanban-board-container .react-beautiful-dnd-dragging {
              z-index: 99999 !important;
            }
            
            /* 9. Ensure drag layer is above everything */
            .kanban-board-container .react-beautiful-dnd-drag-layer {
              z-index: 99999 !important;
            }
            
            /* 10. Any element being dragged should be on top */
            .kanban-board-container [data-rbd-draggable-id]:active,
            .kanban-board-container [data-rbd-draggable-id]:focus {
              z-index: 99999 !important;
            }
            
            /* 11. Global dragged element styles */
            *[data-rbd-draggable-id] {
              z-index: 99999 !important;
            }
            
            /* 12. Ensure dragged elements are above Smart Drop Menu */
            .kanban-board-container *[data-rbd-draggable-id] {
              z-index: 99999 !important;
            }
            
            /* 13. Global styles for dragged elements */
            body *[data-rbd-draggable-id] {
              z-index: 99999 !important;
            }
            
            /* 14. Force all dragged elements to be on top */
            [data-rbd-draggable-id] {
              z-index: 99999 !important;
            }
            
            /* Ensure exact cursor positioning during drag */
            [data-rbd-draggable-id][data-rbd-dragging="true"] {
              transform-origin: center !important;
              transition: none !important;
              will-change: transform !important;
              opacity: 1 !important;
              visibility: visible !important;
              display: block !important;
            }
            
            /* Ensure drag preview is always visible */
            .react-beautiful-dnd-dragging {
              opacity: 1 !important;
              visibility: visible !important;
              z-index: 99999 !important;
            }
            
            /* Fix for hanging cards */

            
                          /* Completely hide placeholder */
              [data-rbd-placeholder-context-id] {
                display: none !important;
                min-height: 0 !important;
                background: transparent !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
              }
            
            /* Preview zones styling */
            .preview-zone {
              position: fixed;
              z-index: 1001;
              pointer-events: auto;
            }
            
            .preview-card {
              transition: all 0.15s ease-out;
              cursor: pointer;
            }
            
            .preview-card:hover {
              transform: scale(1.02);
            }
            
            .preview-card.drag-over {
              background-color: rgba(59, 130, 246, 0.2);
              border-color: rgb(59, 130, 246);
              transform: scale(1.05);
            }
          `}</style>
          <div
            className="group relative kanban-board-container"
            onMouseEnter={e => e.currentTarget.classList.add('kanban-scroll-hover')}
            onMouseLeave={e => e.currentTarget.classList.remove('kanban-scroll-hover')}
          >
            <DragDropContext 
              onDragStart={onDragStart} 
              onDragEnd={onDragEnd}
              enableDefaultSensors={true}
            >

              
              {/* Droppable area for columns */}
              <Droppable droppableId="board" type="COLUMN" direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="kanban-scrollbar flex gap-3 min-h-[700px] overflow-x-auto horizontal-hover-scrollbar"
                    style={{overflowY: 'hidden', position: 'relative'}}
                  >
                    {orderedStatuses.map((column, index) => {
                      if (!column) return null;
                      const columnTasks = getColumnTasks(column.id);
                      // Only disable drop if we have a dragged task and the transition is not valid
                      const isDropDisabled = draggedTask ? !isValidTransition(draggedTask.status, column.id) : false;
                      const isCollapsed = collapsed[column.id];
                      const groupColor = statusColorMap[column.id] || "bg-white border-gray-200";

                      return (
                        <Draggable key={column.id} draggableId={column.id} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              className={`kanban-column ${dragSnapshot.isDragging ? 'dragging' : ''} transition-all duration-200`}
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
                                      {/* Drag handle for collapsed column */}
                                                                              <div 
                                          {...dragProvided.dragHandleProps}
                                          className="absolute -top-1 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity cursor-grab p-1 rounded hover:bg-gray-100 bg-white shadow-sm border border-gray-200"
                                          title="Drag column"
                                        >
                                        <GripVertical className="w-3 h-3 text-gray-400" />
                                      </div>
                                      <div className="flex flex-col items-center justify-start w-full h-full pt-8 pb-4 group/collapsed">
                                        {/* Column selection checkbox for collapsed view - visible on hover */}
                                        {columnTasks.length > 0 && (
                                          <div className="mb-3">
                                            <input
                                              type="checkbox"
                                              checked={areAllTasksInColumnSelected(column.id)}
                                              ref={(el) => {
                                                if (el) {
                                                  el.indeterminate = areSomeTasksInColumnSelected(column.id) && !areAllTasksInColumnSelected(column.id);
                                                }
                                              }}
                                              onChange={(e) => {
                                                e.stopPropagation();
                                                if (areAllTasksInColumnSelected(column.id)) {
                                                  // Deselect all tasks in this column
                                                  const columnTaskIds = getColumnTasks(column.id).map(task => task.id);
                                                  setSelectedTasks(prev => {
                                                    const newSelected = new Set(prev);
                                                    columnTaskIds.forEach(id => newSelected.delete(id));
                                                    return newSelected;
                                                  });
                                                } else {
                                                  // Select all tasks in this column
                                                  selectAllTasksInColumn(column.id);
                                                }
                                              }}
                                              className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 transition-opacity ${
                                                areSomeTasksInColumnSelected(column.id) 
                                                  ? 'opacity-100' 
                                                  : 'opacity-0 group-hover/collapsed:opacity-100'
                                              }`}
                                              title={areAllTasksInColumnSelected(column.id) ? "Deselect all tasks" : "Select all tasks"}
                                            />
                                          </div>
                                        )}
                                        {(() => {
                                          const state = findStateByStatus(column.id);
                                          return (
                                            <span className="font-medium text-base text-[#1c2024] mb-2 text-center" style={{ writingMode: "vertical-rl", textOrientation: "mixed", letterSpacing: "0.05em" }}>
                                              {state?.title || column.title}
                                            </span>
                                          );
                                        })()}
                                        <div className="flex flex-col items-center gap-2 mb-3">
                                          <span className="bg-white text-black text-base font-semibold rounded-xl px-4 py-1 shadow border border-gray-200 text-center">{columnTasks.length}</span>
                                          {areSomeTasksInColumnSelected(column.id) && (
                                            <span className={`bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl px-2 py-1 shadow border border-blue-200 transition-opacity ${
                                              areSomeTasksInColumnSelected(column.id) 
                                                ? 'opacity-100' 
                                                : 'opacity-0 group-hover/collapsed:opacity-100'
                                            }`}>
                                              {getColumnTasks(column.id).filter(task => selectedTasks.has(task.id)).length}
                                            </span>
                                          )}
                                        </div>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="rounded-full hover:bg-[#e0e2e7] text-gray-400 opacity-0 hover:opacity-100 transition-opacity"
                                          onClick={e => {
                                            e.stopPropagation();
                                            setCollapsed(c => ({ ...c, [column.id]: false }));
                                          }}
                                          title="Expand group"
                                        >
                                          <span className="sr-only">Expand</span>
                                          <ChevronRight className="w-5 h-5" />
                                        </Button>
                                      </div>
                                      {provided.placeholder}
                                    </div>
                                  ) : (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      className={`drop-zone flex flex-col min-w-[396px] max-w-[496px] h-[calc(100vh-160px)] rounded-lg border p-0 transition-all duration-200 relative ${
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

                                      <div className="relative group">
                                        {/* Drag handle for expanded column - positioned at top */}
                                        <div 
                                          {...dragProvided.dragHandleProps}
                                          className="absolute -top-1 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity cursor-grab p-1 rounded hover:bg-gray-100 bg-white shadow-sm border border-gray-200"
                                          title="Drag column"
                                        >
                                          <GripVertical className="w-3 h-3 text-gray-400" />
                                        </div>
                                        <div className="flex items-center justify-between mb-2 px-4 pt-3 pb-2">
                                          <div className="flex items-center gap-1 group/header">
                                            {/* Column selection checkbox - visible on hover */}
                                            {columnTasks.length > 0 && (
                                              <div className="flex-shrink-0">
                                                <input
                                                  type="checkbox"
                                                  checked={areAllTasksInColumnSelected(column.id)}
                                                  ref={(el) => {
                                                    if (el) {
                                                      el.indeterminate = areSomeTasksInColumnSelected(column.id) && !areAllTasksInColumnSelected(column.id);
                                                    }
                                                  }}
                                                  onChange={(e) => {
                                                    e.stopPropagation();
                                                    if (areAllTasksInColumnSelected(column.id)) {
                                                      // Deselect all tasks in this column
                                                      const columnTaskIds = getColumnTasks(column.id).map(task => task.id);
                                                      setSelectedTasks(prev => {
                                                        const newSelected = new Set(prev);
                                                        columnTaskIds.forEach(id => newSelected.delete(id));
                                                        return newSelected;
                                                      });
                                                    } else {
                                                      // Select all tasks in this column
                                                      selectAllTasksInColumn(column.id);
                                                    }
                                                  }}
                                                  className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 transition-opacity ${
                                                    areSomeTasksInColumnSelected(column.id) 
                                                      ? 'opacity-100' 
                                                      : 'opacity-0 group-hover/header:opacity-100'
                                                  }`}
                                                  title={areAllTasksInColumnSelected(column.id) ? "Deselect all tasks" : "Select all tasks"}
                                                />
                                              </div>
                                            )}
                                            {(() => {
                                              const state = findStateByStatus(column.id);
                                              return (
                                                <div>
                                                  <h3 className="font-medium text-base text-[#1c2024]">{state?.title || column.title}</h3>
                                                  <p className="text-xs text-[#60646c]">{state?.description || ""}</p>
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
                                                  {getColumnTasks(column.id).filter(task => selectedTasks.has(task.id)).length}
                                                </Badge>
                                              )}
                                            </div>

                                          </div>
                                          <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
                                            {/* Collapse button */}
                                            <Tooltip>
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                className="rounded-full hover:bg-[#e0e2e7] text-gray-400"
                                                onClick={e => {
                                                  e.stopPropagation();
                                                  setCollapsed(c => ({ ...c, [column.id]: true }));
                                                }}
                                                title="Collapse group"
                                              >
                                                <span className="sr-only">Collapse</span>
                                                <ChevronLeft className="w-4 h-4" />
                                              </Button>
                                            </Tooltip>
                                            {/* Add task button */}
                                            {["To do", "In Progress"].includes(column.id) && (
                                              <Tooltip>
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  className="rounded-full hover:bg-[#e0e2e7] text-gray-400"
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
                                              </Tooltip>
                                            )}
                                            {/* More button */}
                                            <Popover 
                                              open={columnMenuOpen[column.id]} 
                                              onOpenChange={(open) => setColumnMenuOpen(prev => ({ ...prev, [column.id]: open }))}
                                            >
                                              <PopoverTrigger asChild>
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  className="rounded-full hover:bg-[#e0e2e7] text-gray-400"
                                                  title="More actions"
                                                  onClick={e => { e.stopPropagation(); }}
                                                >
                                                  <span className="sr-only">More</span>
                                                  <MoreHorizontal className="w-5 h-5 mx-auto" />
                                                </Button>
                                              </PopoverTrigger>
                                              <PopoverContent className="w-48 p-1" align="end">
                                                <div className="space-y-1">
                                                  <Button
                                                    variant="ghost"
                                                    className="w-full justify-start text-sm font-normal px-2 py-1.5 h-auto"
                                                    onClick={() => {
                                                      setCollapsed(prev => ({ ...prev, [column.id]: !prev[column.id] }));
                                                      setColumnMenuOpen(prev => ({ ...prev, [column.id]: false }));
                                                    }}
                                                  >
                                                    {collapsed[column.id] ? 'Expand group' : 'Collapse group'}
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    className="w-full justify-start text-sm font-normal px-2 py-1.5 h-auto"
                                                    onClick={() => {
                                                      selectAllTasksInColumn(column.id);
                                                      setColumnMenuOpen(prev => ({ ...prev, [column.id]: false }));
                                                      toast.success(`Selected all tasks in ${column.title}`);
                                                    }}
                                                  >
                                                    Select all
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
                                                  {renderCard(data[index], data[index].isSubtaskInFlat, index)}
                                                </div>
                                              )}
                                            </List>
                                          ) : (
                                            <div className="space-y-2">
                                              {columnTasks.map((task: any, idx: number) => {
                                                return renderCard(task, task.isSubtaskInFlat, idx);
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
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>
      
      {/* smart-drop-menu: removed Smart Drop Menu component */}
    </TooltipProvider>
  );
});

export default KanbanBoard;