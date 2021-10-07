import { Prisma } from ".prisma/client"

const accountData = Prisma.validator<Prisma.AccountArgs>()({
  select: {
    id: true,
    isEmailPublic: true,
    isNamePublic: true,
    posts: true,
    comments: true,
    user: {
      select: {
        verifiedAt: true
      }
    }
  },
})

type accountModel = Prisma.AccountGetPayload<typeof accountData>

export { accountModel, accountData }