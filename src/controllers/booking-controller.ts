import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares';
import bookingService from '../services/booking-service';
import httpStatus from 'http-status';

export async function createBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const roomId = req.body.roomId as number;
  const userId = req.body.userId as string;
  try {
    const booking = await bookingService.createBooking(roomId, Number(userId));
    res.status(httpStatus.OK).send({ bookingId: booking.id });
  } catch (err) {
    next(err);
  }
}
export async function getBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const userId = req.body.userId as string;
  try {
    const booking = await bookingService.getBooking(Number(userId));
    res.status(httpStatus.OK).send(booking);
  } catch (err) {
    next(err);
  }
}
export async function updateBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const roomId = req.body.roomId as number;
  const userId = req.body.userId as string;
  const bookingId = req.params.bookingId as string;
  if (!roomId) return res.sendStatus(httpStatus.FORBIDDEN);
  try {
    const newBooking = await bookingService.updateBooking(roomId, Number(userId), Number(bookingId));
    res.status(httpStatus.OK).send(newBooking.id);
  } catch (err) {
    next(err);
  }
}
