import { plainToClass } from 'class-transformer';
import { Request, Response } from 'express';
import { CreatePostReportDto } from '../models/reports/request/create.report.dto';
import { FetchReportsDto } from '../models/reports/response/fetch.reports.dto';
import { PostReportDto } from '../models/reports/response/report.dto';
import { ReportService } from '../services/report.service';

const createReport = async (req: Request, res: Response): Promise<void> => {
  const dto = plainToClass(CreatePostReportDto, req.body);
  dto.isValid();

  const report = await ReportService.createReport(
    req.accountId,
    res.locals.type,
    parseInt(res.locals.resourceId),
    dto,
  );

  console.log(report);
  res.status(200).json(plainToClass(PostReportDto, report));
};

const deleteReport = async (req: Request, res: Response): Promise<void> => {
  const reports = await ReportService.deleteReport(
    parseInt(req.params.reportId),
  );

  res.status(200).json(plainToClass(FetchReportsDto, reports));
};

const getReport = async (req: Request, res: Response): Promise<void> => {
  const report = await ReportService.getReport(parseInt(req.params.reportId));

  res.status(200).json(report);
};

const getReportList = async (req: Request, res: Response): Promise<void> => {
  const reports = await ReportService.getReportList();

  res.status(200).json(reports);
};

export { createReport, deleteReport, getReport, getReportList };
