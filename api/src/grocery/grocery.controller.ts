import { 
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  DefaultValuePipe,
  BadRequestException,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { getSchemaPath } from '@nestjs/swagger';
import { PaginationParamsDto } from './dto/pagination.dto';
import { GroceryService } from './grocery.service';
import { FilterGroceryDto, GroceryListResponseDto } from './dto/filter.dto';
import {
  CreateGroceryDto,
  GroceryItemIdDto,
  UpdateGroceryDto,
  DeleteGroceryDto,
  BulkUpdateGroceryDto,
  GroceryItemResponseDto,
  GroceryItemWithHistoryResponseDto
} from './dto/grocery.dto';
import { GroceryItemHistoryResponseDto } from './dto/history.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { GithubAuthMiddleware } from '../auth/github-auth.middleware';
import { CheckOwnership } from '../auth/decorators/check-ownership.decorator';
import { OwnershipGuard } from '../auth/guards/ownership.guard';

@ApiTags('Grocery Items')
@Controller({
  version: '1',
  path: 'grocery',
})
@UseGuards(GithubAuthMiddleware)
export class GroceryController {
  constructor(private readonly groceryService: GroceryService) { }

  @Get()
  @UseGuards(OwnershipGuard)
  @CheckOwnership({ resourceType: 'shoppingList', idParam: 'shoppingListId', fromQuery: true })
  @ApiOperation({ 
    summary: 'Get all grocery items with filtering and pagination',
    description: 'Retrieves a paginated list of grocery items for a specific shopping list with optional filtering.'
  })
  @ApiQuery({ 
    name: 'shoppingListId', 
    required: true, 
    description: 'ID of the shopping list to get items from' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Successfully retrieved grocery items', 
    type: GroceryListResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Missing or invalid shoppingListId parameter' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'User does not have access to the specified shopping list' 
  })
  async filterGroceries(@Query() filter: FilterGroceryDto) {
    if (!filter.shoppingListId) {
      throw new BadRequestException('shoppingListId query parameter is required');
    }
    return this.groceryService.filterGroceries(filter);
  }

  @Get(':id')
  @UseGuards(OwnershipGuard)
  @CheckOwnership({ resourceType: 'groceryItem' })
  @ApiOperation({ 
    summary: 'Get a single grocery item with its history',
    description: 'Retrieves a specific grocery item by ID along with its status change history.'
  })
  @ApiParam({ 
    name: 'id', 
    required: true, 
    description: 'ID of the grocery item to retrieve' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Successfully retrieved grocery item', 
    type: GroceryItemWithHistoryResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Grocery item not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'User does not have access to this grocery item' 
  })
  async getGroceryItem(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.groceryService.getGroceryItem(id);
    return { data };
  }

  @Get(':id/history')
  @UseGuards(OwnershipGuard)
  @CheckOwnership({ resourceType: 'groceryItem' })
  @ApiOperation({ 
    summary: 'Get paginated history for a grocery item',
    description: 'Retrieves the status change history for a specific grocery item with pagination.'
  })
  @ApiParam({ 
    name: 'id', 
    required: true, 
    description: 'ID of the grocery item to get history for' 
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved history for the grocery item',
    type: GroceryItemHistoryResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid pagination parameters' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Grocery item not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'User does not have access to this grocery item' 
  })
  async getGroceryItemHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() pagination: PaginationParamsDto
  ): Promise<GroceryItemHistoryResponseDto> {
    const { data, total } = await this.groceryService.getGroceryItemHistory(
      id,
      pagination.page,
      pagination.limit
    );
    return new GroceryItemHistoryResponseDto(data, {
      total,
      page: pagination.page,
      limit: pagination.limit
    });
  }

  @Post()
  @UseGuards(OwnershipGuard)
  @CheckOwnership({ resourceType: 'shoppingList', idParam: 'shoppingListId', fromBody: true })
  @ApiOperation({ 
    summary: 'Create a new grocery item',
    description: 'Creates a new grocery item in the specified shopping list.'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Successfully created a new grocery item', 
    type: GroceryItemResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'User does not have permission to add items to this shopping list' 
  })
  async createGrocery(
    @Body() createGroceryDto: CreateGroceryDto
  ) {
    const data = await this.groceryService.createGrocery(createGroceryDto);
    return { data };
  }


  @Patch(':id')
  @UseGuards(OwnershipGuard)
  @CheckOwnership({ resourceType: 'groceryItem' })
  @ApiOperation({ 
    summary: 'Partially update a grocery item',
    description: 'Updates specific fields of a grocery item.'
  })
  @ApiParam({ 
    name: 'id', 
    required: true, 
    description: 'ID of the grocery item to partially update' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Successfully updated the grocery item', 
    type: GroceryItemResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Grocery item not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'User does not have permission to update this grocery item' 
  })
  async partialUpdateGrocery(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGroceryDto: Partial<UpdateGroceryDto>
  ) {
    const data = await this.groceryService.partialUpdateGrocery(id, updateGroceryDto);
    return { data };
  }

  @Delete('runout')
  @UseGuards(OwnershipGuard)
  @CheckOwnership({ 
    resourceType: 'shoppingList', 
    idParam: 'shoppingListId',
    fromQuery: true
  })
  @ApiOperation({ 
    summary: 'Delete all grocery items with status RUNOUT',
    description: 'Deletes all grocery items in the specified shopping list that have a status of RUNOUT.'
  })
  @ApiQuery({ 
    name: 'shoppingListId', 
    required: true, 
    description: 'ID of the shopping list to clean up' 
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully deleted items with status RUNOUT',
    schema: {
      type: 'object',
      properties: {
        count: { 
          type: 'number',
          description: 'Number of items deleted' 
        },
        message: { 
          type: 'string',
          description: 'Success message' 
        }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Missing or invalid shoppingListId parameter' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'User does not have permission to delete items from this shopping list' 
  })
  async deleteAllRunOut(
    @Query('shoppingListId', ParseUUIDPipe) shoppingListId: string
  ) {
    const count = await this.groceryService.deleteAllRunOut(shoppingListId);
    return { 
      count: count,
      message: `Successfully deleted items with status RUNOUT`
    };
  }

  @Delete(':id')
  @UseGuards(OwnershipGuard)
  @CheckOwnership({ resourceType: 'groceryItem' })
  @ApiOperation({ 
    summary: 'Delete a single grocery item by ID',
    description: 'Permanently deletes a specific grocery item.'
  })
  @ApiParam({ 
    name: 'id', 
    required: true, 
    description: 'ID of the grocery item to delete' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Successfully deleted the grocery item',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string',
          example: 'Grocery item deleted successfully' 
        }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Grocery item not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'User does not have permission to delete this grocery item' 
  })
  async deleteGrocery(@Param('id', ParseUUIDPipe) id: string) {
    await this.groceryService.deleteGroceryItem(id);
    return { message: 'Grocery item deleted successfully' };
  }

  @Delete('bulk')
  @UseGuards(OwnershipGuard)
  @CheckOwnership({ resourceType: 'groceryItem', idParam: 'ids', fromBody: true })
  @ApiOperation({ 
    summary: 'Delete multiple grocery items',
    description: 'Permanently deletes multiple grocery items by their IDs.'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Successfully deleted the grocery items',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string',
          example: 'Grocery items deleted successfully' 
        }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'One or more grocery items not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'User does not have permission to delete one or more of the specified grocery items' 
  })
  async deleteMultipleGroceryItems(@Body() deleteGroceryDto: DeleteGroceryDto) {
    await this.groceryService.deleteGrocery(deleteGroceryDto.ids);
    return { message: 'Grocery items deleted successfully' };
  }

  @Post('bulk-update-status')
  @UseGuards(OwnershipGuard)
  @CheckOwnership({ 
    resourceType: 'groceryItem',
    idParam: 'ids',
    fromBody: true
  })
  @ApiOperation({ 
    summary: 'Update status of multiple grocery items',
    description: 'Updates the status of multiple grocery items in a single operation.'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Successfully updated status of grocery items',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string',
          example: 'Grocery items status updated successfully' 
        },
        count: { type: 'number', description: 'Number of items updated' },
        updatedItems: { 
          type: 'array', 
          items: { $ref: getSchemaPath(GroceryItemResponseDto) } 
        }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'One or more grocery items not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'User does not have permission to update one or more of the specified grocery items' 
  })
  async bulkUpdateStatus(
    @Body() bulkUpdateDto: BulkUpdateGroceryDto
  ) {
    const result = await this.groceryService.bulkUpdateStatus(bulkUpdateDto);
    return { 
      message: 'Successfully updated grocery items status',
      ...result 
    };
  }
}
