import { Booking } from '@prisma/client';
import { prisma } from '../../config';

export async function createBookingDB(roomId: number, userId: number) {
  return await prisma.booking.create({
    data: {
      roomId,
      userId,
    },
  });
}
export async function findBooking(userId: number) {
  return await prisma.booking.findFirst({
    where: { userId },
    include: { Room: true },
  });
}
