// src/routes/uploadRoutes.ts
import { Router } from 'express';  
import { uploadCSV } from '../controllers/upload.controller';
import { uploadCSVMiddleware } from '../middlewares/multer';

const uploadRouter = Router();

uploadRouter.post('/upload', uploadCSVMiddleware, uploadCSV as any);

export default uploadRouter;
