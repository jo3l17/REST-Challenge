import { PrismaClient, User } from ".prisma/client";
import createHttpError from "http-errors";
import { userPersonalData } from "../models/user.model";
import { createEmail, sgMail } from "../utils/sendgrid.util";
import accountService from "./account.service";
import { generateToken } from "./auth.service";
const prisma = new PrismaClient();

class userService {
  static create = async (data: User) => {
    const user = await prisma.user.create({ data })
    return user;
  }

  static findByEmail = async (email: string) => {
    const user = await prisma.user.findUnique(
      {
        select: {
          ...userPersonalData.select,
          HASH: true
        },
        where: { email }
      }
    )

    if (!user) {
      throw createHttpError(404, 'no user found')
    }

    if (!user.verifiedAt) {
      throw createHttpError(400, 'email not verified')
    }

    return user;
  }

  static findAnyByEmail = async (email: string) => {
    const user = await prisma.user.findUnique(
      {
        select: {
          ...userPersonalData.select,
          HASH: true
        },
        where: { email }
      }
    )

    return user;
  }

  static findById = async (id: number) => {
    const user = await prisma.user.findUnique(
      {
        ...userPersonalData,
        where: { id }
      }
    )
    if (!user) {
      throw createHttpError(404, 'no user found')
    }
    return user;
  }

  static findVerifiedById = async (id: number) => {
    const user = await prisma.user.findFirst(
      {
        ...userPersonalData,
        where: {
          id,
          NOT: [{
            verifiedAt: null
          }]
        }
      }
    )
    if (!user) {
      throw createHttpError(404, 'user not verified')
    }
    return user;
  }

  static updateVerification = async (id: number, role: string) => {
    await prisma.user.update(
      {
        where: { id },
        data: {
          verifiedAt: new Date()
        }
      }
    )
    if (role === 'user') {
      await accountService.create(id)
    }
  }

  static updatePassword = async (id: number, HASH: string) => {
    await prisma.user.update(
      {
        where: { id },
        data: { HASH }
      }
    )
  }

  static updateEmail = async (id: number) => {
    const user = await this.findVerifiedById(id);
    if (!user.temporalEmail) {
      throw createHttpError(400, 'User haven\'t request an email change')
    }
    await prisma.user.update(
      {
        where: { id },
        data: {
          email: user.temporalEmail
          , temporalEmail: null
        }
      }
    )
  }

  static createTemporalEmail = async (id: number, temporalEmail: string) => {
    const user = await this.findVerifiedById(id);
    const existingUser = await this.findAnyByEmail(temporalEmail);
    if (existingUser) {
      throw createHttpError(400, 'email already in use')
    }
    const updatedUser = await prisma.user.update(
      {
        ...userPersonalData,
        where: { id: user.id },
        data: { temporalEmail }
      }
    )
    const token = await generateToken({ id: user.id, role: user.role, type: 'email' });
    const msg = createEmail(
      temporalEmail,
      `Email change`,
      `Hello ${user.name} use patch to this url to verify your new email`,
      `http://localhost:3000/users/email/${token}`,
      token
    )
    await sgMail.send(msg);
    return updatedUser;
  }
}



export default userService