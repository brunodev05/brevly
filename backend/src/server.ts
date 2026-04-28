import Fastify from 'fastify'
import cors from '@fastify/cors'
import { linksRoutes } from './routes/links'
import { redirectRoute } from './routes/redirect'

const app = Fastify({ logger: true, trustProxy: true })

app.register(cors, {
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  methods: ['GET', 'POST', 'DELETE'],
})

app.register(linksRoutes, { prefix: '/api' })
app.register(redirectRoute)

app.get('/api/health', async () => ({ status: 'ok' }))

app.setErrorHandler((error, _request, reply) => {
  if (error.name === 'ZodError') {
    return reply.status(400).send({
      error: 'Dados inválidos',
      issues: JSON.parse(error.message),
    })
  }
  app.log.error(error)
  return reply.status(500).send({ error: 'Erro interno do servidor' })
})

const PORT = Number(process.env.PORT ?? 3333)
const HOST = process.env.HOST ?? '0.0.0.0'

app.listen({ port: PORT, host: HOST }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})
