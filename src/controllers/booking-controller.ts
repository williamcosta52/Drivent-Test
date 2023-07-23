import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares';
import * as bookingService from '../services/booking-service/booking-service';
import httpStatus from 'http-status';

export async function creatBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const roomId = req.body.roomId as number;
  const userId = req.params.userId as string;
  if (!roomId) return res.sendStatus(httpStatus.FORBIDDEN);
  try {
    const booking = await bookingService.createBooking(roomId, Number(userId));
    res.status(httpStatus.OK).send({ bookingId: booking.id });
  } catch (err) {
    next(err);
  }
}
export async function getBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const userId = req.params.userId as string;
  try {
    const booking = await bookingService.getBooking(Number(userId));
    res.status(httpStatus.OK).send(booking);
  } catch (err) {
    next(err);
  }
}
