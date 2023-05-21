import nodemailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";

export const Transport = () => {
  const transporter = nodemailer.createTransport(
    smtpTransport({
      service: process.env.SERVICE_NAME,
      host: process.env.SMTP_HOST,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  );
  return transporter;
};
