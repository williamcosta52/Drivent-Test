import { Router } from 'express';
import { authenticateToken } from '../middlewares';
import * as hotelsController from '../controllers/hotels-controller';

const hotelsRouter = Router();

hotelsRouter.get('/', authenticateToken, hotelsController.hotels);
hotelsRouter.get('/:hotelId', authenticateToken, hotelsController.hotelsById);

export default hotelsRouter;
