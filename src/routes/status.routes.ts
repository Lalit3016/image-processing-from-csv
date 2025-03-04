
// src/routes/statusRoutes.ts
import { Router } from 'express'; 
import { getProcessingStatus } from '../controllers/status.controller';

const statusRouter = Router();

statusRouter.get('/status/:requestId', getProcessingStatus);

export default statusRouter;
