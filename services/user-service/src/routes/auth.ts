import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/verifyToken";

const prisma = new PrismaClient();

export default async function authRoutes(app: FastifyInstance) {
  app.get("/profile", { preHandler: verifyToken }, async (req: any, reply) => {
    try {
      const userId = req.user.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return reply.status(404).send({ error: "User not found" });
      reply.send(user);
    } catch (error) {
      app.log.error("PROFILE ERROR:", error);
      reply.status(500).send({ error: "Internal server error" });
    }
  });

  app.post("/login", async (req, reply) => {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    try {
      // 1. Find user by email
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return reply.status(401).send({ error: "Invalid credentials" });
      }

      // 2. Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return reply.status(401).send({ error: "Invalid credentials" });
      }

      // 3. Sign JWT
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        secret as jwt.Secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" } as jwt.SignOptions
      );

      // 4. Return token
      reply.send({ token });
    } catch (error) {
      app.log.error("LOGIN ERROR:", error);
      reply.status(500).send({ error: "Internal server error" });
    }
  });
}
