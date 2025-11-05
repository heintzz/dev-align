const agenda = require('../configs/queue.config');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

let transporter = null;

// Initialize email transporter
function getTransporter() {
  if (!transporter) {
    try {
      transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } catch (error) {
      console.error('Error creating email transporter:', error);
      return null;
    }
  }
  return transporter;
}

// Define the email job
agenda.define('send email notification', async (job) => {
  const { to, subject, html, metadata } = job.attrs.data;

  console.log(`[Email Worker] Processing email job for: ${to}`);
  console.log(`[Email Worker] Subject: ${subject}`);

  try {
    const emailTransporter = getTransporter();

    // Check if email is configured
    if (!emailTransporter || !process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
      console.log('[Email Worker] Email not configured. Skipping email send.');
      console.log(`[Email Worker] Would send to: ${to}`);
      console.log(`[Email Worker] Subject: ${subject}`);

      // Mark job as completed even if email is not configured
      return {
        success: true,
        skipped: true,
        message: 'Email not configured',
      };
    }

    const mailOptions = {
      from: `DevAlign System <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await emailTransporter.sendMail(mailOptions);

    console.log(`[Email Worker] Email sent successfully: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
      sentAt: new Date(),
    };
  } catch (error) {
    console.error(`[Email Worker] Error sending email to ${to}:`, error.message);

    // Throw error to let Agenda handle retries
    throw new Error(`Failed to send email: ${error.message}`);
  }
});

// Job event handlers for monitoring
agenda.on('start', (job) => {
  console.log(`[Email Worker] Job ${job.attrs.name} starting...`);
});

agenda.on('complete', (job) => {
  console.log(`[Email Worker] Job ${job.attrs.name} completed successfully`);
});

agenda.on('fail', (err, job) => {
  console.error(`[Email Worker] Job ${job.attrs.name} failed:`, err.message);
});

agenda.on('success', (job) => {
  console.log(`[Email Worker] Job ${job.attrs.name} succeeded`);
});

// Start the agenda worker
async function startEmailWorker() {
  try {
    console.log('[Email Worker] Starting email queue worker...');
    await agenda.start();
    console.log('[Email Worker] Email queue worker started successfully');
    console.log('[Email Worker] Waiting for email jobs to process...');
  } catch (error) {
    console.error('[Email Worker] Error starting email worker:', error);
    throw error;
  }
}

// Export functions
module.exports = {
  startEmailWorker,
  agenda,
};
