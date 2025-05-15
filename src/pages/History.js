import React, { useState, useEffect } from 'react';
import './styles/style-history.css';
import Footer from '../components/Footer';
import axios from 'axios';
import { API_URL } from '../services/api';

function HistoryPage() {
  // State for history records
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters
  const [filters, setFilters] = useState({
    search: '',
    dateRange: {
      from: '',
      to: ''
    },
    status: ''
  });

  // State for pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    recordsPerPage: 5,
    totalRecords: 0,
    totalPages: 0
  });

  // Fetch history records from API
  useEffect(() => {
    fetchHistoryRecords();
  }, [filters, pagination.currentPage, pagination.recordsPerPage]);

  const fetchHistoryRecords = async () => {
    try {
      setLoading(true);
      
      // Prepare query parameters
      const params = new URLSearchParams();
      params.append('page', pagination.currentPage);
      params.append('limit', pagination.recordsPerPage);
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      if (filters.status) {
        params.append('status', filters.status);
      }
      
      if (filters.dateRange.from) {
        params.append('fromDate', filters.dateRange.from);
      }
      
      if (filters.dateRange.to) {
        params.append('toDate', filters.dateRange.to);
      }
      
      // Make API call
      const response = await axios.get(`${API_URL}/api_users/lichsuravao`, { params });
      console.log('API Response:', response.data);
      
      // Update state with API response
      setHistoryRecords(response.data);
      setPagination({
        ...pagination,
        totalRecords: response.data.totalRecords,
        totalPages: response.data.totalPages
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching history records:', err);
      setError('Failed to load history records. Please try again later.');
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'from' || name === 'to') {
      setFilters({
        ...filters,
        dateRange: {
          ...filters.dateRange,
          [name]: value
        }
      });
    } else {
      setFilters({
        ...filters,
        [name]: value
      });
    }
    // Reset to first page when filters change
    setPagination({
      ...pagination,
      currentPage: 1
    });
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      dateRange: {
        from: '',
        to: ''
      },
      status: ''
    });
    // Reset to first page when filters reset
    setPagination({
      ...pagination,
      currentPage: 1
    });
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination({
      ...pagination,
      currentPage: page
    });
  };

  // Export data functions
  const handleExportExcel = async () => {
    try {
      // Create params with all current filters for the export
      const params = new URLSearchParams();
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      if (filters.status) {
        params.append('status', filters.status);
      }
      
      if (filters.dateRange.from) {
        params.append('fromDate', filters.dateRange.from);
      }
      
      if (filters.dateRange.to) {
        params.append('toDate', filters.dateRange.to);
      }
      
      // Call export API with filters
      const response = await axios.get('/api/history/export/excel', { 
        params,
        responseType: 'blob' 
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `parking-history-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      alert('Failed to export data. Please try again later.');
    }
  };

  const handleExportPDF = async () => {
    try {
      // Create params with all current filters for the export
      const params = new URLSearchParams();
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      if (filters.status) {
        params.append('status', filters.status);
      }
      
      if (filters.dateRange.from) {
        params.append('fromDate', filters.dateRange.from);
      }
      
      if (filters.dateRange.to) {
        params.append('toDate', filters.dateRange.to);
      }
      
      // Call export API with filters
      const response = await axios.get('/api/history/export/pdf', { 
        params,
        responseType: 'blob' 
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `parking-history-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      alert('Failed to export data. Please try again later.');
    }
  };

  // Function to view full-size image
  const handleViewImage = (imageUrl) => {
    // You could implement a modal here to show the full-size image
    // For now, we'll use a placeholder alert
    window.alert('Viewing full-size image: ' + imageUrl);
  };

  return (
    <div className="content">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Tìm kiếm..." />
        </div>
        <div className="user-profile">
          <i className="fas fa-bell"></i>
          <img src="/api/placeholder/40/40" alt="Admin" />
          <span>Admin User</span>
        </div>
      </div>

      <h1>Lịch sử đỗ xe</h1>
      <p style={{ marginBottom: '20px', color: 'var(--gray)' }}>Xem lịch sử ra vào của các phương tiện trong hệ thống</p>

      {/* Filters */}
      <div className="card">
        <h2 style={{ marginBottom: '15px' }}>Bộ lọc</h2>
        <div className="filters-container">
          <div className="filter-group">
            <label>Tìm kiếm:</label>
            <input 
              type="text" 
              name="search" 
              placeholder="Mã SV hoặc biển số xe" 
              value={filters.search} 
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>Trạng thái:</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">Tất cả</option>
              <option value="active">Đang đỗ</option>
              <option value="completed">Đã rời đi</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Từ ngày:</label>
            <input 
              type="date" 
              name="from" 
              value={filters.dateRange.from} 
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>Đến ngày:</label>
            <input 
              type="date" 
              name="to" 
              value={filters.dateRange.to} 
              onChange={handleFilterChange}
            />
          </div>
          <button className="btn-reset" onClick={handleResetFilters}>
            <i className="fas fa-redo"></i> Đặt lại
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="card">
        <h2 style={{ marginBottom: '15px' }}>Lịch sử ra vào</h2>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <button onClick={fetchHistoryRecords}>Thử lại</button>
          </div>
        ) : (
          <>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Mã lịch sử</th>
                  <th>Mã sinh viên</th>
                  <th>Biển số xe</th>
                  <th>Thời gian vào</th>
                  <th>Thời gian ra</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {historyRecords.length > 0 ? (
                  historyRecords.map(record => (
                    <tr key={record.ma_lich_su}>
                      <td>{record.ma_lich_su}</td>
                      <td>{record.sinh_vien.ma_sv}</td>
                      <td>{record.bien_so_xe}</td>
                      <td>{record.thoi_gian_vao}</td>
                      <td>{record.thoi_gian_ra || "—"}</td>
                      <td>
                        <span className={`status-badge ${record.trang_thai}`}>
                          {record.trang_thai}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-records">Không tìm thấy bản ghi nào</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalRecords > 0 && (
              <div className="pagination">
                <button 
                  className="pagination-btn" 
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`pagination-btn ${pagination.currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
                
                <button 
                  className="pagination-btn" 
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
                
                <span className="pagination-info">
                  Hiển thị {((pagination.currentPage - 1) * pagination.recordsPerPage) + 1}-
                  {Math.min(pagination.currentPage * pagination.recordsPerPage, pagination.totalRecords)} 
                  của {pagination.totalRecords} bản ghi
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Export Buttons */}
      <div className="export-buttons">
        <button className="btn-export" onClick={handleExportExcel} disabled={loading || historyRecords.length === 0}>
          <i className="fas fa-file-excel"></i> Xuất Excel
        </button>
        <button className="btn-export" onClick={handleExportPDF} disabled={loading || historyRecords.length === 0}>
          <i className="fas fa-file-pdf"></i> Xuất PDF
        </button>
      </div>

      <Footer />
    </div>
  );
}

export default HistoryPage;