import { forbiddenError, notFoundError, unauthorizedError } from '../../errors';
import bookingRepository from '../../repositories/booking-repository';
import enrollmentRepository from '../../repositories/enrollment-repository';
import { getRoomById } from '../../repositories/room-repository';
import ticketsRepository from '../../repositories/tickets-repository';

async function createBooking(roomId: number, userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw unauthorizedError();
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw unauthorizedError();
  const ticketType = await ticketsRepository.findTickeWithTypeById(ticket.id);
  if (ticket.status !== 'PAID' || ticketType.TicketType.isRemote || !ticketType.TicketType.includesHotel) {
    throw forbiddenError();
  }
  const room = await getRoomById(roomId);
  if (!room) throw notFoundError();
  if (room.capacity === 0) throw forbiddenError();
  return await bookingRepository.createBookingDB(roomId, userId);
}
async function getBooking(userId: number) {
  const booking = await bookingRepository.findBooking(userId);
  if (!booking) throw notFoundError();
  return booking;
}
async function updateBooking(roomId: number, userId: number, bookingId: number) {
  const booking = await bookingRepository.findBooking(userId);
  const room = await getRoomById(roomId);
  if (!booking || room.capacity === 0) throw forbiddenError();
  return await bookingRepository.updateBooking(bookingId, roomId);
}

const bookingService = {
  updateBooking,
  getBooking,
  createBooking,
};
export default bookingService;
