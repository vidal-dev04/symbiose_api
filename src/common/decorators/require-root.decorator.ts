import { SetMetadata } from '@nestjs/common';

export const REQUIRE_ROOT_KEY = 'requireRoot';
export const RequireRoot = () => SetMetadata(REQUIRE_ROOT_KEY, true);
