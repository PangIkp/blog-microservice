import Fastify from 'fastify';
import dotenv from 'dotenv';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import notiRoutes from './routes/noti';

dotenv.config();

const app = Fastify({ logger: true });

app.register(swagger, {
  openapi: {
    info: {
      title: 'Notification Service',
      version: '1.0.0',
    },
  },
});

app.register(swaggerUI, { routePrefix: '/docs' });

app.register(notiRoutes);

const start = async () => {
  try {
    const PORT = parseInt(process.env.PORT || '4002');
    await app.listen({ port: PORT, host: '0.0.0.0' });
    app.log.info(`Server listening on port ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
