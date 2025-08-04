import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
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
    <div className="App">
      {user ? (
        <Chat user={user} onLogout={handleLogout} />
      ) : showRegister ? (
        <Register onRegister={handleRegister} onBackToLogin={() => setShowRegister(false)} />
      ) : (
        <Login onLogin={handleLogin} onShowRegister={() => setShowRegister(true)} />
      )}
    </div>
  );
}

export default App; 