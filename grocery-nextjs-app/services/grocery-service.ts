import { BaseService } from '@/lib/base-service';
import { 
  GroceryItem, 
  CreateGroceryItemInput, 
  UpdateGroceryItemInput,
  GroceryListResponse,
} from '@/types/grocery';

type DeleteGroceryDto = { ids: string[] };

export class GroceryService extends BaseService<
  GroceryItem,
  CreateGroceryItemInput,
  UpdateGroceryItemInput,
  DeleteGroceryDto
> {
  constructor() {
    super('grocery');
  }

  protected getRevalidationPaths(id?: string): string[] {
    const paths = ['/dashboard'];
    if (id) {
      // If we have a shoppingListId in the future, we can add specific list paths
      paths.push(`/dashboard/${id}`);
    }
    return paths;
  }

  async deleteAllRunout(shoppingListId: string): Promise<{ count: number; message: string }> {
    console.log('Deleting all runout items for shopping list:', shoppingListId);
    return this.fetchWithAuth(
      `${this.baseUrl}/${this.resource}/runout?shoppingListId=${encodeURIComponent(shoppingListId)}`,
      { method: 'DELETE' }
    ).then(response => response.json());
  }

  async getHistory(
    itemId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<{ data: any[]; meta?: any }> {
    if (!itemId) {
      console.error('Item ID is required for fetching history');
      return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
    }
    
    try {
      const response = await this.get<any>(
        `${itemId}/history?page=${page}&limit=${limit}`
      );
      
      return {
        data: response?.data || [],
        meta: {
          ...response?.meta,
          page: response?.meta?.page || page,
          limit: response?.meta?.limit || limit,
          total: response?.meta?.total || 0,
          totalPages: response?.meta?.totalPages || 
            Math.ceil((response?.meta?.total || 0) / (response?.meta?.limit || limit))
        }
      };
    } catch (error) {
      console.error('Error fetching grocery item history:', error);
      return { 
        data: [], 
        meta: { total: 0, page, limit, totalPages: 0 } 
      };
    }
  }

  async getByShoppingList(shoppingListId: string, params: Record<string, any> = {}): Promise<GroceryListResponse> {
    if (!shoppingListId) {
      console.error('shoppingListId is required in getByShoppingList');
      return { data: [], meta: { total: 0, page: 1, limit: 100, totalPages: 1 } };
    }
    
    try {
      // Make sure shoppingListId is included in the query params
      const queryParams = { ...params, shoppingListId };
      console.log('Fetching grocery items with params:', queryParams);
      
      // Use any type to handle different response formats
      const response = await this.get<any>('', queryParams);
      
      // Log the response for debugging
      console.log('Grocery items response:', response);
      
      // If response is an array, wrap it in a proper response object
      if (Array.isArray(response)) {
        const data = response as GroceryItem[];
        return {
          data,
          meta: {
            total: data.length,
            page: Number(params.page) || 1,
            limit: Number(params.limit) || 100,
            totalPages: Math.ceil(data.length / (Number(params.limit) || 100))
          }
        };
      }
      
      // If response has data property, ensure it's an array
      if (response && typeof response === 'object' && 'data' in response) {
        const data = Array.isArray(response.data) ? response.data : [];
        return {
          data,
          meta: response.meta || {
            total: data.length,
            page: Number(params.page) || 1,
            limit: Number(params.limit) || 100,
            totalPages: Math.ceil(data.length / (Number(params.limit) || 100))
          }
        };
      }
      
      // Fallback for any other case
      console.warn('Unexpected response format:', response);
      return { 
        data: [], 
        meta: { 
          total: 0, 
          page: Number(params.page) || 1, 
          limit: Number(params.limit) || 100, 
          totalPages: 1 
        } 
      };
    } catch (error) {
      console.error('Error in getByShoppingList:', error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.post('bulk-update-status', {
      ids: [id],
      status,
    });
  }

  /**
   * Delete multiple grocery items by their IDs
   */
  async deleteGrocery(ids: string[]): Promise<void> {
    if (!ids.length) return;
    await this.deleteByIds(ids);
  }

  // Override default methods to ensure proper typing
  async getAll(params: Record<string, any> = {}): Promise<{ data: GroceryItem[]; meta: any }> {
    const response = await super.getAll(params);
    return {
      data: Array.isArray(response) ? response : [],
      meta: { total: 0, page: 1, limit: 100, totalPages: 1 }
    };
  }

  async create(data: CreateGroceryItemInput): Promise<GroceryItem> {
    if (!data.shoppingListId) {
      throw new Error('shoppingListId is required');
    }
    // Ensure shoppingListId is included in the request body
    const result = await super.create({
      ...data,
      shoppingListId: data.shoppingListId
    });
    return result;
  }

  async update(id: string, data: UpdateGroceryItemInput, partial: boolean = false): Promise<GroceryItem> {
    // The backend returns { data: updatedItem }
    const response = await super.update(id, data, partial) as unknown as { data: GroceryItem };
    return response.data;
  }
}
