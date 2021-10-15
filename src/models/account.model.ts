import { Prisma } from '.prisma/client';

const accountData = Prisma.validator<Prisma.AccountArgs>()({
  select: {
    id: true,
    isEmailPublic: true,
    isNamePublic: true,
    userId: true,
  },
});

export { accountData };
