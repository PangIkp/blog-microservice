import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/verifyToken"; // import middleware ตรวจ token

const prisma = new PrismaClient();

export default async function postRoutes(app: FastifyInstance) {
  // GET posts แบบสาธารณะ (ไม่ต้องล็อกอิน)
  app.get("/posts", async (req, reply) => {
    try {
      const posts = await prisma.post.findMany({
        include: { author: true },
        orderBy: { createdAt: "desc" },
      });
      reply.send(posts);
    } catch (error) {
      app.log.error(error);
      reply.status(500).send({ error: "Failed to fetch posts" });
    }
  });

  // GET โพสต์เดี่ยวแบบสาธารณะ
  app.get("/posts/:id", async (req, reply) => {
    const { id } = req.params as { id: string };

    try {
      const post = await prisma.post.findUnique({
        where: { id },
        include: { author: true },
      });

      if (!post) {
        return reply.status(404).send({ error: "Post not found" });
      }

      // แยก content เป็น array ตาม paragraph (กรณี frontend ต้องการแสดงแบบหลายบรรทัด)
      const contentParagraphs = post.content
        .split("\n")
        .filter((p) => p.trim() !== "");

      reply.send({
        id: post.id,
        title: post.title,
        content: contentParagraphs,
        category: post.category,
        author: post.author.name,
        date: post.createdAt,
        imageUrl: post.imageUrl
      });
    } catch (error) {
      app.log.error(error);
      reply.status(500).send({ error: "Failed to fetch post" });
    }
  });

  // GET posts ของ user คนหนึ่ง (ถ้าต้องการให้เป็นสาธารณะ ก็ไม่ต้องล็อกอิน)
  app.get("/users/:userId/posts", async (req, reply) => {
    const { userId } = req.params as { userId: string };

    try {
      const posts = await prisma.post.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: "desc" },
      });
      reply.send(posts);
    } catch (error) {
      app.log.error(error);
      reply.status(500).send({ error: "Failed to fetch user's posts" });
    }
  });

  // POST สร้างโพสต์ใหม่ — ต้องล็อกอินก่อน
  app.post("/posts", { preHandler: [verifyToken] }, async (req: any, reply) => {
    try {
      const { title, content, category, imageUrl } = req.body as {
        title: string;
        content: string;
        category: string;
        imageUrl?: string;
      };
      const authorId = req.user.userId; // ดึง userId จาก token

      const post = await prisma.post.create({
        data: {
          title,
          content,
          category,
          imageUrl,
          authorId,
        },
      });

      reply.code(201).send(post);
    } catch (error) {
      app.log.error(error);
      reply.status(500).send({ error: "Failed to create post" });
    }
  });

  // PUT แก้ไขโพสต์ — ต้องล็อกอิน และตรวจสอบว่าเป็นเจ้าของโพสต์
  app.put(
    "/posts/:id",
    { preHandler: [verifyToken] },
    async (req: any, reply) => {
      try {
        const { id } = req.params as { id: string };
        const { title, content, category, imageUrl } = req.body as {
          title?: string;
          content?: string;
          category?: string;
          imageUrl?: string;
        };
        const userId = req.user.userId;

        // ตรวจสอบว่าโพสต์นี้เป็นของ user ที่ล็อกอินจริงๆ
        const post = await prisma.post.findUnique({ where: { id } });
        if (!post) {
          return reply.status(404).send({ error: "Post not found" });
        }
        if (post.authorId !== userId) {
          return reply
            .status(403)
            .send({ error: "You are not allowed to edit this post" });
        }

        const updatedPost = await prisma.post.update({
          where: { id },
          data: {
            ...(title !== undefined && { title }),
            ...(content !== undefined && { content }),
            ...(category !== undefined && { category }),
            ...(imageUrl !== undefined && { imageUrl }),
          },
        });

        reply.send(updatedPost);
      } catch (error) {
        app.log.error(error);
        reply.status(500).send({ error: "Failed to update post" });
      }
    }
  );

  // DELETE ลบโพสต์ — ต้องล็อกอิน และเป็นเจ้าของโพสต์
  app.delete(
    "/posts/:id",
    { preHandler: [verifyToken] },
    async (req: any, reply) => {
      try {
        const { id } = req.params as { id: string };
        const userId = req.user.userId;

        const post = await prisma.post.findUnique({ where: { id } });
        if (!post) {
          return reply.status(404).send({ error: "Post not found" });
        }
        if (post.authorId !== userId) {
          return reply
            .status(403)
            .send({ error: "You are not allowed to delete this post" });
        }

        await prisma.post.delete({ where: { id } });
        reply.send({ message: "Post deleted successfully" });
      } catch (error) {
        app.log.error(error);
        reply.status(500).send({ error: "Failed to delete post" });
      }
    }
  );
}
