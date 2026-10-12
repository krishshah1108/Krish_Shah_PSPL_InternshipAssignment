import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import VoucherDetailPage from './pages/VoucherDetailPage';
import VoucherFormPage from './pages/VoucherFormPage';
import VoucherListPage from './pages/VoucherListPage';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route index element={<DashboardPage />} />
                <Route path="vouchers" element={<VoucherListPage />} />
                <Route path="vouchers/:id" element={<VoucherDetailPage />} />

                <Route element={<ProtectedRoute roles={['EMPLOYEE']} />}>
                  <Route path="vouchers/new" element={<VoucherFormPage />} />
                  <Route path="vouchers/:id/edit" element={<VoucherFormPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
