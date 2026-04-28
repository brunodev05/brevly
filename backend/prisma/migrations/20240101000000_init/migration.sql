-- CreateTable
CREATE TABLE "links" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "url" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accesses" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,
    "ip" TEXT,

    CONSTRAINT "accesses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "links_shortCode_key" ON "links"("shortCode");

-- AddForeignKey
ALTER TABLE "accesses" ADD CONSTRAINT "accesses_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "links"("id") ON DELETE CASCADE ON UPDATE CASCADE;
