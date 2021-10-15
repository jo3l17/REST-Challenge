import { plainToClass } from 'class-transformer';
import { Request, Response } from 'express';
import { CreateReportDto } from '../models/reports/request/create.report.dto';
import { FetchReportsDto } from '../models/reports/response/fetch.reports.dto';
import { ReportDto } from '../models/reports/response/report.dto';
import { ReportService } from '../services/report.service';

const createReport = async (req: Request, res: Response): Promise<void> => {
  const dto = plainToClass(CreateReportDto, req.body);
  dto.isValid();

  console.log(dto);
  const report = await ReportService.createReport(
    req.accountId,
    res.locals.type,
    parseInt(res.locals.resourceId),
    dto,
  );

  console.log(report);
  res.status(200).json(plainToClass(ReportDto, report));
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
