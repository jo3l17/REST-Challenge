import sgMail from "@sendgrid/mail";
import dotenv from 'dotenv';
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

const createEmail = (to: string, subject: string, message: string, link: string = '', token: string = '') => {
  const msg: sgMail.MailDataRequired = {
    to,
    subject,
    from: 'joelvaldezangeles@gmail.com',
    html: `<h1>${subject}</h1>
    <p>${message}</p><p>${link}</p>
    ${token ? `<p>or change the token in params<br>${token}</p>` : ''}`
  }
  return msg
}

export { sgMail, createEmail }