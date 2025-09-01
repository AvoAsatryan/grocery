import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator'
import { GroceryItemStatus } from '@prisma/client'

export class GroceryItemIdDto {
  @IsUUID()
  id: string
}

export class CreateGroceryDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  priority?: number

  @IsEnum(GroceryItemStatus)
  @IsOptional()
  status?: GroceryItemStatus

  @IsInt()
  @Min(0)
  @IsOptional()
  quantity?: number
  
  @IsString()
  @IsOptional()
  notes?: string
  
  @IsUUID()
  @IsNotEmpty()
  shoppingListId: string
}

export class UpdateGroceryDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  priority?: number

  @IsEnum(GroceryItemStatus)
  @IsOptional()
  status?: GroceryItemStatus

  @IsInt()
  @Min(0)
  @IsOptional()
  quantity?: number

  @IsString()
  @IsOptional()
  notes?: string | null
}

export class DeleteGroceryDto {
  @IsUUID('4', { each: true })
  ids: string[]
}

export class BulkUpdateGroceryDto {
  @IsUUID('4', { each: true })
  ids: string[]

  @IsEnum(GroceryItemStatus)
  status: GroceryItemStatus
}

export class GroceryItemResponseDto {
  id: string
  name: string
  quantity: number
  priority: number
  status: GroceryItemStatus
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export class GroceryItemHistoryDto {
  id: string
  status: GroceryItemStatus
  changedAt: Date
}

export class GroceryItemWithHistoryResponseDto extends GroceryItemResponseDto {
  history: GroceryItemHistoryDto[]
}
