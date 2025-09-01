import { IsEnum, IsNotEmpty, IsOptional, IsString, IsInt, Min, Max } from 'class-validator'
import { Transform } from 'class-transformer'
import { GroceryItemStatus } from '@prisma/client'
import { PaginationParamsDto } from './pagination.dto'

export class FilterGroceryDto extends PaginationParamsDto {
  @IsString()
  @IsOptional()
  shoppingListId?: string;
  
  @IsString()
  @IsOptional()
  userId?: string;

  @IsEnum(GroceryItemStatus)
  @IsOptional()
  status?: GroceryItemStatus;

  @IsInt()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  priority?: number;

  @IsOptional()
  search?: string
}

export class GroceryListResponseDto<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
