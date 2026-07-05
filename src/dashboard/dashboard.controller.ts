import { Controller, Get, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('stats')
  async stats(@Req() req: any) {
    const userId: string = req.user?.userId;
    const role: string = req.user?.role;

    if (role === 'SUPER_ADMIN') {
      return this.service.statsSuperAdmin();
    }

    if (role === 'ADMIN_ORG') {
      return this.service.statsAdminOrgByUserId(userId);
    }

    if (role === 'ADHERENT') {
      return this.service.statsAdherentByUserId(userId);
    }

    return { role: 'UNKNOWN', kpis: [] };
  }
}
