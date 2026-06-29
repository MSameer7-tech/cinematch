import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { PublicRoute } from '../routes/PublicRoute';
import { GuestRoute } from '../routes/GuestRoute';

// Auth Pages
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { VerifyEmailPage } from '../features/auth/pages/VerifyEmailPage';
import { OnboardingPage } from '../features/auth/pages/OnboardingPage';
import { AuthDebugPage } from '../features/auth/pages/AuthDebugPage';

// Feature Pages
import { HomePage } from '../features/home/pages/HomePage';
import { DiscoverPage } from '../features/discover/pages/DiscoverPage';

import { WatchlistPage } from '../features/watchlist/pages/WatchlistPage';
import { FavoritesPage } from '../features/favorites/pages/FavoritesPage';
import { RecommendationsPage } from '../features/recommendations/pages/RecommendationsPage';

import { MovieDetailsPage } from '../features/movies/pages/MovieDetailsPage';
import { ProfilePage } from '../features/profile/pages/ProfilePage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';

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
            element: <HomePage />,
          },
          {
            path: 'discover',
            element: <DiscoverPage />,
          },
          {
            path: 'movie/:id',
            element: <MovieDetailsPage />,
          },
          {
            path: 'watchlist',
            element: <WatchlistPage />,
          },
          {
            path: 'favorites',
            element: <FavoritesPage />,
          },
          {
            path: 'recommendations',
            element: <RecommendationsPage />,
          },
        ],
      },
      // Protected Routes (accessible ONLY by Authenticated users)
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
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
    path: 'auth-debug',
    element: <AuthDebugPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
