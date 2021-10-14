import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import {
  createReport,
  deleteReport,
  getReport,
  getReportList,
} from '../controllers/report.controller';
import { resourceType } from '../middleware/report.middleware';

const postReportRouter: Router = Router();
const reportRouter: Router = Router({ mergeParams: true });

postReportRouter
  .get('/', asyncHandler(getReportList))
  .get('/:reportId', asyncHandler(getReport))
  .delete('/:reportId', asyncHandler(deleteReport));

reportRouter.post('/', resourceType, createReport);

export { postReportRouter, reportRouter };
