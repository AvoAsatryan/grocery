import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Min, Max, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Base pagination parameters DTO
 * Can be used for any paginated endpoint
 */
export class PaginationParamsDto {
  @ApiProperty({
    description: 'Page number (1-based)',
    required: false,
    default: 1,
    minimum: 1,
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
    example: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

/**
 * Generic paginated response DTO
 * @template T - The type of items in the data array
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Array of items' })
  data: T[];

  @ApiProperty({ description: 'Pagination metadata' })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(data: T[], meta: { total: number; page: number; limit: number }) {
    this.data = data;
    this.meta = {
      total: meta.total,
      page: meta.page,
      limit: meta.limit,
      totalPages: Math.ceil(meta.total / meta.limit),
    };
  }
}
