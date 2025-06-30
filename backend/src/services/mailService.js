import nodemailer from "nodemailer"
import { configDotenv } from 'dotenv';
configDotenv();
const transporter = nodemailer.createTransport({
  service: 'gmail', // or use 'smtp.mailtrap.io', etc.
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS  // your email app password or real password (for testing)
  }
});

//   const transporter=nodemailer.createTransport({
//     host:process.env.EMAIL_HOST,
//     pool:true,
//     port:process.env.EMAIL_PORT,
//     secure:true,
//     auth:{
//       user:process.env.EMAIL_USER,
//       pass:process.env.EMAIL_PASS
//     }
//   })

const sendMail = async ({ to, subject, html }) => {

//  try{
  
//   await transporter.verify();
//   console.log("✅ SMTP verified, ready to send");

//   const mailOption={
//     from:"noreply@company.e-sutra.com",
//     to,
//     subject,
//     html
//   }

//   const info= await transporter.sendMail(mailOption);
//   console.log(info)


//  }catch(err){
//   console.log("error in mail",err)
//  }

  try {
    const info = await transporter.sendMail({
      from: `"Your App Name" <${process.env.EMAIL_USER}>`,
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