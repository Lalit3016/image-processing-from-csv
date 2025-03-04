// src/services/csvService.ts
import * as fs from 'fs';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import { ProductData } from '../types';
import logger from '../common/logger';


export class CsvService {
  static async validateAndParse(filePath: string): Promise<ProductData[]> {
    return new Promise((resolve, reject) => {
      const results: ProductData[] = [];
      let hasErrors = false;
      let rowCount = 0;
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data:any) => {
          rowCount++;
          
          // Check required columns
          if (!data['S. No.'] || !data['Product Name'] || !data['Input Image Urls']) {
            hasErrors = true;
            logger.error(`Row ${rowCount}: Missing required columns`);
            return;
          }
          
          // Validate and format data
          try {
            const serialNumber = parseInt(data['S. No.']);
            const productName = data['Product Name'].trim();
            const inputImageUrls = data['Input Image Urls'].split(',').map((url: string) => url.trim());
            
            if (isNaN(serialNumber) || serialNumber <= 0) {
              hasErrors = true;
              logger.error(`Row ${rowCount}: Invalid serial number`);
              return;
            }
            
            if (!productName) {
              hasErrors = true;
              logger.error(`Row ${rowCount}: Product name cannot be empty`);
              return;
            }
            
            if (inputImageUrls.length === 0 || inputImageUrls.some((url: string) => !url.startsWith('http'))) {
              hasErrors = true;
              logger.error(`Row ${rowCount}: Invalid image URLs`);
              return;
            }
            
            results.push({
              serialNumber,
              productName,
              inputImageUrls
            });
          } catch (error) {
            hasErrors = true;
            logger.error(`Row ${rowCount}: Processing error`, error);
          }
        })
        .on('end', () => {
          if (hasErrors) {
            reject(new Error('CSV validation failed. Check logs for details.'));
          } else if (results.length === 0) {
            reject(new Error('CSV file is empty or has no valid data'));
          } else {
            resolve(results);
          }
        })
        .on('error', (error:any) => {
          reject(error);
        });
    });
  }

  static async generateOutputCsv(
    _requestId: string,
    products: ProductData[],
    outputPath: string
  ): Promise<string> {
    const csvWriter = createObjectCsvWriter({
      path: outputPath,
      header: [
        { id: 'serialNumber', title: 'S. No.' },
        { id: 'productName', title: 'Product Name' },
        { id: 'inputImageUrls', title: 'Input Image Urls' },
        { id: 'outputImageUrls', title: 'Output Image Urls' }
      ]
    });
    
    const records = products.map(product => ({
      serialNumber: product.serialNumber,
      productName: product.productName,
      inputImageUrls: product.inputImageUrls.join(', '),
      outputImageUrls: product.outputImageUrls?.join(', ') || ''
    }));
    
    await csvWriter.writeRecords(records);
    return outputPath;
  }
}
