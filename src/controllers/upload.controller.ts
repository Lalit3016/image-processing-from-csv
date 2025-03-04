
// src/controllers/uploadController.ts
import { Request, Response } from 'express';  
import { generateRequestId } from '../utils/helpers';
import logger from '../common/logger';
import { CsvService } from '../services/csv.service';
import { RequestModel } from '../modals/RequestModel';
import { ProductModel } from '../modals/ProductModel';
import { QueueService } from '../services/queue.service';
 

export const uploadCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }
    
    const filePath = req.file.path;
    const webhookUrl = req.body.webhookUrl;
    
    // Generate request ID
    const requestId = generateRequestId();
    
    // Validate and parse CSV
    const productData = await CsvService.validateAndParse(filePath);
    
    // Create request record
    const request = new RequestModel({
      requestId,
      status: 'pending',
      totalItems: productData.length,
      processedItems: 0,
      csvFileName: req.file.originalname,
      webhookUrl
    });
    
    await request.save();
    
    // Store product data
    const productDocuments = productData.map(product => ({
      requestId,
      ...product,
      processed: false
    }));
    
    await ProductModel.insertMany(productDocuments);
    
    // Queue processing jobs
    const queueService = QueueService.instance;
    
    for (const product of productData) {
      await queueService.addJob({
        requestId,
        productData: product
      });
    }
    
    logger.info(`CSV uploaded and processing queued for request ${requestId}`);
    
    res.status(200).json({
      success: true,
      message: 'CSV uploaded successfully',
      requestId
    });
  } catch (error) {
    logger.error('Upload error:', error);
    res.status(400).json({
      success: false,
      message: `CSV upload failed: ${(error as Error).message}`
    });
  }
};

 