import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ResourceType = 'shoppingList' | 'groceryItem';

@Injectable()
export class AuthorizationService {
  constructor(private prisma: PrismaService) {}

  async checkOwnership(
    userId: string,
    resourceId: string,
    resourceType: ResourceType,
  ): Promise<boolean> {
    if (resourceType === 'shoppingList') {
      const list = await this.prisma.shoppingList.findUnique({
        where: { id: resourceId },
        select: { createdById: true },
      });
      return list?.createdById === userId;
    }

    if (resourceType === 'groceryItem') {
      const item = await this.prisma.groceryItem.findUnique({
        where: { id: resourceId },
        include: { 
          shoppingList: { 
            select: { 
              createdById: true 
            } 
          } 
        },
      });
      return item?.shoppingList.createdById === userId;
    }

    return false;
  }

  async checkBulkOwnership(
    userId: string,
    resourceIds: string[],
    resourceType: ResourceType,
  ): Promise<boolean> {
    if (resourceIds.length === 0) {
      return true; // No resources to check
    }

    if (resourceType === 'groceryItem') {
      const count = await this.prisma.groceryItem.count({
        where: {
          id: { in: resourceIds },
          shoppingList: { 
            createdById: userId 
          }
        },
      });
      return count === resourceIds.length;
    }

    if (resourceType === 'shoppingList') {
      const count = await this.prisma.shoppingList.count({
        where: {
          id: { in: resourceIds },
          createdById: userId
        },
      });
      return count === resourceIds.length;
    }

    return false;
  }
}
