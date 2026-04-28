import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { Readable } from 'node:stream'
import { prisma } from '../lib/prisma'

const BASE_URL = () => process.env.BASE_URL ?? 'http://localhost:3333'

export async function linksRoutes(app: FastifyInstance) {
  // List all links
  app.get('/links', async () => {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { accesses: true } } },
    })

    return links.map((link) => ({
      id: link.id,
      name: link.name,
      url: link.url,
      shortCode: link.shortCode,
      shortUrl: `${BASE_URL()}/${link.shortCode}`,
      accessCount: link._count.accesses,
      createdAt: link.createdAt,
    }))
  })

  // Export all links summary as CSV (Node.js streams)
  app.get('/links/export', async (_request, reply) => {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { accesses: true } } },
    })

    async function* csvRows() {
      yield 'id,nome,url_original,codigo,url_encurtada,total_acessos,criado_em\n'
      for (const link of links) {
        const name = (link.name ?? '').replace(/"/g, '""')
        const url = link.url.replace(/"/g, '""')
        yield `"${link.id}","${name}","${url}","${link.shortCode}","${BASE_URL()}/${link.shortCode}",${link._count.accesses},"${link.createdAt.toISOString()}"\n`
      }
    }

    return reply
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', 'attachment; filename="links.csv"')
      .send(Readable.from(csvRows()))
  })

  // Create a new shortened link
  app.post('/links', async (request, reply) => {
    const bodySchema = z.object({
      url: z.string().url({ message: 'URL inválida' }),
      name: z.string().min(1).optional(),
      customCode: z
        .string()
        .min(3)
        .max(20)
        .regex(/^[a-zA-Z0-9_-]+$/, 'Use apenas letras, números, - e _')
        .optional(),
    })

    const { url, name, customCode } = bodySchema.parse(request.body)
    const shortCode = customCode ?? nanoid(6)

    const existing = await prisma.link.findUnique({ where: { shortCode } })
    if (existing) {
      return reply.status(409).send({ error: 'Código já em uso. Escolha outro.' })
    }

    const link = await prisma.link.create({ data: { url, name, shortCode } })

    return reply.status(201).send({
      id: link.id,
      name: link.name,
      url: link.url,
      shortCode: link.shortCode,
      shortUrl: `${BASE_URL()}/${link.shortCode}`,
      createdAt: link.createdAt,
    })
  })

  // Delete a link
  app.delete('/links/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params)

    const link = await prisma.link.findUnique({ where: { id } })
    if (!link) return reply.status(404).send({ error: 'Link não encontrado' })

    await prisma.link.delete({ where: { id } })
    return reply.status(204).send()
  })

  // Get access report for a link (JSON)
  app.get('/links/:id/stats', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params)
    const { days } = z.object({ days: z.coerce.number().int().positive().default(30) }).parse(request.query)

    const link = await prisma.link.findUnique({ where: { id } })
    if (!link) return reply.status(404).send({ error: 'Link não encontrado' })

    const since = new Date()
    since.setDate(since.getDate() - days)

    const [accesses, totalAccesses] = await Promise.all([
      prisma.access.findMany({
        where: { linkId: id, accessedAt: { gte: since } },
        orderBy: { accessedAt: 'desc' },
      }),
      prisma.access.count({ where: { linkId: id } }),
    ])

    const byDay: Record<string, number> = {}
    for (const access of accesses) {
      const day = access.accessedAt.toISOString().split('T')[0]
      byDay[day] = (byDay[day] ?? 0) + 1
    }

    const accessesByDay = Object.entries(byDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      link: {
        id: link.id,
        name: link.name,
        url: link.url,
        shortCode: link.shortCode,
        shortUrl: `${BASE_URL()}/${link.shortCode}`,
        createdAt: link.createdAt,
      },
      totalAccesses,
      accessesInPeriod: accesses.length,
      periodDays: days,
      accessesByDay,
      recentAccesses: accesses.slice(0, 10).map((a) => ({
        accessedAt: a.accessedAt,
        ip: a.ip,
        userAgent: a.userAgent,
      })),
    }
  })

  // Export accesses of a link as CSV (Node.js streams)
  app.get('/links/:id/stats/export', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params)
    const { days } = z.object({ days: z.coerce.number().int().positive().default(30) }).parse(request.query)

    const link = await prisma.link.findUnique({ where: { id } })
    if (!link) return reply.status(404).send({ error: 'Link não encontrado' })

    const since = new Date()
    since.setDate(since.getDate() - days)

    // Use Prisma cursor-based pagination to stream large datasets efficiently
    async function* csvRows() {
      yield `"Relatório de Acessos - ${link.name ?? link.shortCode}"\n`
      yield `"URL Original","${link.url}"\n`
      yield `"URL Encurtada","${BASE_URL()}/${link.shortCode}"\n`
      yield `"Período","Últimos ${days} dias"\n`
      yield '\n'
      yield 'data_acesso,ip,user_agent\n'

      let cursor: string | undefined
      const PAGE = 100

      while (true) {
        const rows = await prisma.access.findMany({
          where: { linkId: id, accessedAt: { gte: since } },
          orderBy: { accessedAt: 'desc' },
          take: PAGE,
          ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        })

        for (const row of rows) {
          const ua = (row.userAgent ?? '').replace(/"/g, '""')
          yield `"${row.accessedAt.toISOString()}","${row.ip ?? ''}","${ua}"\n`
        }

        if (rows.length < PAGE) break
        cursor = rows[rows.length - 1].id
      }
    }

    return reply
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', `attachment; filename="acessos-${link.shortCode}.csv"`)
      .send(Readable.from(csvRows()))
  })
}
