import { Controller, Post, Get, Patch, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('refresh')
  refresh(@CurrentUser('id') userId: string) {
    return this.auth.refreshToken(userId);
  }

  @Get('me')
  me(@CurrentUser('id') userId: string) {
    return this.auth.me(userId);
  }

  @Patch('me/photo')
  updatePhoto(@CurrentUser('id') userId: string, @Body('photoUrl') photoUrl: string) {
    return this.auth.updatePhoto(userId, photoUrl);
  }
}
