import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { PublicRoute } from '../routes/PublicRoute';
import { GuestRoute } from '../routes/GuestRoute';

import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { VerifyEmailPage } from '../features/auth/pages/VerifyEmailPage';
import { OnboardingPage } from '../features/auth/pages/OnboardingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      // Guest Routes (accessible by both Guests and Authenticated users)
      {
        element: <GuestRoute />,
        children: [
          {
            path: '',
            element: <div>Home Dashboard (Guest / Authenticated User)</div>,
          },
        ],
      },
      // Protected Routes (accessible ONLY by Authenticated users)
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'movies',
            element: <div>Movies Page (Authenticated Only)</div>,
          },
          {
            path: 'profile',
            element: <div>Profile Page (Authenticated Only)</div>,
          },
          {
            path: 'watchlist',
            element: <div>Watchlist Page (Authenticated Only)</div>,
          },
          {
            path: 'onboarding',
            element: <OnboardingPage />,
          },
        ],
      },
    ],
  },
  // Public Routes (accessible ONLY when NOT authenticated; redirects to '/' if authenticated)
  {
    element: <AuthLayout />,
    children: [
      {
        element: <PublicRoute />,
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          },
          {
            path: 'register',
            element: <RegisterPage />,
          },
          {
            path: 'forgot-password',
            element: <ForgotPasswordPage />,
          },
          {
            path: 'reset-password',
            element: <ResetPasswordPage />,
          },
          {
            path: 'verify-email',
            element: <VerifyEmailPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
