import { Controller, Get, Post, Param, Body, Req, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Post()
  envoyer(@Body() body: any, @Req() req: any) {
    return this.service.envoyer({ ...body, expediteurId: req.user.userId });
  }

  @Get('recus')
  recus(@Req() req: any) {
    return this.service.recus(req.user.userId);
  }

  @Get('envoyes')
  envoyes(@Req() req: any) {
    return this.service.envoyes(req.user.userId);
  }

  @Get('non-lus')
  nonLus(@Req() req: any) {
    return this.service.countNonLus(req.user.userId);
  }

  @Get('membres')
  membres(@Query('organisationId') organisationId: string, @Req() req: any) {
    return this.service.membres(organisationId, req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.service.findOne(id, req.user.userId);
  }
}
