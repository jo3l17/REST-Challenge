-- CreateEnum
CREATE TYPE "tokenType" AS ENUM ('session', 'password', 'email');

-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "type" "tokenType" NOT NULL DEFAULT E'session';
