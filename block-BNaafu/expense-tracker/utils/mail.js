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
};
