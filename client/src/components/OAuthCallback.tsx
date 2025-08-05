import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
}

interface OAuthCallbackProps {
  onLogin: (user: User, token: string) => void;
}

const OAuthCallback: React.FC<OAuthCallbackProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        onLogin(user, token);
        navigate('/chat');
      } catch (error) {
        console.error('Error parsing OAuth callback data:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, onLogin, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Completing Sign In...</h1>
        <p>Please wait while we complete your authentication.</p>
        <div className="loading-spinner"></div>
      </div>
    </div>
  );
};

export default OAuthCallback; 