import { Prisma } from '.prisma/client';

const tokenData = Prisma.validator<Prisma.TokenArgs>()({
  select: {
    token: true,
    expirationDate: true,
    userId: true,
  },
});

type tokenModel = Prisma.TokenGetPayload<typeof tokenData>;

export { tokenModel, tokenData };
