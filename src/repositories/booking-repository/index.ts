import { prisma } from '../../config';

async function createBookingDB(roomId: number, userId: number) {
  return await prisma.booking.create({
    data: {
      roomId,
      userId,
    },
  });
}
async function findBooking(userId: number) {
  return await prisma.booking.findFirst({
    where: { userId },
    include: { Room: true },
  });
}
async function updateBooking(bookingId: number, roomId: number) {
  return await prisma.booking.update({
    data: { roomId },
    where: { id: bookingId },
  });
}

const bookingRepository = {
  updateBooking,
  findBooking,
  createBookingDB,
};
export default bookingRepository;
