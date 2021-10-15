import { PrismaClient, Report, ReportType } from '.prisma/client';
import { plainToClass } from 'class-transformer';
import createHttpError from 'http-errors';
import { CreateReportDto } from '../models/reports/request/create.report.dto';
import { FetchReportsDto } from '../models/reports/response/fetch.reports.dto';
import { createEmail, createReport, sgMail } from '../utils/sendgrid.util';
import { PostService } from './post.service';

const prisma = new PrismaClient();

class ReportService {
  static createReport = async (
    accountId: number,
    type: ReportType,
    resourceId: number,
    body: CreateReportDto,
  ): Promise<Report> => {
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

    await this.sendReports(report);
    return report;
  };

  private static sendReports = async (report: Report): Promise<void> => {
    const moderators = await prisma.user.findMany({
      select: { email: true },
      where: { role: 'moderator' },
    });
    const emailMod = moderators.map((moderator) => moderator.email);
    const msg = createReport(emailMod, report);

    await sgMail.send(msg);
  };

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
            accountId: true,
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
      rejectOnNotFound: true,
    });

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
            accountId: true,
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
