import { Request, Response, NextFunction } from 'express'; 
import logger from '../common/logger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(`${err.name}: ${err.message}`, { stack: err.stack });
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation Error', 
      error: err.message 
    });
  }
  
  if (err.name === 'MulterError') {
    return res.status(400).json({ 
      success: false, 
      message: 'File Upload Error', 
      error: err.message 
    });
  }
  
  return res.status(500).json({ 
    success: false, 
    message: 'Internal Server Error', 
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message 
  });
};
