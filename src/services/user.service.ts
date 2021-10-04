import { PrismaClient } from ".prisma/client";
const prisma = new PrismaClient();

const findOne = async (email: string) => {
  const user = await prisma.user.findUnique({
    select: { id: true, email: true, role: true, name: true, HASH: true, verifiedAt: true },
    where: { email }
  })
  return user;
}

export { findOne }