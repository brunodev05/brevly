import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const links = pgTable('links', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  url: text('url').notNull(),
  shortCode: text('short_code').notNull().unique(),
  accessCount: integer('access_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Link = typeof links.$inferSelect
export type NewLink = typeof links.$inferInsert
