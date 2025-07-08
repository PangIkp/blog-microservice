import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function userRoutes(app: FastifyInstance) {
  // Health check route
  app.get('/', async () => {
    return { message: 'User service is running' };
  });

  app.get('/users', async (req, reply) => {
    try {
      const users = await prisma.user.findMany();
      return users;
    } catch (error) {
      app.log.error(error);
      reply.status(500).send({ error: 'Failed to fetch users' });
    }
  });

  app.post('/users', async (req, reply) => {
    try {
      const { name, email } = req.body as { name: string; email: string };
      const user = await prisma.user.create({
        data: { name, email }
      });
      reply.code(201).send(user);
    } catch (error) {
      app.log.error(error);
      reply.status(500).send({ error: 'Failed to create user' });
    }
  });
}
