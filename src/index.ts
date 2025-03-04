import express from 'express';
import path from 'path';   
import { connectDB } from './utils/database'; 
import { errorHandler } from './middlewares/error.middleware';
import logger from './common/logger';
import { environment } from './utils/environment';
import { ImageProcessor } from './workers/image.processor';
import router from './routes/router.routes';

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();  

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/processing', express.static(path.join(__dirname, '../processing')));

// API routes
app.use('/api/v1', router); 

// Additional route for downloading processed CSV
app.get('/api/v1/download/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // Generate and send CSV file
    // Implementation would create CSV on-the-fly from DB data
    res.download(path.join(__dirname, '../processing', `${requestId}.csv`));
  } catch (error) {
    logger.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate download'
    });
  }
});

// Error handling middleware
app.use(errorHandler as any);

// Start server
const PORT = environment.port;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  
  // Start image processor worker
  ImageProcessor.start();
  logger.info('Image processor worker started');
});

export default app;