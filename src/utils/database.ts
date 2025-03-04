 
 
import mongoose from 'mongoose'; 
import logger from '../common/logger';
import { environment } from './environment';


export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(environment.mongoUri);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};