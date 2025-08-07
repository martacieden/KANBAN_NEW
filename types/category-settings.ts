export interface CategoryGroupSettings {
  enabledGroups: Record<string, boolean>;
  groupOrder: string[];
}

export interface CategorySettings {
  [categoryName: string]: CategoryGroupSettings;
}

export interface StatusGroup {
  id: string;
  title: string;
  subtitle: string;
  color?: string;
  statuses?: string[];
} 