import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { ThemeProvider } from './store/ThemeContext';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import ThemePicker from './pages/ThemePicker';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import MentorDashboard from './pages/MentorDashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/choose-theme" element={
              <ProtectedRoute><ThemePicker /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
            <Route path="/jobs" element={
              <ProtectedRoute><Jobs /></ProtectedRoute>
            } />
            <Route path="/applications" element={
              <ProtectedRoute><Applications /></ProtectedRoute>
            } />
            <Route path="/mentor" element={
              <ProtectedRoute><MentorDashboard /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;