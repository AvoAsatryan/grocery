'use server';

import { revalidatePath } from 'next/cache';
import { shoppingListService } from '@/services/shopping-list-service';
import { 
  ShoppingList, 
  PaginatedResponse, 
  CreateShoppingListInput, 
  ShoppingListQueryParams 
} from '@/types/shopping-list';

export async function getAll(
  params: ShoppingListQueryParams = {}
): Promise<PaginatedResponse<ShoppingList>> {
  try {
    return shoppingListService.getAll(params);
  } catch (error) {
    console.error('Failed to fetch shopping lists:', error);
    throw new Error('Failed to fetch shopping lists');
  }
}

// For backward compatibility
export async function getShoppingLists(
  params: ShoppingListQueryParams = {}
): Promise<PaginatedResponse<ShoppingList>> {
  return getAll(params);
}

export async function getShoppingList(id: string): Promise<ShoppingList> {
  try {
    return await shoppingListService.getOne(id);
  } catch (error) {
    console.error(`Failed to fetch shopping list ${id}:`, error);
    throw new Error('Failed to fetch shopping list');
  }
}

export async function createShoppingList(
  data: CreateShoppingListInput
): Promise<ShoppingList> {
  try {
    const result = await shoppingListService.create(data);
    revalidatePath('/dashboard');
    return result;
  } catch (error) {
    console.error('Failed to create shopping list:', error);
    throw new Error('Failed to create shopping list');
  }
}

export async function updateShoppingList(
  id: string,
  data: Partial<CreateShoppingListInput>
): Promise<ShoppingList> {
  try {
    const result = await shoppingListService.update(id, data);
    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/${id}`);
    return result;
  } catch (error) {
    console.error(`Failed to update shopping list ${id}:`, error);
    throw new Error('Failed to update shopping list');
  }
}

export async function deleteShoppingList(id: string): Promise<void> {
  try {
    await shoppingListService.delete(id);
    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/${id}`, 'page');
    // The parent component will handle the UI update
  } catch (error) {
    console.error(`Failed to delete shopping list ${id}:`, error);
    throw new Error('Failed to delete shopping list');
  }
}
