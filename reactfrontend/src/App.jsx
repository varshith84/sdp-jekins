import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect, useContext } from 'react';
import { Navbar } from './components/Navbar';
import { AdminNavbar } from './components/admin/AdminNavbar';
import { Settings } from './components/Settings';

import { LoadingScreen } from './components/LoadingScreen';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { ForgotPassword } from './components/auth/ForgotPassword';

import { Drive } from './components/Drive';
import { Profile } from './components/Profile';
import { ViewAllGroups } from './components/admin/ViewAllGroups';
import { ViewAllUsers } from './components/admin/ViewAllUsers';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { themes } from './lib/themes';
import { AuthProvider, AuthContext } from './AuthContext.jsx';
import ComingSoon from './components/ComingSoon.jsx';
import { Dashboard } from './components/Dashboard.jsx';

const ProtectedAdminRoute = ({ element }) => {
  const { user } = useContext(AuthContext);
  if (!user || !user.isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return element;
};


const AppRoutes = () => {
  const [theme, setTheme] = useState('default');
  const { user } = useContext(AuthContext);

  const currentTheme = themes[theme] || themes.default;

  return (
    <div className={`min-h-screen ${currentTheme.background} flex flex-col`}>
      <Routes>
      
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/*"
          element={
            <div className="flex flex-col h-screen overflow-hidden">
              {user?.isAdmin ? <AdminNavbar /> : <Navbar />}
              <main className="flex-1 overflow-auto px-4 container mx-auto py-2">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard/>} />
                  <Route path="/admin-dashboard" element={<ProtectedAdminRoute element={<AdminDashboard />} />} />
                  
                  <Route path="/nearby" element={<ComingSoon />} />
            
                 
                  <Route path="/drive" element={<Drive />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings setTheme={setTheme} theme={theme} />} />
                  <Route path="/view-all-groups" element={<ProtectedAdminRoute element={<ViewAllGroups />} />} />
                  <Route path="/view-all-users" element={<ProtectedAdminRoute element={<ViewAllUsers />} />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
      <Toaster position="bottom-right" />
    </div>
  );
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
