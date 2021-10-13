import { signup } from "../auth.controller";
import { PrismaClient } from ".prisma/client";
import { Request, Response } from "express";
import authService from "../../services/auth.service";
const prisma = new PrismaClient();

type ResponseObject = {
  message: string
  token: string
}

beforeAll(async () => {
  await prisma.$connect();
  await prisma.user.deleteMany();
})
afterAll(async () => {
  await prisma.$disconnect();
})

describe('Authentication controller: ', () => {
  describe('signup ', () => {
    it('should return a token', async () => {
      // const date = new Date().getTime();
      const req = { body: { email: `joelvaldez@ravn.co`, password: '12345678', name: 'Joel' } }
      const res = {
        status(status: number) {
          expect(status).toBe(200)
          return this
        },
        async json(result: ResponseObject) {
          const payload = await authService.verifyToken(result.token, 'verification');
          expect(payload.type).toBe('verification')
        }
      }
      await signup(req as Request, res as unknown as Response)
    })

    /*it('should return email already in use', async () => {
      const date = new Date().getTime();
      await prisma.user.create({ data: { email: `t${date}@gmail.com`, password: '', name: '' } })
      const req = { body: { email: `t${date}@gmail.com`, password: '12345678', name: 'Bob' } }
      const res = {
        status(status: number) {
          expect(status).toBe(400)
          return this
        },
        json(result: ResponseObject) {
          console.log(result)
          expect(typeof result.message).toBe('string')
        }
      }
      // await signup(req as Request, res as Response)
      expect(signup(req as Request, res as unknown as Response)).toThrow(Error);
    })

    it('should return an Error ', async () => {
      const req = { body: {} }
      const res = {
        status(status: number) {
          expect(status).toBe(500)
          return this
        },
        json(result: ResponseObject) {
          expect(typeof result.message).toBe('string')
        }
      }
      await signup(req as Request, res as Response)
    })*/
  })
})