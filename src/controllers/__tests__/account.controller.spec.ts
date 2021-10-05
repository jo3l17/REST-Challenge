import { PrismaClient, User } from ".prisma/client";

const prisma = new PrismaClient();

type ResponseObject = {
  message?: string
  token?: string
}

describe('Account controller: ', () => {
  describe('getUser ', () => {
    it('should return a user', async () => {
      const date = new Date().getTime();
      const user = await prisma.user.create({ data: { email: `t${date}@gmail.com`, HASH: '', name: '' } })
      const req = { params: { id: `${user.id}` } }
      const res = {
        status(status: number) {
          expect(status).toBe(200)
          return this
        },
        send(result: User) {
          expect(result.email).toEqual(user.email)
        }
      }
    })
  })
})