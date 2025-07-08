import Fastify from 'fastify';
import dotenv from 'dotenv';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import userRoutes from './routes/user';

dotenv.config();
const app = Fastify({ logger: true });

app.register(swagger, {
  openapi: {
    info: { title: 'User Service', version: '1.0.0' }
  }
});
app.register(swaggerUI, { routePrefix: '/docs' });

app.register(userRoutes);

app.listen({ port: Number(process.env.PORT) || 4001, host: '0.0.0.0' });
