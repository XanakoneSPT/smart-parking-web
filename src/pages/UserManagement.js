import React, { useState, useEffect } from 'react';
import './styles/style-user.css';
import Footer from '../components/Footer';
import axios from 'axios';

function UserManagement() {
  // State for users
  const [users, setUsers] = useState([]);
  
  // State for loading, error, search and user management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for new user form
  const [newUser, setNewUser] = useState({
    name: '',
    id_rfid: '',
    role: 'Student',
    total_money: 100000,
    permissions: ['dashboard']
  });

  // Fetch users function
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('http://192.168.1.2:8000/api_users/sinhvien/');
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users data. Please try again later.');
      setLoading(false);
    }
  };

  // Use effect to fetch data on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
    
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id_rfid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.ma_sv.toString().includes(searchTerm.toLowerCase())
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
      id_rfid: '',
      role: 'Student',
      total_money: 100000,
      permissions: ['dashboard', 'reports']
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
  const handleDeleteClick = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      setError(null);
      
      try {
        // Delete user from API
        await axios.delete(`/api/students/${userId}`);
        
        // Refresh the list after deletion
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user. Please try again.');
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Convert total_money to number if it's a number input
    if (name === 'total_money' && !isNaN(value)) {
      setNewUser({
        ...newUser,
        [name]: parseInt(value)
      });
    } else {
      setNewUser({
        ...newUser,
        [name]: value
      });
    }
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (selectedUser) {
        // Update existing user
        const apiData = {
          MaSV: newUser.id,
          HoTen: newUser.name,
          id_RFID: newUser.id_rfid,
          SoTienHienCo: newUser.total_money
        };
        
        await axios.put(`/api/students/${selectedUser.id}`, apiData);
        
        // Refresh user list after update
        fetchUsers();
      } else {
        // Add new user
        const apiData = {
          HoTen: newUser.name,
          id_RFID: newUser.id_rfid,
          SoTienHienCo: newUser.total_money,
          MatKhau: 'cntt123' // Default password
        };
        
        await axios.post('/api/students', apiData);
        
        // Refresh user list after adding
        fetchUsers();
      }
      
      // Close modal
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Failed to save user. Please try again.');
    }
  };

  // Handle user money update
  const updateUserMoney = async (userId, newValue) => {
    setError(null);
    
    try {
      // Find the user
      const user = users.find(u => u.id === userId);
      const newMoney = user.total_money === 'inactive' ? 100000 : 'inactive';
      
      // Update money on server
      await axios.patch(`/api/students/${userId}/money`, { 
        SoTienHienCo: newMoney 
      });
      
      // Refresh user data
      fetchUsers();
    } catch (err) {
      console.error('Error updating user money:', err);
      setError('Failed to update user balance. Please try again.');
    }
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;

  return (
    <>
      {/* Main Content */}
      <div className="content">
        {/* Error message if any */}
        {error && <div className="error-message">{error}</div>}
        
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
                  <th>Số tiền hiện có</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user.ma_sv}>
                      <td>{user.ma_sv}</td>
                      <td>{user.ho_ten}</td>
                      <td>{user.id_rfid}</td>
                      <td>Sinh vien</td>
                      <td>{user.so_tien_hien_co} VND</td>
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">Không tìm thấy người dùng</td>
                  </tr>
                )}
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
                  <label>ID RFID</label>
                  <input 
                    type="text" 
                    name="id_rfid" 
                    value={newUser.id_rfid} 
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
                  <label>Số tiền hiện có</label>
                  <input 
                    type="number" 
                    name="total_money"
                    value={newUser.total_money === 'inactive' ? 0 : newUser.total_money}
                    onChange={handleInputChange}
                    min="0"
                    step="1000"
                  />
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