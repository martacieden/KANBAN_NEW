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
    { key: "progress", label: "Progress", pinned: false },
    { key: "department", label: "Department", pinned: false },
    { key: "type", label: "Type", pinned: false },
    { key: "clientInfo", label: "Client info", pinned: false },
    { key: "description", label: "Description", pinned: false },
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
                            { key: "progress", label: "Progress", pinned: false },
                            { key: "department", label: "Department", pinned: false },
                            { key: "type", label: "Type", pinned: false },
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
  useEffect(() => { setStatus(defaultStatus || "To do"); }, [defaultStatus]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new task</DialogTitle>
        </DialogHeader>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={status}
              onChange={e => setStatus(e.target.value)}
              disabled={!!defaultStatus}
            >
              <option value="To do">To do</option>
              <option value="In Progress">In progress</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Task name</label>
            <input className="w-full border rounded px-2 py-1" placeholder="Enter task name" />
          </div>
          {/* Add other fields as needed */}
          <div className="flex justify-end gap-2 pt-4">
            <DialogClose asChild>
              <button type="button" className="px-4 py-2 rounded border">Cancel</button>
            </DialogClose>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Create</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
