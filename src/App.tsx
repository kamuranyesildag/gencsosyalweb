import { ErrorBoundary } from "./components/ErrorBoundary";
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AppLayout } from "./layouts/AppLayout";
import { Feed } from "./pages/Feed";
import { Explore } from "./pages/Explore";
import { Notifications } from "./pages/Notifications";
import { Messages } from "./pages/Messages";
import { MessageDetail } from "./pages/MessageDetail";
import { Bookmarks } from "./pages/Bookmarks";
import { Communities } from "./pages/Communities";
import { CommunityDetail } from "./pages/CommunityDetail";
import { Profile } from "./pages/Profile";
import { PostDetail } from "./pages/PostDetail";
import { ProjectDetail } from "./pages/ProjectDetail";
import { Projects } from "./pages/Projects";
import { HashtagDetail } from "./pages/HashtagDetail";
import { Settings } from "./pages/Settings";
import { Admin } from "./pages/Admin";
import { Onboarding } from "./pages/Onboarding";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { VerifyEmail } from "./pages/VerifyEmail";
import { Landing } from "./pages/Landing";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";
import { AuthWrapper } from "./components/AuthWrapper";
import { useAuthStore } from "./context/useAuth";
import { BaseLayout } from "./layouts/BaseLayout";
import { ToastContainer } from "./components/ui/Toast";
import { ConfirmDialogContainer } from "./components/ui/ConfirmDialog"; // for logged out
import { SplashScreen } from "./components/ui/SplashScreen";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/home" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <SplashScreen onComplete={() => {}} />
        <AuthWrapper>
          <Routes>
            {/* Logged Out Routes using simple BaseLayout */}
            <Route element={<BaseLayout />}>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
              <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />
              <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
            </Route>

            {/* Logged In Routes using AppLayout (Sidebars) */}
            <Route element={<AppLayout />}>
              <Route path="/home" element={<Feed />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/messages/:id" element={<ProtectedRoute><MessageDetail /></ProtectedRoute>} />
              <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/communities/:slug" element={<CommunityDetail />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/hashtags/:name" element={<HashtagDetail />} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            </Route>
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          </Routes>
        </AuthWrapper>
      </ErrorBoundary>
      <ToastContainer />
  <ConfirmDialogContainer />
    </BrowserRouter>
  );
}
