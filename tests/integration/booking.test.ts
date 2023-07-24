import supertest from 'supertest';
import app, { init } from '@/app';
import {
  createEnrollmentWithAddress,
  createHotel,
  createRoom,
  createTicket,
  createTicketType,
  createUser,
  noHotelTicket,
  remoteTicket,
  ticketWithHotel,
} from '../factories';
import httpStatus from 'http-status';
import { cleanDb, generateValidToken } from '../helpers';
import { TicketStatus } from '@prisma/client';
import { createBooking, roomWithoutVacancies } from '../factories/booking-factory';
import faker from '@faker-js/faker';

beforeAll(async () => {
  await init();
  await cleanDb();
});

beforeEach(async () => {
  await cleanDb();
});

const api = supertest(app);

describe('post /booking', () => {
  it('should respond with status 401 when token is not valid', async () => {
    const token = faker.lorem.word();
    const response = await api.post('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it('should respond with status 401 if no token is given', async () => {
    const response = await api.post('/booking');
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it('should respond with status 403 when user have not paid the ticket', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    const hotel = await createHotel();
    const room = await createRoom(hotel.id);
    const result = await api
      .post('/booking')
      .set('Authorization', `Bearer ${token}`)
      .send({ roomId: room.id, userId: user.id });
    expect(result.status).toBe(httpStatus.FORBIDDEN);
  });
  it('should respond with status 403 when ticketType is remote', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await remoteTicket();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const room = await createRoom(hotel.id);
    const result = await api
      .post('/booking')
      .set('Authorization', `Bearer ${token}`)
      .send({ roomId: room.id, userId: user.id });
    expect(result.status).toBe(httpStatus.FORBIDDEN);
  });
  it('should respond with status 403 if ticket does not include hotel', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await noHotelTicket();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const room = await createRoom(hotel.id);
    const result = await api
      .post('/booking')
      .set('Authorization', `Bearer ${token}`)
      .send({ roomId: room.id, userId: user.id });
    expect(result.status).toBe(httpStatus.FORBIDDEN);
  });
  it('should respond with status 403 if the room has no vacancies', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType();
    const hotel = await createHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const room = await roomWithoutVacancies(hotel.id);
    const result = await api
      .post('/booking')
      .set('Authorization', `Bearer ${token}`)
      .send({ roomId: room.id, userId: user.id });
    expect(result.status).toBe(httpStatus.FORBIDDEN);
  });
  it('should respond with status 404 if booking does not exist', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await ticketWithHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createHotel();
    const result = await api
      .post('/booking')
      .set('Authorization', `Bearer ${token}`)
      .send({ roomId: 15, userId: user.id });
    expect(result.status).toBe(httpStatus.NOT_FOUND);
  });
  it('should respond with status 200 and booking id', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await ticketWithHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const room = await createRoom(hotel.id);
    const response = await api
      .post('/booking')
      .set('Authorization', `Bearer ${token}`)
      .send({ roomId: room.id, userId: user.id });
    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual({
      bookingId: expect.any(Number),
    });
  });
});
describe('get /booking', () => {
  it('should respond with status 404 when booking does not exist', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await ticketWithHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    await createRoom(hotel.id);
    const response = await api.get('/booking').set('Authorization', `Bearer ${token}`).send({ userId: 45 });
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });
  it('should respond with status 200 and booking', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await ticketWithHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const room = await createRoom(hotel.id);
    const booking = await createBooking(room.id, user.id);
    const response = await api.get('/booking').set('Authorization', `Bearer ${token}`).send({ userId: user.id });
    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual({
      id: booking.id,
      userId: booking.userId,
      roomId: booking.roomId,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      Room: {
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        hotelId: room.hotelId,
        createdAt: room.createdAt.toISOString(),
        updatedAt: room.updatedAt.toISOString(),
      },
    });
  });
});
describe('put /booking', () => {
  it('should respond with status 403 if roomId is not send', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await ticketWithHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const firstRoom = await createRoom(hotel.id);
    const booking = await createBooking(firstRoom.id, user.id);
    const response = await api
      .put(`/booking/${booking.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: user.id });
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });
  it('should respond with status 403 if room has no capacity', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await ticketWithHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const firstRoom = await createRoom(hotel.id);
    const booking = await createBooking(firstRoom.id, user.id);
    const room = await roomWithoutVacancies(hotel.id);
    const response = await api
      .put(`/booking/${booking.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ roomId: room.id, userId: user.id });
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });
  it('should respond with status 403 if booking does not exist', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await ticketWithHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    await createRoom(hotel.id);
    const response = await api.put('/booking/43').set('Authorization', `Bearer ${token}`).send({ userId: user.id });
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });
});
