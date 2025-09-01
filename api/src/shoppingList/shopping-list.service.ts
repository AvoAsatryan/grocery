// shopping-list.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreateShoppingListDto, 
  UpdateShoppingListDto, 
  ShoppingListQueryDto 
} from './dto/shopping-list.dto';

type UserWithId = {
  id: string;
};

@Injectable()
export class ShoppingListService {
  constructor(private prisma: PrismaService) {}

  async create(createShoppingListDto: CreateShoppingListDto, userId: string) {
    return this.prisma.shoppingList.create({
      data: {
        ...createShoppingListDto,
        createdBy: { 
          connect: { 
            id: userId 
          } 
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, query: ShoppingListQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ShoppingListWhereInput = {
      createdById: userId,
      ...(search && {
        name: { 
          contains: search, 
          mode: 'insensitive' as const 
        },
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.shoppingList.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.shoppingList.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const list = await this.prisma.shoppingList.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!list) {
      throw new NotFoundException(`Shopping list with ID ${id} not found`);
    }

    return list;
  }

  async update(
    id: string,
    updateShoppingListDto: UpdateShoppingListDto,
  ) {
    return this.prisma.shoppingList.update({
      where: { id },
      data: updateShoppingListDto,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const list = await this.findOne(id);
    
    await this.prisma.shoppingList.delete({
      where: { id },
    });

    return list;
  }
}