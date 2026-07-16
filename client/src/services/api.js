import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_URL || 'https://srdpa.onrender.com/api');

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ================= AUTH =================
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const submitKyc = (data) => API.post('/auth/kyc', data);
export const toggle2FA = () => API.post('/auth/toggle-2fa');
export const updateLimits = (data) => API.put('/auth/limits', data);
export const changePassword = (data) => API.post('/auth/change-password', data);
export const getDashboardStats = () => API.get('/auth/dashboard');
export const setTransactionPin = (pin) =>
  API.post('/auth/set-transaction-pin', { transactionPin: pin, confirmTransactionPin: pin });
export const verifyTransactionPin = (pin) =>
  API.post('/auth/verify-transaction-pin', { transactionPin: pin });
export const changeTransactionPin = (oldPin, newPin) =>
  API.post('/auth/change-transaction-pin', {
    oldTransactionPin: oldPin,
    newTransactionPin: newPin,
    confirmTransactionPin: newPin,
  });

// ================= WALLET =================
export const getWallet = () => API.get('/wallet');
export const addMoney = (amount) => API.post('/wallet/add-money', { amount });
export const sendMoney = (receiverSRPayId, amount, transactionPin) =>
  API.post('/wallet/send-money', { receiverSRPayId, amount, transactionPin });

// ================= TRANSACTIONS =================
export const getTransactions = (params) => API.get('/transactions', { params });
export const getMiniStatement = () => API.get('/transactions/mini-statement');
export const getRecentContacts = () => API.get('/transactions/recent-contacts');
export const getTransactionDetails = (id) => API.get(`/transactions/${id}`);
export const getWalletTransactions = (params) => API.get('/wallet/transactions', { params });

// ================= USERS =================
export const searchUsers = (q) => API.get('/users/search', { params: { q } });
export const getMyQR = () => API.get('/users/my-qr');
export const scanQR = (qrData) => API.post('/users/scan-qr', { qrData });
export const generateDynamicQR = (amount) => API.post('/users/generate-dynamic-qr', { amount });
export const scanDynamicQR = (qrData) => API.post('/users/scan-dynamic-qr', { qrData });

// ================= PAYMENTS =================
export const createOrder = (amount) => API.post('/payment/create-order', { amount });
export const verifyPayment = (data) => API.post('/payment/verify-payment', data);
export const getPaymentHistory = () => API.get('/payment/history');
export const failedPayment = (orderId, reason) => API.post('/payment/failed', { orderId, reason });

// ================= OTP =================
export const sendOtp = (phone, purpose) => API.post('/otp/send', { phone, purpose });
export const verifyOtp = (phone, otp, purpose) => API.post('/otp/verify', { phone, otp, purpose });
export const sendLoginOtp = (phone) => API.post('/auth/send-login-otp', { phone });
export const verifyLoginOtp = (phone, otp) => API.post('/auth/verify-login-otp', { phone, otp });
export const verifyFirebaseOtp = (idToken) => API.post('/otp/verify-firebase', { idToken });

// ================= NOTIFICATIONS =================
export const getNotifications = (params) => API.get('/notifications', { params });
export const getUnreadCount = () => API.get('/notifications/unread-count');
export const markNotificationRead = (id) => API({ method: 'patch', url: `/notifications/${id}/read`, data: {} });
export const markAllNotificationsRead = () => API({ method: 'patch', url: '/notifications/read-all', data: {} });
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);

// ================= UPI =================
export const getUpiIds = () => API.get('/upi');
export const createUpiId = (nickname) => API.post('/upi/create', { nickname });
export const setPrimaryUpi = (upiId) => API.put(`/upi/${upiId}/primary`);
export const deleteUpiId = (upiId) => API.delete(`/upi/${upiId}`);
export const resolveUpiId = (upiId) => API.get('/upi/resolve', { params: { upiId } });

// ================= CONTACTS =================
export const getContacts = () => API.get('/contacts');
export const addContact = (srpayId, nickname) => API.post('/contacts', { srpayId, nickname });
export const toggleFavorite = (contactId) => API.put(`/contacts/${contactId}/favorite`);
export const updateNickname = (contactId, nickname) => API.put(`/contacts/${contactId}/nickname`, { nickname });
export const deleteContact = (contactId) => API.delete(`/contacts/${contactId}`);
export const syncContacts = () => API.post('/contacts/sync');

// ================= BANK ACCOUNTS =================
export const getBankAccounts = () => API.get('/bank');
export const addBankAccount = (data) => API.post('/bank/add', data);
export const setPrimaryBank = (accountId) => API.put(`/bank/${accountId}/primary`);
export const deleteBankAccount = (accountId) => API.delete(`/bank/${accountId}`);
export const verifyBankAccount = (accountId) => API.post(`/bank/${accountId}/verify`);
export const withdrawToBank = (accountId, amount, transactionPin) =>
  API.post('/bank/withdraw', { accountId, amount, transactionPin });

// ================= PAYMENT REQUESTS =================
export const requestMoney = (payerSRPayId, amount, description) =>
  API.post('/requests/request', { payerSRPayId, amount, description });
export const splitBill = (participants, totalAmount, description) =>
  API.post('/requests/split', { participants, totalAmount, description });
export const payRequest = (requestId, transactionPin) =>
  API.post('/requests/pay', { requestId, transactionPin });
export const declineRequest = (requestId) => API.put(`/requests/${requestId}/decline`);
export const cancelRequest = (requestId) => API.put(`/requests/${requestId}/cancel`);
export const getPendingRequests = () => API.get('/requests/pending');
export const getRequestHistory = () => API.get('/requests/history');

// ================= PAYMENT LINKS =================
export const createPaymentLink = (amount, description) =>
  API.post('/pay-links/create', { amount, description });
export const getPaymentLinkDetails = (code) => API.get(`/pay-links/${code}`);
export const payViaLink = (code, transactionPin) =>
  API.post('/pay-links/pay', { code, transactionPin });
export const getMyPaymentLinks = () => API.get('/pay-links');
export const cancelPaymentLink = (linkId) => API.delete(`/pay-links/${linkId}`);

// ================= RECURRING PAYMENTS =================
export const createRecurringPayment = (data) => API.post('/recurring/create', data);
export const getRecurringPayments = () => API.get('/recurring');
export const toggleRecurringPayment = (paymentId) => API.put(`/recurring/${paymentId}/toggle`);
export const cancelRecurringPayment = (paymentId) => API.put(`/recurring/${paymentId}/cancel`);

export default API;