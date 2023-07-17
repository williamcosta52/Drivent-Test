import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares';
import * as hotelsService from '../services/hotels-service/hotels-service';

export async function hotels(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const userId = req.userId as number;
  try {
    const allHotels = await hotelsService.findhotels(userId);
    res.send(allHotels);
  } catch (err) {
    next(err);
  }
}
export async function hotelsById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { hotelId } = req.params;
  const userId = req.userId;
  try {
    const rooms = await hotelsService.hotelById(Number(hotelId), userId);
    res.send(rooms);
  } catch (err) {
    next(err);
  }
}
