import { Prisma } from '.prisma/client';

const userPersonalData = Prisma.validator<Prisma.UserArgs>()({
  select: {
    id: true,
    email: true,
    role: true,
    name: true,
    verifiedAt: true,
    password: true,
    temporalEmail: true,
  },
});

export { userPersonalData };
