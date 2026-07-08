import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  uploadFile(buffer: Buffer, originalname: string, mimetype: string): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const folder = 'symbiose';
      const resourceType = mimetype.startsWith('image') ? 'image' : 'raw';

      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!);
        },
      );

      Readable.from(buffer).pipe(stream);
    });
  }
}
