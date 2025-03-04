// src/workers/imageProcessor.ts
import Bull from 'bull'; 
import { QueueService } from '../services/queue.service';
import { environment } from '../utils/environment';
import { ProcessingJob } from '../types';
import { RequestModel } from '../modals/RequestModel';
import logger from '../common/logger';
import { ImageService } from '../services/image.service';
import { ProductModel } from '../modals/ProductModel';
import { WebhookService } from '../services/webhook.service';

export class ImageProcessor {
  private queue: Bull.Queue;
  
  constructor() {
    this.queue = QueueService.instance.getQueue();
    this.setupWorker();
  }
  
  private setupWorker(): void {
    this.queue.process(environment.workerConcurrency, async (job) => {
      const { requestId, productData } = job.data as ProcessingJob;
      
      try {
        // Update request status to processing if it's the first job
        await RequestModel.findOneAndUpdate(
          { requestId, status: 'pending' },
          { status: 'processing' }
        );
        
        logger.info(`Processing job for product ${productData.productName} in request ${requestId}`);
        
        // Process each image URL
        const outputImageUrls: string[] = [];
        
        for (let i = 0; i < productData.inputImageUrls.length; i++) {
          const inputUrl = productData.inputImageUrls[i];
          
          // Process image
          const outputUrl = await ImageService.processImage(
            inputUrl,
            productData.productName,    
            productData.serialNumber,
            i
          );
          
          outputImageUrls.push(outputUrl);
          
          // Simulate processing time (remove in production)
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Update product with output URLs
        await ProductModel.findOneAndUpdate(
          { requestId, productName: productData.productName },
          { outputImageUrls, processed: true }
        );
        
        // Update request progress
        const updated = await RequestModel.findOneAndUpdate(
          { requestId },
          { $inc: { processedItems: 1 } },
          { new: true }
        );
        
        // Check if all items are processed
        if (updated && updated.processedItems === updated.totalItems) {
          await RequestModel.findOneAndUpdate(
            { requestId },
            { status: 'completed' }
          );
          
          // Trigger webhook if all processing is complete
          await WebhookService.triggerWebhook(requestId);
        }
        
        return { success: true, outputImageUrls };
      } catch (error) {
        logger.error(`Error processing job for product ${productData.productName}:`, error);
        
        // Update product with error
        await ProductModel.findOneAndUpdate(
          { requestId, productName: productData.productName },
          { processed: false }
        );
        
        // Update request with error if all jobs failed
        const request = await RequestModel.findOne({ requestId });
        const products = await ProductModel.find({ requestId, processed: true });
        
        if (request && products.length === 0) {
          await RequestModel.findOneAndUpdate(
            { requestId },
            { 
              status: 'failed',
              error: `Processing failed: ${(error as Error).message}`
            }
          );
        }
        
        throw error;
      }
    });
  }
  
  public static start(): ImageProcessor {
    return new ImageProcessor();
  }
}