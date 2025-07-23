import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Settings, X, Search, ChevronLeft } from "lucide-react";
import { Paperclip, MessageCircle, Users, User, Layers, Calendar } from "lucide-react";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

const initialTasks = [
  {
    id: "1",
    taskId: "FCLT-771",
    title: "Update Calls, Distributions",
    priority: "Emergency",
    category: "Budget",
    assignee: { name: "Marley Bergson", initials: "MB", department: "Finance" },
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
    description: "Update calls and distributions for Q4.",
    status: "To do",
  },
  {
    id: "2",
    taskId: "INVST-344",
    title: "Renew insurance on Sand Lane",
    priority: "Low",
    category: "Investment",
    assignee: { name: "Justin’s team", initials: "JT", department: "Legal" },
    subtasks: [
      { id: "2-1", taskId: "INVST-344-1", title: "Collect insurance quotes", status: "To do", assignee: { name: "Justin’s team", initials: "JT", department: "Legal" }, dueDate: "2024-11-12" },
      { id: "2-2", taskId: "INVST-344-2", title: "Review policy terms", status: "To do", assignee: { name: "Justin’s team", initials: "JT", department: "Legal" }, dueDate: "2024-11-12" },
    ],
    tags: ["insurance", "property"],
    dueDate: "2024-11-12",
    progress: 100,
    department: "Legal",
    type: "Task",
    clientInfo: "Acme Inc.",
    description: "Renew property insurance for Sand Lane.",
    status: "To do",
  },
  {
    id: "3",
    taskId: "LFST-133",
    title: "Define goals",
    priority: "Low",
    category: "Philanthropy",
    assignee: { name: "Cheyenne Calzoni", initials: "CC", department: "Philanthropy" },
    subtasks: [],
    tags: ["planning"],
    dueDate: "2024-11-12",
    progress: 40,
    department: "Philanthropy",
    type: "Task",
    clientInfo: "Acme Inc.",
    description: "Define philanthropic goals for 2025.",
    status: "To do",
  },
  {
    id: "4",
    taskId: "IT-334",
    title: "Categorize expenses",
    priority: "Normal",
    category: "Budget",
    assignee: { name: "Carla Franci", initials: "CF", department: "Finance" },
    subtasks: [],
    tags: ["accounting"],
    dueDate: "2024-11-12",
    progress: 60,
    department: "Finance",
    type: "Task",
    clientInfo: "Acme Inc.",
    description: "Categorize expenses for Q4.",
    status: "To do",
  },
  {
    id: "5",
    taskId: "INVST-83",
    title: "Set up family office budget",
    priority: "Normal",
    category: "Investment",
    assignee: { name: "Family Office", initials: "FO", department: "Finance" },
    subtasks: [
      { id: "5-1", taskId: "INVST-83-1", title: "Gather financial data", status: "In Progress", assignee: { name: "Family Office", initials: "FO", department: "Finance" }, dueDate: "2024-11-12" },
      { id: "5-2", taskId: "INVST-83-2", title: "Draft initial budget", status: "In Progress", assignee: { name: "Family Office", initials: "FO", department: "Finance" }, dueDate: "2024-11-12" },
      { id: "5-3", taskId: "INVST-83-3", title: "Review with stakeholders", status: "In Progress", assignee: { name: "Family Office", initials: "FO", department: "Finance" }, dueDate: "2024-11-12" },
      { id: "5-4", taskId: "INVST-83-4", title: "Adjust allocations", status: "In Progress", assignee: { name: "Family Office", initials: "FO", department: "Finance" }, dueDate: "2024-11-12" },
      { id: "5-5", taskId: "INVST-83-5", title: "Finalize budget", status: "In Progress", assignee: { name: "Family Office", initials: "FO", department: "Finance" }, dueDate: "2024-11-12" },
    ],
    tags: ["budget", "planning"],
    dueDate: "2024-11-12",
    progress: 90,
    department: "Finance",
    type: "Task",
    clientInfo: "Acme Inc.",
    description: "Set up the family office budget for the next year.",
    status: "In Progress",
  },
  {
    id: "6",
    taskId: "INVST-773",
    title: "Screening and approving tenants",
    priority: "High",
    category: "Investment",
    assignee: { name: "Gretchen’s team", initials: "GT", department: "Legal" },
    subtasks: [],
    tags: ["tenants", "screening"],
    dueDate: "2024-11-12",
    progress: 70,
    department: "Legal",
    type: "Task",
    clientInfo: "Acme Inc.",
    description: "Screen and approve tenants for new properties.",
    status: "In Progress",
  },
  {
    id: "7",
    taskId: "HR-678",
    title: "Home Security Enhancement",
    priority: "Normal",
    category: "HR",
    assignee: { name: "Giana Levin", initials: "GL", department: "HR" },
    subtasks: [],
    tags: ["security"],
    dueDate: "2024-11-12",
    progress: 50,
    department: "HR",
    type: "Task",
    clientInfo: "Acme Inc.",
    description: "Enhance home security for employees.",
    status: "In Progress",
  },
  {
    id: "8",
    taskId: "RLST-234",
    title: "Challenger 350 Aircraft Purchase",
    priority: "Low",
    category: "Legal",
    assignee: { name: "Aviation Team", initials: "AT", department: "Legal" },
    subtasks: [],
    tags: ["aircraft", "purchase"],
    dueDate: "2024-11-12",
    progress: 30,
    department: "Legal",
    type: "Task",
    clientInfo: "Acme Inc.",
    description: "Purchase Challenger 350 aircraft.",
    status: "Needs Work",
  },
  {
    id: "9",
    taskId: "HR-543-1",
    title: "Upgrade IT Infrastructure",
    priority: "High",
    category: "HR",
    assignee: { name: "Marley Bergson", initials: "MB", department: "HR" },
    subtasks: [],
    tags: ["IT", "upgrade"],
    dueDate: "2024-11-12",
    progress: 60,
    department: "HR",
    type: "Task",
    clientInfo: "Acme Inc.",
    description: "Upgrade IT infrastructure for the company.",
    status: "Needs Work",
  },
  {
    id: "10",
    taskId: "HR-543-2",
    title: "Annual Employee Training Program",
    priority: "Emergency",
    category: "HR",
    assignee: { name: "James Saris", initials: "JS", department: "HR" },
    subtasks: [],
    tags: ["training", "employee"],
    dueDate: "2024-11-12",
    progress: 20,
    department: "HR",
    type: "Task",
    clientInfo: "Acme Inc.",
    description: "Annual training program for all employees.",
    status: "Needs Work",
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
}: {
  showSettings?: boolean,
  setShowSettings?: (v: boolean) => void,
  cardFields?: Record<string, boolean>,
  setCardFields?: (v: Record<string, boolean>) => void,
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
    return (
      <Draggable key={task.id} draggableId={task.id} index={parseInt(task.id.replace(/\D/g, ""))}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`mb-3 ${isSubtask ? "ml-6" : ""}`}
          >
            <Card className="border-[#e8e8ec] rounded-2xl shadow-none">
              <CardContent className="p-6">
                {/* ID */}
                {cardFields.taskId && (
                  <div className="text-xs font-semibold text-[#60646c] mb-1">{task.taskId}</div>
                )}
                {/* Title (Name) */}
                {cardFields.name !== false && (
                  <div className="text-base font-semibold text-[#1c2024] mb-1">{task.title}</div>
                )}
                {/* Description */}
                {cardFields.description && task.description && (
                  <div className="text-sm text-[#8b8d98] mb-3 line-clamp-2">{task.description}</div>
                )}
                {/* Org + Avatars */}
                {cardFields.organization && (
                  <div className="flex items-center gap-2 mb-4">
                    {/* Org logo (placeholder gradient) */}
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 via-pink-400 to-purple-400 flex items-center justify-center">
                      <span className="sr-only">Org</span>
                    </span>
                    {/* Organization (clientInfo) */}
                    {cardFields.organization && (
                      <span className="text-sm text-[#1c2024] font-medium mr-2">{task.clientInfo}</span>
                    )}
                    {/* Avatars (mocked) */}
                    {cardFields.assignee && (
                      <div className="flex -space-x-2 ml-2">
                        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="" className="w-6 h-6 rounded-full border-2 border-white" />
                        <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="" className="w-6 h-6 rounded-full border-2 border-white" />
                        <span className="w-6 h-6 rounded-full bg-[#f3f3f3] text-xs text-[#60646c] flex items-center justify-center border-2 border-white">+5</span>
                      </div>
                    )}
                  </div>
                )}
                {/* Priority, Due */}
                <div className="flex items-center justify-between mb-4">
                  {cardFields.priority && (
                    <div className="flex items-center gap-2">
                      {/* Priority icon */}
                      {task.priority === "Normal" && <Layers className="w-4 h-4 text-[#0034dc]" />}
                      {task.priority === "High" && <ChevronDown className="w-4 h-4 text-[#e5484d] rotate-180" />}
                      {task.priority === "Emergency" && <ChevronDown className="w-4 h-4 text-[#e5484d] rotate-180" />}
                      <span className={`text-sm font-medium ${task.priority === "Emergency" || task.priority === "High" ? "text-[#e5484d]" : task.priority === "Low" ? "text-[#8b8d98]" : "text-[#0034dc]"}`}>{task.priority || "Normal"}</span>
                    </div>
                  )}
                  {cardFields.dueDate && (
                    <div className="text-sm text-[#8b8d98] flex items-center gap-1">
                      <span>Due:</span>
                      <span className="text-[#1c2024] font-medium">{task.dueDate}</span>
                    </div>
                  )}
                </div>
                {/* Bottom row: Subtasks, Attachments, Comments */}
                <div className="flex items-center gap-2">
                  {/* Subtask count as button */}
                  {cardFields.subtasks && task.subtasks && task.subtasks.length > 0 && (
                    <>
                      <button
                        type="button"
                        className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#f3f3f3] text-sm font-medium text-[#1c2024] hover:bg-[#e8e8ec] transition"
                        onClick={() => setExpandedSubtasks(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                      >
                        {expandedSubtasks[task.id] ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        {task.subtasks.length} subtasks
                      </button>
                      {expandedSubtasks[task.id] && (
                        <div className="mt-2 space-y-1 pl-8">
                          {task.subtasks.map((sub: any) => (
                            <div key={sub.id} className="flex items-center gap-2 py-1">
                              <span className="text-xs font-medium text-[#1c2024]">{sub.title}</span>
                              <span className="text-xs text-[#8b8d98]">{sub.status}</span>
                              <span className="text-xs text-[#8b8d98]">{sub.dueDate}</span>
                              {sub.assignee && <span className="text-xs text-[#8b8d98]">{sub.assignee.name}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  <span className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#f3f3f3] text-sm text-[#60646c] ml-auto">
                    <Paperclip className="w-4 h-4" />2
                  </span>
                  <span className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#f3f3f3] text-sm text-[#60646c]">
                    <MessageCircle className="w-4 h-4" />2
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Draggable>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full w-full">
        {/* Kanban scroll area with padding */}
        <div className="flex-1 overflow-auto px-6 pt-6 pb-4">
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div className="flex gap-6 min-h-[600px]">
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
                              className={`flex flex-col items-center justify-center min-w-[72px] max-w-[72px] h-full rounded-lg border p-0 cursor-pointer select-none relative group ${groupColor} ${isDropDisabled && draggedTask ? "opacity-50 cursor-not-allowed border-dashed" : ""} ${snapshot.isDraggingOver && !isDropDisabled ? "ring-2 ring-blue-400" : ""}`}
                              onClick={() => setCollapsed(c => ({ ...c, [column.id]: false }))}
                            >
                              <div className="flex flex-col items-center justify-center w-full h-full py-8">
                                <span className="font-bold text-lg text-black mb-4 text-center" style={{ writingMode: "vertical-rl", textOrientation: "mixed", letterSpacing: "0.05em" }}>{column.title}</span>
                                <span className="bg-white text-black text-base font-semibold rounded-xl px-4 py-1 mb-4 shadow border border-gray-200 text-center">{columnTasks.length}</span>
                                <button
                                  className="rounded hover:bg-gray-100 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setCollapsed(c => ({ ...c, [column.id]: false }));
                                  }}
                                  title="Expand group"
                                >
                                  <ChevronRight className="w-5 h-5 text-gray-400" />
                                </button>
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
                          } ${
                            snapshot.isDraggingOver && !isDropDisabled
                              ? "ring-2 ring-blue-400"
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1 px-6 pt-6 pb-1 group">
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
                                  className="rounded-full hover:bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
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
                                    className="rounded-full hover:bg-gray-100 text-gray-400"
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
                              <Tooltip>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="rounded-full hover:bg-gray-100 text-gray-400"
                                  title="More actions"
                                  onClick={e => { e.stopPropagation(); }}
                                >
                                  <span className="sr-only">More</span>
                                  <span className="text-lg">...</span>
                                </Button>
                              </Tooltip>
                            </div>
                        </div>
                          <div className="flex-1 overflow-y-auto px-4 pb-4">
                            {columnTasks.length === 0 && (
                              <div className="text-xs text-gray-400 flex-1 flex items-center justify-center">No tasks</div>
                      )}
                            {columnTasks.map((task: any, idx: number) => renderCard(task))}
                  {provided.placeholder}
                </div>
                        </div>
                      )
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
        </div>
      </div>
    </TooltipProvider>
  );
} 