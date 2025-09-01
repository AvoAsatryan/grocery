import { BaseService } from '@/lib/base-service';
import { ShoppingList, CreateShoppingListInput, UpdateShoppingListInput, ShoppingListQueryParams } from '@/types/shopping-list';

export class ShoppingListService extends BaseService<
  ShoppingList,
  CreateShoppingListInput,
  UpdateShoppingListInput
> {
  constructor() {
    super('shopping-lists');
  }

  protected getRevalidationPaths(id?: string): string[] {
    const paths = ['/dashboard'];
    if (id) {
      paths.push(`/dashboard/${id}`);
    }
    return paths;
  }

  async getAll(params: ShoppingListQueryParams = {}): Promise<{ data: ShoppingList[]; meta: any }> {
    return super.getAll(params);
  }

  /**
   * Update a shopping list
   * @param id The ID of the shopping list to update
   * @param data The data to update
   * @returns The updated shopping list
   */
  async update(
    id: string,
    data: UpdateShoppingListInput
  ): Promise<ShoppingList> {
    const result = await this.patch<ShoppingList>(id, data);
    await this.revalidate(id);
    return result;
  }

  // Alias for backward compatibility
  async updateShoppingList(
    id: string,
    data: UpdateShoppingListInput
  ): Promise<ShoppingList> {
    return this.update(id, data);
  }

  /**
   * Delete a shopping list
   * @param id The ID of the shopping list to delete
   */
  async deleteShoppingList(id: string): Promise<void> {
    await this.delete(id);
    await this.revalidate(id);
  }
}

export const shoppingListService = new ShoppingListService();
