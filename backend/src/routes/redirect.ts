import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function redirectRoute(app: FastifyInstance) {
  app.get('/:shortCode', async (request, reply) => {
    const paramsSchema = z.object({ shortCode: z.string() })
    const { shortCode } = paramsSchema.parse(request.params)

    const link = await prisma.link.findUnique({ where: { shortCode } })

    if (!link) {
      return reply.status(404).send({ error: 'Link não encontrado' })
    }

    // Record this access
    await prisma.access.create({
      data: {
        linkId: link.id,
        ip: request.ip,
        userAgent: request.headers['user-agent'] ?? null,
      },
    })

    return reply.redirect(302, link.url)
  })
}
