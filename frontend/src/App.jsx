import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
// Lazy load pages for performance optimization
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const UploadPage = React.lazy(() => import('./pages/UploadPage'));
const MatchResultPage = React.lazy(() => import('./pages/MatchResultPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const InterviewPage = React.lazy(() => import('./pages/InterviewPage'));
const QuizPage = React.lazy(() => import('./pages/QuizPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const HistoryPage = React.lazy(() => import('./pages/HistoryPage'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />
            <Route path="/profile" element={<ProfilePage />} />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview"
              element={
                <ProtectedRoute>
                  <InterviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz"
              element={
                <ProtectedRoute>
                  <QuizPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/result"
              element={
                <ProtectedRoute>
                  <MatchResultPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
