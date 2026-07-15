const admin = require("firebase-admin");

// Firebase Admin SDK for verifying Firebase ID tokens from the client
const initializeFirebase = () => {
  try {
    if (admin.apps.length) return admin;

    // Check if credentials are in .env
    const projectId = process.env.FIREBASE_PROJECT_ID || "srpay-9943e";
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!clientEmail || !privateKey) {
      console.warn("⚠️ Firebase Admin credentials not in .env. OTP verification will use backend OTP flow.");
      console.log("   To use Firebase Auth, add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to .env");
      return null;
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    console.log("✅ Firebase Admin SDK initialized");
    return admin;
  } catch (error) {
    console.error("❌ Firebase init error:", error.message);
    return null;
  }
};

const firebaseAdmin = initializeFirebase();

// ================= VERIFY FIREBASE ID TOKEN =================
const verifyFirebaseToken = async (idToken) => {
  if (!firebaseAdmin) throw new Error("Firebase not configured on backend");
  const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
  return {
    uid: decoded.uid,
    phone: decoded.phone_number,
  };
};

module.exports = {
  firebaseAdmin,
  verifyFirebaseToken,
};