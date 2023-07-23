import { forbiddenError, notFoundError } from '../../errors';
import * as bookingRepository from '../../repositories/booking-repository/booking-repositories';
import enrollmentRepository from '../../repositories/enrollment-repository';
import { getRoomById } from '../../repositories/room-repository/room-repository';
import ticketsRepository from '../../repositories/tickets-repository';

export async function createBooking(roomId: number, userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  const ticketType = await ticketsRepository.findTickeWithTypeById(ticket.id);
  if (ticket.status !== 'PAID' || ticketType.TicketType.isRemote || !ticketType.TicketType.includesHotel)
    throw forbiddenError();
  const room = await getRoomById(roomId);
  if (room.capacity === 0) throw forbiddenError();
  return await bookingRepository.createBookingDB(roomId, userId);
}
export async function getBooking(userId: number) {
  const booking = await bookingRepository.findBooking(userId);
  if (!booking) throw notFoundError();
  return booking;
}
