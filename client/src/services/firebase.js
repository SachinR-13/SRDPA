import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// ================= YOUR FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyAP1Xgy6WzngKwuflo4WrJF39-QNRnFWxQ",
  authDomain: "srpay-9943e.firebaseapp.com",
  projectId: "srpay-9943e",
  storageBucket: "srpay-9943e.firebasestorage.app",
  messagingSenderId: "870709063710",
  appId: "1:870709063710:web:eaa0bb3c0041e960473e0f",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };

// ================= SETUP reCAPTCHA =================
export const setupRecaptcha = (containerId = "recaptcha-container") => {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }
  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {},
  });
  return window.recaptchaVerifier;
};

// ================= SEND OTP VIA FIREBASE =================
export const sendFirebaseOtp = async (phone) => {
  const verifier = setupRecaptcha();
  const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
  const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
  window.confirmationResult = confirmationResult;
  return { message: "OTP sent via Firebase SMS" };
};

// ================= VERIFY OTP =================
export const verifyFirebaseOtpCode = async (otp) => {
  if (!window.confirmationResult) throw new Error("Please request OTP first");
  const result = await window.confirmationResult.confirm(otp);
  const idToken = await result.user.getIdToken();
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }
  window.confirmationResult = null;
  return { verified: true, phone: result.user.phoneNumber, idToken, uid: result.user.uid };
};

export const isFirebaseConfigured = false; // Set to true when Firebase Phone Auth works on your domain