import Fastify from 'fastify';
import dotenv from 'dotenv';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import cors from '@fastify/cors';    
import userRoutes from './routes/user';
import authRoutes from './routes/auth';

dotenv.config();
const app = Fastify({ logger: true });

// ลงทะเบียน swagger
app.register(swagger, {
  openapi: {
    info: { title: 'User Service', version: '1.0.0' }
  }
});
app.register(swaggerUI, { routePrefix: '/docs' });

// ลงทะเบียน cors ก่อน route อื่นๆ
app.register(cors, {
  origin: 'http://localhost:5173',   // หรือ * ถ้าต้องการอนุญาตทุกที่ (แนะนำเจาะจง)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

// ลงทะเบียน routes
app.register(userRoutes);
app.register(authRoutes, { prefix: '/auth' });

app.listen({ port: Number(process.env.PORT) || 4001, host: '0.0.0.0' });
