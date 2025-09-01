'use server';

import { GroceryService } from '@/services/grocery-service';
import { GroceryItem, CreateGroceryItemInput, UpdateGroceryItemInput, GroceryItemHistoryResponse } from '@/types/grocery';

const service = new GroceryService();

export interface GroceryListResponse {
  data: any[];
  meta?: any;
}

export async function getGroceryItems(shoppingListId: string, params: Record<string, any> = {}): Promise<GroceryListResponse> {
  try {
    const response = await service.getByShoppingList(shoppingListId, params);
    console.log('getGroceryItems response:', response);

    // If response is already in the correct format with data array
    if (response && 'data' in response && Array.isArray(response.data)) {
      return {
        data: response.data,
        meta: response.meta || {
          total: response.data.length,
          page: Number(params.page) || 1,
          limit: Number(params.limit) || 10,
          totalPages: 1
        }
      };
    }

    // If response is just an array, wrap it in the correct format
    if (Array.isArray(response)) {
      return {
        data: response,
        meta: {
          total: response.length,
          page: Number(params.page) || 1,
          limit: Number(params.limit) || 10,
          totalPages: 1
        }
      };
    }

    // Fallback for any other case
    console.warn('Unexpected response format in getGroceryItems:', response);
    return {
      data: [],
      meta: {
        total: 0,
        page: Number(params.page) || 1,
        limit: Number(params.limit) || 10,
        totalPages: 0
      }
    };
  } catch (error) {
    console.error('Error in getGroceryItems:', error);
    return {
      data: [],
      meta: {
        total: 0,
        page: Number(params.page) || 1,
        limit: Number(params.limit) || 10,
        totalPages: 0
      }
    };
  }
}

export async function createGroceryItem(data: CreateGroceryItemInput): Promise<GroceryItem> {
  try {
    console.log('Creating grocery item with data:', data);

    if (!data.shoppingListId) {
      throw new Error('shoppingListId is required');
    }

    if (!data.name?.trim()) {
      throw new Error('Item name is required');
    }

    const result = await service.create({
      ...data,
      name: data.name.trim(),
      shoppingListId: data.shoppingListId
    });

    console.log('Successfully created grocery item:', result);
    return result;
  } catch (error) {
    console.error('Error in createGroceryItem:', error);
    throw error; // Re-throw to be handled by the caller
  }
}

export async function updateGroceryItem(
  id: string,
  data: UpdateGroceryItemInput
): Promise<GroceryItem> {
  const result = await service.update(id, data, true);
  return result;
}

/**
 * Delete a grocery item by ID
 * @param id The ID of the grocery item to delete
 */
export async function deleteGroceryItem(id: string): Promise<void> {
  if (!id) {
    throw new Error('Item ID is required');
  }
  await service.delete(id);
}

export async function updateGroceryStatus(id: string, status: string): Promise<void> {
  await service.updateStatus(id, status);
}



export interface DeleteRunoutResponse {
  count: number;
  message: string;
}

export interface GetGroceryItemHistoryParams {
  itemId: string;
  page?: number;
  limit?: number;
}

export async function getGroceryItemHistory({ 
  itemId, 
  page = 1, 
  limit = 10 
}: GetGroceryItemHistoryParams): Promise<GroceryItemHistoryResponse> {
  try {
    const response = await service.getHistory(itemId, page, limit);
    return {
      data: response.data || [],
      meta: response.meta || {
        total: response.data?.length || 0,
        page: page,
        limit: limit,
        totalPages: Math.ceil((response.meta?.total || response.data?.length || 0) / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching grocery item history:', error);
    throw new Error('Failed to fetch grocery item history');
  }
}

export async function deleteAllRunoutItems(shoppingListId: string): Promise<DeleteRunoutResponse> {
  try {
    return await service.deleteAllRunout(shoppingListId);
  } catch (error) {
    console.error('Error deleting runout items:', error);
    throw new Error('Failed to delete runout items');
  }
}
