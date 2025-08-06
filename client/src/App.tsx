import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
import OAuthCallback from './components/OAuthCallback';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import './App.css';

interface User {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    // Check for stored authentication token
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);

    // Listen for localStorage changes in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      // Only handle changes to our specific keys
      if (e.key === 'token' || e.key === 'user') {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          // User logged in from another tab
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            console.log('User logged in from another tab');
          } catch (error) {
            console.error('Error parsing user data from storage event:', error);
            setUser(null);
          }
        } else {
          // User logged out from another tab
          setUser(null);
          console.log('User logged out from another tab');
        }
      }
    };

    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogin = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleRegister = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || "1819503316-g8utd2pglfkkj9knodugltkkj4vra4e8.apps.googleusercontent.com"}>
      <Router>
        <div className="App">
          <Routes>
            <Route 
              path="/" 
              element={
                user ? <Navigate to="/chat" /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/login" 
              element={
                user ? <Navigate to="/chat" /> : 
                <Login onLogin={handleLogin} onShowRegister={() => setShowRegister(true)} />
              } 
            />
            <Route 
              path="/register" 
              element={
                user ? <Navigate to="/chat" /> : 
                <Register onRegister={handleRegister} onBackToLogin={() => setShowRegister(false)} />
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                user ? <Navigate to="/chat" /> : 
                <ForgotPassword />
              } 
            />
            <Route 
              path="/reset-password" 
              element={
                user ? <Navigate to="/chat" /> : 
                <ResetPassword onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/oauth-callback" 
              element={
                user ? <Navigate to="/chat" /> : 
                <OAuthCallback onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/chat" 
              element={
                user ? <Chat user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
              } 
            />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App; 