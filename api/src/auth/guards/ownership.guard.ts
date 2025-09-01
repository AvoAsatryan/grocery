import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthorizationService } from '../authorization.service';

type ResourceType = 'shoppingList' | 'groceryItem';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authorizationService: AuthorizationService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get metadata from the handler or class
    const handler = context.getHandler();
    const resourceType = this.reflector.get<ResourceType>('resourceType', handler) ||
      this.reflector.get<ResourceType>('resourceType', context.getClass());
    const idParam = this.reflector.get<string>('idParam', handler) || 'id';
    const fromQuery = this.reflector.get<boolean>('fromQuery', handler) || false;
    const fromBody = this.reflector.get<boolean>('fromBody', handler) || false;

    if (!resourceType) {
      throw new Error('Resource type not specified. Use @CheckOwnership() decorator.');
    }

    // Get resource ID from the appropriate location
    let resourceId;
    if (fromQuery) {
      resourceId = request.query[idParam];
    } else if (fromBody) {
      // If fromBody is true, get the ID from the request body
      resourceId = request.body?.[idParam];

      // For bulk operations, the ID might be in an array in the body
      if (!resourceId && Array.isArray(request.body?.ids)) {
        resourceId = request.body.ids;
      }
    } else {
      // Default: try params, then body, then query
      resourceId = request.params?.[idParam] || request.body?.[idParam] || request.query?.[idParam];
    }

    if (!resourceId) {
      let location = 'request';
      if (fromQuery) location = 'query parameters';
      else if (fromBody) location = 'request body';

      throw new ForbiddenException(
        `Resource ID not found in ${location}. Looking for parameter: ${idParam}`
      );
    }

    // Support both single ID and array of IDs
    if (Array.isArray(resourceId) || typeof resourceId === 'string') {
      const ids = Array.isArray(resourceId) ? resourceId : [resourceId];

      // For multiple IDs, use bulk check
      if (ids.length > 1) {
        const hasAccess = await this.authorizationService.checkBulkOwnership(
          user.id,
          ids,
          resourceType,
        );

        if (!hasAccess) {
          throw new ForbiddenException('You do not have permission to access one or more resources');
        }
        return true;
      }

      // For single ID, use regular check
      const hasAccess = await this.authorizationService.checkOwnership(
        user.id,
        ids[0],
        resourceType,
      );

      if (!hasAccess) {
        throw new ForbiddenException('You do not have permission to access this resource');
      }
    }

    return true;
  }
}
