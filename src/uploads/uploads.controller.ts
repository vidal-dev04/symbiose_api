import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { Public } from '../common/decorators/public.decorator';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CloudinaryService } from './cloudinary.service';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly cloudinary: CloudinaryService) {}

  @Post()
  @Public()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx/i;
        if (allowed.test(extname(file.originalname))) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Type de fichier non autorisé'), false);
        }
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');
    const result = await this.cloudinary.uploadFile(file.buffer, file.originalname, file.mimetype);
    return { url: result.secure_url, filename: result.public_id };
  }
}
