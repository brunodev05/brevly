CREATE TABLE IF NOT EXISTS "links" (
    "id" text PRIMARY KEY NOT NULL,
    "url" text NOT NULL,
    "short_code" text NOT NULL,
    "access_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "links_short_code_unique" UNIQUE("short_code")
);
