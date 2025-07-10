import { FastifyInstance } from "fastify";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default async function userRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return { message: "User service is running" };
  });

  app.get("/users", async (req, reply) => {
    try {
      const users = await prisma.user.findMany();
      return users;
    } catch (error) {
      app.log.error(error);
      reply.status(500).send({ error: "Failed to fetch users" });
    }
  });

   app.post('/users', async (req, reply) => {
    try {
      const { name, email, password, role } = req.body as {
        name: string;
        email: string;
        password: string;
        role?: string;
      };

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role === 'ADMIN' ? 'ADMIN' : 'USER',
        },
      });

      reply.code(201).send({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      app.log.error('CREATE USER ERROR:', error);
      reply.status(500).send({ error: 'Failed to create user' });
    }
  });
}
