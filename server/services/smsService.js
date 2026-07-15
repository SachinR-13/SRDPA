// ================= SMS SERVICE =================
// Supports multiple SMS providers for sending real OTP messages.
// Provider selection is automatic based on environment variables.

const https = require("https");
const axios = require("axios");

// ================= FAST2SMS PROVIDER (India - Recommended) =================
// Sign up: https://www.fast2sms.com
// Dashboard → API → Generate API Key
// Free credits on signup (~₹50 worth)
const sendViaFast2SMS = async (phone, message) => {
  const apiKey = process.env.SMS_API_KEY;
  if (!apiKey) return false;

  try {
    const response = await axios({
      method: "POST",
      url: "https://www.fast2sms.com/dev/bulkV2",
      headers: {
        authorization: apiKey,
        "Content-Type": "application/json",
      },
      data: {
        route: "otp",
        sender_id: process.env.SMS_SENDER_ID || "SRPAY",
        message: message,
        language: "english",
        flash: 0,
        numbers: phone,
      },
      timeout: 10000,
    });

    if (response.data?.return === true) {
      console.log(`✅ SMS sent to ${phone} via Fast2SMS`);
      return true;
    } else {
      console.error("❌ Fast2SMS failed:", response.data?.message);
      return false;
    }
  } catch (error) {
    console.error("❌ Fast2SMS error:", error.message);
    return false;
  }
};

// ================= MSG91 PROVIDER (Alternative) =================
// Sign up: https://msg91.com
const sendViaMSG91 = async (phone, message) => {
  const apiKey = process.env.SMS_API_KEY;
  if (!apiKey) return false;

  try {
    const response = await axios({
      method: "POST",
      url: "https://api.msg91.com/api/v5/flow/",
      headers: {
        authkey: apiKey,
        "Content-Type": "application/json",
      },
      data: {
        sender: process.env.SMS_SENDER_ID || "SRPAY",
        mobiles: `91${phone}`,
        message: message,
      },
      timeout: 10000,
    });

    if (response.data?.type === "success") {
      console.log(`✅ SMS sent to ${phone} via MSG91`);
      return true;
    }
    return false;
  } catch (error) {
    console.error("❌ MSG91 error:", error.message);
    return false;
  }
};

// ================= TEXT LOCAL PROVIDER (International) =================
// Sign up: https://textlocal.com
const sendViaTextLocal = async (phone, message) => {
  const apiKey = process.env.SMS_API_KEY;
  if (!apiKey) return false;

  try {
    const response = await axios({
      method: "POST",
      url: "https://api.textlocal.in/send/",
      params: {
        apikey: apiKey,
        numbers: `91${phone}`,
        sender: process.env.SMS_SENDER_ID || "SRPAY",
        message: message,
      },
      timeout: 10000,
    });

    if (response.data?.status === "success") {
      console.log(`✅ SMS sent to ${phone} via TextLocal`);
      return true;
    }
    return false;
  } catch (error) {
    console.error("❌ TextLocal error:", error.message);
    return false;
  }
};

// ================= MAIN SMS SENDER (Auto-selects provider) =================
const sendSMS = async (phone, message) => {
  const apiKey = process.env.SMS_API_KEY;

  // If no SMS API key, SMS won't be sent (simulated mode)
  if (!apiKey) {
    console.log(`\n📱 ====== SMS SIMULATED ====`);
    console.log(`📞 To: ${phone}`);
    console.log(`💬 ${message}`);
    console.log(`📋 ========================\n`);
    console.log(`ℹ️  Set SMS_API_KEY in .env to send real SMS`);
    return false;
  }

  const provider = process.env.SMS_PROVIDER || "fast2sms";

  // Try selected provider
  let sent = false;
  switch (provider.toLowerCase()) {
    case "fast2sms":
      sent = await sendViaFast2SMS(phone, message);
      if (!sent) sent = await sendViaMSG91(phone, message); // fallback
      break;
    case "msg91":
      sent = await sendViaMSG91(phone, message);
      if (!sent) sent = await sendViaFast2SMS(phone, message); // fallback
      break;
    case "textlocal":
      sent = await sendViaTextLocal(phone, message);
      break;
    default:
      sent = await sendViaFast2SMS(phone, message);
  }

  return sent;
};

module.exports = { sendSMS };