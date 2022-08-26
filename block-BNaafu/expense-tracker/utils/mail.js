const nodemailer = require("nodemailer");
module.exports = {
  generateOTP: () => {
    let otp = "";
    for (let i = 0; i <= 3; i++) {
      const randVal = Math.round(Math.random() * 9);
      otp += randVal;
    }
    return otp;
  },
  mailTransport: () =>
    nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    }),
};
