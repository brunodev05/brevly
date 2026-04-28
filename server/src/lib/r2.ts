import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
})

export async function uploadCSV(content: string): Promise<string> {
  const key = `links-${randomUUID()}.csv`

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET!,
      Key: key,
      Body: content,
      ContentType: 'text/csv; charset=utf-8',
    }),
  )

  return `${process.env.CLOUDFLARE_PUBLIC_URL}/${key}`
}
