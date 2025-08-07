"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CategorySettings, CategoryGroupSettings, StatusGroup } from '../types/category-settings';

interface CategorySettingsContextType {
  getCategorySettings: (category: string) => CategoryGroupSettings;
  updateCategorySettings: (category: string, settings: CategoryGroupSettings) => void;
  resetCategorySettings: (category: string) => void;
  getCategoryGroups: (category: string) => StatusGroup[];
}

const CategorySettingsContext = createContext<CategorySettingsContextType | undefined>(undefined);

const STORAGE_KEY = "category-group-settings";

// Дефолтні групи для кожної категорії
const CATEGORY_GROUPS: Record<string, StatusGroup[]> = {
  "Budget": [
    { id: "to_do", title: "To Do", subtitle: "Planning & Preparation" },
    { id: "in_progress", title: "In Progress", subtitle: "Active Work" },
    { id: "in_review", title: "In Review", subtitle: "Under Review" },
    { id: "approved", title: "Approved", subtitle: "Approved & Completed" },
    { id: "rejected", title: "Rejected", subtitle: "Rejected or Canceled" }
  ],
  "Legal": [
    { id: "draft", title: "Draft", subtitle: "Initial Draft" },
    { id: "review", title: "Review", subtitle: "Legal Review" },
    { id: "pending", title: "Pending", subtitle: "Pending Approval" },
    { id: "finalized", title: "Finalized", subtitle: "Document Finalized" },
    { id: "rejected", title: "Rejected", subtitle: "Document Rejected" }
  ],
  "HR": [
    { id: "open", title: "Open", subtitle: "Position Open" },
    { id: "screening", title: "Screening", subtitle: "Candidate Screening" },
    { id: "interviewing", title: "Interviewing", subtitle: "Interview Process" },
    { id: "hired", title: "Hired", subtitle: "Successfully Hired" },
    { id: "rejected", title: "Rejected", subtitle: "Candidate Rejected" }
  ],
  "Philanthropy": [
    { id: "proposal", title: "Proposal", subtitle: "Grant Proposal" },
    { id: "evaluation", title: "Evaluation", subtitle: "Under Evaluation" },
    { id: "approved", title: "Approved", subtitle: "Grant Approved" },
    { id: "funded", title: "Funded", subtitle: "Funds Disbursed" },
    { id: "rejected", title: "Rejected", subtitle: "Grant Rejected" }
  ],
  "Investment": [
    { id: "research", title: "Research", subtitle: "Market Research" },
    { id: "analysis", title: "Analysis", subtitle: "Investment Analysis" },
    { id: "decision", title: "Decision", subtitle: "Investment Decision" },
    { id: "executed", title: "Executed", subtitle: "Investment Executed" },
    { id: "rejected", title: "Rejected", subtitle: "Investment Rejected" }
  ],
  "Food": [
    { id: "planning", title: "Planning", subtitle: "Menu Planning" },
    { id: "preparation", title: "Preparation", subtitle: "Food Preparation" },
    { id: "serving", title: "Serving", subtitle: "Food Service" },
    { id: "completed", title: "Completed", subtitle: "Service Completed" },
    { id: "cancelled", title: "Cancelled", subtitle: "Service Cancelled" }
  ],
  "Travel": [
    { id: "planning", title: "Planning", subtitle: "Trip Planning" },
    { id: "booking", title: "Booking", subtitle: "Making Bookings" },
    { id: "confirmed", title: "Confirmed", subtitle: "Travel Confirmed" },
    { id: "cancelled", title: "Cancelled", subtitle: "Travel Cancelled" }
  ],
  "Accounting": [
    { id: "pending", title: "Pending", subtitle: "Pending Processing" },
    { id: "processing", title: "Processing", subtitle: "Under Processing" },
    { id: "review", title: "Review", subtitle: "Under Review" },
    { id: "completed", title: "Completed", subtitle: "Processing Completed" },
    { id: "rejected", title: "Rejected", subtitle: "Processing Rejected" }
  ]
};

// Дефолтні групи для "All tasks"
const ALL_TASKS_GROUPS: StatusGroup[] = [
  { id: "CREATED", title: "Created", subtitle: "Not started yet" },
  { id: "ACTIVE", title: "Active", subtitle: "In progress" },
  { id: "PAUSED", title: "Paused", subtitle: "Temporarily paused" },
  { id: "COMPLETED", title: "Completed", subtitle: "Successfully completed" },
  { id: "REJECTED", title: "Rejected", subtitle: "Rejected or canceled" }
];

export function CategorySettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CategorySettings>({});

  // Завантаження налаштувань з localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading category settings:', error);
      }
    }
  }, []);

  // Збереження налаштувань в localStorage
  const saveSettings = (newSettings: CategorySettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  };

  // Отримання дефолтних налаштувань для категорії
  const getDefaultSettings = (category: string): CategoryGroupSettings => {
    const groups = getCategoryGroups(category);
    return {
      enabledGroups: Object.fromEntries(groups.map(g => [g.id, true])),
      groupOrder: groups.map(g => g.id)
    };
  };

  // Отримання налаштувань для категорії
  const getCategorySettings = (category: string): CategoryGroupSettings => {
    if (category === "All tasks") {
      return {
        enabledGroups: Object.fromEntries(ALL_TASKS_GROUPS.map(g => [g.id, true])),
        groupOrder: ALL_TASKS_GROUPS.map(g => g.id)
      };
    }
    
    const savedSettings = settings[category];
    if (savedSettings) {
      return savedSettings;
    }
    
    // Повертаємо дефолтні налаштування для категорії
    return getDefaultSettings(category);
  };



  // Оновлення налаштувань для категорії
  const updateCategorySettings = (category: string, newSettings: CategoryGroupSettings) => {
    const updatedSettings = {
      ...settings,
      [category]: newSettings
    };
    saveSettings(updatedSettings);
  };

  // Скидання налаштувань для категорії
  const resetCategorySettings = (category: string) => {
    const updatedSettings = { ...settings };
    delete updatedSettings[category];
    saveSettings(updatedSettings);
  };

  // Отримання груп для категорії
  const getCategoryGroups = (category: string): StatusGroup[] => {
    if (category === "All tasks") {
      return ALL_TASKS_GROUPS;
    }
    
    return CATEGORY_GROUPS[category] || ALL_TASKS_GROUPS;
  };

  const value: CategorySettingsContextType = {
    getCategorySettings,
    updateCategorySettings,
    resetCategorySettings,
    getCategoryGroups
  };

  return (
    <CategorySettingsContext.Provider value={value}>
      {children}
    </CategorySettingsContext.Provider>
  );
}

export function useCategorySettings() {
  const context = useContext(CategorySettingsContext);
  if (context === undefined) {
    throw new Error('useCategorySettings must be used within a CategorySettingsProvider');
  }
  return context;
} 