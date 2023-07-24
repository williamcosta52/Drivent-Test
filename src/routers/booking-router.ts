import { Router } from 'express';
import * as booking from '../controllers/booking-controller';
import { authenticateToken } from '../middlewares';

const bookingRouter = Router();

bookingRouter.post('/', authenticateToken, booking.createBooking);
bookingRouter.get('/', authenticateToken, booking.getBooking);
bookingRouter.put('/:bookingId', authenticateToken, booking.updateBooking);
export default bookingRouter;
