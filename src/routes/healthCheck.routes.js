import { Router} from 'express';

import { healthCheckController } from '../controllers/healthCheck.controller.js';

const router = Router();
// Define the health check route
router.route('/')
    .get(healthCheckController.healthCheck);

export default router;
