import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermission) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Accès refusé');

    // Le système de permissions ne restreint que le palier SUPER_ADMIN.
    if (user.role !== 'SUPER_ADMIN') return true;
    // Un compte non rattaché à un groupe est un super admin racine, sans restriction.
    if (!user.groupeId) return true;

    if (!user.permissions?.includes(requiredPermission)) {
      throw new ForbiddenException('Vous n\'avez pas la permission nécessaire pour cette action');
    }
    return true;
  }
}
