import { Controller, Get, Patch, Param, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.userId);
  }

  @Get('non-lues')
  countNonLues(@Req() req: any) {
    return this.service.countNonLues(req.user.userId);
  }

  @Patch('tout-lire')
  toutLire(@Req() req: any) {
    return this.service.toutMarquerLu(req.user.userId);
  }

  @Patch(':id/lu')
  marquerLue(@Param('id') id: string, @Req() req: any) {
    return this.service.marquerLue(id, req.user.userId);
  }
}
