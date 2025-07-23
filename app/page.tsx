"use client"

import Sidebar from "../components/sidebar";
import TopBar from "../components/topbar";
import KanbanBoard from "../components/KanbanBoard";
import { Plus, ChevronDown, ChevronRight, Filter, Settings, Share, Bell, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Paperclip, User, Share as ShareIcon } from "lucide-react";

export default function Page() {
  // Define CARD_FIELDS array (without Category and Subtask count)
  const CARD_FIELDS = [
    { key: "taskId", label: "ID", pinned: true },
    { key: "name", label: "Name", pinned: true },
    { key: "organization", label: "Organization", pinned: true },
    { key: "priority", label: "Priority", pinned: false },
    { key: "assignee", label: "Assignee", pinned: false },
    { key: "tags", label: "Tags", pinned: false },
    { key: "dueDate", label: "Due date", pinned: false },
    { key: "clientInfo", label: "Client info", pinned: false },
    { key: "description", label: "Description", pinned: false },
    { key: "attachments", label: "Attachments", pinned: false },
    { key: "comments", label: "Comments", pinned: false },
  ];
  // State for cardFields
  const [cardFields, setCardFields] = useState<Record<string, boolean>>(() => {
    const obj: Record<string, boolean> = {};
    CARD_FIELDS.forEach(f => obj[f.key] = true);
    return obj;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [settingsSearch, setSettingsSearch] = useState("");
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
  return (
    <div className="flex h-screen bg-[#fcfcfd]">
      {/* Sidebar - fixed */}
      <div className="sticky top-0 left-0 h-screen z-30"><Sidebar /></div>
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopBar - fixed */}
        <div className="sticky top-0 left-0 z-20 bg-white"><TopBar /></div>
        <div className="flex flex-1 min-h-0">
          {/* Tasks Panel - sticky */}
          <div className="w-80 bg-[#ffffff] border-r border-[#e8e8ec] flex flex-col sticky top-[64px] left-0 z-10 h-[calc(100vh-64px)]">
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
          {/* Kanban Board */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Filter/Search Bar Row - sticky */}
            <div className="sticky top-[64px] left-0 z-10 bg-white">
              <div className="bg-[#ffffff] border-b border-[#e8e8ec] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Removed counter badge from filter bar */}
                    <Button variant="ghost" size="sm" className="text-[#60646c]">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                    {/* View Setting button triggers KanbanBoard popover */}
                    <Popover open={showSettings} onOpenChange={setShowSettings}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="text-[#1c2024]">
                          <Settings className="w-4 h-4 mr-2" />
                          View setting
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-80 p-4 rounded-2xl shadow-2xl border border-[#e8e8ec] bg-white mt-2">
                        <div className="relative mb-4">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search"
                            className="pl-10 bg-[#f9f9fb] border-[#e8e8ec]"
                            value={settingsSearch}
                            onChange={e => setSettingsSearch(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          {/* Pinned fields */}
                          {[
                            { key: "taskId", label: "ID", pinned: true },
                            { key: "name", label: "Name", pinned: true },
                            { key: "organization", label: "Organization", pinned: true },
                          ].filter(f => f.label.toLowerCase().includes(settingsSearch.toLowerCase())).map((field, idx) => (
                            <div key={field.key} className="flex items-center justify-between py-1">
                              <span className="text-[15px] text-[#1c2024]">{field.label}</span>
                              <Switch checked disabled={true} />
                            </div>
                          ))}
                          <hr className="my-2 border-gray-200" />
                          {/* Regular fields */}
                          {[
                            { key: "priority", label: "Priority", pinned: false },
                            { key: "assignee", label: "Assignee", pinned: false },
                            { key: "tags", label: "Tags", pinned: false },
                            { key: "dueDate", label: "Due date", pinned: false },
                            { key: "clientInfo", label: "Client info", pinned: false },
                            { key: "description", label: "Description", pinned: false },
                          ].filter(f => f.label.toLowerCase().includes(settingsSearch.toLowerCase())).map((field, idx) => (
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
                          ))}
                          {CARD_FIELDS.filter(f => !f.pinned && ["attachments","comments"].includes(f.key)).map((field, idx) => (
                            <div key={field.key} className="flex items-center justify-between py-1">
                              <span className="text-[15px] text-[#1c2024]">{field.label}</span>
                              <Switch checked={cardFields[field.key]} onCheckedChange={v => setCardFields({ ...cardFields, [field.key]: v })} />
                            </div>
                          ))}
                        </div>
                        <button
                          className="mt-6 w-full py-2 rounded-md border border-[#e8e8ec] bg-[#f9f9fb] text-[#1c2024] font-medium hover:bg-[#f4f4f7]"
                          onClick={() => setCardFields(() => {
                            const obj: Record<string, boolean> = {};
                            CARD_FIELDS.forEach(f => obj[f.key] = true);
                            return obj;
                          })}
                        >
                          Reset to default
                        </button>
                      </PopoverContent>
                    </Popover>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b8d98] w-4 h-4" />
                      <Input placeholder="Search" className="pl-10 w-48 bg-[#f9f9fb] border-[#e8e8ec]" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-[#60646c]">
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="ghost" size="sm" className="text-[#60646c]">
                      Actions
                    </Button>
                    <Button onClick={() => { setModalStatus(undefined); setShowCreateModal(true); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      New task
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            {/* Pass cardFields and setCardFields to KanbanBoard */}
            <KanbanBoard showSettings={showSettings} setShowSettings={setShowSettings} cardFields={cardFields} setCardFields={setCardFields} />
          </div>
        </div>
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
