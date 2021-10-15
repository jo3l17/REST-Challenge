import { PrismaClient, Report, ReportType } from '.prisma/client';
import { plainToClass } from 'class-transformer';
import createHttpError from 'http-errors';
import { CreatePostReportDto } from '../models/reports/request/create.report.dto';
import { FetchReportsDto } from '../models/reports/response/fetch.reports.dto';
import { createEmail, createReport, sgMail } from '../utils/sendgrid.util';

const prisma = new PrismaClient();

class ReportService {
  static createReport = async (
    accountId: number,
    type: ReportType,
    resourceId: number,
    body: CreatePostReportDto,
  ): Promise<Report> => {
    console.log(type == ReportType.post);

    try {
      const report = await prisma.report.create({
        data: {
          title: body.title,
          content: body.content,
          type: type,
          account: {
            connect: {
              id: accountId,
            },
          },
          [type]: {
            connect: {
              id: resourceId,
            },
          },
        },
      });

      console.log(report);
      this.sendReports(report);
      return report;
    } catch (error) {
      throw error;
    }
  };

  private static sendReports = async (report: Report) => {
    const moderators = await prisma.user.findMany({
      select: { email: true },
      where: { role: 'moderator' }
    })
    console.log(moderators);
    const emailMod = moderators.map(moderator => moderator.email)
    console.log(emailMod);
    const msg = createReport(emailMod, report)
    
    await sgMail.send(msg)
  }

  static deleteReport = async (reportId: number): Promise<Report> => {
    return await prisma.report.delete({
      where: {
        id: reportId,
      },
    });
  };

  static getReport = async (reportId: number): Promise<FetchReportsDto> => {
    const report = await prisma.report.findFirst({
      select: {
        id: true,
        title: true,
        content: true,
        post: {
          select: {
            id: true,
            title: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
          },
        },
        accountId: true,
      },
      where: {
        id: reportId,
      },
    });

    if (!report) {
      throw createHttpError(404, 'Report not found');
    }

    return plainToClass(FetchReportsDto, report);
  };

  static getReportList = async (): Promise<FetchReportsDto[]> => {
    const reports = await prisma.report.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        post: {
          select: {
            id: true,
            title: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
          },
        },
        accountId: true,
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
    });

    return plainToClass(FetchReportsDto, reports);
  };
}

export { ReportService };
