import { Report } from '.prisma/client';
import sgMail, { MailDataRequired } from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config();

const HOST = process.env.HOST || `localhost:${process.env.PORT || 3000}`;

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const createEmail = (
  to: string,
  subject: string,
  message: string,
  link = '',
  token = '',
): MailDataRequired => {
  const msg: sgMail.MailDataRequired = {
    to,
    subject,
    from: 'joelvaldezangeles@gmail.com',
    html: `<h1>${subject}</h1>
    <p>${message}</p><p>${link}</p>
    ${token ? `<p>or change the token in params<br>${token}</p>` : ''}`,
  };
  return msg;
};

const createReport = (to: string[], report: Report): MailDataRequired => {
  const msg: sgMail.MailDataRequired = {
    to: to.length === 0 ? 'joelvaldezangeles@gmail.com' : to,
    subject: `new ${report.type} reported`,
    from: 'joelvaldezangeles@gmail.com',
    html: `<h1>${report.title}</h1>
    <p>${report.content}</p>
    <p>report Id: ${report.id}</p>
    <p>created at: ${report.createdAt}</p>
    <p>see all reports at:<a href="${HOST}/api/v1/reports">Reports</a> with a bearer token in headers</p>`,
  };
  return msg;
};

export { sgMail, createEmail, createReport, HOST };
