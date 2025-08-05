import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

interface User {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
}

interface RegisterProps {
  onRegister: (user: User, token: string) => void;
  onBackToLogin: () => void;
}

const handleGoogleSuccess = (credentialResponse: any) => {
  // This will be handled by the OAuth callback route
  window.location.href = 'http://localhost:5000/api/auth/google';
};

const handleGoogleError = () => {
  console.log('Google Login Failed');
};

const Register: React.FC<RegisterProps> = ({ onRegister, onBackToLogin }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onRegister(data.user, data.token);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p>Join ChatApp to start chatting</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              minLength={6}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
              minLength={6}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-divider">
          <span>or</span>
        </div>
        
        <div className="oauth-buttons">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="filled_blue"
            size="large"
            text="signup_with"
            shape="rectangular"
          />
          
          <button 
            onClick={() => window.location.href = 'http://localhost:5000/api/auth/microsoft'}
            className="oauth-button microsoft-button"
          >
            <svg width="20" height="20" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 1H1v9h9V1zM20 1h-9v9h9V1zM10 11H1v9h9v-9zM20 11h-9v9h9v-9z" fill="currentColor"/>
            </svg>
            Sign up with Microsoft
          </button>
        </div>
        
        <div className="auth-footer">
          <p>Already have an account? <a href="#" onClick={() => navigate('/login')}>Sign in</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register; 