import React, { createContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

export const AuthContext = createContext(null);

// DEVELOPMENT MODE: Set to true to use mock data, false for normal authentication
const DEVELOPMENT_MODE = true;

// Mock user data for development - only used before login
const MOCK_USER = {
  id: "ADMIN001",
  username: "1",
  fullName: "Xana", // This will be replaced with actual admin name after login
  phoneNumber: "0123456789",
  role: "Admin"
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(DEVELOPMENT_MODE ? MOCK_USER : null);
  const [loading, setLoading] = useState(!DEVELOPMENT_MODE);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Skip token check in development mode
    if (DEVELOPMENT_MODE) {
      // Check if we have stored user info from previous login
      const userInfoString = localStorage.getItem('user_info') || sessionStorage.getItem('user_info');
      if (userInfoString) {
        try {
          // If we have stored user info, use that instead of mock data
          const userInfo = JSON.parse(userInfoString);
          setCurrentUser(userInfo);
        } catch (err) {
          console.error('Error parsing stored user info:', err);
        }
      }
      return;
    }
    
    // Check for auth token on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (token) {
        try {
          // Get user info from storage
          const userInfoString = localStorage.getItem('user_info') || sessionStorage.getItem('user_info');
          if (userInfoString) {
            const userInfo = JSON.parse(userInfoString);
            setCurrentUser(userInfo);
          } else {
            // If we have a token but no user info, try to fetch it
            const response = await apiService.get('api_users/me/');
            setCurrentUser(response.data);
          }
        } catch (err) {
          console.error('Auth verification failed:', err);
          // Clear invalid tokens
          localStorage.removeItem('auth_token');
          sessionStorage.removeItem('auth_token');
          localStorage.removeItem('user_info');
          sessionStorage.removeItem('user_info');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password, rememberMe = false) => {
    // In development mode, simulate login but with modified user info
    if (DEVELOPMENT_MODE) {
      // Create a user object that looks like it came from the server
      // In a real app, this would come from the API
      const mockResponse = {
        ma_qtv: username, 
        ho_ten: `Admin ${username}`, // This simulates getting the actual admin name
        so_dien_thoai: "0123456789",
        vai_tro: "Admin"
      };
      
      // Map the mock response as if it came from the server
      const mappedUser = {
        id: mockResponse.ma_qtv,
        username: mockResponse.ma_qtv,
        fullName: mockResponse.ho_ten,
        phoneNumber: mockResponse.so_dien_thoai,
        role: mockResponse.vai_tro
      };
      
      // Store the user info as if it was a real login
      if (rememberMe) {
        localStorage.setItem('user_info', JSON.stringify(mappedUser));
      } else {
        sessionStorage.setItem('user_info', JSON.stringify(mappedUser));
      }
      
      setCurrentUser(mappedUser);
      return mappedUser;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Use the specialized login method that maps fields to backend expectations
      const response = await apiService.login(username, password);
      
      const { token, user } = response.data;
      
      // Map backend fields to our frontend user object
      const mappedUser = {
        id: user.ma_qtv,
        username: user.ma_qtv,
        fullName: user.ho_ten,
        phoneNumber: user.so_dien_thoai,
        role: user.vai_tro
      };
      
      // Store token and user info
      if (rememberMe) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_info', JSON.stringify(mappedUser));
      } else {
        sessionStorage.setItem('auth_token', token);
        sessionStorage.setItem('user_info', JSON.stringify(mappedUser));
      }
      
      setCurrentUser(mappedUser);
      return mappedUser;
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'Login failed';
      if (err.response) {
        // Server responded with an error
        if (err.response.status === 401) {
          errorMessage = 'Invalid admin ID or password';
        } else {
          errorMessage = 'Login failed: ' + (err.response.data.message || 'Server error');
        }
      } else if (err.request) {
        // No response received
        errorMessage = 'Unable to connect to the server. Please check your network connection.';
      } else {
        // Error in request setup
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // In development mode, clear storage but keep mock user
    if (DEVELOPMENT_MODE) {
      localStorage.removeItem('user_info');
      sessionStorage.removeItem('user_info');
      setCurrentUser(MOCK_USER);
      return;
    }
    
    // Clear auth data
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    sessionStorage.removeItem('user_info');
    setCurrentUser(null);
  };

  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider 
      value={{
        currentUser,
        loading,
        error,
        login,
        logout,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 