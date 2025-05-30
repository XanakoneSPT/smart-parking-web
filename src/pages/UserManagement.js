import React, { useState, useEffect } from 'react';
import './styles/style-user.css';
import Footer from '../components/Footer';
import axios from 'axios';
import { API_URL } from '../services/api';

function UserManagement() {
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    id: '', // Student ID (ma_sv)
    name: '',
    id_rfid: '',
    role: 'Student',
    total_money: 100000,
    permissions: ['dashboard', 'reports']
  });

  // Log API URL for debugging
  useEffect(() => {
    console.log('API URL:', API_URL);
  }, []);

  // Fetch users function
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching users from:', `${API_URL}api_users/sinhvien/`);
      const response = await axios.get(`${API_URL}api_users/sinhvien/`);
      console.log('Users data received:', response.data);
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
    
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id_rfid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.ma_sv?.toString().includes(searchTerm.toLowerCase())
  );

  // Event Handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddUserClick = () => {
    setSelectedUser(null);
    setNewUser({
      id: '', 
      name: '',
      id_rfid: '',
      role: 'Student',
      total_money: 100000,
      permissions: ['dashboard', 'reports']
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    // Map API data structure to form structure
    setNewUser({
      id: user.ma_sv,
      name: user.ho_ten,
      id_rfid: user.id_rfid,
      role: 'Student', // Default since API doesn't seem to handle roles
      total_money: user.so_tien_hien_co,
      permissions: ['dashboard', 'reports'] // Default permissions
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      setError(null);
      
      try {
        await axios.delete(`${API_URL}api_users/sinhvien/${userId}/`);
        fetchUsers(); // Refresh the list after deletion
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user. Please try again.');
      }
    }
  };

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

  // Direct API call function - bypass complex logic
  const addUserDirectly = async () => {
    try {
      // Simple request with minimal data for testing
      const apiData = {
        ma_sv: newUser.id,
        ho_ten: newUser.name,
        id_rfid: newUser.id_rfid,
        so_tien_hien_co: newUser.total_money,
        mat_khau: 'cntt123'
      };
      
      console.log('Sending direct API request to create user:', apiData);
      
      const response = await axios({
        method: 'post',
        url: `${API_URL}api_users/sinhvien/`,
        data: apiData,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('User created successfully:', response.data);
      fetchUsers();
      setIsModalOpen(false);
      return true;
    } catch (err) {
      console.error('Direct API call error:', err);
      let errorMessage = 'Failed to create user: ';
      
      if (err.response) {
        console.log('Error response:', err.response);
        errorMessage += JSON.stringify(err.response.data || {});
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    
    console.log('Form submission initiated with data:', newUser);
    
    // Validate form data
    if (!newUser.id) {
      setError('MSSV (Student ID) is required');
      return;
    }
    
    if (!newUser.name) {
      setError('Name is required');
      return;
    }
    
    if (!newUser.id_rfid) {
      setError('RFID ID is required');
      return;
    }
    
    try {
      if (selectedUser) {
        // Update existing user
        const apiData = {
          ma_sv: newUser.id,
          ho_ten: newUser.name,
          id_rfid: newUser.id_rfid,
          so_tien_hien_co: newUser.total_money
        };
        
        console.log('Updating user with data:', apiData);
        const response = await axios.put(`${API_URL}api_users/sinhvien/${selectedUser.ma_sv}/`, apiData);
        console.log('Update response:', response.data);
      } else {
        // Try the direct API call approach
        return await addUserDirectly();
      }
      
      // Refresh user list and close modal
      fetchUsers();
      setIsModalOpen(false);
      return true;
    } catch (err) {
      console.error('Error saving user:', err);
      
      let errorMessage = 'Failed to save user. ';
      
      if (err.response) {
        console.log('Error response:', err.response);
        errorMessage += 'Server response: ' + JSON.stringify(err.response.data || {});
      } else if (err.request) {
        errorMessage += 'No response received from server. Check network connection.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      return false;
    }
  };

  const updateUserMoney = async (userId, newValue) => {
    setError(null);
    
    try {
      const user = users.find(u => u.ma_sv === userId);
      const newMoney = user.so_tien_hien_co === 'inactive' ? 100000 : 'inactive';
      
      await axios.patch(`${API_URL}api_users/sinhvien/${userId}/money/`, { 
        so_tien_hien_co: newMoney 
      });
      
      fetchUsers(); // Refresh user data
    } catch (err) {
      console.error('Error updating user money:', err);
      setError('Failed to update user balance. Please try again.');
    }
  };

  // Helper Functions
  const formatMoney = (value) => {
    if (value === 'inactive') return 'Không hoạt động';
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;

  return (
    <div className="content">
      {/* Error message */}
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
            <h3>{users.filter(user => user.so_tien_hien_co !== 'inactive').length}</h3>
            <p>Người dùng đang hoạt động</p>
          </div>
          <div className="icon icon-success">
            <i className="fas fa-user-check"></i>
          </div>
        </div>
        {/* <div className="card stat-card">
          <div className="stat-info">
            <h3>{users.filter(user => user.so_tien_hien_co === 'inactive').length}</h3>
            <p>Người dùng không hoạt động</p>
          </div>
          <div className="icon icon-danger">
            <i className="fas fa-user-times"></i>
          </div>
        </div> */}
        <div className="card stat-card">
          <div className="stat-info">
            <h3>{users.filter(user => user.role === 'Admin').length || 0}</h3>
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
                    <td>Sinh viên</td>
                    <td>{formatMoney(user.so_tien_hien_co)}</td>
                    <td>
                      <div>
                        <button onClick={() => handleEditClick(user)}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button onClick={() => handleDeleteClick(user.ma_sv)}>
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
              {/* Student ID field */}
              <div className="form-group">
                <label>MSSV (Student ID) *</label>
                <input 
                  type="text" 
                  name="id" 
                  value={newUser.id} 
                  onChange={handleInputChange}
                  required
                />
              </div>
            
              <div className="form-group">
                <label>Tên người dùng *</label>
                <input 
                  type="text" 
                  name="name" 
                  value={newUser.name} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>ID RFID *</label>
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
                  {['dashboard', 'users', 'reports', 'settings'].map(perm => (
                    <div className="checkbox-item" key={perm}>
                      <input 
                        type="checkbox" 
                        id={`perm-${perm}`}
                        checked={newUser.permissions.includes(perm)}
                        onChange={() => handlePermissionChange(perm)}
                      />
                      <label htmlFor={`perm-${perm}`}>
                        {perm === 'dashboard' && 'Bảng điều khiển'}
                        {perm === 'users' && 'Quản lý người dùng'}
                        {perm === 'reports' && 'Báo cáo'}
                        {perm === 'settings' && 'Cài đặt hệ thống'}
                      </label>
                    </div>
                  ))}
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
  );
}

export default UserManagement;