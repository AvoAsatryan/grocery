import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
});

export type User = z.infer<typeof UserSchema>;

export const ShoppingListSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  notes: z.string().max(500, 'Notes are too long').optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: UserSchema,
});

export type ShoppingList = z.infer<typeof ShoppingListSchema>;

export const PaginationMetaSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) => 
  z.object({
    data: z.array(itemSchema),
    meta: PaginationMetaSchema,
  });

export type PaginatedResponse<T> = z.infer<ReturnType<typeof PaginatedResponseSchema<z.ZodType<T>>>>;

export const CreateShoppingListInputSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  notes: z.string().max(500, 'Notes are too long').optional(),
});

export type CreateShoppingListInput = z.infer<typeof CreateShoppingListInputSchema>;

export const UpdateShoppingListInputSchema = CreateShoppingListInputSchema.partial();

export type UpdateShoppingListInput = z.infer<typeof UpdateShoppingListInputSchema>;

export const ShoppingListQueryParamsSchema = z.object({
  page: z.number().int().positive().default(1).optional(),
  limit: z.number().int().positive().max(100).default(10).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['updatedAt', 'name']).default('updatedAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

export type ShoppingListQueryParams = z.infer<typeof ShoppingListQueryParamsSchema>;

// Validation function that can be used in server actions
export function validateShoppingListData(data: unknown): CreateShoppingListInput {
  return CreateShoppingListInputSchema.parse(data);
}

export function validateUpdateShoppingListData(data: unknown): UpdateShoppingListInput {
  return UpdateShoppingListInputSchema.parse(data);
}

export function validateQueryParams(params: unknown): ShoppingListQueryParams {
  return ShoppingListQueryParamsSchema.parse(params);
}
