export enum GroceryItemStatus {
  HAVE = 'HAVE',
  RANOUT = 'RANOUT'
}

export interface GroceryItemHistory {
  id: string;
  status: GroceryItemStatus;
  changedAt: string;
}

export interface GroceryItemHistoryResponse {
  data: GroceryItemHistory[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  priority: number;
  status: GroceryItemStatus;
  shoppingListId: string;
  notes?: string;
  history: GroceryItemHistory[];
  createdAt: string;
  updatedAt: string;
  isOptimistic?: boolean; // Used for optimistic UI updates
}

export interface CreateGroceryItemInput {
  name: string;
  quantity?: number;
  priority?: number;
  status?: GroceryItemStatus;
  shoppingListId: string;
  notes?: string;
}

export interface UpdateGroceryItemInput {
  name?: string;
  quantity?: number;
  priority?: number;
  status?: GroceryItemStatus;
  notes?: string;
}

export interface GroceryListResponse {
  data: GroceryItem[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateGroceryItemApiResponse {
  data: GroceryItem;
}

// Priority labels for better UX
export const priorityLabels: Record<number, string> = {
  1: 'Highest',
  2: 'High',
  3: 'Medium',
  4: 'Low',
  5: 'Lowest',
};

// Priority colors for visual indication
export const priorityColors: Record<number, string> = {
  1: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  2: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  3: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  4: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  5: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
};

// Status colors for visual indication
export const statusColors: Record<GroceryItemStatus, string> = {
  [GroceryItemStatus.HAVE]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [GroceryItemStatus.RANOUT]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};
