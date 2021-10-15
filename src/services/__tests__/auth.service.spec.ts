// import { PrismaClient } from '.prisma/client';
// import { hashSync } from 'bcrypt';
// import { jwtData } from '../../utils/jwt.util';
// import AuthService from '../auth.service';
// import createHttpError from 'http-errors';
// import { sgMail } from '../../utils/sendgrid.util';

// jest.mock('http-errors', () => {
//   return jest.fn();
// });
// jest.mock('../../utils/sendgrid.util');

// const prisma = new PrismaClient();

// beforeAll(async () => {
//   await prisma.$connect();
//   await prisma.user.deleteMany();
// });
// afterAll(async () => {
//   await prisma.$disconnect();
// });

// describe('Authentication service: ', () => {
//   describe('validate password ', () => {
//     const hashedPassword = hashSync('12345678', 12);
//     it('should return true', async () => {
//       expect(
//         await AuthService.validatePassword('12345678', hashedPassword),
//       ).toBeTruthy();
//     });
//     it('should return false', async () => {
//       expect(
//         await AuthService.validatePassword('123456789', hashedPassword),
//       ).toBeFalsy();
//     });
//   });

//   describe('create Token', () => {
//     it('should return a valid token', async () => {
//       const user = await prisma.user.create({
//         data: {
//           email: 'johndoe@email.com',
//           name: 'john doe',
//           password: '123456',
//         },
//       });
//       const data: jwtData = { id: user.id, role: 'user', type: 'verification' };
//       const token = await AuthService.createToken(data);
//       expect(token.userId).toEqual(user.id);
//     });
//   });

//   describe('generateToken', () => {
//     it('should return a generated token', async () => {
//       const user = await prisma.user.create({
//         data: {
//           email: 'johndoe2@email.com',
//           name: 'john doe',
//           password: '123456',
//         },
//       });
//       const data: jwtData = { id: user.id, role: 'user', type: 'verification' };
//       const token = await AuthService.generateToken(data);
//       expect(typeof token).toBe('string');
//     });
//   });

//   describe('verifyToken', () => {
//     it('should return a verifiedToken', async () => {
//       expect.assertions(2);
//       const user = await prisma.user.create({
//         data: {
//           email: 'johndoe3@email.com',
//           name: 'john doe',
//           password: '123456',
//         },
//       });
//       const data: jwtData = { id: user.id, role: 'user', type: 'verification' };
//       const token = await AuthService.generateToken(data);
//       const result = await AuthService.verifyToken(token, 'verification');

//       expect(result.id).toEqual(user.id);
//       expect(result.role).toEqual(user.role);
//     });
//     it('should throw invalid token', async () => {
//       expect.assertions(2);
//       const user = await prisma.user.create({
//         data: {
//           email: 'johndoe4@email.com',
//           name: 'john doe',
//           password: '123456',
//         },
//       });
//       const data: jwtData = { id: user.id, role: 'user', type: 'verification' };
//       const token = await AuthService.generateToken(data);
//       try {
//         await AuthService.verifyToken(token);
//       } catch (e) {
//         expect(
//           (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
//             .calls[0][0],
//         ).toBe(400);
//         expect(
//           (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
//             .calls[0][1],
//         ).toMatch('invalid token');
//       }
//     });
//   });
//   describe('sendNewVerification', () => {
//     it('should create an send an email', async () => {
//       const user = await prisma.user.create({
//         data: {
//           email: 'johndoe5@email.com',
//           name: 'john doe',
//           password: '123456',
//         },
//       });
//       const data: jwtData = { id: user.id, role: 'user', type: 'verification' };
//       const token = await AuthService.createToken(data);
//       await AuthService.sendNewVerification(token.token);
//       expect(sgMail.send).toHaveBeenCalledTimes(1);
//     });
//   });
//   describe('uniqueEmail', () => {
//     it('should return true', async () => {
//       const result = await AuthService.uniqueEmail('johndoe6@email.com')
//       expect(result).toBeTruthy()
//     });
//     it('should return false', async () => {
//       const result = await AuthService.uniqueEmail('johndoe5@email.com')
//       expect(result).toBeFalsy()
//     });
//   });
// });