/*
  Warnings:

  - You are about to drop the `ReportComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReportPost` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('post', 'comment');

-- DropForeignKey
ALTER TABLE "ReportComment" DROP CONSTRAINT "ReportComment_accountId_fkey";

-- DropForeignKey
ALTER TABLE "ReportComment" DROP CONSTRAINT "ReportComment_commentId_fkey";

-- DropForeignKey
ALTER TABLE "ReportPost" DROP CONSTRAINT "ReportPost_accountId_fkey";

-- DropForeignKey
ALTER TABLE "ReportPost" DROP CONSTRAINT "ReportPost_postId_fkey";

-- DropTable
DROP TABLE "ReportComment";

-- DropTable
DROP TABLE "ReportPost";

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "content" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commentId" INTEGER,
    "postId" INTEGER,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
