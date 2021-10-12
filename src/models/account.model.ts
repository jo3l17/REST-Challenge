import { Prisma } from '.prisma/client';

const accountData = Prisma.validator<Prisma.AccountArgs>()({
  select: {
    id: true,
    isEmailPublic: true,
    isNamePublic: true,
    userId: true
  },
});

const patchAccountData = Prisma.validator<Prisma.AccountArgs>()({
  select: {
    isEmailPublic: true,
    isNamePublic: true,
  },
});

type resAccountModel = Prisma.AccountGetPayload<typeof accountData>;

type patchAccountModel = Prisma.AccountGetPayload<typeof patchAccountData>;

export { resAccountModel, accountData, patchAccountModel };
