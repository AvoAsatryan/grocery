import { ApiProperty } from '@nestjs/swagger';
import { GroceryItemStatus } from '@prisma/client';
import { PaginatedResponseDto } from './pagination.dto';

export class GroceryItemHistoryDto {
  @ApiProperty({ description: 'Unique identifier for the history entry' })
  id: string;

  @ApiProperty({ enum: GroceryItemStatus, description: 'The status of the item at this point in history' })
  status: GroceryItemStatus;

  @ApiProperty({ type: String, format: 'date-time', description: 'When the status was changed' })
  changedAt: Date;

  @ApiProperty({ description: 'ID of the related grocery item' })
  groceryItemId: string;
}

export class GroceryItemHistoryResponseDto extends PaginatedResponseDto<GroceryItemHistoryDto> {
  @ApiProperty({ type: [GroceryItemHistoryDto], description: 'List of history entries' })
  data: GroceryItemHistoryDto[];
}
