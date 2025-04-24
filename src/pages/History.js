import React, { useState, useEffect } from 'react';
import './styles/style-history.css'
import Footer from '../components/Footer';

function HistoryPage() {
  // State for history records
  const [historyRecords, setHistoryRecords] = useState([
    {
      id: '1001',
      studentId: 'ST12345', 
      carPlate: '29A-12345',
      checkInTime: '2025-04-01 08:15:22',
      checkOutTime: '2025-04-01 16:45:37',
      checkInImage: '/api/placeholder/80/60',
      checkOutImage: '/api/placeholder/80/60',
      status: 'completed'
    },
    {
      id: '1002',
      studentId: 'ST23456',
      carPlate: '30F-56789',
      checkInTime: '2025-04-02 09:20:15',
      checkOutTime: '2025-04-02 17:30:42',
      checkInImage: '/api/placeholder/80/60',
      checkOutImage: '/api/placeholder/80/60',
      status: 'completed'
    },
    {
      id: '1003',
      studentId: 'ST34567',
      carPlate: '33A-78901',
      checkInTime: '2025-04-03 07:45:30',
      checkOutTime: '',
      checkInImage: '/api/placeholder/80/60',
      checkOutImage: '',
      status: 'active'
    },
    {
      id: '1004',
      studentId: 'ST45678',
      carPlate: '29B-34567',
      checkInTime: '2025-04-02 10:05:12',
      checkOutTime: '2025-04-02 18:22:51',
      checkInImage: '/api/placeholder/80/60',
      checkOutImage: '/api/placeholder/80/60',
      status: 'completed'
    },
    {
      id: '1005',
      studentId: 'ST56789',
      carPlate: '30A-89012',
      checkInTime: '2025-04-03 08:30:45',
      checkOutTime: '',
      checkInImage: '/api/placeholder/80/60',
      checkOutImage: '',
      status: 'active'
    },
    {
      id: '1006',
      studentId: 'ST67890',
      carPlate: '31A-23456',
      checkInTime: '2025-04-01 09:15:33',
      checkOutTime: '2025-04-01 15:40:22',
      checkInImage: '/api/placeholder/80/60',
      checkOutImage: '/api/placeholder/80/60',
      status: 'completed'
    },
    {
      id: '1007',
      studentId: 'ST78901',
      carPlate: '29C-45678',
      checkInTime: '2025-04-02 11:25:18',
      checkOutTime: '2025-04-02 19:10:35',
      checkInImage: '/api/placeholder/80/60',
      checkOutImage: '/api/placeholder/80/60',
      status: 'completed'
    },
    {
      id: '1008',
      studentId: 'ST89012',
      carPlate: '33B-67890',
      checkInTime: '2025-04-03 08:55:40',
      checkOutTime: '',
      checkInImage: '/api/placeholder/80/60',
      checkOutImage: '',
      status: 'active'
    },
  ]);

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
    recordsPerPage: 5
  });

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
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination({
      ...pagination,
      currentPage: page
    });
  };

  // Filter records based on search and filters
  const filteredRecords = historyRecords.filter(record => {
    // Search filter (check in student ID or car plate)
    const searchMatch = filters.search === '' || 
      record.studentId.toLowerCase().includes(filters.search.toLowerCase()) ||
      record.carPlate.toLowerCase().includes(filters.search.toLowerCase());
      
    // Status filter
    const statusMatch = filters.status === '' || record.status === filters.status;
    
    // Date range filter
    let dateMatch = true;
    if (filters.dateRange.from !== '' || filters.dateRange.to !== '') {
      const recordDate = new Date(record.checkInTime);
      
      if (filters.dateRange.from !== '') {
        const fromDate = new Date(filters.dateRange.from);
        if (recordDate < fromDate) {
          dateMatch = false;
        }
      }
      
      if (filters.dateRange.to !== '') {
        const toDate = new Date(filters.dateRange.to);
        toDate.setHours(23, 59, 59);
        if (recordDate > toDate) {
          dateMatch = false;
        }
      }
    }
    
    return searchMatch && statusMatch && dateMatch;
  });
  
  // Paginate records
  const indexOfLastRecord = pagination.currentPage * pagination.recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - pagination.recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / pagination.recordsPerPage);

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
        <table className="history-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mã sinh viên</th>
              <th>Biển số xe</th>
              <th>Thời gian vào</th>
              <th>Thời gian ra</th>
              <th>Ảnh vào</th>
              <th>Ảnh ra</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length > 0 ? (
              currentRecords.map(record => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.studentId}</td>
                  <td>{record.carPlate}</td>
                  <td>{record.checkInTime}</td>
                  <td>{record.checkOutTime || "—"}</td>
                  <td>
                    <img 
                      src={record.checkInImage} 
                      alt="Check-in" 
                      className="history-image"
                      onClick={() => window.alert('Xem ảnh lớn')} // Placeholder for image modal
                    />
                  </td>
                  <td>
                    {record.checkOutImage ? (
                      <img 
                        src={record.checkOutImage} 
                        alt="Check-out" 
                        className="history-image"
                        onClick={() => window.alert('Xem ảnh lớn')} // Placeholder for image modal
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${record.status}`}>
                      {record.status === 'active' ? 'Đang đỗ' : 'Đã rời đi'}
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
        {filteredRecords.length > 0 && (
          <div className="pagination">
            <button 
              className="pagination-btn" 
              disabled={pagination.currentPage === 1}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
              disabled={pagination.currentPage === totalPages}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
            
            <span className="pagination-info">
              Hiển thị {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, filteredRecords.length)} của {filteredRecords.length} bản ghi
            </span>
          </div>
        )}
      </div>

      {/* Export Buttons */}
      <div className="export-buttons">
        <button className="btn-export">
          <i className="fas fa-file-excel"></i> Xuất Excel
        </button>
        <button className="btn-export">
          <i className="fas fa-file-pdf"></i> Xuất PDF
        </button>
      </div>

      <Footer />
    </div>
  );
}

export default HistoryPage;