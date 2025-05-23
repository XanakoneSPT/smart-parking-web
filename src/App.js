import './App.css';
import './pages/styles/style-user.css';

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ParkingManagement from './pages/ParkingManagement';
import VehicleManagement from './pages/History';
import UserManagement from './pages/UserManagement';
import Payment from './pages/Payment';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        {/* Login route without navbar */}
        <Route path="/login" element={<Login />} />
        
        {/* Layout route with navbar for protected routes */}
        <Route
          path="/*"
          element={
            <div className="App">
              <Navbar />
              <div className="main-content">
                <Routes>
                  <Route path="parking-management" element={<ParkingManagement />} />
                  <Route path="history" element={<VehicleManagement />} />
                  <Route path="user-management" element={<UserManagement />} />
                  <Route path="payment" element={<Payment />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="/" element={<Navigate to="/parking-management" />} />
                  <Route index element={<Navigate to="/parking-management" />} />
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;