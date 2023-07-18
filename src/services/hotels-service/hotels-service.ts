import { notFoundError } from '../../errors';
import { paymentError } from '../../errors/payment-error';
import enrollmentRepository from '../../repositories/enrollment-repository';
import * as hotelsRepositories from '../../repositories/hotels-repository/hotels-repository';
import ticketsRepository from '../../repositories/tickets-repository';
import { Hotel, Room } from '@prisma/client';

export async function findhotels(userId: number): Promise<Hotel[]> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();
  const ticket = await ticketsRepository.getTicket(userId);
  if (!ticket) throw notFoundError();
  if (ticket.status !== 'PAID' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) throw paymentError();
  const result = await hotelsRepositories.findHotels();
  if (!result.length) throw notFoundError();
  return result;
}
export async function hotelById(hotelId: number, userId: number): Promise<Hotel & { Rooms: Room[] }> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();
  if (ticket.status !== 'PAID' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) throw paymentError();
  const hotel = await hotelsRepositories.findHotelById(hotelId);
  if (!hotel) throw notFoundError();
  return hotel;
}
