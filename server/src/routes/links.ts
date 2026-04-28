import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { eq, desc, sql } from 'drizzle-orm'
import { db } from '../db'
import { links } from '../db/schema'
import { uploadCSV } from '../lib/r2'

const shortCodeSchema = z
  .string()
  .min(3, 'Mínimo 3 caracteres')
  .max(20, 'Máximo 20 caracteres')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Use apenas letras, números, - e _')

const frontendUrl = () => process.env.FRONTEND_URL ?? 'http://localhost'

function formatLink(link: { id: string; url: string; shortCode: string; accessCount: number; createdAt: Date }) {
  return {
    id: link.id,
    url: link.url,
    shortCode: link.shortCode,
    shortUrl: `${frontendUrl()}/${link.shortCode}`,
    accessCount: link.accessCount,
    createdAt: link.createdAt,
  }
}

export async function linksRoutes(app: FastifyInstance) {
  // List all links
  app.get('/links', async () => {
    const rows = await db
      .select()
      .from(links)
      .orderBy(desc(links.createdAt))

    return rows.map(formatLink)
  })

  // Export all links as CSV → upload to R2 → return CDN URL
  app.get('/links/export', async (_request, reply) => {
    const rows = await db
      .select()
      .from(links)
      .orderBy(desc(links.createdAt))

    const header = 'url_original,url_encurtada,contagem_acessos,data_criacao'
    const body = rows.map((link) => {
      const shortUrl = `${frontendUrl()}/${link.shortCode}`
      return `"${link.url}","${shortUrl}",${link.accessCount},"${link.createdAt.toISOString()}"`
    })

    const csvContent = [header, ...body].join('\n')
    const url = await uploadCSV(csvContent)

    return reply.status(200).send({ url })
  })

  // Create a new shortened link
  app.post('/links', async (request, reply) => {
    const { url, shortCode: customCode } = z
      .object({
        url: z.string().url({ message: 'URL inválida' }),
        shortCode: shortCodeSchema.optional(),
      })
      .parse(request.body)

    const shortCode = customCode ?? nanoid(6)

    // Validate the generated code too
    shortCodeSchema.parse(shortCode)

    const existing = await db
      .select({ id: links.id })
      .from(links)
      .where(eq(links.shortCode, shortCode))
      .limit(1)

    if (existing.length > 0) {
      return reply.status(409).send({ error: 'URL encurtada já existe' })
    }

    const [link] = await db
      .insert(links)
      .values({ url, shortCode })
      .returning()

    return reply.status(201).send(formatLink(link))
  })

  // Get link by shortCode and increment access count
  app.get('/links/:shortCode', async (request, reply) => {
    const { shortCode } = z.object({ shortCode: z.string() }).parse(request.params)

    const [link] = await db
      .update(links)
      .set({ accessCount: sql`${links.accessCount} + 1` })
      .where(eq(links.shortCode, shortCode))
      .returning()

    if (!link) {
      return reply.status(404).send({ error: 'Link não encontrado' })
    }

    return formatLink(link)
  })

  // Delete a link by shortCode
  app.delete('/links/:shortCode', async (request, reply) => {
    const { shortCode } = z.object({ shortCode: z.string() }).parse(request.params)

    const [deleted] = await db
      .delete(links)
      .where(eq(links.shortCode, shortCode))
      .returning({ id: links.id })

    if (!deleted) {
      return reply.status(404).send({ error: 'Link não encontrado' })
    }

    return reply.status(204).send()
  })
}
