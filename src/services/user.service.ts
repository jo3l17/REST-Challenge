import { PrismaClient } from ".prisma/client";
const prisma = new PrismaClient();

const findByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    select: { id: true, email: true, role: true, name: true, HASH: true, verifiedAt: true },
    where: { email }
  })
  return user;
}

const findById = async (id: number) => {
  const user = await prisma.user.findUnique({
    select: { id: true, email: true, role: true, name: true, verifiedAt: true },
    where: { id }
  })
  return user;
}

const updateVerification = async (id: number) => {
  const user = await prisma.user.update({
    where: { id }, data: { verifiedAt: new Date() }
  })
}

export { findByEmail, findById, updateVerification }