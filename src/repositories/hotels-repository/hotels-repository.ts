import { prisma } from '../../config';
import { Hotel, Room } from '@prisma/client';

export async function findHotels(): Promise<Hotel[]> {
  return await prisma.hotel.findMany();
}
export async function findHotelById(hotelId: number): Promise<Hotel & { Rooms: Room[] }> {
  return await prisma.hotel.findFirst({ where: { id: hotelId }, include: { Rooms: true } });
}
