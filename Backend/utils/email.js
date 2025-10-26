const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: '"DevAlign HRIS" <noreply@hr-devalign.com>',
    to: options.to,
    subject: options.subject,
    text: options.text,
  };

  await transporter.sendMail(message);
};

module.exports = { sendEmail };
