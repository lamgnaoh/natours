const nodemailer = require("nodemailer");
const sendMail = async (options) => {
  // 1: tạo 1 transporter
  const transporter = nodemailer.createTransport({
    // host: "smtp-mail.outlook.com",
    host: process.env.EMAIL_HOST,
    // port: 587,
    port: process.env.EMAIL_PORT,
    // tls: {
    //   ciphers: "SSLv3",
    // },
    // secureConnection: false,
    // secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //   send email
  //   transporter.sendMail trả về 1 Promise
  await transporter.sendMail(options);
};
module.exports = sendMail;
