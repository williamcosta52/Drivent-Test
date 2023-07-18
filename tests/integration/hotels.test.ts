import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import app, { init } from '@/app';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createEnrollmentWithAddress,
  createTicket,
  createTicketType,
  createUser,
  noHotelTicket,
  remoteTicket,
  ticketWithHotel,
} from '../factories';
import { createHotel, createRoom } from '../factories/hotels-factory';

beforeAll(async () => {
  await init();
  await cleanDb();
});

beforeEach(async () => {
  await cleanDb();
});

const api = supertest(app);

describe('GET /hotels', () => {
  it('Should respond with status 401 if no token is given', async () => {
    const result = await api.get('/hotels');
    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it('Shoud respond with status 401 if token is invalid', async () => {
    const token = faker.lorem.word();
    const result = await api.get('/hotels').set('Authorization', `Bearer ${token}`);
    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it('Shoud respond status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const result = await api.get('/hotels').set('Authorization', `Bearer ${token}`);
    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe('When token is valid', () => {
    it('Shoud respond with status 404 when user doesnt have an enrollment', async () => {
      const token = await generateValidToken();
      const result = await api.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });
    it('Shoud respond with status 404 when user doesnt have a ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
      const result = await api.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });
    it('Shoud respond with status 404 if no hotels are found', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await ticketWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const result = await api.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });
    it('Shoud respond with status 402 when user have not paid the ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const result = await api.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
    it('Shoud respond with status 402 if ticketType is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await remoteTicket();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const result = await api.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
    it('Shoud respond with status 402 if ticket does not include hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await noHotelTicket();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const result = await api.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
    it('Shoud respond with status 201 and with hotels data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await ticketWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createHotel();
      const result = await api.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(result.status).toBe(httpStatus.CREATED);
      expect(result.body).toHaveLength(1);
    });
  });
});
describe('GET /hotels/:hotelId', () => {
  it('Should respond with status 401 if no token is given', async () => {
    const result = await api.get('/hotels/1');
    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it('Shoud respond with status 401 if token is invalid', async () => {
    const token = faker.lorem.word();
    const result = await api.get('/hotels/1').set('Authorization', `Bearer ${token}`);
    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it('Shoud respond status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const result = await api.get('/hotels/1').set('Authorization', `Bearer ${token}`);
    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe('when token is valid', () => {
    it('Shoud respond with status 404 when user doesnt have an enrollment', async () => {
      const token = await generateValidToken();
      const result = await api.get('/hotels/1').set('Authorization', `Bearer ${token}`);
      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });
    it('Shoud respond with status 404 when user doesnt have a ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
      const result = await api.get('/hotels/1').set('Authorization', `Bearer ${token}`);
      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });
    it('Shoud respond with status 404 if no hotels are found', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await ticketWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const result = await api.get('/hotels/1').set('Authorization', `Bearer ${token}`);
      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });
    it('Shoud respond with status 402 when user have not paid the ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const result = await api.get('/hotels/1').set('Authorization', `Bearer ${token}`);
      expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
    it('Shoud respond with status 402 if ticketType is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await remoteTicket();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const result = await api.get('/hotels/1').set('Authorization', `Bearer ${token}`);
      expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
    it('Shoud respond with status 402 if ticket does not include hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await noHotelTicket();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const result = await api.get('/hotels/1').set('Authorization', `Bearer ${token}`);
      expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
    it('Shoud respond with status 202 and with hotels data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await ticketWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const result = await api.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
      expect(result.status).toBe(httpStatus.CREATED);
      expect(result.body).toMatchObject({
        name: hotel.name,
        image: hotel.image,
        Rooms: [
          {
            name: room.name,
            capacity: room.capacity,
            hotelId: room.hotelId,
          },
        ],
      });
    });
  });
});
