import { PrismaClient, User } from ".prisma/client";
import { Request, Response } from "express";
import { getUser } from "../user.controller";

const prisma = new PrismaClient();

describe('User controller: ', () => {
  describe('getUser ', () => {
    it('should return a user', async () => {
      const date = new Date().getTime();
      const user = await prisma.user.create({ data: { email: `joelvaldezangeles+${date}@gmail.com`, password: '', name: '' } })
      const req = { body: {}, params: { id: `${user.id}` } }
      // const req = { body: { email: `t${date}@gmail.com`, HASH: '12345678', name: 'Bob' } }
      const res = {
        status(status: number) {
          expect(status).toBe(200)
          return this
        },
        json(result: User) {
          expect(result.email).toEqual(user.email)
        }
      }
      getUser(req as unknown as Request, res as Response)
    })
  })
})