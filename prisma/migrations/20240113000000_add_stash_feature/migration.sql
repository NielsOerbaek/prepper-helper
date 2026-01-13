-- CreateEnum
CREATE TYPE "StashRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateTable
CREATE TABLE "Stash" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stash_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StashMember" (
    "id" TEXT NOT NULL,
    "stashId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "StashRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StashMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StashInvitation" (
    "id" TEXT NOT NULL,
    "stashId" TEXT NOT NULL,
    "email" TEXT,
    "userId" TEXT,
    "invitedBy" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StashInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StashMember_userId_idx" ON "StashMember"("userId");
CREATE INDEX "StashMember_stashId_idx" ON "StashMember"("stashId");
CREATE UNIQUE INDEX "StashMember_stashId_userId_key" ON "StashMember"("stashId", "userId");

-- CreateIndex
CREATE INDEX "StashInvitation_stashId_idx" ON "StashInvitation"("stashId");
CREATE INDEX "StashInvitation_email_idx" ON "StashInvitation"("email");
CREATE INDEX "StashInvitation_userId_idx" ON "StashInvitation"("userId");

-- AddForeignKey
ALTER TABLE "StashMember" ADD CONSTRAINT "StashMember_stashId_fkey" FOREIGN KEY ("stashId") REFERENCES "Stash"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StashMember" ADD CONSTRAINT "StashMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StashInvitation" ADD CONSTRAINT "StashInvitation_stashId_fkey" FOREIGN KEY ("stashId") REFERENCES "Stash"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 1: Add stashId column to Item (nullable initially)
ALTER TABLE "Item" ADD COLUMN "stashId" TEXT;

-- Step 2: Create default stash for each user who has items
INSERT INTO "Stash" ("id", "name", "createdAt", "updatedAt")
SELECT
    CONCAT('stash_', "id"),
    'My Stash',
    NOW(),
    NOW()
FROM "User" u
WHERE EXISTS (SELECT 1 FROM "Item" WHERE "userId" = u.id);

-- Step 3: Create StashMember entries (user as OWNER of their default stash)
INSERT INTO "StashMember" ("id", "stashId", "userId", "role", "createdAt")
SELECT
    CONCAT('member_', u.id),
    CONCAT('stash_', u.id),
    u.id,
    'OWNER',
    NOW()
FROM "User" u
WHERE EXISTS (SELECT 1 FROM "Stash" WHERE "id" = CONCAT('stash_', u.id));

-- Step 4: Update items to point to their owner's stash
UPDATE "Item" i
SET "stashId" = CONCAT('stash_', i."userId");

-- Step 5: Make stashId required and add foreign key
ALTER TABLE "Item" ALTER COLUMN "stashId" SET NOT NULL;
ALTER TABLE "Item" ADD CONSTRAINT "Item_stashId_fkey" FOREIGN KEY ("stashId") REFERENCES "Stash"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 6: Drop the old userId column and index from Item
DROP INDEX IF EXISTS "Item_userId_idx";
ALTER TABLE "Item" DROP CONSTRAINT IF EXISTS "Item_userId_fkey";
ALTER TABLE "Item" DROP COLUMN "userId";

-- Step 7: Create new index on stashId for Item
CREATE INDEX "Item_stashId_idx" ON "Item"("stashId");

-- Step 8: Add stashId column to ChecklistItem (nullable initially)
ALTER TABLE "ChecklistItem" ADD COLUMN "stashId" TEXT;

-- Step 9: Update ChecklistItem to point to their owner's stash
UPDATE "ChecklistItem" c
SET "stashId" = CONCAT('stash_', c."userId");

-- Step 10: For users without a stash yet (no items but has checklist), create stash
INSERT INTO "Stash" ("id", "name", "createdAt", "updatedAt")
SELECT
    CONCAT('stash_', u.id),
    'My Stash',
    NOW(),
    NOW()
FROM "User" u
WHERE EXISTS (SELECT 1 FROM "ChecklistItem" WHERE "userId" = u.id)
  AND NOT EXISTS (SELECT 1 FROM "Stash" WHERE "id" = CONCAT('stash_', u.id));

-- Step 11: Create StashMember entries for these users too
INSERT INTO "StashMember" ("id", "stashId", "userId", "role", "createdAt")
SELECT
    CONCAT('member_', u.id),
    CONCAT('stash_', u.id),
    u.id,
    'OWNER',
    NOW()
FROM "User" u
WHERE EXISTS (SELECT 1 FROM "ChecklistItem" WHERE "userId" = u.id)
  AND NOT EXISTS (SELECT 1 FROM "StashMember" WHERE "userId" = u.id);

-- Step 12: Update remaining ChecklistItem entries
UPDATE "ChecklistItem" c
SET "stashId" = CONCAT('stash_', c."userId")
WHERE "stashId" IS NULL;

-- Step 13: Handle ChecklistItem - drop old constraint and column
DROP INDEX IF EXISTS "ChecklistItem_userId_idx";
ALTER TABLE "ChecklistItem" DROP CONSTRAINT IF EXISTS "ChecklistItem_userId_name_key";
ALTER TABLE "ChecklistItem" DROP CONSTRAINT IF EXISTS "ChecklistItem_userId_fkey";

-- Step 14: Make stashId required for ChecklistItem (only if there are rows)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "ChecklistItem" WHERE "stashId" IS NULL) THEN
        -- This shouldn't happen, but delete orphaned records if any
        DELETE FROM "ChecklistItem" WHERE "stashId" IS NULL;
    END IF;
END $$;

ALTER TABLE "ChecklistItem" ALTER COLUMN "stashId" SET NOT NULL;
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_stashId_fkey" FOREIGN KEY ("stashId") REFERENCES "Stash"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 15: Drop userId column from ChecklistItem
ALTER TABLE "ChecklistItem" DROP COLUMN "userId";

-- Step 16: Create new indexes and constraints for ChecklistItem
CREATE INDEX "ChecklistItem_stashId_idx" ON "ChecklistItem"("stashId");
CREATE UNIQUE INDEX "ChecklistItem_stashId_name_key" ON "ChecklistItem"("stashId", "name");
