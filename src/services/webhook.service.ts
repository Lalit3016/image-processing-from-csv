import axios from 'axios';
import { RequestModel } from '../modals/RequestModel';
import { ProductModel } from '../modals/ProductModel';
import logger from '../common/logger';

export class WebhookService {
  static async triggerWebhook(requestId: string): Promise<void> {
    try {
      const request = await RequestModel.findOne({ requestId });
      if (!request || !request.webhookUrl) {
        logger.info(`No webhook URL found for request ${requestId}`);
        return;
      }
      
      const products = await ProductModel.find({ requestId });
      
      // Generate output CSV URL (in a real system, this would be a download link)
      const outputCsvUrl = `${process.env.BASE_URL}/api/download/${requestId}`;
      
      // Prepare webhook payload
      const payload = {
        requestId,
        status: request.status,
        totalItems: request.totalItems,
        processedItems: request.processedItems,
        completedAt: request.updatedAt,
        outputCsvUrl
      };
      
      // Send webhook
      await axios.post(request.webhookUrl, payload);
      logger.info(`Webhook triggered for request ${requestId}`);
    } catch (error) {
      logger.error(`Failed to trigger webhook for request ${requestId}:`, error);
      // Don't throw the error, just log it to prevent failure cascading
    }
  }
}
