import { GroceryItemStatus } from "@/types/grocery";

type GroceryQueryParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  search?: string;
  shoppingListId: string;
};

// Types
type SortField = 'priority' | 'name';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | GroceryItemStatus;

export type { GroceryQueryParams, SortField, SortDirection, StatusFilter };
