import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, apiService } from '../services/api';
import './styles/style-login.css';

function Login() {
  // State
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

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
    setLoading(true);
    setError(null);
    
    try {
      // Validate form
      if (!credentials.username.trim()) {
        throw new Error('Please enter your username');
      }
      
      if (!credentials.password.trim()) {
        throw new Error('Please enter your password');
      }
      
      // Make login request
      const response = await apiService.post('api_users/login/', {
        username: credentials.username,
        password: credentials.password
      });
      
      console.log('Login response:', response.data);
      
      // Store token and user info
      const { token, user } = response.data;
      
      if (rememberMe) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_info', JSON.stringify(user));
      } else {
        sessionStorage.setItem('auth_token', token);
        sessionStorage.setItem('user_info', JSON.stringify(user));
      }
      
      // Redirect based on role
      if (user.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        // Server responded with an error
        if (err.response.status === 401) {
          setError('Username or password is incorrect');
        } else {
          setError('Login failed: ' + (err.response.data.message || 'Server error'));
        }
      } else if (err.request) {
        // No response received
        setError('Unable to connect to the server. Please check your network connection.');
      } else {
        // Error in request setup
        setError(err.message);
      }
    } finally {
      setLoading(false);
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
          <h1>Student Management System</h1>
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
            <label htmlFor="username">Username</label>
            <div className="input-with-icon">
              <i className="fas fa-user"></i>
              <input
                type="username"
                id="username"
                name="username"
                placeholder="Enter your username"
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