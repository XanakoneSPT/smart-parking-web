import React, { useState, useEffect } from 'react';
import './styles/style-noti.css'
import Footer from '../components/Footer';

function Notifications() {
  // States for notifications and form data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Bảo trì hệ thống',
      message: 'Hệ thống sẽ bảo trì từ 2:00 - 4:00 ngày 10/04/2025. Xin vui lòng không sử dụng hệ thống trong thời gian này.',
      type: 'system',
      recipients: 'all',
      status: 'scheduled',
      dateCreated: '2025-04-06T10:30:00',
      dateScheduled: '2025-04-09T18:00:00',
      author: 'System Admin'
    },
    {
      id: 2,
      title: 'Bảo trì chỗ đỗ xe',
      message: 'Khu vực A & B sẽ bảo trì vào ngày 15/04/2025.',
      type: 'system',
      recipients: 'all',
      status: 'sent',
      dateCreated: '2025-04-05T14:20:00',
      dateSent: '2025-04-05T15:00:00',
      author: 'Manager'
    },
    {
      id: 3,
      title: 'Nhiệm vụ ca trực mới',
      message: 'Các nhân viên vui lòng kiểm tra lịch trực mới cho tháng 4 trong hệ thống.',
      type: 'task',
      recipients: 'staff',
      status: 'sent',
      dateCreated: '2025-04-04T09:45:00',
      dateSent: '2025-04-04T10:00:00',
      author: 'Admin User'
    },
    {
      id: 4,
      title: 'Cập nhật phần mềm',
      message: 'Phiên bản mới của ứng dụng đã được phát hành với các tính năng mới. Vui lòng cập nhật ngay để có trải nghiệm tốt nhất.',
      type: 'system',
      recipients: 'users',
      status: 'draft',
      dateCreated: '2025-04-07T08:15:00',
      author: 'Tech Team'
    }
  ]);

  // State for new notification form
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'system',
    recipients: 'all',
    status: 'draft'
  });

  // State for editing notification
  const [editingNotification, setEditingNotification] = useState(null);
  
  // State for filter and search
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Handle input changes for new notification form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNotification({
      ...newNotification,
      [name]: value
    });
  };

  // Submit new notification
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    
    // If editing existing notification
    if (editingNotification) {
      const updatedNotifications = notifications.map(notif => 
        notif.id === editingNotification.id 
          ? {
              ...editingNotification,
              ...newNotification,
              dateCreated: editingNotification.dateCreated,
              dateSent: newNotification.status === 'sent' ? now : editingNotification.dateSent,
              dateScheduled: newNotification.status === 'scheduled' ? now : editingNotification.dateScheduled
            } 
          : notif
      );
      
      setNotifications(updatedNotifications);
      setEditingNotification(null);
    } 
    // Creating new notification
    else {
      const newNotificationObj = {
        id: notifications.length + 1,
        ...newNotification,
        dateCreated: now,
        dateSent: newNotification.status === 'sent' ? now : null,
        dateScheduled: newNotification.status === 'scheduled' ? now : null,
        author: 'Admin User'
      };
      
      setNotifications([...notifications, newNotificationObj]);
    }
    
    // Reset form
    setNewNotification({
      title: '',
      message: '',
      type: 'system',
      recipients: 'all',
      status: 'draft'
    });
  };

  // Edit notification
  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setNewNotification({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      recipients: notification.recipients,
      status: notification.status
    });
  };

  // Delete notification
  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      setNotifications(notifications.filter(notification => notification.id !== id));
    }
  };

  // Send notification now
  const handleSendNow = (id) => {
    const now = new Date().toISOString();
    setNotifications(notifications.map(notification => 
      notification.id === id 
        ? { ...notification, status: 'sent', dateSent: now } 
        : notification
    ));
  };

  // Filter notifications
  const filteredNotifications = notifications
    .filter(notification => {
      if (filter === 'all') return true;
      return notification.status === filter;
    })
    .filter(notification => {
      if (!searchTerm) return true;
      return (
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  return (
    <>
      {/* Main Content */}
      <div className="content">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Tìm kiếm thông báo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="user-profile">
            <i className="fas fa-bell"></i>
            <img src="/api/placeholder/40/40" alt="Admin" />
            <span>Admin User</span>
          </div>
        </div>

        <h1>Quản lý thông báo</h1>
        <p style={{ marginBottom: '20px', color: 'var(--gray)' }}>Tạo và quản lý thông báo tới người dùng và nhân viên</p>
        
        {/* Dashboard Statistics */}
        <div className="dashboard-overview">
          <div className="card stat-card">
            <div className="stat-info">
              <h3>{notifications.filter(n => n.status === 'sent').length}</h3>
              <p>Đã gửi</p>
            </div>
            <div className="icon" style={{ backgroundColor: 'var(--success)' }}>
              <i className="fas fa-paper-plane"></i>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-info">
              <h3>{notifications.filter(n => n.status === 'scheduled').length}</h3>
              <p>Lên lịch</p>
            </div>
            <div className="icon" style={{ backgroundColor: 'var(--primary)' }}>
              <i className="fas fa-clock"></i>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-info">
              <h3>{notifications.filter(n => n.status === 'draft').length}</h3>
              <p>Bản nháp</p>
            </div>
            <div className="icon" style={{ backgroundColor: 'var(--warning)' }}>
              <i className="fas fa-edit"></i>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-info">
              <h3>{notifications.length}</h3>
              <p>Tổng cộng</p>
            </div>
            <div className="icon" style={{ backgroundColor: 'var(--info)' }}>
              <i className="fas fa-bell"></i>
            </div>
          </div>
        </div>

        {/* Create/Edit Notification Form */}
        <div className="card">
          <h2 style={{ marginBottom: '15px' }}>
            {editingNotification ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
          </h2>
          <form onSubmit={handleSubmit} className="notification-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Tiêu đề thông báo</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newNotification.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập tiêu đề thông báo"
                />
              </div>
              <div className="form-group">
                <label htmlFor="type">Loại thông báo</label>
                <select
                  id="type"
                  name="type"
                  value={newNotification.type}
                  onChange={handleInputChange}
                >
                  <option value="system">Hệ thống</option>
                  <option value="alert">Cảnh báo</option>
                  <option value="task">Nhiệm vụ</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="recipients">Người nhận</label>
                <select
                  id="recipients"
                  name="recipients"
                  value={newNotification.recipients}
                  onChange={handleInputChange}
                >
                  <option value="all">Tất cả</option>
                  <option value="users">Chỉ người dùng</option>
                  <option value="staff">Chỉ nhân viên</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="status">Trạng thái</label>
                <select
                  id="status"
                  name="status"
                  value={newNotification.status}
                  onChange={handleInputChange}
                >
                  <option value="draft">Lưu bản nháp</option>
                  <option value="scheduled">Lên lịch gửi</option>
                  <option value="sent">Gửi ngay</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Nội dung thông báo</label>
              <textarea
                id="message"
                name="message"
                value={newNotification.message}
                onChange={handleInputChange}
                required
                rows="5"
                placeholder="Nhập nội dung thông báo"
              ></textarea>
            </div>
            
            {newNotification.status === 'scheduled' && (
              <div className="form-group">
                <label htmlFor="scheduleTime">Thời gian gửi</label>
                <input
                  type="datetime-local"
                  id="scheduleTime"
                  name="scheduleTime"
                />
              </div>
            )}
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingNotification ? 'Cập nhật thông báo' : 'Tạo thông báo'}
              </button>
              {editingNotification && (
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingNotification(null);
                    setNewNotification({
                      title: '',
                      message: '',
                      type: 'system',
                      recipients: 'all',
                      status: 'draft'
                    });
                  }}
                >
                  Hủy chỉnh sửa
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Notification List */}
        <div className="card">
          <div className="card-header-with-actions">
            <h2>Danh sách thông báo</h2>
            <div className="filter-controls">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tất cả</option>
                <option value="draft">Bản nháp</option>
                <option value="scheduled">Đã lên lịch</option>
                <option value="sent">Đã gửi</option>
              </select>
            </div>
          </div>
          
          <div className="notification-list">
            {filteredNotifications.length === 0 ? (
              <div className="no-data">Không có thông báo nào</div>
            ) : (
              filteredNotifications.map(notification => (
                <div key={notification.id} className="notification-item">
                  <div className="notification-header">
                    <div className={`notification-badge ${notification.type}`}>
                      {notification.type === 'system' && <i className="fas fa-cogs"></i>}
                      {notification.type === 'promotion' && <i className="fas fa-percentage"></i>}
                      {notification.type === 'alert' && <i className="fas fa-exclamation-triangle"></i>}
                      {notification.type === 'task' && <i className="fas fa-tasks"></i>}
                    </div>
                    <h3>{notification.title}</h3>
                    <div className={`status-badge ${notification.status}`}>
                      {notification.status === 'draft' && 'Bản nháp'}
                      {notification.status === 'scheduled' && 'Đã lên lịch'}
                      {notification.status === 'sent' && 'Đã gửi'}
                    </div>
                  </div>
                  
                  <div className="notification-body">
                    <p>{notification.message}</p>
                  </div>
                  
                  <div className="notification-footer">
                    <div className="notification-meta">
                      <span><i className="fas fa-user"></i> {notification.author}</span>
                      <span><i className="fas fa-users"></i> 
                        {notification.recipients === 'all' && 'Tất cả'}
                        {notification.recipients === 'users' && 'Người dùng'}
                        {notification.recipients === 'staff' && 'Nhân viên'}
                      </span>
                      <span><i className="fas fa-calendar"></i> Tạo: {formatDate(notification.dateCreated)}</span>
                      {notification.dateSent && (
                        <span><i className="fas fa-paper-plane"></i> Gửi: {formatDate(notification.dateSent)}</span>
                      )}
                      {notification.dateScheduled && (
                        <span><i className="fas fa-clock"></i> Lên lịch: {formatDate(notification.dateScheduled)}</span>
                      )}
                    </div>
                    
                    <div className="notification-actions">
                      {notification.status !== 'sent' && (
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => handleSendNow(notification.id)}
                          title="Gửi ngay"
                        >
                          <i className="fas fa-paper-plane"></i>
                        </button>
                      )}
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEdit(notification)}
                        title="Chỉnh sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(notification.id)}
                        title="Xóa"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

export default Notifications;