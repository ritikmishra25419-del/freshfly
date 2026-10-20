import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { ThemeProvider } from './store/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import ThemePicker from './pages/ThemePicker';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import MentorDashboard from './pages/MentorDashboard';
import Portfolio from './pages/Portfolio';
import CareerPassport from './pages/CareerPassport';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Roadmap from './pages/Roadmap';
import Messages from './pages/Messages';
import Community from './pages/Community';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import Skills from './pages/Skills';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/skills" element={
  <ProtectedRoute><ErrorBoundary><Skills /></ErrorBoundary></ProtectedRoute>
} />
                <Route path="/choose-theme" element={
                  <ProtectedRoute><ThemePicker /></ProtectedRoute>
                  
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><ErrorBoundary><Profile /></ErrorBoundary></ProtectedRoute>
                } />
                <Route path="/jobs" element={
                  <ProtectedRoute><ErrorBoundary><Jobs /></ErrorBoundary></ProtectedRoute>
                } />
                <Route path="/applications" element={
                  <ProtectedRoute><ErrorBoundary><Applications /></ErrorBoundary></ProtectedRoute>
                } />
                <Route path="/mentor" element={
                  <ProtectedRoute><ErrorBoundary><MentorDashboard /></ErrorBoundary></ProtectedRoute>
                } />
                <Route path="/portfolio" element={
                  <ProtectedRoute><ErrorBoundary><Portfolio /></ErrorBoundary></ProtectedRoute>
                } />
                <Route path="/passport" element={
                  <ProtectedRoute><ErrorBoundary><CareerPassport /></ErrorBoundary></ProtectedRoute>
                } />
                <Route path="/passport/:userId" element={
                  <ProtectedRoute><ErrorBoundary><CareerPassport /></ErrorBoundary></ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute><ErrorBoundary><Notifications /></ErrorBoundary></ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute><ErrorBoundary><Settings /></ErrorBoundary></ProtectedRoute>
                } />
                <Route path="/roadmap" element={
                  <ProtectedRoute><ErrorBoundary><Roadmap /></ErrorBoundary></ProtectedRoute>
                } />
                <Route path="/messages" element={
                  <ProtectedRoute><ErrorBoundary><Messages /></ErrorBoundary></ProtectedRoute>
                } />
                <Route path="/community" element={
                  <ProtectedRoute><ErrorBoundary><Community /></ErrorBoundary></ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;