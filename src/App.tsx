import React, { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster as HotToaster } from 'react-hot-toast';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import LoadingSkeleton from "@/components/LoadingSkeleton";

// Core Pages (Lazy)
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const VerifyEmailPage = lazy(() => import("@/pages/auth/VerifyEmailPage"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const Terms = lazy(() => import("@/pages/Terms"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// User Pages (Lazy)
const UserDashboard = lazy(() => import("@/pages/user/Dashboard"));
const MyAppliances = lazy(() => import("@/pages/user/MyAppliances"));
const MyRequests = lazy(() => import("@/pages/user/MyRequests"));
const RequestDetails = lazy(() => import("@/pages/user/RequestDetails"));
const CreateServiceRequest = lazy(() => import("@/pages/user/CreateServiceRequest"));
const SubscriptionPage = lazy(() => import("@/pages/user/SubscriptionPage"));
const NotificationsPage = lazy(() => import("@/pages/user/NotificationsPage"));
const ProfilePage = lazy(() => import("@/pages/user/ProfilePage"));
const SmartTroubleshooter = lazy(() => import("@/pages/user/SmartTroubleshooter"));

// Technician Pages (Lazy)
const TechnicianDashboard = lazy(() => import("@/pages/technician/Dashboard"));
const IncomingRequests = lazy(() => import("@/pages/technician/IncomingRequests"));
const TechnicianProfile = lazy(() => import("@/pages/technician/TechnicianProfile"));
const VerificationPage = lazy(() => import("@/pages/technician/VerificationPage"));

// Admin Pages (Lazy)
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayoutComponent = lazy(() => import("./components/layouts/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const TechnicianManagement = lazy(() => import("./pages/admin/TechnicianManagement"));
const RequestManagement = lazy(() => import("./pages/admin/RequestManagement"));
const ApplianceManagement = lazy(() => import("./pages/admin/ApplianceManagement"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const PayoutManagement = lazy(() => import("./pages/admin/PayoutManagement"));

const queryClient = new QueryClient();

const UserLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={['user']}>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

const TechLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={['technician']}>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HotToaster />
        <BrowserRouter>
          <Suspense fallback={<LoadingSkeleton rows={5} />}>
            <Routes>
              { }
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />

              { }
              <Route path="/user/dashboard" element={<UserLayout><UserDashboard /></UserLayout>} />
              <Route path="/user/appliances" element={<UserLayout><MyAppliances /></UserLayout>} />
              <Route path="/user/requests" element={<UserLayout><MyRequests /></UserLayout>} />
              <Route path="/user/requests/new" element={<UserLayout><CreateServiceRequest /></UserLayout>} />
              <Route path="/user/requests/:requestId" element={<UserLayout><RequestDetails /></UserLayout>} />
              <Route path="/user/subscription" element={<UserLayout><SubscriptionPage /></UserLayout>} />
              <Route path="/user/notifications" element={<UserLayout><NotificationsPage /></UserLayout>} />
              <Route path="/user/profile" element={<UserLayout><ProfilePage /></UserLayout>} />
              <Route path="/user/troubleshoot" element={<UserLayout><SmartTroubleshooter /></UserLayout>} />

              { }
              <Route path="/technician/dashboard" element={<TechLayout><TechnicianDashboard /></TechLayout>} />
              <Route path="/technician/requests" element={<TechLayout><IncomingRequests /></TechLayout>} />
              <Route path="/technician/profile" element={<TechLayout><TechnicianProfile /></TechLayout>} />
              <Route path="/technician/verification" element={<TechLayout><VerificationPage /></TechLayout>} />

              { }
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayoutComponent />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="technicians" element={<TechnicianManagement />} />
                <Route path="appliances" element={<ApplianceManagement />} />
                <Route path="requests" element={<RequestManagement />} />
                <Route path="reports" element={<Reports />} />
                <Route path="payouts" element={<PayoutManagement />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
