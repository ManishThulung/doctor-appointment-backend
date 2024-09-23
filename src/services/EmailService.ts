import nodemailer from "nodemailer";
import ApiError from "../abstractions/ApiError";
import { Repository } from "../repository/Repository";

export class EmailService<T> extends Repository<T> {
  constructor({ repository }) {
    super(repository);
  }
  async verifyEmail(id: string, email: string): Promise<any> {
    const isEmailExist = await this.getOne({ id, email });
    if (!isEmailExist) {
      throw new ApiError("Email does not exist", 404);
    }
    const verifyEmail = await this.update(
      { email, id },
      { isEmailVerified: true }
    );
    return verifyEmail;
  }
  async emailSender(
    email: string,
    title: string,
    body: string,
    ccEmail?: string[]
  ) {
    try {
      // Create a Transporter to send emails
      let transporter = nodemailer.createTransport({
        service: "gmail",
        secure: true,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });
      // Send emails to users
      let info: any;
      if (ccEmail && ccEmail?.length <= 0) {
        info = await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: email,
          cc: ccEmail,
          subject: title,
          html: body,
        });
      } else {
        info = await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: email,
          subject: title,
          html: body,
        });
      }
      return info;
    } catch (error) {
      throw new Error(error);
    }
  }
}
