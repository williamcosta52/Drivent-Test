import { prisma } from '../../config';

export async function findHotels() {
  return await prisma.hotel.findMany();
}
export async function findHotelById(hotelId: number) {
  return await prisma.hotel.findFirst({ where: { id: hotelId }, include: { Rooms: true } });
}
