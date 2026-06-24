CREATE TABLE IF NOT EXISTS "species_archive" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "species" TEXT NOT NULL,
  "latin" TEXT NOT NULL,
  "score" REAL NOT NULL DEFAULT 0,
  "records" INTEGER NOT NULL DEFAULT 0,
  "photos" TEXT NOT NULL DEFAULT '[]',
  "tags" TEXT NOT NULL DEFAULT '[]',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "species_archive_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "species_archive_userId_species_key" ON "species_archive"("userId", "species");
