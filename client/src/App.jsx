import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WalletAdd from './pages/WalletAdd';
import SendMoney from './pages/SendMoney';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';
import Profile from './pages/Profile';
import MyQR from './pages/MyQR';
import ScanQR from './pages/ScanQR';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import UpiManagement from './pages/UpiManagement';
import ContactsPage from './pages/ContactsPage';
import BankAccounts from './pages/BankAccounts';
import PaymentRequests from './pages/PaymentRequests';
import PaymentLinks from './pages/PaymentLinks';
import RecurringPayments from './pages/RecurringPayments';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './pages/AdminLayout';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '10px', background: '#333', color: '#fff' },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* User Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="wallet" element={<WalletAdd />} />
            <Route path="wallet/add" element={<WalletAdd />} />
            <Route path="send-money" element={<SendMoney />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="transactions/:id" element={<TransactionDetail />} />
            <Route path="profile" element={<Profile />} />
            <Route path="qr-code" element={<MyQR />} />
            <Route path="scan" element={<ScanQR />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="upi" element={<UpiManagement />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="bank" element={<BankAccounts />} />
            <Route path="requests" element={<PaymentRequests />} />
            <Route path="pay-links" element={<PaymentLinks />} />
            <Route path="recurring" element={<RecurringPayments />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminDashboard />} />
            <Route path="wallets" element={<AdminDashboard />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;