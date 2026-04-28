import { migrate } from 'drizzle-orm/postgres-js/migrator'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { db } from './db'
import { linksRoutes } from './routes/links'

async function bootstrap() {
  await migrate(db, { migrationsFolder: './drizzle' })

  const app = Fastify({ logger: true, trustProxy: true })

  await app.register(cors, {
    origin: process.env.FRONTEND_URL ?? 'http://localhost',
    methods: ['GET', 'POST', 'DELETE'],
  })

  app.register(linksRoutes, { prefix: '/api' })

  app.get('/api/health', async () => ({ status: 'ok' }))

  app.setErrorHandler((error, _request, reply) => {
    if (error.name === 'ZodError') {
      return reply.status(400).send({ error: 'Dados inválidos', issues: JSON.parse(error.message) })
    }
    app.log.error(error)
    return reply.status(500).send({ error: 'Erro interno do servidor' })
  })

  const PORT = Number(process.env.PORT ?? 3333)

  await app.listen({ port: PORT, host: '0.0.0.0' })
}

bootstrap()
