export interface ProductData {
    serialNumber: number;
    productName: string;
    inputImageUrls: string[];
    outputImageUrls?: string[];
  }
  
  export interface ProcessingRequest {
    requestId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    totalItems: number;
    processedItems: number;
    createdAt: Date;
    updatedAt: Date;
    csvFileName: string;
    webhookUrl?: string;
    error?: string;
  }
  
  export interface ProcessingJob {
    requestId: string;
    productData: ProductData;
  }
  