import './App.css';
import './pages/styles/style-user.css';

import React from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ParkingManagement from './pages/ParkingManagement';
import VehicleManagement from './pages/History';
import UserManagement from './pages/UserManagement';
import Payment from './pages/Payment';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/parking-management" element={<ParkingManagement />} />
            <Route path="/history" element={<VehicleManagement />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="*" element={<Home />} /> {/* Default Route */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
