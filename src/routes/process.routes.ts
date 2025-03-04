import { Router } from 'express'; 
import { bodySchemaValidator } from '../middlewares/schema.validator'; 
import {
  LoginValidation,
  UpdateUserRoleValidation,
  UserValidation,
  VerifyAccountValidation,
} from '../validations/userSchemaValidation';  

const processRouter = Router({ mergeParams: true });

const processingController = new ProcessingController();

processRouter.post('/register', bodySchemaValidator(UserValidation), processingController.signup);

processRouter.post('/login', bodySchemaValidator(LoginValidation), processingController.signin);
 

export default processRouter;
