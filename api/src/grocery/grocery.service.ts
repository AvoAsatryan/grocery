import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, GroceryItemStatus } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { FilterGroceryDto } from './dto/filter.dto'
import { CreateGroceryDto, UpdateGroceryDto, BulkUpdateGroceryDto, GroceryItemWithHistoryResponseDto } from './dto/grocery.dto'

@Injectable()
export class GroceryService {
  constructor(private readonly prisma: PrismaService) {}

  private async updateStatusWithHistory(
    id: string, 
    status: GroceryItemStatus,
    updateData: any
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Update the item status
      const updatedItem = await tx.groceryItem.update({
        where: { id },
        data: updateData,
      });

      // 2. Record the status change in history
      await tx.groceryItemHistory.create({
        data: {
          groceryItemId: id,
          status: status,
        },
      });

      return updatedItem;
    });
  }

  async filterGroceries(filter: FilterGroceryDto) {
    const { page = 1, limit = 10, status, priority, search, shoppingListId } = filter;
    
    if (!shoppingListId) {
      throw new Error('shoppingListId is required');
    }
    
    const skip = (page - 1) * limit;
    
    const where: Prisma.GroceryItemWhereInput = {
      shoppingListId,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(search && {
        name: { 
          contains: search, 
          mode: 'insensitive' 
        },
      }),
    };

    const [total, items] = await Promise.all([
      this.prisma.groceryItem.count({ where }),
      this.prisma.groceryItem.findMany({
        where,
        orderBy: [{ priority: 'asc' }, { name: 'asc' }],
        skip,
        take: limit,
      }),
    ])

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getGroceryItem(id: string): Promise<GroceryItemWithHistoryResponseDto> {
    const item = await this.prisma.groceryItem.findUnique({
      where: { id },
      include: {
        history: {
          orderBy: { changedAt: 'desc' },
          select: {
            id: true,
            status: true,
            changedAt: true,
          },
        },
      },
    })

    if (!item) {
      throw new NotFoundException(`Grocery item with ID "${id}" not found`)
    }

    return item
  }

  async createGrocery(createGroceryDto: CreateGroceryDto) {
    const { shoppingListId, status = GroceryItemStatus.RANOUT, ...data } = createGroceryDto;
    
    return this.prisma.$transaction(async (tx) => {
      // Create the grocery item
      const item = await tx.groceryItem.create({
        data: {
          ...data,
          status,
          shoppingList: {
            connect: { id: shoppingListId }
          }
        },
        include: {
          shoppingList: true
        }
      });

      // Record initial status in history
      await tx.groceryItemHistory.create({
        data: {
          groceryItemId: item.id,
          status: status,
        },
      });

      return item;
    });
  }

  async updateGrocery(id: string, updateGroceryDto: UpdateGroceryDto) {
    const existingItem = await this.prisma.groceryItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      throw new NotFoundException(`Grocery item with ID "${id}" not found`);
    }

    const updateData: any = { ...updateGroceryDto };
    
    // Handle notes field
    if ('notes' in updateGroceryDto) {
      updateData.notes = updateGroceryDto.notes || null;
    }

    // If status is being updated, use the transaction method
    if (updateGroceryDto.status && updateGroceryDto.status !== existingItem.status) {
      return this.updateStatusWithHistory(id, updateGroceryDto.status, updateData);
    }

    // For non-status updates, perform a regular update
    return this.prisma.groceryItem.update({
      where: { id },
      data: updateData,
    });
  }

  async partialUpdateGrocery(id: string, updateGroceryDto: Partial<UpdateGroceryDto>) {
    const existingItem = await this.prisma.groceryItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      throw new NotFoundException(`Grocery item with ID "${id}" not found`);
    }

    const updateData: any = { ...updateGroceryDto };
    
    // Handle notes field
    if ('notes' in updateGroceryDto) {
      updateData.notes = updateGroceryDto.notes || null;
    }

    // If status is being updated, use the transaction method
    if (updateGroceryDto.status && updateGroceryDto.status !== existingItem.status) {
      return this.updateStatusWithHistory(id, updateGroceryDto.status, updateData);
    }

    // For non-status updates, perform a regular update
    return this.prisma.groceryItem.update({
      where: { id },
      data: updateData,
    });
  }  

  async deleteGrocery(ids: string[]) {
    return this.prisma.$transaction(async (tx) => {
      // Check if all items exist
      const count = await tx.groceryItem.count({
        where: { id: { in: ids } },
      });
  
      if (count !== ids.length) {
        throw new NotFoundException('One or more grocery items not found');
      }
  
      // Delete history first due to foreign key constraint
      await tx.groceryItemHistory.deleteMany({
        where: { groceryItemId: { in: ids } },
      });
  
      // Then delete the items
      await tx.groceryItem.deleteMany({
        where: { id: { in: ids } },
      });
    });
  }

  async deleteGroceryItem(id: string): Promise<void> {
    // Check if item exists
    const item = await this.prisma.groceryItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`Grocery item with ID "${id}" not found`);
    }

    // Then delete the item
    await this.prisma.groceryItem.delete({
      where: { id },
    });
  }

  async bulkUpdateStatus({ ids, status }: BulkUpdateGroceryDto) {
    // First check if all items exist
    const count = await this.prisma.groceryItem.count({
      where: { id: { in: ids } },
    });

    if (count !== ids.length) {
      throw new NotFoundException('One or more grocery items not found');
    }

    // Get current status of all items to only update those that are changing
    const items = await this.prisma.groceryItem.findMany({
      where: { id: { in: ids } },
      select: { id: true, status: true },
    });

    const itemsToUpdate = items.filter(item => item.status !== status);
    const itemsToUpdateIds = itemsToUpdate.map(item => item.id);

    if (itemsToUpdateIds.length === 0) {
      return { count: 0 }; // No updates needed
    }

    // Update all items and collect history in a transaction
    return this.prisma.$transaction(async (tx) => {
      // Update items that actually need updating
      const updatedItems = await tx.groceryItem.updateMany({
        where: { id: { in: itemsToUpdateIds } },
        data: { status },
      });

      // Create history records only for updated items
      const historyRecords = itemsToUpdateIds.map(id => ({
        groceryItemId: id,
        status,
      }));

      if (historyRecords.length > 0) {
        await tx.groceryItemHistory.createMany({
          data: historyRecords,
        });
      }

      return updatedItems;
    });
  }

  async getGroceryItemHistory(
    itemId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: any[]; total: number }> {
    // First verify the item exists
    const item = await this.prisma.groceryItem.findUnique({
      where: { id: itemId },
      select: { id: true },
    });

    if (!item) {
      throw new NotFoundException(`Grocery item with ID "${itemId}" not found`);
    }

    const skip = (page - 1) * limit;
    
    // Get paginated history
    const [data, total] = await Promise.all([
      this.prisma.groceryItemHistory.findMany({
        where: { groceryItemId: itemId },
        orderBy: { changedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          status: true,
          changedAt: true,
          groceryItemId: true,
        },
      }),
      this.prisma.groceryItemHistory.count({
        where: { groceryItemId: itemId },
      }),
    ]);

    return { data, total };
  }

  /**
   * Delete all grocery items with status RUNOUT for a specific shopping list
   * @param shoppingListId - The ID of the shopping list
   */

  async deleteAllRunOut(shoppingListId: string): Promise<{ count: number }> {
    return this.prisma.$transaction(async (tx) => {
      // Find all RUNOUT items
      const runOutItems = await tx.groceryItem.findMany({
        where: { 
          status: GroceryItemStatus.RANOUT,
          shoppingListId: shoppingListId
        },
        select: { id: true },
      });
  
      if (runOutItems.length === 0) {
        return { count: 0 };
      }
  
      const ids = runOutItems.map(item => item.id);
  
      // Delete history first due to foreign key constraint
      await tx.groceryItemHistory.deleteMany({
        where: { groceryItemId: { in: ids } },
      });
  
      // Then delete the items
      const { count } = await tx.groceryItem.deleteMany({
        where: { id: { in: ids } },
      });
  
      return { count };
    });
  }
}
