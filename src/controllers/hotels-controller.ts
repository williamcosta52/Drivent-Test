import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares';
import * as hotelsService from '../services/hotels-service/hotels-service';
import httpStatus from 'http-status';

export async function hotels(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  try {
    const allHotels = await hotelsService.findhotels(userId);
    res.status(httpStatus.CREATED).send(allHotels);
  } catch (err) {
    next(err);
  }
}
export async function hotelsById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { hotelId } = req.params;
  const userId = req.userId;
  try {
    const rooms = await hotelsService.hotelById(Number(hotelId), userId);
    res.status(httpStatus.CREATED).send(rooms);
  } catch (err) {
    next(err);
  }
}
