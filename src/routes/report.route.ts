import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import {
  createReport,
  deleteReport,
  getReport,
  getReportList,
} from '../controllers/report.controller';
import { resourceType } from '../middleware/report.middleware';

const reportRouter: Router = Router();
const reportAccountRouter: Router = Router({ mergeParams: true });

reportRouter
  .get('/', asyncHandler(getReportList))
  .get('/:reportId', asyncHandler(getReport))
  .delete('/:reportId', asyncHandler(deleteReport));

reportAccountRouter.post(
  '/',
  asyncHandler(resourceType),
  asyncHandler(createReport),
);

export { reportRouter, reportAccountRouter };
