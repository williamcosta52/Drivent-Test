import { notFoundError } from '../../errors';
import { paymentError } from '../../errors/payment-error';
import enrollmentRepository from '../../repositories/enrollment-repository';
import * as hotelsRepositories from '../../repositories/hotels-repository/hotels-repository';
import ticketsRepository from '../../repositories/tickets-repository';

export async function findhotels(userId: number) {
  const enrollment = enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();
  const ticket = await ticketsRepository.getTicket(userId);
  if (!ticket) throw notFoundError();
  if (ticket.status !== 'PAID' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) throw paymentError();

  const result = await hotelsRepositories.findHotels();

  if (result.length === 0) throw notFoundError();

  return result;
}
export async function hotelById(hotelId: number, userId: number) {
  const enrollment = enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();
  const ticket = await ticketsRepository.getTicket(userId);
  if (!ticket) throw notFoundError();
  if (ticket.status !== 'PAID' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) throw paymentError();

  const hotel = await hotelsRepositories.findHotelById(hotelId);
  if (!hotel) throw notFoundError();
  return hotel;
}
