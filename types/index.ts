// Task Management App Type Definitions

export interface Assignee {
  name: string;
  initials: string;
  department?: string;
  avatarUrl?: string;
}

export interface TeamMember {
  name: string;
  initials: string;
  avatarUrl: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  status: string;
  assignee?: Assignee;
  dueDate?: string;
}

export interface Task {
  id: string;
  taskId: string;
  title: string;
  category: string;
  status: string;
  stage?: string;
  priority: string;
  assignee?: Assignee;
  teamMembers?: TeamMember[];
  subtasks?: Subtask[];
  tags?: string[];
  dueDate?: string;
  progress?: number;
  department?: string;
  type?: string;
  clientInfo?: string;
  description?: string;
  attachmentCount?: number;
  commentCount?: number;
  lastStatusChange?: string;
  workspace?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StatusGroup {
  id: string;
  title: string;
  color: string;
  group: string;
}

export interface ColumnField {
  key: string;
  label: string;
  pinned: boolean;
}

export interface TaskOrder {
  [status: string]: string[];
}

export interface ColumnWidths {
  [key: string]: number;
}

export interface CardFields {
  [key: string]: boolean;
}

export interface TaskCategory {
  name: string;
  count: number;
  active: boolean;
  expanded?: boolean;
} 