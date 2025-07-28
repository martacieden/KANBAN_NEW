import React, { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Paperclip, MoreHorizontal, Share2, X } from "lucide-react";

interface Assignee {
  name: string;
  initials: string;
  department?: string;
  avatarUrl?: string;
}

interface Subtask {
  id: string;
  taskId: string;
  title: string;
  status: string;
  assignee: Assignee;
  dueDate: string;
}

export interface Task {
  id: string;
  taskId: string;
  title: string;
  priority: string;
  category: string;
  assignee: Assignee;
  subtasks?: Subtask[];
  tags?: string[];
  dueDate?: string;
  progress?: number;
  department?: string;
  type?: string;
  clientInfo?: string;
  description?: string;
  status?: string;
  attachments?: { name: string; url: string }[];
  comments?: { author: string; text: string; date: string }[];
  project?: string;
  workspace?: string;
  createdAt?: string;
  reportedBy?: string;
  reportedByAvatar?: string;
  assigneeAvatar?: string;
}

interface TaskPreviewProps {
  task: Task;
  onClose?: () => void;
}

const TABS = ["Overview", "Comments", "History"];

export const TaskPreview: React.FC<TaskPreviewProps> = ({ task, onClose }) => {
  const [activeTab, setActiveTab] = useState("Overview");

  // Мок дані для стека користувачів (заміни на реальні з task, якщо є)
  const users = [
    { name: "Marley Bergson", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
    { name: "Anna Smith", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  ];
  const extraCount = 5;

  return (
    <div className="w-[420px] max-w-[420px] h-full bg-white border-l border-[#e8e8ec] flex flex-col shadow-xl overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-6 pb-2 border-b border-[#e8e8ec] relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {task.status && (
              <Badge className="bg-blue-100 text-blue-700 font-medium px-2 py-1 text-xs rounded">{task.status}</Badge>
            )}
            {task.createdAt && (
              <span className="text-xs text-[#8b8d98]">Created on {task.createdAt}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Стек аватарів */}
            <div className="flex -space-x-2 ml-2">
              {users.map((user, idx) => (
                <Avatar key={idx} className="w-7 h-7 border-2 border-white">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
              ))}
              <span className="w-7 h-7 rounded-full bg-[#f3f3f3] text-xs text-[#60646c] flex items-center justify-center border-2 border-white">+{extraCount}</span>
            </div>
            <Button variant="ghost" size="icon" className="ml-2"><Share2 className="w-5 h-5" /></Button>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
            )}
          </div>
        </div>
        <h2 className="text-lg font-semibold text-[#1c2024] mb-1">{task.title}</h2>
        <div className="text-xs text-[#8b8d98] mb-2">Last modified by <span className="font-medium text-[#1c2024]">IM</span> Today at 11:34 AM</div>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-[#e8e8ec] bg-white px-6">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? "border-[#0034dc] text-[#0034dc]" : "border-transparent text-[#60646c] hover:text-[#0034dc]"}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      {/* Tab content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === "Overview" && (
          <>
            {/* Details */}
            <div className="mb-6">
              <div className="font-semibold text-base mb-3">Details</div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div>
                  <div className="text-[#8b8d98]">Status</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-blue-100 text-blue-700 font-medium px-2 py-1 text-xs rounded">{task.status}</Badge>
                  </div>
                </div>
                <div>
                  <div className="text-[#8b8d98]">Workspace</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-[#f3f3f3] text-[#1c2024] font-medium px-2 py-1 text-xs rounded">S</Badge>
                    <span>Smith Family</span>
                  </div>
                </div>
                <div>
                  <div className="text-[#8b8d98]">Category</div>
                  <div className="mt-1">Green initiatives</div>
                </div>
                <div>
                  <div className="text-[#8b8d98]">Reported by</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="w-6 h-6"><AvatarImage src={task.reportedByAvatar} /><AvatarFallback>JS</AvatarFallback></Avatar>
                    <span>Jane Smith</span>
                  </div>
                </div>
                <div>
                  <div className="text-[#8b8d98]">Assignee</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={task.assignee.avatarUrl || "https://randomuser.me/api/portraits/men/32.jpg"} />
                      <AvatarFallback className="text-xs bg-gray-100">{task.assignee.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-[13px] font-normal leading-5 text-[#1c2024]">{task.assignee.name}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[#8b8d98]">Due date</div>
                  <div className="mt-1">Nov 10, 2024</div>
                </div>
                <div>
                  <div className="text-[#8b8d98]">Priority</div>
                  <div className="flex items-center gap-2 mt-1">
                    {(task.priority === "Emergency" || task.priority === "High") && (
                      <span className="text-[#e5484d] text-lg">↑</span>
                    )}
                    {task.priority === "Low" && (
                      <span className="text-green-500 text-lg">↓</span>
                    )}
                    {task.priority === "Normal" && (
                      <span className="text-[#0034dc] text-lg">—</span>
                    )}
                    <span className={`font-semibold ${
                      task.priority === "Emergency" || task.priority === "High" 
                        ? "text-[#e5484d]" 
                        : task.priority === "Low" 
                        ? "text-[#8b8d98]" 
                        : "text-[#0034dc]"
                    }`}>
                      {task.priority || "Normal"}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[#8b8d98]">Project</div>
                  <div className="mt-1">EcoPower</div>
                </div>
              </div>
            </div>
            {/* ID */}
            <div className="mb-6">
              <div className="font-semibold text-base mb-1">ID</div>
              <div className="text-sm text-[#1c2024] font-mono">{task.taskId || task.id}</div>
            </div>
            {/* Description */}
            {task.description && (
              <div className="mb-6">
                <div className="font-semibold text-base mb-1">Description</div>
                <div className="text-sm text-[#8b8d98] whitespace-pre-line">{task.description}</div>
              </div>
            )}
            {/* Subtasks */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-base">Subtasks</div>
                  <div className="text-sm text-[#8b8d98]">
                    {task.subtasks.filter(st => st.status === "Done").length} of {task.subtasks.length} completed
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${(task.subtasks.filter(st => st.status === "Done").length / task.subtasks.length) * 100}%` 
                    }}
                  ></div>
                </div>
                {/* Subtasks list */}
                <div className="space-y-2">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-3 p-3 bg-[#fafbfc] rounded-lg border border-[#e8e8ec]">
                      <div className="flex items-center gap-2 flex-1">
                        <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                          <path d="M6 9l6 0" />
                          <path d="M4 5l4 0" />
                          <path d="M6 5v11a1 1 0 0 0 1 1h5" />
                          <path d="M12 7m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z" />
                          <path d="M12 15m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z" />
                        </svg>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-[#60646c] mb-1">{subtask.taskId}</div>
                          <div className="text-sm font-medium text-[#1c2024]">{subtask.title}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs px-2 py-1 ${
                            subtask.status === "Done" ? "bg-green-100 text-green-700 border-green-200" :
                            subtask.status === "In Progress" ? "bg-blue-100 text-blue-700 border-blue-200" :
                            subtask.status === "Verified" ? "bg-purple-100 text-purple-700 border-purple-200" :
                            "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          {subtask.status}
                        </Badge>
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={subtask.assignee.avatarUrl || "https://randomuser.me/api/portraits/men/32.jpg"} />
                          <AvatarFallback className="text-xs bg-gray-100">
                            {subtask.assignee.initials}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="mb-6">
                <div className="font-semibold text-base mb-2">Attachments</div>
                <ul className="space-y-2">
                  {task.attachments.map((att, idx) => (
                    <li key={idx} className="flex items-center gap-2 bg-[#fafbfc] rounded px-2 py-2 border border-[#e8e8ec]">
                      <Paperclip className="w-4 h-4 text-[#0034dc]" />
                      <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-[#0034dc] underline text-sm font-medium">{att.name}</a>
                      <Button variant="ghost" size="icon" className="ml-auto"><MoreHorizontal className="w-4 h-4" /></Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
        {activeTab === "Comments" && (
          <div className="text-sm text-[#8b8d98]">No comments yet.</div>
        )}
        {activeTab === "History" && (
          <div className="text-sm text-[#8b8d98]">History is not implemented yet.</div>
        )}
      </div>
    </div>
  );
};

export default TaskPreview; 