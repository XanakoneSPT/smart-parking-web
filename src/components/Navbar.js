import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Use Link for routing

function Navbar() {
  const [activeItem, setActiveItem] = useState('Trang chủ'); // Track active menu item

  // Function to set active menu item
  const handleClick = (item) => {
    setActiveItem(item);
  };

  return (
    // Sidebar Navigation
    <div className="sidebar">
      <div className="sidebar-header">
        <h2><i className="fas fa-parking"></i> <span>Smart Parking</span></h2>
      </div>
      <div className="menu">
        <Link
          to="/home"
          className={`menu-item ${activeItem === 'Trang chủ' ? 'active' : ''}`}
          onClick={() => handleClick('Trang chủ')}
        >
          <i className="fas fa-tachometer-alt"></i>
          <span>Trang chủ</span>
        </Link>
        <Link
          to="/parking-management"
          className={`menu-item ${activeItem === 'Quản lý bãi đỗ' ? 'active' : ''}`}
          onClick={() => handleClick('Quản lý bãi đỗ')}
        >
          <i className="fas fa-map-marked-alt"></i>
          <span>Quản lý bãi đỗ</span>
        </Link>
        <Link
          to="/history"
          className={`menu-item ${activeItem === 'Lich sử' ? 'active' : ''}`}
          onClick={() => handleClick('Lich sử')}
        >
          <i className="fas fa-history"></i>
          <span>Lịch Sử</span>
        </Link>
        <Link
          to="/user-management"
          className={`menu-item ${activeItem === 'Quản lý người dùng' ? 'active' : ''}`}
          onClick={() => handleClick('Quản lý người dùng')}
        >
          <i className="fas fa-users"></i>
          <span>Quản lý người dùng</span>
        </Link>
        <Link
          to="/payment"
          className={`menu-item ${activeItem === 'Thanh toán' ? 'active' : ''}`}
          onClick={() => handleClick('Thanh toán')}
        >
          <i className="fas fa-receipt"></i>
          <span>Thanh toán</span>
        </Link>
        <Link
          to="/reports"
          className={`menu-item ${activeItem === 'Báo cáo' ? 'active' : ''}`}
          onClick={() => handleClick('Báo cáo')}
        >
          <i className="fas fa-chart-line"></i>
          <span>Báo cáo</span>
        </Link>
        {/* <Link
          to="/notifications"
          className={`menu-item ${activeItem === 'Thông báo' ? 'active' : ''}`}
          onClick={() => handleClick('Thông báo')}
        >
          <i className="fas fa-bell"></i>
          <span>Thông báo</span>
        </Link> */}
      </div>
    </div>
  );
}

export default Navbar;
