import nodemailer from "nodemailer"
import { configDotenv } from 'dotenv';
import { emailTemplateGenerator } from "./templates.js";
configDotenv();

  const transporter=nodemailer.createTransport({
    host:process.env.EMAIL_HOST,
    pool:true,
    port:process.env.EMAIL_PORT,
    secure:true,
    auth:{
      user:process.env.EMAIL_USER,
      pass:process.env.EMAIL_PASS
    }
  })

const sendMail = async ({ to, purpose, otp_code }) => {

  const {html,subject}=emailTemplateGenerator({purpose,otp_code})

  try {
    const info = await transporter.sendMail({
      from: ` ${process.env.EMAIL_USER}`,
      to,
      subject,
      html
    });

    console.log('📧 Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
};

export default sendMail