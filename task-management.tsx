"use client"

import { useState } from "react"
import { Search, Filter, Settings, Share, Plus, MoreHorizontal, ChevronRight, ChevronDown, Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import TopBar from "./components/topbar";
import Sidebar from "./components/sidebar";

export default function Component() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Food"])

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  // Видаляю sidebarItems і все, що стосується Sidebar

  type ViewSettingKey = 'id' | 'name' | 'organization' | 'status' | 'steps' | 'description' | 'attachments' | 'comments' | 'assignees' | 'dueDate';
  const [viewSettings, setViewSettings] = useState<Record<ViewSettingKey, boolean>>({
    id: true,
    name: true,
    organization: true,
    status: true,
    steps: true,
    description: false,
    attachments: false,
    comments: false,
    assignees: true,
    dueDate: true,
  })
  const [showViewSettings, setShowViewSettings] = useState(false)

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

  return (
    <div className="flex h-screen bg-[#fcfcfd]">
      {/* Sidebar (тільки одне меню з іконками, логотипом і Help) */}
      <Sidebar />
      {/* Контентна частина */}
      <div className="flex-1 flex flex-col">
        {/* TopBar на всю ширину */}
        <TopBar />
        {/* Tasks Panel + Task Board */}
        <div className="flex flex-1">
          {/* Tasks Panel (тільки Tasks, категорії, New category) */}
          <div className="w-80 bg-[#ffffff] border-r border-[#e8e8ec] flex flex-col">
            <div className="flex-1 p-4">
              <h3 className="text-lg font-semibold text-[#1c2024] mb-4">Tasks</h3>
              <div className="space-y-1">
                {taskCategories.map((category, index) => (
                  <div key={index}>
                    <div
                      className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer ${
                        category.active ? "bg-[#ebf3ff] text-[#004fc7]" : "text-[#60646c] hover:bg-[#f9f9fb]"
                      }`}
                      onClick={() => category.name === "Food" && toggleCategory(category.name)}
                    >
                      <div className="flex items-center gap-2">
                        {category.name === "Food" &&
                          (expandedCategories.includes("Food") ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          ))}
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
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
          {/* Task Board (основний контент) */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-[#ffffff] border-b border-[#e8e8ec] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#8b8d98]"></div>
                    <span className="text-sm text-[#60646c]">All tasks</span>
                    <Badge variant="secondary" className="bg-[#f0f0f3] text-[#60646c]">
                      303
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[#60646c]">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                  <Button variant="ghost" size="sm" className="text-[#60646c]" onClick={() => setShowViewSettings(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    View setting
                  </Button>
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
                  <Button className="bg-[#0034dc] hover:bg-[#004fc7]">
                    <Plus className="w-4 h-4 mr-2" />
                    New task
                  </Button>
                  <Bell className="w-5 h-5 text-[#60646c]" />
                </div>
              </div>
            </div>
            {/* Task Board */}
            <div className="flex-1 p-6">
              <div className="flex gap-6 h-full">
                {/* To Do Column */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#1c2024]">To do</h3>
                      <Badge className="bg-[#8b8d98] text-white">6</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#8b8d98] cursor-pointer" />
                      <MoreHorizontal className="w-4 h-4 text-[#8b8d98] cursor-pointer" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Task Card 1 */}
                    <Card className="border-[#e8e8ec]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-[#60646c]">FCLT-771</span>
                        </div>
                        <h4 className="font-medium text-[#1c2024] mb-2">Update Calls, Distributions</h4>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-[#60646c]">Acme Inc.</span>
                          <span className="text-xs bg-[#e8e8ec] px-2 py-1 rounded text-[#60646c]">MB</span>
                          <span className="text-sm text-[#60646c]">Marley Bergson</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <ChevronDown className="w-4 h-4 text-[#e5484d]" />
                            <span className="text-sm text-[#e5484d]">Emergency</span>
                          </div>
                          <span className="text-sm text-[#e5484d]">Due: Nov 12, 2024</span>
                        </div>
                        <div className="text-sm text-[#60646c]">
                          <ChevronRight className="w-4 h-4 inline mr-1" />2 subtasks
                        </div>
                      </CardContent>
                    </Card>

                    {/* Task Card 2 */}
                    <Card className="border-[#e8e8ec]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-[#60646c]">INVST-344</span>
                        </div>
                        <h4 className="font-medium text-[#1c2024] mb-2">Renew insurance on Sand Lane</h4>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-[#60646c]">Acme Inc.</span>
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-[#1c2024] text-white text-xs">JT</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-[#60646c]">Justin's team</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <ChevronDown className="w-4 h-4 text-[#8b8d98]" />
                            <span className="text-sm text-[#8b8d98]">Low</span>
                          </div>
                          <span className="text-sm text-[#60646c]">Due: Nov 12, 2024</span>
                        </div>
                        <div className="text-sm text-[#60646c]">
                          <ChevronDown className="w-4 h-4 inline mr-1" />2 subtasks
                        </div>
                      </CardContent>
                    </Card>

                    {/* Task Card 3 */}
                    <Card className="border-[#e8e8ec]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-[#60646c]">LFST-133</span>
                        </div>
                        <h4 className="font-medium text-[#1c2024] mb-2">Define goals</h4>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-[#60646c]">Acme Inc.</span>
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-[#bea887] text-white text-xs">CC</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-[#60646c]">Cheyenne Calzoni</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ChevronDown className="w-4 h-4 text-[#8b8d98]" />
                            <span className="text-sm text-[#8b8d98]">Low</span>
                          </div>
                          <span className="text-sm text-[#60646c]">Due: Nov 12, 2024</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Task Card 4 */}
                    <Card className="border-[#e8e8ec]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-[#60646c]">IT-334</span>
                        </div>
                        <h4 className="font-medium text-[#1c2024] mb-2">Categorize expenses</h4>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-[#60646c]">Acme Inc.</span>
                          <span className="text-xs bg-[#e8e8ec] px-2 py-1 rounded text-[#60646c]">CF</span>
                          <span className="text-sm text-[#60646c]">Carla Franci</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#0034dc] rounded-full"></div>
                            <span className="text-sm text-[#60646c]">Normal</span>
                          </div>
                          <span className="text-sm text-[#60646c]">Due: Nov 12, 2024</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* In Progress Column */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#1c2024]">In progress</h3>
                      <Badge className="bg-[#0034dc] text-white">3</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#8b8d98] cursor-pointer" />
                      <MoreHorizontal className="w-4 h-4 text-[#8b8d98] cursor-pointer" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Task Card 1 - Enhanced */}
                    <Card className="border-[#e8e8ec]">
                      <CardContent className="p-4">
                        {viewSettings.id && (
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-medium text-[#60646c]">INVST-83</span>
                            <ChevronRight className="w-4 h-4 text-[#8b8d98]" />
                          </div>
                        )}
                        {viewSettings.name && (
                          <h4 className="font-medium text-[#1c2024] mb-2">Set up family office budget</h4>
                        )}
                        {viewSettings.description && (
                          <p className="text-sm text-[#8b8d98] mb-3">
                            Update the estate plan during major life events (e.g., marriage/divorce, children,
                            inheritance)....
                          </p>
                        )}
                        {viewSettings.organization && (
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm text-[#60646c]">Acme Inc.</span>
                          </div>
                        )}
                        {viewSettings.assignees && (
                          <div className="flex items-center gap-2 mb-3">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="bg-[#bea887] text-white text-xs">+5</AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-2">
                          {viewSettings.status && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-[#0034dc] rounded-full"></div>
                              <span className="text-sm text-[#60646c]">Normal</span>
                            </div>
                          )}
                          {viewSettings.dueDate && <span className="text-sm text-[#60646c]">Due: Nov 12, 2024</span>}
                        </div>
                        {viewSettings.steps && (
                          <div className="text-sm text-[#60646c]">
                            <ChevronRight className="w-4 h-4 inline mr-1" />5 subtasks
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Task Card 2 */}
                    <Card className="border-[#e8e8ec]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-[#60646c]">INVST-773</span>
                        </div>
                        <h4 className="font-medium text-[#1c2024] mb-2">Screening and approving tenants</h4>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-[#60646c]">Acme Inc.</span>
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-[#1c2024] text-white text-xs">GT</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-[#60646c]">Gretchen's team</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ChevronDown className="w-4 h-4 text-[#e5484d]" />
                            <span className="text-sm text-[#e5484d]">High</span>
                          </div>
                          <span className="text-sm text-[#60646c]">Due: Nov 12, 2024</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Task Card 3 */}
                    <Card className="border-[#e8e8ec]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-[#60646c]">HR-678</span>
                        </div>
                        <h4 className="font-medium text-[#1c2024] mb-2">Home Security Enhancement</h4>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-[#60646c]">Acme Inc.</span>
                          <span className="text-xs bg-[#e8e8ec] px-2 py-1 rounded text-[#60646c]">GL</span>
                          <span className="text-sm text-[#60646c]">Giana Levin</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#0034dc] rounded-full"></div>
                            <span className="text-sm text-[#60646c]">Normal</span>
                          </div>
                          <span className="text-sm text-[#60646c]">Due: Nov 12, 2024</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Button
                      variant="ghost"
                      className="w-full justify-center text-[#60646c] border-2 border-dashed border-[#e8e8ec]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add task
                    </Button>
                  </div>
                </div>

                {/* Needs Work Column */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#1c2024]">Needs work</h3>
                      <Badge className="bg-[#ffc53d] text-[#ab6400]">3</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#8b8d98] cursor-pointer" />
                      <MoreHorizontal className="w-4 h-4 text-[#8b8d98] cursor-pointer" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Task Card 1 */}
                    <Card className="border-[#e8e8ec]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-[#60646c]">RLST-234</span>
                        </div>
                        <h4 className="font-medium text-[#1c2024] mb-2">Challenger 350 Aircraft Purchase</h4>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-[#60646c]">Acme Inc.</span>
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-[#bea887] text-white text-xs">+5</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ChevronDown className="w-4 h-4 text-[#8b8d98]" />
                            <span className="text-sm text-[#8b8d98]">Low</span>
                          </div>
                          <span className="text-sm text-[#60646c]">Due: Nov 12, 2024</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Task Card 2 */}
                    <Card className="border-[#e8e8ec]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-[#60646c]">HR-543</span>
                        </div>
                        <h4 className="font-medium text-[#1c2024] mb-2">Upgrade IT Infrastructure</h4>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-[#60646c]">Acme Inc.</span>
                          <span className="text-xs bg-[#e8e8ec] px-2 py-1 rounded text-[#60646c]">MB</span>
                          <span className="text-sm text-[#60646c]">Marley Bergson</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ChevronDown className="w-4 h-4 text-[#e5484d]" />
                            <span className="text-sm text-[#e5484d]">High</span>
                          </div>
                          <span className="text-sm text-[#60646c]">Due: Nov 12, 2024</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Task Card 3 */}
                    <Card className="border-[#e8e8ec]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-[#60646c]">HR-543</span>
                        </div>
                        <h4 className="font-medium text-[#1c2024] mb-2">Annual Employee Training Program</h4>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-[#60646c]">Acme Inc.</span>
                          <span className="text-xs bg-[#e8e8ec] px-2 py-1 rounded text-[#60646c]">JS</span>
                          <span className="text-sm text-[#60646c]">James Saris</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ChevronDown className="w-4 h-4 text-[#e5484d]" />
                            <span className="text-sm text-[#e5484d]">Emergency</span>
                          </div>
                          <span className="text-sm text-[#60646c]">Due: Nov 12, 2024</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Button
                      variant="ghost"
                      className="w-full justify-center text-[#60646c] border-2 border-dashed border-[#e8e8ec]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add task
                    </Button>
                  </div>
                </div>

                {/* Done Column */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#1c2024]">Done</h3>
                      <Badge className="bg-[#30a46c] text-white">0</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#8b8d98] cursor-pointer" />
                      <MoreHorizontal className="w-4 h-4 text-[#8b8d98] cursor-pointer" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-center text-[#60646c] border-2 border-dashed border-[#e8e8ec]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add task
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* View Settings Modal */}
        {showViewSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#60646c]" />
                  <h3 className="text-lg font-semibold text-[#1c2024]">View setting</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowViewSettings(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b8d98] w-4 h-4" />
                <Input placeholder="Search" className="pl-10 bg-[#f9f9fb] border-[#e8e8ec]" />
              </div>

              <div className="space-y-4">
                {[
                  { key: "id", label: "ID (Pinned)", pinned: true },
                  { key: "name", label: "Name (Pinned)", pinned: true },
                  { key: "organization", label: "Organization", pinned: false },
                  { key: "status", label: "Status", pinned: false },
                  { key: "steps", label: "Steps", pinned: false },
                  { key: "description", label: "Description", pinned: false },
                  { key: "attachments", label: "Attachments", pinned: false },
                  { key: "comments", label: "Comments", pinned: false },
                  { key: "assignees", label: "Assignees", pinned: false },
                  { key: "dueDate", label: "Due Date", pinned: false },
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <span className="text-sm text-[#1c2024]">{setting.label}</span>
                    <button
                      onClick={() =>
                        !setting.pinned &&
                        setViewSettings((prev) => ({
                          ...prev,
                          [setting.key as ViewSettingKey]: !prev[setting.key as ViewSettingKey],
                        }))
                      }
                      className={`w-12 h-6 rounded-full transition-colors ${
                        viewSettings[setting.key as ViewSettingKey] ? "bg-[#0034dc]" : "bg-[#e8e8ec]"
                      } ${setting.pinned ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow transition-transform flex items-center justify-center ${
                          viewSettings[setting.key as ViewSettingKey] ? "translate-x-6" : "translate-x-0.5"
                        }`}
                      >
                        {viewSettings[setting.key as ViewSettingKey] && <div className="w-2 h-2 bg-[#0034dc] rounded-full"></div>}
                      </div>
                    </button>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full mt-6 bg-transparent"
                onClick={() =>
                  setViewSettings({
                    id: true,
                    name: true,
                    organization: true,
                    status: true,
                    steps: false,
                    description: false,
                    attachments: false,
                    comments: false,
                    assignees: true,
                    dueDate: true,
                  })
                }
              >
                Reset to default
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
