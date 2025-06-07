import React, { useState, useEffect } from 'react';
import './styles/style-history.css';
import Footer from '../components/Footer';
import { API_URL, apiService } from '../services/api';
import TablePagination from '../components/TablePagination';
import useAutoFetch from '../hooks/useAutoFetch';
import { useAutoFetchSettings } from '../context/AutoFetchContext';
import AutoFetchControl from '../components/AutoFetchControl';

function HistoryPage() {
  // State for history records
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Get auto-fetch settings
  const { interval, globalEnabled } = useAutoFetchSettings();

  // State for filters
  const [filters, setFilters] = useState({
    search: '',
    dateRange: {
      from: '',
      to: ''
    },
    status: '',
    sortOrder: 'newest' // Default sort order: newest to oldest
  });

  // State for pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    recordsPerPage: 5,
    totalRecords: 0,
    totalPages: 0
  });

  // Fetch history records from API
  const fetchHistoryRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare parameters based on filters and pagination
      const params = {
        page: pagination.currentPage,
        limit: pagination.recordsPerPage,
        sortOrder: filters.sortOrder
      };
      
      // Add filters to params if they exist
      if (filters.search) {
        params.search = filters.search;
      }
      
      if (filters.status) {
        params.status = filters.status;
      }
      
      if (filters.dateRange.from) {
        params.fromDate = filters.dateRange.from;
      }
      
      if (filters.dateRange.to) {
        params.toDate = filters.dateRange.to;
      }
      
      // Make API call
      const response = await apiService.get('api_users/lichsuravao/', { params });
      console.log('Fetching users from:', `${API_URL}api_users/lichsuravao/`);
      
      // Check if the response data is an array or has pagination info
      let records = [];
      let totalCount = 0;
      
      if (Array.isArray(response.data)) {
        // API returns all records, implement client-side pagination
        let allRecords = response.data;
        
        // Apply client-side sorting if needed
        if (filters.sortOrder === 'newest') {
          allRecords.sort((a, b) => new Date(b.thoi_gian_vao) - new Date(a.thoi_gian_vao));
        } else if (filters.sortOrder === 'oldest') {
          allRecords.sort((a, b) => new Date(a.thoi_gian_vao) - new Date(b.thoi_gian_vao));
        }
        
        totalCount = allRecords.length;
        
        // Calculate slicing indexes based on current page and records per page
        const startIndex = (pagination.currentPage - 1) * pagination.recordsPerPage;
        const endIndex = startIndex + pagination.recordsPerPage;
        
        // Slice the records based on current page and records per page
        records = allRecords.slice(startIndex, endIndex);
      } else if (response.data.records) {
        // API already returns paginated data
        records = response.data.records;
        totalCount = response.data.totalRecords || response.data.records.length;
      } else {
        // Fallback if the structure is unexpected
        records = response.data;
        totalCount = response.data.length;
      }
      
      // Update state with paginated data
      setHistoryRecords(records);
      setPagination({
        ...pagination,
        totalRecords: totalCount,
        totalPages: Math.ceil(totalCount / pagination.recordsPerPage)
      });
      
      setLastFetchTime(new Date());
      setLoading(false);
      
      return records;
    } catch (err) {
      console.error('Error fetching history records:', err);
      setError('Failed to load history records. Please try again later.');
      setLoading(false);
      throw err;
    }
  };

  // Use auto-fetch hook
  const {
    data: autoFetchedRecords,
    isLoading: isLoadingRecords,
    error: autoFetchError,
    manualFetch
  } = useAutoFetch(
    fetchHistoryRecords,
    interval,
    globalEnabled,
    [filters, pagination.currentPage, pagination.recordsPerPage]
  );
  
  // Update state when auto-fetched data changes
  useEffect(() => {
    if (autoFetchedRecords && !isLoadingRecords) {
      setHistoryRecords(autoFetchedRecords);
    }
    if (autoFetchError) {
      setError(autoFetchError.message || 'Failed to fetch history records');
    }
  }, [autoFetchedRecords, isLoadingRecords, autoFetchError]);

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
      status: '',
      sortOrder: 'newest'
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

  // Handle records per page change
  const handleRecordsPerPageChange = (recordsPerPage) => {
    setPagination({
      ...pagination,
      recordsPerPage: recordsPerPage,
      currentPage: 1 // Reset to first page when changing records per page
    });
  };

  // Add a handler for sort order change
  const handleSortOrderChange = (e) => {
    setFilters({
      ...filters,
      sortOrder: e.target.value
    });
    // Reset to first page when sort order changes
    setPagination({
      ...pagination,
      currentPage: 1
    });
  };

  // Export data functions
  const handleExportExcel = async () => {
    try {
      // Create params with all current filters for the export
      const params = {};
      
      if (filters.search) {
        params.search = filters.search;
      }
      
      if (filters.status) {
        params.status = filters.status;
      }
      
      if (filters.dateRange.from) {
        params.fromDate = filters.dateRange.from;
      }
      
      if (filters.dateRange.to) {
        params.toDate = filters.dateRange.to;
      }
      
      // Call export API with filters
      const response = await apiService.get('api/history/export/excel', { 
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
      const params = {};
      
      if (filters.search) {
        params.search = filters.search;
      }
      
      if (filters.status) {
        params.status = filters.status;
      }
      
      if (filters.dateRange.from) {
        params.fromDate = filters.dateRange.from;
      }
      
      if (filters.dateRange.to) {
        params.toDate = filters.dateRange.to;
      }
      
      // Call export API with filters
      const response = await apiService.get('api/history/export/pdf', { 
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
      {/* Top Bar - removing search bar and user profile */}
      <div className="top-bar">
        <h1>Lịch sử ra vào</h1>
      </div>

      <p className="section-description">Xem lịch sử các phương tiện ra vào bãi đỗ xe</p>

      {/* Auto-fetch control */}
      {/* <AutoFetchControl /> */}
      
      {/* Last updated indicator */}
      {lastFetchTime && (
        <div className="last-updated">
          <small>Cập nhật lần cuối: {lastFetchTime.toLocaleTimeString('vi-VN')}</small>
          {globalEnabled && <span className="fetch-indicator"></span>}
        </div>
      )}

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
          <div className="filter-group">
            <label>Sắp xếp:</label>
            <select value={filters.sortOrder} onChange={handleSortOrderChange}>
              <option value="newest">Mới nhất đến cũ nhất</option>
              <option value="oldest">Cũ nhất đến mới nhất</option>
            </select>
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
              <TablePagination
                totalRecords={pagination.totalRecords}
                currentPage={pagination.currentPage}
                recordsPerPage={pagination.recordsPerPage}
                onPageChange={handlePageChange}
                onRecordsPerPageChange={handleRecordsPerPageChange}
              />
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