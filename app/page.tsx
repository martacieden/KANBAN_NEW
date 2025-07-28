"use client"

import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import TopBar from "../components/topbar";
import KanbanBoard, { initialTasks as kanbanInitialTasks } from "../components/KanbanBoard";
import { Plus, ChevronDown, ChevronRight, Filter, Settings, Share, Bell, Search, List, Kanban, Layers, ChevronUp, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Paperclip, User, Share as ShareIcon, Copy, Archive, Users, Shield, FileText, X } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import TaskPreview from "../components/TaskPreview";

// Функція для генерації унікального кольору на основі тексту
function generateColorFromText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
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

export default function Page() {
  // Define fields for Kanban cards
  const KANBAN_CARD_FIELDS = [
    { key: "taskId", label: "ID", pinned: true },
    { key: "name", label: "Name", pinned: true },
    { key: "organization", label: "Organization", pinned: false },
    { key: "priority", label: "Priority", pinned: false },
    { key: "assignee", label: "Assignee", pinned: false },
    { key: "tags", label: "Tags", pinned: false },
    { key: "dueDate", label: "Due date", pinned: false },
    { key: "description", label: "Description", pinned: false },
    { key: "attachments", label: "Attachments", pinned: false },
    { key: "comments", label: "Comments", pinned: false },
  ];

  // Define fields for Table columns (more fields available)
  const TABLE_COLUMN_FIELDS = [
    { key: "taskId", label: "ID", pinned: true },
    { key: "title", label: "Name", pinned: true },
    { key: "priority", label: "Priority", pinned: false },
    { key: "status", label: "Status", pinned: false },
    { key: "assignee", label: "Assignee", pinned: false },
    { key: "dueDate", label: "Due date", pinned: false },
    { key: "description", label: "Description", pinned: false },
    { key: "organization", label: "Organization", pinned: false },
    { key: "tags", label: "Tags", pinned: false },
    { key: "workspace", label: "Workspace", pinned: false },
    { key: "createdAt", label: "Created", pinned: false },
    { key: "updatedAt", label: "Updated", pinned: false },
    { key: "attachments", label: "Attachments", pinned: false },
    { key: "comments", label: "Comments", pinned: false },
  ];
  // Get current fields based on view
  const getCurrentFields = () => view === 'kanban' ? KANBAN_CARD_FIELDS : TABLE_COLUMN_FIELDS;
  
  // State for cardFields
  const [cardFields, setCardFields] = useState<Record<string, boolean>>(() => {
    const obj: Record<string, boolean> = {};
    // Initialize with all possible fields from both lists
    [...KANBAN_CARD_FIELDS, ...TABLE_COLUMN_FIELDS].forEach(f => {
      // Tags hidden by default
      obj[f.key] = f.key !== 'tags';
    });
    return obj;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [settingsSearch, setSettingsSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const taskCategories = [
    { name: "All tasks", count: 303, active: true },
    { name: "Budget", count: 99, active: false },
    { name: "Philanthropy", count: 124, active: false },
    { name: "Investment", count: 16, active: false },
    { name: "Legal", count: 2, active: false },
    { name: "Travel", count: 6, active: false },
    { name: "Food", count: 15, active: false, expanded: true },
    { name: "HR", count: 6, active: false },
    { name: "Accounting", count: 33, active: false },
  ];
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalStatus, setModalStatus] = useState<string | undefined>(undefined);
  useEffect(() => {
    const handler = (e: any) => {
      setModalStatus(e.detail?.status);
      setShowCreateModal(true);
    };
    window.addEventListener("openCreateTaskModal", handler);
    return () => window.removeEventListener("openCreateTaskModal", handler);
  }, []);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    checkbox: 40,
    title: 300,
    priority: 120,
    status: 120,
    dueDate: 120,
    assignee: 150,
    organization: 150,
    description: 200,
  });

  // Функція для оновлення selectedTask коли завдання змінюється в KanbanBoard
  const handleTaskUpdate = (updatedTask: any) => {
    console.log('handleTaskUpdate called with:', updatedTask);
    console.log('current selectedTask:', selectedTask);
    if (selectedTask) {
      // Перевіряємо як основне завдання, так і підзавдання
      if (selectedTask.id === updatedTask.id) {
        console.log('Updating selectedTask with new status:', updatedTask.status);
        setSelectedTask(updatedTask);
      } else if (selectedTask.subtasks) {
        // Перевіряємо чи оновлене завдання є підзавданням поточного selectedTask
        const hasMatchingSubtask = selectedTask.subtasks.some((subtask: any) => subtask.id === updatedTask.id);
        if (hasMatchingSubtask) {
          console.log('Updating subtask in selectedTask');
          const updatedSelectedTask = {
            ...selectedTask,
            subtasks: selectedTask.subtasks.map((subtask: any) => 
              subtask.id === updatedTask.id 
                ? { ...subtask, status: updatedTask.status }
                : subtask
            )
          };
          setSelectedTask(updatedSelectedTask);
        }
      }
    }
  };

  // Закривати прев'ю при зміні view
  useEffect(() => {
    setSelectedTask(null);
  }, [view]);

  // Закривати вибрані завдання при зміні view
  useEffect(() => {
    setSelectedTasks(new Set());
  }, [view]);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar - fixed */}
      {!sidebarCollapsed && (
        <div className="sticky top-0 left-0 h-screen z-30"><Sidebar /></div>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopBar - fixed */}
        <div className="sticky top-0 left-0 z-20 bg-white"><TopBar /></div>
        <div className="flex flex-1 min-h-0">
          {/* Tasks Panel - sticky */}
          {!sidebarCollapsed && (
            <div className="w-64 bg-[#ffffff] border-r border-[#e8e8ec] flex flex-col sticky top-[56px] left-0 z-10 h-[calc(100vh-56px)]">
              <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="text-lg font-semibold text-[#1c2024] mb-4">Tasks</h3>
                <div className="space-y-1">
                  {taskCategories.map((category, index) => (
                    <div key={index}>
                      <div
                        className={`flex items-center gap-2 justify-between px-3 py-2 rounded-lg cursor-pointer ${
                          category.active ? "bg-[#ebf3ff] text-[#004fc7]" : "text-[#60646c] hover:bg-[#f9f9fb]"
                        }`}
                        onClick={() => category.name === "Food" && toggleCategory(category.name)}
                      >
                        <span className="text-sm font-medium">{category.name}</span>
                        {category.count && (
                          <Badge variant="secondary" className="bg-[#f0f0f3] text-[#60646c] text-xs">
                            {category.count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full justify-start mt-4 text-[#60646c]">
                  <Plus className="w-4 h-4 mr-2" />
                  New category
                </Button>
              </div>
            </div>
          )}
          {/* Kanban Board / Grid View + TaskPreview */}
          <div className="flex-1 flex flex-row min-w-0">
            <div className="flex-1 flex flex-col min-w-0">
              {/* Filter/Search Bar Row - sticky */}
              <div className="sticky top-[56px] left-0 z-10 bg-white">
                <div className="bg-[#ffffff] border-b border-[#e8e8ec] py-1">
                  <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                      {/* Collapse Sidebar Button */}
                      <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="w-[28px] h-[28px] flex justify-center items-center flex-row border-solid border rounded-md bg-[#FFFFFF] border-[#E0E1E6] hover:bg-gray-100 transition-colors duration-150"
                        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                      >
                        {sidebarCollapsed ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#60646c]">
                            <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                            <path d="M9 4v16"></path>
                            <path d="M13 14l2 -2l-2 -2"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#60646c]">
                            <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                            <path d="M9 4v16"></path>
                            <path d="M15 10l-2 2l2 2"></path>
                          </svg>
                        )}
                      </button>
                      {/* Filters, View Setting, Search */}
                      <Button variant="ghost" size="sm" className="text-[#60646c]">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                      </Button>
                      <Popover open={showSettings} onOpenChange={setShowSettings}>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-[#60646c]">
                            <Settings className="w-4 h-4 mr-2" />
                            {view === 'list' 
                              ? `${getCurrentFields().filter(f => cardFields[f.key] !== false).length}/${getCurrentFields().length} columns`
                              : 'View setting'
                            }
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-80 p-4 rounded-2xl shadow-2xl border border-[#e8e8ec] bg-white mt-2 max-h-[70vh] flex flex-col">
                          <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              placeholder="Search"
                              className="pl-10 bg-[#f9f9fb] border-[#e8e8ec]"
                              value={settingsSearch}
                              onChange={e => setSettingsSearch(e.target.value)}
                            />
                          </div>
                          {/* Scrollable content area */}
                          <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1">
                            {/* Pinned fields */}
                            {[
                              { key: "taskId", label: "ID", pinned: true },
                              { key: "name", label: "Name", pinned: true },
                            ].filter(f => f.label.toLowerCase().includes(settingsSearch.toLowerCase())).map((field, idx) => (
                              <div key={field.key} className="flex items-center justify-between py-1">
                                <span className="text-[15px] text-[#1c2024]">{field.label}</span>
                                <Switch checked disabled={true} />
                              </div>
                            ))}
                            <hr className="my-2 border-gray-200" />
                            {/* Regular fields - ordered by card display sequence */}
                            {[
                              "description",
                              "organization", 
                              "assignee",
                              "priority",
                              "dueDate",
                              "tags",
                              "attachments",
                              "comments"
                            ].map(fieldKey => {
                              const field = getCurrentFields().find(f => f.key === fieldKey);
                              if (!field || field.pinned) return null;
                              if (!field.label.toLowerCase().includes(settingsSearch.toLowerCase())) return null;
                              
                              return (
                                <div key={field.key} className="flex items-center justify-between py-1">
                                  <span className="text-[15px] text-[#1c2024]">{field.label}</span>
                                  <Switch
                                    checked={cardFields[field.key]}
                                    onCheckedChange={() => {
                                      setCardFields(prev => ({
                                        ...prev,
                                        [field.key]: !prev[field.key]
                                      }));
                                    }}
                                  />
                                </div>
                              );
                            }).filter(Boolean)}
                          </div>
                          {/* Reset button - fixed at bottom */}
                          <button
                            className="mt-4 w-full py-2 rounded-md border border-[#e8e8ec] bg-[#f9f9fb] text-[#1c2024] font-medium hover:bg-[#f4f4f7] flex-shrink-0"
                            onClick={() => setCardFields(() => {
                              const obj: Record<string, boolean> = {};
                              getCurrentFields().forEach(f => {
                                // Tags hidden by default even after reset
                                obj[f.key] = f.key !== 'tags';
                              });
                              return obj;
                            })}
                          >
                            Reset to default
                          </button>
                        </PopoverContent>
                      </Popover>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b8d98] w-4 h-4" />
                        <Input placeholder="Search" className="pl-10 w-48 bg-transparent border-0" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* View Switcher */}
                      <div className="flex items-center gap-1 mr-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={view === 'list' ? 'bg-[#0034dc] text-white' : 'text-[#8b8d98]'}
                          onClick={() => setView('list')}
                          aria-label="List view"
                        >
                          <List className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={view === 'kanban' ? 'bg-[#0034dc] text-white' : 'text-[#8b8d98]'}
                          onClick={() => setView('kanban')}
                          aria-label="Kanban view"
                        >
                          <Kanban className="w-5 h-5" />
                        </Button>
                      </div>
                      {view === 'kanban' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => (window as any).kanbanExpandAll?.()}
                            className="text-[#60646c] hover:text-[#1c2024]"
                            title="Expand all groups"
                          >
                            Expand all
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => (window as any).kanbanCollapseAll?.()}
                            className="text-[#60646c] hover:text-[#1c2024]"
                            title="Collapse all groups"
                          >
                            Collapse all
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" className="text-[#60646c]">
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="ghost" size="sm" className="text-[#60646c]">
                        Actions
                      </Button>
                      <Button onClick={() => { setModalStatus(undefined); setShowCreateModal(true); }} className="bg-[#0034dc] hover:bg-[#004fc7] text-white px-5">
                        <Plus className="w-4 h-4 mr-2" />
                        New task
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Pass cardFields and setCardFields to KanbanBoard */}
              {view === 'kanban' ? (
                <KanbanBoard
                  showSettings={showSettings}
                  setShowSettings={setShowSettings}
                  cardFields={cardFields}
                  setCardFields={setCardFields}
                  onTaskClick={setSelectedTask}
                  onTaskUpdate={handleTaskUpdate}
                />
              ) : (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Actions panel when tasks are selected */}
                  {selectedTasks.size > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border-b border-blue-200">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                          {selectedTasks.size}
                        </div>
                        <span className="text-blue-900 font-medium">Selected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="text-gray-700 border-gray-300">
                          <FileText className="w-4 h-4 mr-2" />
                          Convert to subtask
                        </Button>
                        <Button variant="outline" size="sm" className="text-gray-700 border-gray-300">
                          <Users className="w-4 h-4 mr-2" />
                          Assign users
                        </Button>
                        <Button variant="outline" size="sm" className="text-gray-700 border-gray-300">
                          <Shield className="w-4 h-4 mr-2" />
                          Manage access
                        </Button>
                        <Button variant="outline" size="sm" className="text-gray-700 border-gray-300">
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </Button>
                        <Button variant="outline" size="sm" className="text-gray-700 border-gray-300">
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedTasks(new Set())}
                          className="text-gray-500 hover:text-gray-700 ml-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <TaskTable
                      tasks={kanbanInitialTasks}
                      cardFields={cardFields}
                      onTaskClick={setSelectedTask}
                      onTaskUpdate={handleTaskUpdate}
                      tableFields={TABLE_COLUMN_FIELDS}
                      selectedTasks={selectedTasks}
                      setSelectedTasks={setSelectedTasks}
                      columnWidths={columnWidths}
                      setColumnWidths={setColumnWidths}
                    />
                  </div>
                </div>
              )}
            </div>
            {/* Видаляю TaskPreview з flex-контейнера */}
          </div>
        </div>
        {/* Оверлей прев'ю */}
        {selectedTask && (
          <div className="fixed top-[56px] right-0 bottom-0 w-[420px] z-50 shadow-2xl bg-white border-l border-[#e8e8ec]">
            <TaskPreview task={selectedTask} onClose={() => setSelectedTask(null)} />
          </div>
        )}
      </div>
      <CreateTaskModal open={showCreateModal} onOpenChange={setShowCreateModal} defaultStatus={modalStatus} />
    </div>
  );
}

function CreateTaskModal({ open, onOpenChange, defaultStatus }: { open: boolean, onOpenChange: (v: boolean) => void, defaultStatus?: string }) {
  const [status, setStatus] = useState(defaultStatus || "To do");
  const [name, setName] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [category, setCategory] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("");
  const [project, setProject] = useState("");
  const [needsAttention, setNeedsAttention] = useState(false);
  const [description, setDescription] = useState("");
  const [touched, setTouched] = useState<{[k:string]:boolean}>({});
  useEffect(() => { setStatus(defaultStatus || "To do"); }, [defaultStatus]);
  const required = { name, workspace, category };
  const hasError = (field: string) => {
    if (field === 'name') return touched.name && !name;
    if (field === 'workspace') return touched.workspace && !workspace;
    if (field === 'category') return touched.category && !category;
    return false;
  };
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, workspace: true, category: true });
    if (!name || !workspace || !category) return;
    // TODO: handle create
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header */}
          <div className="border-b border-[#e8e8ec] px-8 pt-8 pb-4 flex flex-col gap-2">
            <div className="text-xs text-[#8b8d98] mb-1">All tasks / New task</div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-[#1c2024]">Create new task</h2>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Button type="button" variant="outline" size="sm" className="gap-1 px-3 py-1.5 text-sm">
                  <ShareIcon className="w-4 h-4" /> Share
                </Button>
              </div>
            </div>
          </div>
          {/* Main content */}
          <div className="flex flex-1 min-h-0">
            {/* Left: Form */}
            <div className="flex-1 px-8 py-8 overflow-y-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="rounded-lg bg-[#f4f4f7] w-12 h-12 flex items-center justify-center text-[#8b8d98]">
                  <User className="w-7 h-7" />
                </div>
                <Input
                  className={`text-xl font-medium border-0 shadow-none bg-transparent focus:ring-0 focus-visible:ring-0 placeholder:text-[#b0b3bb] ${hasError("name") ? "border-red-500" : ""}`}
                  placeholder="Enter tasks name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onBlur={() => setTouched(t => ({...t, name:true}))}
                />
              </div>
              <div className="text-sm font-semibold text-[#1c2024] mb-2">Details</div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-w-2xl">
                {/* Status */}
                <div>
                  <Label className="mb-1">Status</Label>
                  <div className="px-3 py-1.5 rounded bg-[#f4f4f7] text-[#1c2024] text-sm font-medium w-fit">{status}</div>
                </div>
                {/* Workspace */}
                <div>
                  <Label className="mb-1">Workspace <span className="text-red-500">*</span></Label>
                  <select
                    className={`w-full border rounded px-2 py-1.5 text-sm bg-white ${hasError("workspace") ? "border-red-500" : ""}`}
                    value={workspace}
                    onChange={e => setWorkspace(e.target.value)}
                    onBlur={() => setTouched(t => ({...t, workspace:true}))}
                  >
                    <option value="">Select workspace</option>
                    <option value="Default">Default</option>
                  </select>
                </div>
                {/* Category */}
                <div>
                  <Label className="mb-1">Category <span className="text-red-500">*</span></Label>
                  <select
                    className={`w-full border rounded px-2 py-1.5 text-sm bg-white ${hasError("category") ? "border-red-500" : ""}`}
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    onBlur={() => setTouched(t => ({...t, category:true}))}
                  >
                    <option value="">Select category</option>
                    <option value="Capital Projects">Capital Projects</option>
                  </select>
                </div>
                {/* Assignee */}
                <div>
                  <Label className="mb-1">Assignee</Label>
                  <select
                    className="w-full border rounded px-2 py-1.5 text-sm bg-white"
                    value={assignee}
                    onChange={e => setAssignee(e.target.value)}
                  >
                    <option value="">Select assignee</option>
                    <option value="Marley Bergson">Marley Bergson</option>
                  </select>
                </div>
                {/* Due date */}
                <div>
                  <Label className="mb-1">Due date</Label>
                  <Input type="date" className="w-full border rounded px-2 py-1.5 text-sm bg-white" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
                {/* Priority */}
                <div>
                  <Label className="mb-1">Priority</Label>
                  <select
                    className="w-full border rounded px-2 py-1.5 text-sm bg-white"
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                  >
                    <option value="">Select priority</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                {/* Project */}
                <div>
                  <Label className="mb-1">Project</Label>
                  <select
                    className="w-full border rounded px-2 py-1.5 text-sm bg-white"
                    value={project}
                    onChange={e => setProject(e.target.value)}
                  >
                    <option value="">Select project</option>
                  </select>
                </div>
                {/* Needs attention */}
                <div className="flex items-center gap-2 mt-6">
                  <Checkbox id="needsAttention" checked={needsAttention} onCheckedChange={v => setNeedsAttention(!!v)} />
                  <Label htmlFor="needsAttention" className="text-sm">Impacts client</Label>
                </div>
              </div>
              {/* Description */}
              <div className="mt-6">
                <Label className="mb-1">Description</Label>
                <textarea
                  className="w-full border rounded px-3 py-2 text-sm bg-white min-h-[60px] resize-y mt-1"
                  placeholder="Start typing..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>
            {/* Right: Add to task */}
            <div className="w-80 bg-[#fafbfc] border-l border-[#e8e8ec] flex flex-col p-8">
              <div className="text-sm font-semibold text-[#1c2024] mb-4">Add to task</div>
              <Button type="button" variant="outline" className="w-full justify-start gap-2 mb-2">
                <Paperclip className="w-4 h-4" /> Attachment
              </Button>
              {/* Додаткові кнопки можна додати тут */}
            </div>
          </div>
          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[#e8e8ec] px-8 py-4 bg-white">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-[#60646c]">Cancel</Button>
            <Button type="submit" className="bg-[#0034dc] hover:bg-[#004fc7] text-white px-8">Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TaskTable({ tasks, cardFields, onTaskClick, onTaskUpdate, tableFields, selectedTasks, setSelectedTasks, columnWidths, setColumnWidths }: { tasks: any[], cardFields: Record<string, boolean>, onTaskClick: (task: any) => void, onTaskUpdate?: (task: any) => void, tableFields: any[], selectedTasks: Set<string>, setSelectedTasks: (tasks: Set<string>) => void, columnWidths: Record<string, number>, setColumnWidths: (widths: Record<string, number>) => void }) {
  // Визначаємо, які колонки показувати
  const columns = [
    { key: "checkbox", label: "", pinned: true },
    ...tableFields.filter(col => cardFields[col.key] !== false || col.key === "title")
  ];

  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const handleMouseDown = (e: React.MouseEvent, columnKey: string) => {
    setIsResizing(true);
    setResizingColumn(columnKey);
    setStartX(e.clientX);
    setStartWidth(columnWidths[columnKey] || 120);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !resizingColumn) return;
    
    const diff = e.clientX - startX;
    const newWidth = Math.max(50, startWidth + diff); // Мінімальна ширина 50px
    
    setColumnWidths({
      ...columnWidths,
      [resizingColumn]: newWidth
    });
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setResizingColumn(null);
  };

  // Додаємо глобальні слухачі подій
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <Table className="w-full caption-bottom text-sm">
          <TableHeader className="[&_tr]:border-b sticky top-0 bg-white z-10">
            <TableRow className="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted border-b border-[#e8e8ec] h-10">
              {columns.map((col, index) => (
                <TableHead 
                  key={col.key} 
                  className="h-10 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] relative"
                  style={{ 
                    width: `${columnWidths[col.key] || 120}px`,
                    minWidth: `${columnWidths[col.key] || 120}px`,
                    maxWidth: `${columnWidths[col.key] || 120}px`,
                    paddingLeft: col.key === "checkbox" || col.key === "title" ? "16px" : "16px",
                    paddingRight: col.key === "title" ? "32px" : col.key === "dueDate" ? "16px" : "16px",
                    textAlign: col.key === "dueDate" ? "right" : "left"
                  }}
                >
                  {col.key === "checkbox" ? (
                    <Checkbox 
                      checked={selectedTasks.size === tasks.length && tasks.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTasks(new Set(tasks.map(t => t.id)));
                        } else {
                          setSelectedTasks(new Set());
                        }
                      }}
                      className="w-5 h-5 rounded border-[#e0e1e6] shadow-none"
                    />
                  ) : col.key === "priority" ? (
                    <div className="flex items-center gap-1">
                      <span className="text-[13px] font-medium leading-5 text-[#80838d]">{col.label}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-down w-4 h-4 text-[#60646c]">
                        <path d="M12 5v14"></path>
                        <path d="m19 12-7 7-7-7"></path>
                      </svg>
                    </div>
                  ) : (
                    <span className="text-[13px] font-medium leading-5 text-[#80838d]">{col.label}</span>
                  )}
                  
                  {/* Resize handle */}
                  {index < columns.length - 1 && (
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-200 opacity-0 hover:opacity-100"
                      onMouseDown={(e) => handleMouseDown(e, col.key)}
                      style={{ zIndex: 10 }}
                    />
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr:last-child]:border-0">
            {tasks.map((task, idx) => (
              <TableRow key={task.id || idx} className="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted border-b border-[#e8e8ec] bg-white h-10">
                {columns.map(col => (
                  <TableCell 
                    key={col.key} 
                    className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                    style={{ 
                      width: `${columnWidths[col.key] || 120}px`,
                      minWidth: `${columnWidths[col.key] || 120}px`,
                      maxWidth: `${columnWidths[col.key] || 120}px`,
                      paddingLeft: col.key === "checkbox" || col.key === "title" ? "16px" : "16px",
                      paddingRight: col.key === "title" ? "32px" : col.key === "dueDate" ? "16px" : "16px",
                      textAlign: col.key === "dueDate" ? "right" : "left"
                    }}
                    onClick={col.key === "checkbox" ? undefined : () => onTaskClick(task)}
                  >
                    {col.key === "checkbox" ? (
                      <Checkbox 
                        checked={selectedTasks.has(task.id)}
                        onCheckedChange={(checked) => {
                          const newSelected = new Set(selectedTasks);
                          if (checked) {
                            newSelected.add(task.id);
                          } else {
                            newSelected.delete(task.id);
                          }
                          setSelectedTasks(newSelected);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 rounded border-[#e0e1e6] shadow-none"
                      />
                    ) : col.key === "title" ? (
                      <span className="text-[13px] font-medium leading-5 text-[#1c2024] truncate block w-full">{task.title}</span>
                    ) : col.key === "assignee" && task.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={task.assignee.avatarUrl || "https://randomuser.me/api/portraits/men/32.jpg"} />
                          <AvatarFallback className="text-xs bg-gray-100">{task.assignee.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-[13px] font-normal leading-5 text-[#1c2024] truncate">{task.assignee.name}</span>
                      </div>
                    ) : col.key === "priority" ? (
                      <div className="flex items-center gap-2">
                        {/* Unified Flag icon for all priorities with different colors */}
                        <Flag 
                          className={`w-4 h-4 ${
                            task.priority === "Emergency" ? "text-[#e5484d]" : 
                            task.priority === "High" ? "text-[#e5484d]" : 
                            task.priority === "Low" ? "text-[#8b8d98]" : 
                            "text-[#0034dc]"
                          }`} 
                        />
                        <span className="text-[13px] font-normal leading-5 text-[#1c2024] truncate">{task.priority || "Normal"}</span>
                      </div>
                    ) : col.key === "status" ? (
                      <div className={`inline-flex items-center rounded-md text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent px-1.5 py-0.5 border-0 shadow-none ${
                        task.status === "To do" ? "bg-[#dbeafe] text-[#1d4ed8] hover:bg-[#dbeafe]" :
                        task.status === "In Progress" || task.status === "In progress" ? "bg-[#fef3c7] text-[#d97706] hover:bg-[#fef3c7]" :
                        task.status === "Needs Work" || task.status === "Needs work" ? "bg-[#fed7aa] text-[#ea580c] hover:bg-[#fed7aa]" :
                        task.status === "Verified" ? "bg-[#dcfce7] text-[#16a34a] hover:bg-[#dcfce7]" :
                        task.status === "Acknowledged" ? "bg-[#cffafe] text-[#0891b2] hover:bg-[#cffafe]" :
                        task.status === "Paused" ? "bg-[#f3f4f6] text-[#6b7280] hover:bg-[#f3f4f6]" :
                        task.status === "Blocked" ? "bg-[#fecaca] text-[#dc2626] hover:bg-[#fecaca]" :
                        task.status === "Done" ? "bg-[#d1fae5] text-[#059669] hover:bg-[#d1fae5]" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        <span className="text-[13px] font-medium leading-5 truncate">{task.status}</span>
                      </div>
                    ) : col.key === "dueDate" ? (
                      <span className="text-[13px] font-normal leading-5 text-[#1c2024]">{task.dueDate}</span>
                    ) : col.key === "description" ? (
                      <span className="text-[13px] font-normal leading-5 text-[#60646c] truncate block w-full">{task.description}</span>
                    ) : col.key === "organization" ? (
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full bg-gradient-to-br ${generateColorFromText(task.clientInfo || 'default')} flex items-center justify-center flex-shrink-0`}>
                          <span className="sr-only">Org</span>
                        </span>
                        <span className="text-[13px] font-normal leading-5 text-[#1c2024] truncate">{task.clientInfo || ""}</span>
                      </div>
                    ) : (
                      <span className="text-[13px] font-normal leading-5 text-[#1c2024] truncate">{task[col.key] || ""}</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
