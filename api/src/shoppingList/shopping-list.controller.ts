// shopping-list.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ShoppingListService } from './shopping-list.service';
import { 
  CreateShoppingListDto, 
  UpdateShoppingListDto, 
  ShoppingListQueryDto 
} from './dto/shopping-list.dto';
import { GithubAuthMiddleware } from '../auth/github-auth.middleware';
import { CheckOwnership } from '../auth/decorators/check-ownership.decorator';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('shopping-lists')
@Controller({
  version: '1',
  path: 'shopping-lists',
})
@UseGuards(GithubAuthMiddleware)
export class ShoppingListController {
  constructor(private readonly shoppingListService: ShoppingListService) {}

  @Post()
  create(
    @Body() createShoppingListDto: CreateShoppingListDto, 
    @Request() req: { user: { id: string; githubId: string } }
  ) {
    return this.shoppingListService.create(
      createShoppingListDto,
      req.user.id, // Using the database user ID instead of githubId
    );
  }

  @Get()
  findAll(
    @Query() query: ShoppingListQueryDto, 
    @Request() req: { user: { id: string } }
  ) {
    return this.shoppingListService.findAll(req.user.id, query);
  }

  @Get(':id')
  @UseGuards(OwnershipGuard)
  @CheckOwnership({ resourceType: 'shoppingList' })
  async findOne(@Param('id') id: string) {
    return this.shoppingListService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(OwnershipGuard)
  @CheckOwnership({ resourceType: 'shoppingList' })
  async update(
    @Param('id') id: string,
    @Body() updateShoppingListDto: UpdateShoppingListDto,
  ) {
    return this.shoppingListService.update(
      id,
      updateShoppingListDto,
    );
  }

  @Delete(':id')
  @UseGuards(OwnershipGuard)
  @CheckOwnership({ resourceType: 'shoppingList' })
  async remove(
    @Param('id') id: string,
  ) {
    return this.shoppingListService.remove(id);
  }
}