import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function notiRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return { message: 'Notification service is running' };
  });

  app.get('/notifications', async (req, reply) => {
    try {
      const notifications = await prisma.notification.findMany();
      return notifications;
    } catch (error) {
      app.log.error(error);
      reply.status(500).send({ error: 'Failed to fetch notifications' });
    }
  });

  app.post('/notifications', async (req, reply) => {
    try {
      const { userId, message } = req.body as { userId: string; message: string };
      const noti = await prisma.notification.create({
        data: { userId, message }
      });
      reply.code(201).send(noti);
    } catch (error) {
      app.log.error(error);
      reply.status(500).send({ error: 'Failed to create notification' });
    }
  });
}
