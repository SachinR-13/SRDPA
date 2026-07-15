const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

// ================= CREATE TRANSPORTER =================
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  // In development, use Ethereal for testing (no real credentials needed)
  if (process.env.NODE_ENV === "development" || !process.env.SMTP_HOST) {
    logger.info("📧 Using Ethereal test email service");
    // We'll create ethereal account lazily
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

// ================= CREATE ETHEREAL TEST ACCOUNT =================
let etherealTransporter = null;

const getEtherealTransporter = async () => {
  if (etherealTransporter) return etherealTransporter;

  try {
    const testAccount = await nodemailer.createTestAccount();
    etherealTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    logger.info(`📧 Ethereal email: ${testAccount.user}`);
    return etherealTransporter;
  } catch (error) {
    logger.error("Failed to create Ethereal account:", error.message);
    return null;
  }
};

// ================= SEND EMAIL =================
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    let transport = getTransporter();

    // Fallback to Ethereal in dev if no SMTP configured
    if (!transport) {
      transport = await getEtherealTransporter();
    }

    if (!transport) {
      logger.warn("⚠️ No email transporter available. Email not sent.");
      return { success: false, message: "No email transporter configured" };
    }

    const mailOptions = {
      from: `"SRPay" <${process.env.SMTP_FROM || "noreply@srpay.app"}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    };

    const info = await transport.sendMail(mailOptions);

    if (process.env.NODE_ENV === "development") {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        logger.info(`📧 Preview URL: ${previewUrl}`);
      }
    }

    logger.info(`📧 Email sent to ${to}: ${subject}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error("Failed to send email:", error.message);
    return { success: false, message: error.message };
  }
};

// ================= EMAIL TEMPLATES =================

const emailTemplates = {
  // Welcome Email
  welcome: (fullName) => ({
    subject: "Welcome to SRPay!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="width: 60px; height: 60px; border-radius: 16px; background: linear-gradient(135deg, #4F46E5, #7C3AED); display: inline-flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 28px; font-weight: bold;">S</span>
          </div>
        </div>
        <h1 style="color: #111827; text-align: center;">Welcome to SRPay!</h1>
        <p style="color: #6B7280; font-size: 15px; line-height: 1.6;">Hi <strong>${fullName}</strong>,</p>
        <p style="color: #6B7280; font-size: 15px; line-height: 1.6;">
          Thank you for joining SRPay! Your account has been successfully created.
          You can now send money, make payments, and manage your finances securely.
        </p>
        <div style="background: #F3F4F6; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0; color: #374151; font-size: 14px;">
            ✅ Your account is verified<br>
            ✅ Your wallet is ready<br>
            ✅ Start sending money instantly
          </p>
        </div>
        <p style="color: #6B7280; font-size: 15px; line-height: 1.6;">
          If you have any questions, feel free to contact our support team.
        </p>
        <p style="color: #6B7280; font-size: 15px; line-height: 1.6;">
          Best regards,<br>
          <strong>The SRPay Team</strong>
        </p>
      </div>
    `,
  }),

  // Money Sent
  moneySent: (senderName, receiverName, amount, balance) => ({
    subject: `₹${amount} Sent Successfully - SRPay`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="width: 60px; height: 60px; border-radius: 50%; background: #FEE2E2; display: inline-flex; align-items: center; justify-content: center;">
            <span style="font-size: 28px;">📤</span>
          </div>
        </div>
        <h2 style="color: #111827; text-align: center;">Money Sent</h2>
        <div style="background: #F9FAFB; border-radius: 16px; padding: 24px; margin: 20px 0;">
          <div style="text-align: center; margin-bottom: 16px;">
            <span style="font-size: 36px; font-weight: bold; color: #DC2626;">-₹${amount}</span>
          </div>
          <div style="border-top: 1px solid #E5E7EB; padding-top: 16px;">
            <p style="margin: 4px 0; color: #6B7280; font-size: 14px;"><strong>From:</strong> ${senderName}</p>
            <p style="margin: 4px 0; color: #6B7280; font-size: 14px;"><strong>To:</strong> ${receiverName}</p>
            <p style="margin: 4px 0; color: #6B7280; font-size: 14px;"><strong>Available Balance:</strong> ₹${balance}</p>
          </div>
        </div>
      </div>
    `,
  }),

  // Money Received
  moneyReceived: (senderName, receiverName, amount, balance) => ({
    subject: `₹${amount} Received - SRPay`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="width: 60px; height: 60px; border-radius: 50%; background: #D1FAE5; display: inline-flex; align-items: center; justify-content: center;">
            <span style="font-size: 28px;">📥</span>
          </div>
        </div>
        <h2 style="color: #111827; text-align: center;">Money Received</h2>
        <div style="background: #F9FAFB; border-radius: 16px; padding: 24px; margin: 20px 0;">
          <div style="text-align: center; margin-bottom: 16px;">
            <span style="font-size: 36px; font-weight: bold; color: #059669;">+₹${amount}</span>
          </div>
          <div style="border-top: 1px solid #E5E7EB; padding-top: 16px;">
            <p style="margin: 4px 0; color: #6B7280; font-size: 14px;"><strong>From:</strong> ${senderName}</p>
            <p style="margin: 4px 0; color: #6B7280; font-size: 14px;"><strong>To:</strong> ${receiverName}</p>
            <p style="margin: 4px 0; color: #6B7280; font-size: 14px;"><strong>Available Balance:</strong> ₹${balance}</p>
          </div>
        </div>
      </div>
    `,
  }),

  // Wallet Top-up
  walletTopUp: (fullName, amount, balance) => ({
    subject: `₹${amount} Added to Wallet - SRPay`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="width: 60px; height: 60px; border-radius: 50%; background: #DBEAFE; display: inline-flex; align-items: center; justify-content: center;">
            <span style="font-size: 28px;">💰</span>
          </div>
        </div>
        <h2 style="color: #111827; text-align: center;">Wallet Credited</h2>
        <p style="color: #6B7280; text-align: center; font-size: 15px;">Hi ${fullName},</p>
        <div style="background: #F9FAFB; border-radius: 16px; padding: 24px; margin: 20px 0;">
          <p style="margin: 4px 0; color: #374151; font-size: 16px;">Amount: <strong>+₹${amount}</strong></p>
          <p style="margin: 4px 0; color: #374151; font-size: 16px;">New Balance: <strong>₹${balance}</strong></p>
        </div>
      </div>
    `,
  }),

  // OTP Email
  otpEmail: (otp, purpose) => ({
    subject: `Your SRPay OTP - ${purpose}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="width: 60px; height: 60px; border-radius: 16px; background: linear-gradient(135deg, #4F46E5, #7C3AED); display: inline-flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 28px; font-weight: bold;">S</span>
          </div>
        </div>
        <h2 style="color: #111827; text-align: center;">OTP Verification</h2>
        <p style="color: #6B7280; text-align: center; font-size: 15px;">Use this OTP to ${purpose}</p>
        <div style="background: #F3F4F6; border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0; letter-spacing: 8px;">
          <span style="font-size: 32px; font-weight: bold; color: #4F46E5;">${otp}</span>
        </div>
        <p style="color: #9CA3AF; text-align: center; font-size: 13px;">This OTP is valid for 5 minutes. Do not share it with anyone.</p>
      </div>
    `,
  }),
};

module.exports = {
  sendEmail,
  emailTemplates,
};