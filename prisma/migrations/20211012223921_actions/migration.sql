/*
  Warnings:

  - The values [likes,dislikes] on the enum `Actions` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Actions_new" AS ENUM ('like', 'dislike');
ALTER TABLE "PostLike" ALTER COLUMN "type" TYPE "Actions_new" USING ("type"::text::"Actions_new");
ALTER TABLE "CommentLike" ALTER COLUMN "type" TYPE "Actions_new" USING ("type"::text::"Actions_new");
ALTER TYPE "Actions" RENAME TO "Actions_old";
ALTER TYPE "Actions_new" RENAME TO "Actions";
DROP TYPE "Actions_old";
COMMIT;
