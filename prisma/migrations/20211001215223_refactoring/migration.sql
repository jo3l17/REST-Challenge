/*
  Warnings:

  - You are about to drop the column `dislikedBy` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `likedBy` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `dislikedBy` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `likedBy` on the `Post` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Actions" AS ENUM ('like', 'dislike');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'moderator');

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "dislikedBy",
DROP COLUMN "likedBy";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "dislikedBy",
DROP COLUMN "likedBy";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT E'user';

-- CreateTable
CREATE TABLE "PostLike" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,
    "type" "Actions" NOT NULL,

    CONSTRAINT "PostLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentLike" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "commentId" INTEGER NOT NULL,
    "type" "Actions" NOT NULL,

    CONSTRAINT "CommentLike_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentLike" ADD CONSTRAINT "CommentLike_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentLike" ADD CONSTRAINT "CommentLike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
