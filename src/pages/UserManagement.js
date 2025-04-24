import React, { useState, useEffect } from 'react';
import './styles/style-user.css';
import Footer from '../components/Footer';

function UserManagement() {
  // State for users
  const [users, setUsers] = useState([
    { 
      id: 1, 
      name: 'Nguyễn Văn A', 
      email: '12Fd3', 
      role: 'Admin', 
      status: 'active',
      lastLogin: '2025-04-01 14:23',
      permissions: ['dashboard', 'users', 'reports', 'settings']
    },
    { 
      id: 2, 
      name: 'Trần Thị B', 
      email: '123Fd3', 
      role: 'Manager', 
      status: 'active',
      lastLogin: '2025-04-01 10:05',
      permissions: ['dashboard', 'reports', 'settings']
    },
    { 
      id: 3, 
      name: 'Lê Văn C', 
      email: '24ef14', 
      role: 'Student', 
      status: 'inactive',
      lastLogin: '2025-03-28 09:15',
      permissions: ['dashboard', 'reports']
    },
    { 
      id: 4, 
      name: 'Phạm Thị D', 
      email: 'e4dd23', 
      role: 'Student', 
      status: 'active',
      lastLogin: '2025-04-02 08:30',
      permissions: ['dashboard', 'reports']
    },
    { 
      id: 5, 
      name: 'Hoàng Văn E', 
      email: 'ffdwe1', 
      role: 'Manager', 
      status: 'active',
      lastLogin: '2025-04-01 16:45',
      permissions: ['dashboard', 'reports', 'settings']
    }
  ]);

  // State for search term
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for selected user (for editing)
  const [selectedUser, setSelectedUser] = useState(null);
  
  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for new user form
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Student',
    status: 'active',
    permissions: ['dashboard']
  });

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle opening modal for adding new user
  const handleAddUserClick = () => {
    setSelectedUser(null);
    setNewUser({
      name: '',
      email: '',
      role: 'Student',
      status: 'active',
      permissions: ['dashboard']
    });
    setIsModalOpen(true);
  };

  // Handle opening modal for editing existing user
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setNewUser({ ...user });
    setIsModalOpen(true);
  };

  // Handle user deletion
  const handleDeleteClick = (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value
    });
  };

  // Handle permission checkboxes
  const handlePermissionChange = (permission) => {
    const updatedPermissions = [...newUser.permissions];
    
    if (updatedPermissions.includes(permission)) {
      // Remove permission if already exists
      const index = updatedPermissions.indexOf(permission);
      updatedPermissions.splice(index, 1);
    } else {
      // Add permission if doesn't exist
      updatedPermissions.push(permission);
    }
    
    setNewUser({
      ...newUser,
      permissions: updatedPermissions
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedUser) {
      // Update existing user
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...newUser, id: user.id } : user
      ));
    } else {
      // Add new user with generated ID
      const newId = Math.max(...users.map(user => user.id)) + 1;
      setUsers([...users, {
        ...newUser,
        id: newId,
        lastLogin: 'Chưa đăng nhập'
      }]);
    }
    
    // Close modal
    setIsModalOpen(false);
  };

  // Handle user status toggle
  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  // Helper function to determine progress bar class
  const getProgressBarClass = (count, total) => {
    const percentage = (count / total) * 100;
    if (percentage <= 33) return 'progress-low';
    if (percentage <= 66) return 'progress-medium';
    return 'progress-high';
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
              placeholder="Tìm kiếm người dùng..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="user-profile">
            <i className="fas fa-bell"></i>
            <img src="/api/placeholder/40/40" alt="Admin" />
            <span>Admin User</span>
          </div>
        </div>

        <h1>Quản lý người dùng</h1>
        <p>Quản lý người dùng và phân quyền trong hệ thống</p>
        
        {/* User Statistics */}
        <div className="dashboard-overview">
          <div className="card stat-card">
            <div className="stat-info">
              <h3>{users.length}</h3>
              <p>Tổng người dùng</p>
            </div>
            <div className="icon icon-primary">
              <i className="fas fa-users"></i>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-info">
              <h3>{users.filter(user => user.status === 'active').length}</h3>
              <p>Người dùng đang hoạt động</p>
            </div>
            <div className="icon icon-success">
              <i className="fas fa-user-check"></i>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-info">
              <h3>{users.filter(user => user.status === 'inactive').length}</h3>
              <p>Người dùng không hoạt động</p>
            </div>
            <div className="icon icon-danger">
              <i className="fas fa-user-times"></i>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-info">
              <h3>{users.filter(user => user.role === 'Admin').length}</h3>
              <p>Quản trị viên</p>
            </div>
            <div className="icon icon-secondary">
              <i className="fas fa-user-shield"></i>
            </div>
          </div>
        </div>

        {/* Users Management */}
        <div className="card">
          <div>
            <h2>Danh sách người dùng</h2>
            <button 
              className="btn-primary" 
              onClick={handleAddUserClick}
            >
              <i className="fas fa-plus"></i>
              Thêm người dùng
            </button>
          </div>
          
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>MSSV</th>
                  <th>Tên</th>
                  <th>ID RFID</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Đăng nhập cuối</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <span 
                        className={`status ${user.status === 'active' ? 'available' : 'occupied'}`}
                        onClick={() => toggleUserStatus(user.id)}
                      >
                        {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td>{user.lastLogin}</td>
                    <td>
                      <div>
                        <button 
                          onClick={() => handleEditClick(user)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(user.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Role Distribution */}
        <div className="tables-container">
          <div className="card">
            <h2>Phân bố vai trò</h2>
            <table>
              <thead>
                <tr>
                  <th>Vai trò</th>
                  <th>Số lượng</th>
                  <th>Tỷ lệ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Admin</td>
                  <td>{users.filter(user => user.role === 'Admin').length}</td>
                  <td>
                    <div className="progress-bar">
                      <div 
                        className={`progress ${getProgressBarClass(
                          users.filter(user => user.role === 'Admin').length, 
                          users.length
                        )}`}
                      ></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Manager</td>
                  <td>{users.filter(user => user.role === 'Manager').length}</td>
                  <td>
                    <div className="progress-bar">
                      <div 
                        className={`progress ${getProgressBarClass(
                          users.filter(user => user.role === 'Manager').length, 
                          users.length
                        )}`}
                      ></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Student</td>
                  <td>{users.filter(user => user.role === 'Student').length}</td>
                  <td>
                    <div className="progress-bar">
                      <div 
                        className={`progress ${getProgressBarClass(
                          users.filter(user => user.role === 'Student').length, 
                          users.length
                        )}`}
                      ></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="card">
            <h2>Hoạt động người dùng gần đây</h2>
            <table>
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Hành động</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Nguyễn Văn A</td>
                  <td>Đăng nhập</td>
                  <td>2025-04-02 08:45</td>
                </tr>
                <tr>
                  <td>Trần Thị B</td>
                  <td>Cập nhật thông tin</td>
                  <td>2025-04-01 16:30</td>
                </tr>
                <tr>
                  <td>Phạm Thị D</td>
                  <td>Đăng nhập</td>
                  <td>2025-04-01 08:30</td>
                </tr>
                <tr>
                  <td>Hoàng Văn E</td>
                  <td>Thay đổi mật khẩu</td>
                  <td>2025-03-31 14:20</td>
                </tr>
                <tr>
                  <td>Admin User</td>
                  <td>Tạo người dùng mới</td>
                  <td>2025-03-30 11:15</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* User Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>{selectedUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</h2>
                <button 
                  className="modal-close"
                  onClick={() => setIsModalOpen(false)}
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Tên người dùng</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={newUser.name} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={newUser.email} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Vai trò</label>
                  <select 
                    name="role" 
                    value={newUser.role} 
                    onChange={handleInputChange}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Student">Student</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select 
                    name="status" 
                    value={newUser.status} 
                    onChange={handleInputChange}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Quyền hạn</label>
                  <div className="checkbox-group">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="perm-dashboard" 
                        checked={newUser.permissions.includes('dashboard')}
                        onChange={() => handlePermissionChange('dashboard')}
                      />
                      <label htmlFor="perm-dashboard">Bảng điều khiển</label>
                    </div>
                    
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="perm-users" 
                        checked={newUser.permissions.includes('users')}
                        onChange={() => handlePermissionChange('users')}
                      />
                      <label htmlFor="perm-users">Quản lý người dùng</label>
                    </div>
                    
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="perm-reports" 
                        checked={newUser.permissions.includes('reports')}
                        onChange={() => handlePermissionChange('reports')}
                      />
                      <label htmlFor="perm-reports">Báo cáo</label>
                    </div>
                    
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="perm-settings" 
                        checked={newUser.permissions.includes('settings')}
                        onChange={() => handlePermissionChange('settings')}
                      />
                      <label htmlFor="perm-settings">Cài đặt hệ thống</label>
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="btn-submit"
                  >
                    {selectedUser ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}

export default UserManagement;