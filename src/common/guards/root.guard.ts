import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_ROOT_KEY } from '../decorators/require-root.decorator';

@Injectable()
export class RootGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireRoot = this.reflector.getAllAndOverride<boolean>(REQUIRE_ROOT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requireRoot) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user || user.role !== 'SUPER_ADMIN' || user.groupeId) {
      throw new ForbiddenException('Seul un super admin racine peut gérer les groupes et les comptes');
    }
    return true;
  }
}
