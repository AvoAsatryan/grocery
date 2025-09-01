import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { OwnershipGuard } from '../guards/ownership.guard';

type ResourceType = 'shoppingList' | 'groceryItem';

interface CheckOwnershipOptions {
  resourceType: ResourceType;
  idParam?: string; // Parameter name that contains the resource ID (defaults to 'id')
  fromQuery?: boolean; // If true, looks for the ID in query parameters
  fromBody?: boolean; // If true, looks for the ID in request body
}

export function CheckOwnership(options: CheckOwnershipOptions | ResourceType) {
  const { resourceType, idParam = 'id', fromQuery = false, fromBody = false } = 
    typeof options === 'string' ? { resourceType: options } : options;

  return applyDecorators(
    SetMetadata('resourceType', resourceType),
    SetMetadata('idParam', idParam),
    SetMetadata('fromQuery', fromQuery),
    SetMetadata('fromBody', fromBody),
    UseGuards(OwnershipGuard),
  );
}
