import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Settings, X, Search, ChevronLeft, ChevronUp, Clock, ChevronDown as ChevronDownIcon, Layers, Paperclip, MessageCircle, MoreHorizontal } from "lucide-react";
import { Paperclip as PaperclipIcon, MessageCircle as MessageCircleIcon } from "lucide-react";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import TaskPreview from "./TaskPreview";

const STATUSES = [
  { id: "To do", title: "To do", color: "bg-blue-50 border-blue-200" },
  { id: "In Progress", title: "In progress", color: "bg-yellow-50 border-yellow-200" },
  { id: "Needs Work", title: "Needs work", color: "bg-orange-50 border-orange-200" },
  { id: "Verified", title: "Verified", color: "bg-green-50 border-green-200" },
  { id: "Acknowledged", title: "Acknowledged", color: "bg-cyan-50 border-cyan-200" },
  { id: "Paused", title: "Paused", color: "bg-gray-50 border-gray-200" },
  { id: "Blocked", title: "Blocked", color: "bg-red-50 border-red-200" },
  { id: "Done", title: "Done", color: "bg-emerald-50 border-emerald-200" },
];

const allowedTransitions: Record<string, string[]> = {
  "To do": ["In Progress", "Blocked", "Paused"],
  "In Progress": ["Needs Work", "Verified", "Paused", "Blocked", "To do"],
  "Needs Work": ["In Progress", "Blocked", "Paused"],
  "Verified": ["Acknowledged", "Done", "Paused", "Blocked"],
  "Acknowledged": ["Done", "Verified", "Paused", "Blocked"],
  "Paused": ["In Progress", "To do", "Blocked"],
  "Blocked": ["To do", "In Progress", "Paused"],
  "Done": ["In Progress", "Acknowledged"],
};

const isValidTransition = (fromStatus: string, toStatus: string): boolean => {
  if (fromStatus === toStatus) return true;
  return allowedTransitions[fromStatus]?.includes(toStatus) || false;
};

export const initialTasks = [
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
      { id: "1-1", taskId: "FCLT-771-1", title: "Review call schedule", status: "To do", assignee: { name: "Marley Bergson", initials: "MB", department: "Finance" }, dueDate: "2024-11-12" },
      { id: "1-2", taskId: "FCLT-771-2", title: "Confirm distribution amounts", status: "To do", assignee: { name: "Marley Bergson", initials: "MB", department: "Finance" }, dueDate: "2024-11-12" },
    ],
    tags: ["finance", "urgent"],
    dueDate: "2024-11-12",
    progress: 80,
    department: "Finance",
    type: "Task",
    clientInfo: "Acme Inc.",
    description: "Update calls and distributions for Q4. Review quarterly performance and adjust distribution schedules accordingly.",
    status: "To do",
    attachmentCount: 5,
    commentCount: 12,
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
      { id: "2-1", taskId: "INVST-344-1", title: "Collect insurance quotes", status: "To do", assignee: { name: "Justin's team", initials: "JT", department: "Legal" }, dueDate: "2024-11-12" },
      { id: "2-2", taskId: "INVST-344-2", title: "Review policy terms", status: "To do", assignee: { name: "Justin's team", initials: "JT", department: "Legal" }, dueDate: "2024-11-12" },
    ],
    tags: ["insurance", "property"],
    dueDate: "2024-11-12",
    progress: 100,
    department: "Legal",
    type: "Task",
    clientInfo: "Acme Inc.",
    description: "Renew property insurance for Sand Lane property. Compare quotes from multiple providers and ensure adequate coverage. This is a longer description to demonstrate how the text will be clamped to a maximum of three lines in the card. Any extra text will be hidden and replaced with an ellipsis. We need to evaluate different insurance companies, their coverage options, deductibles, and premium costs. The property is located in a high-risk area, so we need comprehensive coverage including flood, fire, and liability insurance. Additionally, we should consider umbrella policies for extra protection.",
    status: "To do",
    attachmentCount: 3,
    commentCount: 7,
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
    clientInfo: "Acme Inc.",
    description: "Define philanthropic goals for 2025. Focus on education and environmental initiatives.",
    status: "To do",
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
      { id: "4-1", taskId: "INVST-83-1", title: "Analyze current expenses", status: "In Progress", assignee: { name: "Erin George", initials: "EG", department: "Investment" }, dueDate: "2024-11-12" },
      { id: "4-2", taskId: "INVST-83-2", title: "Set budget categories", status: "Verified", assignee: { name: "Erin George", initials: "EG", department: "Investment" }, dueDate: "2024-11-15" },
      { id: "4-3", taskId: "INVST-83-3", title: "Review with stakeholders", status: "To do", assignee: { name: "Erin George", initials: "EG", department: "Investment" }, dueDate: "2024-11-20" },
      { id: "4-4", taskId: "INVST-83-4", title: "Finalize budget document", status: "To do", assignee: { name: "Erin George", initials: "EG", department: "Investment" }, dueDate: "2024-11-25" },
      { id: "4-5", taskId: "INVST-83-5", title: "Present to board", status: "To do", assignee: { name: "Erin George", initials: "EG", department: "Investment" }, dueDate: "2024-11-30" },
    ],
    tags: ["budget", "planning"],
    dueDate: "2024-11-12",
    progress: 60,
    department: "Investment",
    type: "Task",
    clientInfo: "Acme Inc.",
    description: "Set up comprehensive family office budget for next fiscal year with detailed expense tracking.",
    status: "In Progress",
    attachmentCount: 12,
    commentCount: 23,
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
      { id: "6-1", taskId: "INVST-773-1", title: "Background checks", status: "In Progress", assignee: { name: "Gretchen's team", initials: "GT", department: "Legal" }, dueDate: "2024-11-15" },
      { id: "6-2", taskId: "INVST-773-2", title: "Credit verification", status: "In Progress", assignee: { name: "Gretchen's team", initials: "GT", department: "Legal" }, dueDate: "2024-11-18" },
      { id: "6-3", taskId: "INVST-773-3", title: "Reference calls", status: "To do", assignee: { name: "Gretchen's team", initials: "GT", department: "Legal" }, dueDate: "2024-11-20" },
    ],
    tags: ["tenants", "screening"],
    dueDate: "2024-11-12",
    progress: 70,
    department: "Legal",
    type: "Task",
    clientInfo: "Acme Inc.",
    description: "Complete tenant screening process for multiple properties including background and credit checks. This comprehensive process involves multiple steps and detailed verification procedures. We need to conduct thorough background checks, verify employment history, check credit scores, contact previous landlords, and ensure all applicants meet our strict criteria. The screening process must comply with fair housing laws and regulations. We also need to verify income requirements (typically 3x rent), check for any criminal history, and assess the overall reliability of potential tenants. Documentation must be properly maintained for legal compliance and future reference.",
    status: "In Progress",
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
    status: "In Progress",
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
      { id: "8-1", taskId: "RLST-234-1", title: "Aircraft inspection", status: "Needs Work", assignee: { name: "Aviation Team", initials: "AT", department: "Legal" }, dueDate: "2024-11-25" },
      { id: "8-2", taskId: "RLST-234-2", title: "Insurance setup", status: "To do", assignee: { name: "Aviation Team", initials: "AT", department: "Legal" }, dueDate: "2024-12-01" },
    ],
    tags: ["aircraft", "purchase"],
    dueDate: "2024-11-12",
    progress: 30,
    department: "Legal",
    type: "Task",
    clientInfo: "Acme Inc.",
    description: "Complete purchase of Challenger 350 aircraft including inspection, documentation, and registration.",
    status: "Needs Work",
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
    clientInfo: "Acme Inc.",
    description: "Comprehensive IT infrastructure upgrade including servers, networking, and security systems.",
    status: "Needs Work",
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
      { id: "10-1", taskId: "HR-543-2-1", title: "Design curriculum", status: "Needs Work", assignee: { name: "James Saris", initials: "JS", department: "HR" }, dueDate: "2024-11-20" },
      { id: "10-2", taskId: "HR-543-2-2", title: "Book venues", status: "To do", assignee: { name: "James Saris", initials: "JS", department: "HR" }, dueDate: "2024-11-25" },
      { id: "10-3", taskId: "HR-543-2-3", title: "Invite speakers", status: "To do", assignee: { name: "James Saris", initials: "JS", department: "HR" }, dueDate: "2024-11-30" },
    ],
    tags: ["training", "employee"],
    dueDate: "2024-11-12",
    progress: 20,
    department: "HR",
    type: "Task",
    clientInfo: "Acme Inc.",
    description: "Organize comprehensive annual employee training program covering compliance, skills development, and team building. This extensive program will include multiple modules designed to enhance employee capabilities and ensure regulatory compliance. The training will cover topics such as workplace safety, diversity and inclusion, cybersecurity awareness, professional development, leadership skills, and industry-specific regulations. We need to coordinate with external trainers, book appropriate venues, prepare training materials, and ensure all employees can attend their required sessions. The program should be engaging, interactive, and measurable with clear learning outcomes and assessment criteria.",
    status: "Needs Work",
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
      { id: "11-1", taskId: "FIN-892-1", title: "Gather financial documents", status: "Verified", assignee: { name: "Sarah Mitchell", initials: "SM", department: "Finance" }, dueDate: "2024-11-18" },
      { id: "11-2", taskId: "FIN-892-2", title: "Review deductions", status: "Verified", assignee: { name: "Sarah Mitchell", initials: "SM", department: "Finance" }, dueDate: "2024-11-22" },
    ],
    tags: ["tax", "quarterly"],
    dueDate: "2024-11-28",
    progress: 85,
    department: "Finance",
    type: "Task",
    clientInfo: "Beta Corp.",
    description: "Prepare and file quarterly tax returns with detailed documentation and compliance review.",
    status: "Verified",
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
    clientInfo: "Gamma LLC",
    description: "Review vendor contracts for compliance and negotiate better terms where possible.",
    status: "Verified",
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
      { id: "13-1", taskId: "INV-678-1", title: "Market analysis", status: "Acknowledged", assignee: { name: "Investment Committee", initials: "IC", department: "Investment" }, dueDate: "2024-11-30" },
    ],
    tags: ["portfolio", "rebalancing"],
    dueDate: "2024-12-05",
    progress: 90,
    department: "Investment",
    type: "Task",
    clientInfo: "Delta Holdings",
    description: "Complete portfolio rebalancing based on Q4 market conditions and risk assessment.",
    status: "Acknowledged",
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
    clientInfo: "Epsilon Inc.",
    description: "Conduct annual performance reviews for all department heads and key personnel.",
    status: "Acknowledged",
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
      { id: "15-1", taskId: "PROP-123-1", title: "Property inspection", status: "Done", assignee: { name: "Property Team", initials: "PT", department: "Investment" }, dueDate: "2024-11-10" },
      { id: "15-2", taskId: "PROP-123-2", title: "Market valuation", status: "Done", assignee: { name: "Property Team", initials: "PT", department: "Investment" }, dueDate: "2024-11-12" },
    ],
    tags: ["real-estate", "due-diligence"],
    dueDate: "2024-11-15",
    progress: 100,
    department: "Investment",
    type: "Task",
    clientInfo: "Zeta Properties",
    description: "Complete due diligence for commercial real estate acquisition including environmental and structural assessments.",
    status: "Done",
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
    clientInfo: "Theta Corp.",
    description: "Prepare all documentation and processes for annual compliance audit by regulatory authorities. This critical project requires meticulous preparation and coordination across multiple departments. We need to gather all required documentation, ensure all processes are properly documented and compliant with current regulations, prepare staff for interviews with auditors, and create comprehensive reports demonstrating our adherence to industry standards. The audit preparation involves reviewing internal controls, updating policies and procedures, conducting mock audits, and addressing any potential compliance gaps. All documentation must be organized, easily accessible, and demonstrate continuous improvement in our compliance framework.",
    status: "Done",
    attachmentCount: 45,
    commentCount: 52,
  },
];

const statusColorMap = Object.fromEntries(
  STATUSES.map((s) => [s.id, s.color])
);

const CARD_FIELDS = [
  { key: "taskId", label: "Task ID", pinned: true },
  { key: "priority", label: "Priority", pinned: true },
  { key: "category", label: "Category", pinned: true },
  { key: "assignee", label: "Assignee", pinned: true },
  { key: "subtasks", label: "Subtask count", pinned: true },
  { key: "tags", label: "Tags", pinned: true },
  { key: "dueDate", label: "Due date", pinned: true },
  { key: "progress", label: "Progress", pinned: true },
  { key: "department", label: "Department", pinned: true },
  { key: "type", label: "Type", pinned: true },
  { key: "clientInfo", label: "Client info", pinned: true },
  { key: "description", label: "Description", pinned: true },
];

export default function KanbanBoard({
  showSettings: showSettingsProp,
  setShowSettings: setShowSettingsProp,
  cardFields: cardFieldsProp,
  setCardFields: setCardFieldsProp,
  onTaskClick,
}: {
  showSettings?: boolean,
  setShowSettings?: (v: boolean) => void,
  cardFields?: Record<string, boolean>,
  setCardFields?: (v: Record<string, boolean>) => void,
  onTaskClick?: (task: any) => void,
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [draggedTask, setDraggedTask] = useState<null | { id: string; status: string }>(null);
  const [internalShowSettings, internalSetShowSettings] = useState(false);
  const showSettings = showSettingsProp !== undefined ? showSettingsProp : internalShowSettings;
  const setShowSettings = setShowSettingsProp || internalSetShowSettings;
  const [settingsSearch, setSettingsSearch] = useState("");
  const [grouped, setGrouped] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [internalCardFields, internalSetCardFields] = useState<Record<string, boolean>>(() => {
    const obj: Record<string, boolean> = {};
    CARD_FIELDS.forEach(f => obj[f.key] = true);
    return obj;
  });
  const cardFields = cardFieldsProp || internalCardFields;
  const setCardFields = setCardFieldsProp || internalSetCardFields;
  // Collapsed columns state
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [expandedSubtasks, setExpandedSubtasks] = useState<Record<string, boolean>>({});
  const [columnMenuOpen, setColumnMenuOpen] = useState<Record<string, boolean>>({});
  // Видаляю selectedTask, setSelectedTask

  // Search filter
  const filteredTasks = useMemo(() => {
    const lower = search.toLowerCase();
    function matches(task: any) {
      return CARD_FIELDS.some(f => {
        const val = task[f.key];
        if (Array.isArray(val)) return val.join(", ").toLowerCase().includes(lower);
        if (typeof val === "object" && val !== null) return Object.values(val).join(" ").toLowerCase().includes(lower);
        return String(val ?? "").toLowerCase().includes(lower);
      }) || (task.subtasks && task.subtasks.some(matches));
    }
    return tasks.filter(matches);
  }, [tasks, search]);

  // Grouped/flat view
  function getColumnTasks(status: string) {
    if (grouped) {
      return filteredTasks.filter(t => t.status === status);
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
      return all;
    }
  }

  // Drag logic
  const onDragStart = (start: any) => {
    const task = tasks.find((t) => t.id === start.draggableId);
    if (task) setDraggedTask(task);
  };

  const onDragEnd = (result: DropResult) => {
    setDraggedTask(null);
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    // Find task or subtask
    let task = tasks.find((t) => t.id === draggableId);
    let isSubtask = false;
    if (!task) {
      for (const t of tasks) {
        if (t.subtasks) {
          const st = t.subtasks.find((st: any) => st.id === draggableId);
          if (st) {
            // Inherit missing fields from parent for type safety
            task = { ...t, ...st };
            isSubtask = true;
            break;
          }
        }
      }
    }
    if (!task) return;
    if (!isValidTransition(task.status, destination.droppableId)) {
      toast.error(`Cannot move task from ${task.status} to ${destination.droppableId}`);
      return;
    }
    if (isSubtask) {
      setTasks(prev => prev.map(t => ({
        ...t,
        subtasks: t.subtasks ? t.subtasks.map((st: any) => st.id === draggableId ? { ...st, status: destination.droppableId } : st) : [],
      })));
    } else {
      setTasks(prev => prev.map(t => t.id === draggableId ? { ...t, status: destination.droppableId } : t));
    }
    toast.success(`Task moved to ${destination.droppableId}`);
  };

  // Card rendering
  function renderCard(task: any, isSubtask = false) {
    const showSubtasks = cardFields.subtasks && task.subtasks && task.subtasks.length > 0;
    const showAttachments = cardFields.attachments;
    const showComments = cardFields.comments;
    const isSimple = !showSubtasks && !showAttachments && !showComments;
    const subtasksCount = task.subtasks?.length || 0;
    return (
      <Draggable key={task.id} draggableId={task.id} index={parseInt(task.id.replace(/\D/g, ""))}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="mb-2"
            style={provided.draggableProps.style}
          >
            <div
              className={`${snapshot.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{
                transform: snapshot.isDragging ? 'scale(0.95) rotate(3deg)' : 'none',
                transition: snapshot.isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)',
                position: 'relative',
                zIndex: snapshot.isDragging ? 1000 : 'auto',
              }}
            >
              <Card className={`border-[#e8e8ec] rounded-2xl transition-all duration-150 ease-out w-full ${
                snapshot.isDragging 
                  ? 'shadow-xl shadow-black/20 border-blue-300' 
                  : 'shadow-none hover:shadow-lg hover:shadow-black/15 hover:border-gray-300'
              }`}>
              <CardContent className={`${isSimple ? "p-3" : "p-4"} ${task.isSubtaskInFlat ? "bg-blue-50/30 border-l-4 border-l-blue-400" : ""}`}>
                {/* Parent task indicator for subtasks in flat view */}
                {task.isSubtaskInFlat && (
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M6 9l6 0" />
                        <path d="M4 5l4 0" />
                        <path d="M6 5v11a1 1 0 0 0 1 1h5" />
                        <path d="M12 7m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z" />
                        <path d="M12 15m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z" />
                      </svg>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span>від {task.parentTaskId}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs px-2 py-0 bg-blue-100 text-blue-700 border-blue-200">
                      SUBTASK
                    </Badge>
                  </div>
                )}
                {/* Subtask indicator for grouped view */}
                {isSubtask && !task.isSubtaskInFlat && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <path d="M6 9l6 0" />
                      <path d="M4 5l4 0" />
                      <path d="M6 5v11a1 1 0 0 0 1 1h5" />
                      <path d="M12 7m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z" />
                      <path d="M12 15m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z" />
                    </svg>
                  </div>
                )}
                {/* ID */}
                {cardFields.taskId && (
                  <div className="text-xs font-semibold text-[#60646c] mb-1">{task.taskId}</div>
                )}
                {/* Title (Name) */}
                {cardFields.name !== false && (
                  <div 
                    className="text-base font-semibold text-[#1c2024] mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => onTaskClick && onTaskClick(task)}
                  >
                    {task.title}
                  </div>
                )}
                {/* Description */}
                {cardFields.description && task.description && (
                  <div className="text-sm text-[#8b8d98] mb-2 line-clamp-3">{task.description}</div>
                )}
                {/* Org + Avatars */}
                {(cardFields.organization || cardFields.assignee) && (
                  <div className="flex items-center justify-between mb-1">
                    {/* Org logo and organization - invisible but takes space when hidden */}
                    <div className={`flex items-center gap-2 ${cardFields.organization ? '' : 'invisible'}`}>
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 via-pink-400 to-purple-400 flex items-center justify-center">
                        <span className="sr-only">Org</span>
                      </span>
                      <span className="text-sm text-[#1c2024] font-medium mr-2">{task.clientInfo}</span>
                    </div>
                    {/* Assignee avatars - aligned to the right */}
                    {cardFields.assignee && task.teamMembers && (
                      <div className="flex -space-x-2">
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
                        {task.priority === "Normal" && <Layers className="w-4 h-4 text-[#0034dc]" />}
                        {task.priority === "High" && <ChevronDown className="w-4 h-4 text-[#e5484d] rotate-180" />}
                        {task.priority === "Emergency" && <ChevronDown className="w-4 h-4 text-[#e5484d] rotate-180" />}
                        <span className={`text-sm font-medium ${task.priority === "Emergency" || task.priority === "High" ? "text-[#e5484d]" : task.priority === "Low" ? "text-[#8b8d98]" : "text-[#0034dc]"}`}>{task.priority || "Normal"}</span>
                      </div>
                    </div>
                    {/* Due date */}
                    {cardFields.dueDate && (
                      <div className="text-sm text-[#8b8d98] flex items-center gap-1">
                        <span>Due:</span>
                        <span className="text-[#1c2024] font-medium">{task.dueDate}</span>
                      </div>
                    )}
                  </div>
                )}
                {/* Subtasks + Attachments + Comments в один рядок */}
                {(subtasksCount > 0 || showAttachments || showComments) && (
                  <div className="flex items-center gap-3 mt-2 w-full">
                    {subtasksCount > 0 && (
                      <div 
                        className="flex items-center gap-2 cursor-pointer select-none hover:bg-gray-100 rounded px-1 py-0.5 transition-colors duration-100 ease-out"
                        onClick={() => setExpandedSubtasks(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                      >
                        {expandedSubtasks[task.id] ? (
                          <ChevronDown className="w-5 h-5 text-[#8b8d98]" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-[#8b8d98]" />
                        )}
                        <span className="font-semibold text-base text-[#1c2024]">{subtasksCount} subtasks</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      {showAttachments && (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#f3f3f3] text-sm text-[#60646c]">
                          <Paperclip className="w-4 h-4" />{task.attachmentCount}
                        </span>
                      )}
                      {showComments && (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#f3f3f3] text-sm text-[#60646c]">
                          <MessageCircle className="w-4 h-4" />{task.commentCount}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
            {/* Render subtasks when expanded */}
            {expandedSubtasks[task.id] && task.subtasks && task.subtasks.map((subtask: any) => (
              <div key={subtask.id} className="ml-4 mt-2">
                {renderCard(subtask, true)}
              </div>
            ))}
          </div>
        )}
      </Draggable>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full w-full">
        {/* Kanban scroll area with padding */}
        <div className="flex-1 px-6 pt-6 pb-4">
            <style>{`
              .kanban-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: #d1d5db #fff0;
              }
              .kanban-scrollbar::-webkit-scrollbar {
                width: 8px;
                background: transparent;
                opacity: 0;
              }
              .kanban-scrollbar::-webkit-scrollbar-thumb {
                background: #d1d5db;
                border-radius: 8px;
                opacity: 0;
                transition: opacity 0.2s;
              }
              .kanban-scroll-hover .kanban-scrollbar {
                overflow-x: auto !important;
              }
              .kanban-scroll-hover .kanban-scrollbar::-webkit-scrollbar,
              .kanban-scroll-hover .kanban-scrollbar::-webkit-scrollbar-thumb {
                opacity: 1;
              }
            `}</style>
            <div
              className="group relative"
              onMouseEnter={e => e.currentTarget.classList.add('kanban-scroll-hover')}
              onMouseLeave={e => e.currentTarget.classList.remove('kanban-scroll-hover')}
            >
              <div className="kanban-scrollbar flex gap-6 min-h-[600px] overflow-x-hidden" style={{overflowY: 'hidden', position: 'relative'}}>
                <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                  {STATUSES.map((column) => {
                    const columnTasks = getColumnTasks(column.id);
                    const isDropDisabled = !!(draggedTask && !isValidTransition(draggedTask.status, column.id));
                    const isCollapsed = collapsed[column.id];
                    const groupColor = statusColorMap[column.id] || "bg-white border-gray-200";
          return (
            <Droppable
              key={column.id}
              droppableId={column.id}
              isDropDisabled={isDropDisabled}
            >
              {(provided, snapshot) => (
                      isCollapsed ? (
                        <Droppable key={column.id} droppableId={column.id} isDropDisabled={isDropDisabled}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                              className={`flex flex-col items-center justify-center min-w-[72px] max-w-[72px] h-full rounded-lg border p-0 cursor-pointer select-none relative group ${groupColor} ${isDropDisabled && draggedTask ? "opacity-50 cursor-not-allowed border-dashed" : ""}`}
                              onClick={() => setCollapsed(c => ({ ...c, [column.id]: false }))}
                            >
                              <div className="flex flex-col items-center justify-center w-full h-full py-8">
                                <span className="font-medium text-base text-[#1c2024] mb-4 text-center" style={{ writingMode: "vertical-rl", textOrientation: "mixed", letterSpacing: "0.05em" }}>{column.title}</span>
                                <span className="bg-white text-black text-base font-semibold rounded-xl px-4 py-1 mb-4 shadow border border-gray-200 text-center">{columnTasks.length}</span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="rounded-full hover:bg-[#e0e2e7] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
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
                  )}
                        </Droppable>
                      ) : (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex flex-col min-w-[420px] max-w-[520px] h-[calc(100vh-220px)] rounded-lg border p-0 transition-opacity relative ${
                            groupColor
                          } ${
                            isDropDisabled && draggedTask
                              ? "opacity-50 cursor-not-allowed border-dashed"
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0 px-6 pt-3 pb-1 group">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-base text-[#1c2024]">{column.title}</h3>
                              <Badge className="text-xs px-2 py-0.5 h-5 min-w-5 flex items-center justify-center">{columnTasks.length}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Collapse button (only on hover) */}
                              <Tooltip>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="rounded-full hover:bg-[#e0e2e7] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
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
                                        // TODO: Implement select all functionality
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
                          {!collapsed[column.id] && (
                            <div className="flex-1 overflow-y-auto px-4 pb-4">
                              {columnTasks.length === 0 && (
                                <div className="text-xs text-gray-400 flex-1 flex items-center justify-center">No tasks</div>
                              )}
                              {columnTasks.map((task: any, idx: number) => renderCard(task))}
                              {provided.placeholder}
                            </div>
                          )}
                        </div>
                      )
              )}
            </Droppable>
          );
        })}
              </DragDropContext>
            </div>
          </div>
        </div>
        {/* Видаляю selectedTask, TaskPreview */}
      </div>
    </TooltipProvider>
  );
} 