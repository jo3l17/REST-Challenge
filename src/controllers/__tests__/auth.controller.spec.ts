import { signup, login, logout, passwordRecover, passwordChange, refreshToken } from "../auth.controller";
import { PrismaClient } from ".prisma/client";
import { Request, Response } from "express";
import { verifyToken } from "../../services/auth.service";
const prisma = new PrismaClient();

type ResponseObject = {
  message: string
  token: string
}

beforeAll(async () => {
  await prisma.$connect();
})
afterAll(async () => {
  await prisma.$disconnect();
})

describe('Authentication controller: ', () => {
  describe('signup ', () => {
    it('should return a token', async () => {
      const date = new Date().getTime();
      const req = { body: { email: `t${date}@gmail.com`, HASH: '12345678', name: 'Bob' } }
      const res = {
        status(status: number) {
          expect(status).toBe(200)
          return this
        },
        send(result: ResponseObject) {
          const payload = verifyToken(result.token, 'verification');
          expect(payload.type).toBe('verification')
        }
      }
      await signup(req as Request, res as Response)
    })

    it('should return email already in use', async () => {
      const date = new Date().getTime();
      await prisma.user.create({ data: { email: `t${date}@gmail.com`, HASH: '', name: '' } })
      const req = { body: { email: `t${date}@gmail.com`, HASH: '12345678', name: 'Bob' } }
      const res = {
        status(status: number) {
          expect(status).toBe(400)
          return this
        },
        send(result: ResponseObject) {
          expect(typeof result.message).toBe('string')
        }
      }
      await signup(req as Request, res as Response)
    })

    it('should return an Error ', async () => {
      const req = { body: {} }
      const res = {
        status(status: number) {
          expect(status).toBe(500)
          return this
        },
        send(result: ResponseObject) {
          expect(typeof result.message).toBe('string')
        }
      }
      await signup(req as Request, res as Response)
    })
  })
})