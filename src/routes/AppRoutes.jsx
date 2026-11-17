import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { USER_ROLES } from '../constants/enums';
import { ProtectedRoute } from './ProtectedRoute';

// LAYOUTS
import { TouristLayout } from '../layouts/TouristLayout';
import { HostLayout } from '../layouts/HostLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { AuthLayout } from '../layouts/AuthLayout';

// PAGES - TOURIST
import { HomePage } from '../pages/tourist/HomePage';
import { SearchResultsPage } from '../pages/tourist/SearchResultsPage';
import { HotelDetailPage } from '../pages/tourist/HotelDetailPage';

// PAGES - AUTH
import { HostLoginPage } from '../pages/auth/HostLoginPage';
import { HostRegisterPage } from '../pages/auth/HostRegisterPage';
import { VerifyOtpPage } from '../pages/auth/VerifyOtpPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { AdminLoginPage } from '../pages/auth/AdminLoginPage';

// PAGES - HOST
import { HostDashboardPage } from '../pages/host/HostDashboardPage';
import { AddHotelPage } from '../pages/host/AddHotelPage';
import { EditHotelPage } from '../pages/host/EditHotelPage';
import { HostProfilePage } from '../pages/host/HostProfilePage';

// PAGES - ADMIN
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { HotelModerationPage } from '../pages/admin/HotelModerationPage';
import { HostManagementPage } from '../pages/admin/HostManagementPage';
import { SystemConfigPage } from '../pages/admin/SystemConfigPage';

// 404
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. TOURIST ROUTES (PUBLIC) */}
      <Route element={<TouristLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.SEARCH} element={<SearchResultsPage />} />
        <Route path={ROUTES.HOTEL_DETAIL} element={<HotelDetailPage />} />
      </Route>

      {/* 2. AUTH ROUTES (PUBLIC / GUEST) */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<HostLoginPage />} />
        <Route path={ROUTES.REGISTER} element={<HostRegisterPage />} />
        <Route path={ROUTES.VERIFY_OTP} element={<VerifyOtpPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      </Route>

      {/* 2.1. ADMIN LOGIN - GIAO DIỆN 2 CỘT CHUẨN FIGMA FRAME 14 */}
      <Route path={ROUTES.ADMIN.LOGIN} element={<AdminLoginPage />} />

      {/* 3. HOST ROUTES (PROTECTED) */}
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.HOST, USER_ROLES.ADMIN]} />}>
        <Route element={<HostLayout />}>
          <Route path={ROUTES.HOST.DASHBOARD} element={<HostDashboardPage />} />
          <Route path={ROUTES.HOST.HOTELS} element={<HostDashboardPage />} />
          <Route path={ROUTES.HOST.ADD_HOTEL} element={<AddHotelPage />} />
          <Route path={ROUTES.HOST.EDIT_HOTEL} element={<EditHotelPage />} />
          <Route path={ROUTES.HOST.PROFILE} element={<HostProfilePage />} />
        </Route>
      </Route>

      {/* 4. ADMIN ROUTES (PROTECTED) */}
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />}>
        <Route element={<AdminLayout />}>
          {/* Mặc định chuyển hướng vào trang Kiểm duyệt */}
          <Route path="/admin" element={<Navigate to={ROUTES.ADMIN.MODERATION} replace />} />
          {/* Giữ nguyên route Dashboard (ẩn trên menu sidebar, không xóa code) */}
          <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboardPage />} />
          <Route path={ROUTES.ADMIN.MODERATION} element={<HotelModerationPage />} />
          <Route path={ROUTES.ADMIN.HOST_MANAGEMENT} element={<HostManagementPage />} />
          <Route path={ROUTES.ADMIN.SYSTEM_CONFIG} element={<SystemConfigPage />} />
        </Route>
      </Route>

      {/* 5. 404 NOT FOUND */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
