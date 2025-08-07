"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';
import { useCategorySettings } from '../contexts/CategorySettingsContext';
import { CategoryGroupSettings, StatusGroup } from '../types/category-settings';

interface CategoryGroupSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeCategory: string;
}

export default function CategoryGroupSettingsModal({
  open,
  onOpenChange,
  activeCategory
}: CategoryGroupSettingsModalProps) {
  const { getCategorySettings, updateCategorySettings, resetCategorySettings, getCategoryGroups } = useCategorySettings();
  
  const [settings, setSettings] = useState<CategoryGroupSettings>({
    enabledGroups: {},
    groupOrder: []
  });
  
  const [groups, setGroups] = useState<StatusGroup[]>([]);

  // Завантаження груп при відкритті модального вікна
  useEffect(() => {
    if (open) {
      const categoryGroups = getCategoryGroups(activeCategory);
      setGroups(categoryGroups);
      
      // Створюємо прості дефолтні налаштування
      const defaultSettings = {
        enabledGroups: Object.fromEntries(categoryGroups.map(g => [g.id, true])),
        groupOrder: categoryGroups.map(g => g.id)
      };
      setSettings(defaultSettings);
    }
  }, [open, activeCategory, getCategoryGroups]);

  // Обробка зміни перемикача групи
  const handleToggleGroup = (groupId: string) => {
    setSettings(prev => ({
      ...prev,
      enabledGroups: {
        ...prev.enabledGroups,
        [groupId]: !prev.enabledGroups[groupId]
      }
    }));
  };

  // Обробка зміни порядку групи
  const moveGroup = (groupId: string, direction: 'up' | 'down') => {
    const currentIndex = settings.groupOrder.indexOf(groupId);
    if (currentIndex === -1) return;
    
    const newOrder = [...settings.groupOrder];
    if (direction === 'up' && currentIndex > 0) {
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
    } else if (direction === 'down' && currentIndex < newOrder.length - 1) {
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
    }
    
    setSettings(prev => ({
      ...prev,
      groupOrder: newOrder
    }));
  };

  // Скасування змін
  const handleCancel = () => {
    onOpenChange(false);
  };

  // Отримання відсортованих груп за поточним порядком
  const sortedGroups = groups
    .filter(group => settings.enabledGroups[group.id] !== false)
    .sort((a, b) => {
      const aIndex = settings.groupOrder.indexOf(a.id);
      const bIndex = settings.groupOrder.indexOf(b.id);
      return aIndex - bIndex;
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Групи статусів для {activeCategory}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Групи статусів, які відображаються на канбан дошці
          </div>
          
          <div className="space-y-2">
            {groups.map((group, index) => (
              <div key={group.id} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50">
                <div>
                  <div className="text-sm font-medium">{group.title}</div>
                  <div className="text-xs text-gray-500">{group.subtitle}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveGroup(group.id, 'up')}
                      disabled={index === 0}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveGroup(group.id, 'down')}
                      disabled={index === groups.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Switch
                    checked={settings.enabledGroups[group.id] !== false}
                    onCheckedChange={() => handleToggleGroup(group.id)}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {groups.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              Немає груп для відображення
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Закрити
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 