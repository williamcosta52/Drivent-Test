import { prisma } from '@/config';

export async function roomWithoutVacancies(hotelId: number) {
  return await prisma.room.create({
    data: { capacity: 0, name: 'Hotel brabo', hotelId },
  });
}
export async function findRoom(roomId: number) {
  return await prisma.room.findUnique({ where: { id: roomId } });
}
export async function createBooking(roomId: number, userId: number) {
  return await prisma.booking.create({
    data: { roomId, userId },
  });
}
