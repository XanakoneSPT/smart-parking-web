import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './styles/style-login.css';

function Login() {
  // State
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  
  // Auth context
  const { login, loading, error, isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access before being redirected to login
  const from = location.state?.from?.pathname || 
    (currentUser?.role === 'Admin' ? '/admin' : '/parking-management');

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Event Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };

  const handleRememberMeChange = () => {
    setRememberMe(!rememberMe);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!credentials.username.trim() || !credentials.password.trim()) {
      return;
    }
    
    try {
      // Use login function from auth context
      await login(credentials.username, credentials.password, rememberMe);
      // Navigation is handled by the useEffect hook
    } catch (err) {
      // Error handling is done in the auth context
      console.error('Login submission error:', err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            {/* <img src="/api/placeholder/80/80" alt="Logo" /> */}
            <h1>Logo</h1>
          </div>
          <h1>Smart Parking System</h1>
          <p>Sign in to continue</p>
        </div>
        
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
        <div className="form-group">
            <label htmlFor="username">Admin ID</label>
            <div className="input-with-icon">
              <i className="fas fa-user"></i>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your admin ID"
                value={credentials.username}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>
          </div>
          
          <div className="form-options">
            <div className="remember-me">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                disabled={loading}
              />
              <label htmlFor="remember-me">Remember me</label>
            </div>
            <a href="/forgot-password" className="forgot-password">Forgot password?</a>
          </div>
          
          <button
            type="submit"
            className="btn-login"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Signing in...
              </>
            ) : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;