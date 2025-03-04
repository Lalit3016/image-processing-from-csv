// src/controllers/statusController.ts
import { Request, Response } from 'express'; 
import { RequestModel } from '../modals/RequestModel';
import { ProductModel } from '../modals/ProductModel';
import logger from '../common/logger';
 
export const getProcessingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    
    if (!requestId) {
      res.status(400).json({ success: false, message: 'Request ID is required' });
      return;
    }
    
    const request = await RequestModel.findOne({ requestId });
    
    if (!request) {
      res.status(404).json({ success: false, message: 'Request not found' });
      return;
    }
    
    // Get product status summary
    const products = await ProductModel.find({ requestId });
    // const processedProducts = products.filter(p => p.processed).length;
    
    const response = {
      success: true,
      requestId: request.requestId,
      status: request.status,
      progress: {
        total: request.totalItems,
        processed: request.processedItems,
        percentage: Math.floor((request.processedItems / request.totalItems) * 100)
      },
      createdAt: request.createdAt,
      updatedAt: request.updatedAt
    };
    
    // If completed, add download link
    if (request.status === 'completed') {
      Object.assign(response, {
        downloadUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/download/${requestId}`
      });
    }
    
    // If failed, add error message
    if (request.status === 'failed' && request.error) {
      Object.assign(response, {
        error: request.error
      });
    }
    
    res.status(200).json(response);
  } catch (error) {
    logger.error('Status check error:', error);
    res.status(500).json({
      success: false,
      message: `Status check failed: ${(error as Error).message}`
    });
  }
};