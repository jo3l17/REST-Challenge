import { PrismaClient } from ".prisma/client";
import { hashSync } from "bcrypt";
import { jwtData } from "../../utils/jwt.util";
import AuthService from "../auth.service";

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
  await prisma.user.deleteMany();
})
afterAll(async () => {
  await prisma.$disconnect();
})

describe('Authentication service: ', () => {
  describe('validate password ', () => {
    const hashedPassword = hashSync('12345678', 12)
    it('should return true', async () => {
      expect(await AuthService.validatePassword('12345678', hashedPassword)).toBeTruthy();
    })
    it('should return false', async () => {
      expect(await AuthService.validatePassword('123456789', hashedPassword)).toBeFalsy();
    })
  })
  describe('create Token', () => {
    it('should return a valid token', async () => {
      const user = await prisma.user.create({ data: { email: 'johndoe@email.com', name: 'john doe', password: '123456' } })
      const data: jwtData = { id: user.id, role: 'user', type: 'verification' }
      const token = await AuthService.createToken(data);
      expect(token.userId).toEqual(user.id);
    })
  })
  describe('generateToken', () => {
    it('should return a generated token', async () => {
      const user = await prisma.user.create({ data: { email: 'johndoe2@email.com', name: 'john doe', password: '123456' } })
      const data: jwtData = { id: user.id, role: 'user', type: 'verification' }
      const token = await AuthService.generateToken(data);
      expect(typeof token).toBe('string');
    })
  })
})