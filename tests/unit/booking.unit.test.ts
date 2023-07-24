import bookingRepository from '@/repositories/booking-repository';
import bookingService from '@/services/booking-service';
import { createBooking } from '../controllers/booking-controller';

describe('get booking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should return booking', async () => {
    jest.spyOn(bookingRepository, 'findBooking').mockImplementationOnce((): any => {
      return [
        {
          id: 1,
          userId: 1,
          roomId: 1,
          createdAt: '24/07/2023',
          updatedAt: '24/07/2023',
          Room: {
            id: 1,
            name: 'batata',
            capacity: 1,
            hotelId: 1,
            createdAt: '24/07/2023',
            updatedAt: '24/07/2023',
          },
        },
      ];
    });
    const response = await bookingService.getBooking(1);
    expect(response).toHaveLength(1);
  });
  it('should return notFoundError if no have booking', async () => {
    jest.spyOn(bookingRepository, 'findBooking').mockRejectedValueOnce({
      name: 'NotFoundError',
      message: 'No result for this search!',
    });
    await expect(bookingService.getBooking(1)).rejects.toEqual({
      name: 'NotFoundError',
      message: 'No result for this search!',
    });
  });
});
