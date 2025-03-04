import axios from 'axios';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { ProductData } from '../types';
import { getFileNameFromUrl } from '../utils/helpers';
import { environment } from '../utils/environment';
import logger from '../common/logger';

export class ImageService {
  static async processImage(
    imageUrl: string,
    productName: string,
    serialNumber: number,
    index: number
  ): Promise<string> {
    try {
      // Create processing directory if it doesn't exist
      const processingDir = path.join('processing', productName);
      fs.mkdirSync(processingDir, { recursive: true });
      
      // Download the image
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const originalFileName = getFileNameFromUrl(imageUrl);
      const fileExt = path.extname(originalFileName);
      const originalPath = path.join(processingDir, `original_${serialNumber}_${index}${fileExt}`);
      
      // Save original image
      fs.writeFileSync(originalPath, Buffer.from(response.data));
      
      // Process image - reduce quality to 50%
      const processedPath = path.join(processingDir, `processed_${serialNumber}_${index}${fileExt}`);
      
      await sharp(originalPath)
        .jpeg({ quality: environment.compressionQuality })
        .toFile(processedPath);
      
      // For a real implementation, you would upload the processed image to a cloud storage
      // and return the URL. For this example, we'll simulate it.
      const outputUrl = `${environment.storageUrl}/processed/${productName}/processed_${serialNumber}_${index}${fileExt}`;
      
      // Clean up
      // fs.unlinkSync(originalPath); // Uncomment to delete original
      
      return outputUrl;
    } catch (error) {
      logger.error(`Error processing image ${imageUrl}:`, error);
      throw new Error(`Failed to process image: ${(error as Error).message}`);
    }
  }
}
