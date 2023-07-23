import { prisma } from '../../config';

export async function getRoomById(roomId: number) {
  return prisma.room.findFirst({
    where: { id: roomId },
  });
}
