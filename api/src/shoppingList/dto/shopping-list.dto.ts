import { IsString, IsOptional, IsUUID, IsInt, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShoppingListDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateShoppingListDto {
  @IsString()
  @IsOptional()
  name?: string;
  
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ShoppingListQueryDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @IsString()
  @IsOptional()
  search?: string;
}
