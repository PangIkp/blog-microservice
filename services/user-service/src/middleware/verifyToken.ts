import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

export async function verifyToken(req: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return reply.status(401).send({ error: "Malformed token" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not set");
    }

    const decoded = jwt.verify(token, secret);
    (req as any).user = decoded;
  } catch (err) {
    return reply.status(401).send({ error: "Invalid token" });
  }
}
