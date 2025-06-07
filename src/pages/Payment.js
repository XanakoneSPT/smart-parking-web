import React, { useState, useEffect, useRef, useMemo } from 'react';
import Footer from '../components/Footer';
import './styles/style-payment.css';
import { API_URL, apiService } from '../services/api';
import TablePagination from '../components/TablePagination';
import useAutoFetch from '../hooks/useAutoFetch';
import { useAutoFetchSettings } from '../context/AutoFetchContext';
import AutoFetchControl from '../components/AutoFetchControl';

function Payment() {
  // State for top-up history
  const [topUpHistory, setTopUpHistory] = useState([]);
  const [loadingTopUp, setLoadingTopUp] = useState(true);
  const [errorTopUp, setErrorTopUp] = useState(null);

  // State for recent transactions
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [errorTransactions, setErrorTransactions] = useState(null);

  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Get auto-fetch settings
  const { interval, globalEnabled } = useAutoFetchSettings();

  // State for search term
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for date filter
  const [dateFilter, setDateFilter] = useState('all');
  
  // State for status filter
  const [statusFilter, setStatusFilter] = useState('all');
  
  // State for payment method filter
  const [methodFilter, setMethodFilter] = useState('all');
  
  // State for receipt modal
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  
  // State for invoice generation modal
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState({
    MSSV: '',
    licenseNumber: '',
    email: '',
    amount: '',
    parkingSpot: ''
  });
  
  // State for revenue data
  const [revenueData, setRevenueData] = useState({ dates: [], revenues: [] });
  
  // Charts refs
  const revenueChartRef = useRef(null);
  const paymentMethodChartRef = useRef(null);
  const revenueChartInstance = useRef(null);
  const paymentMethodChartInstance = useRef(null);

  // Add pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    recordsPerPage: 10,
    totalRecords: 0
  });

  // Add sort order state
  const [sortOrder, setSortOrder] = useState('newest');

  // Function to fetch student information
  const fetchStudentInfo = async (studentId) => {
    try {
      const response = await apiService.get(`api_users/sinhvien/${studentId}/`);
      return response.data;
    } catch (err) {
      console.error(`Error fetching student info for ID ${studentId}:`, err);
      return null;
    }
  };

  // Fetch top-up history from API
  const fetchTopUpHistory = async () => {
    setLoadingTopUp(true);
    setErrorTopUp(null);
    
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.recordsPerPage
      };
      
      console.log('Fetching top-up history with params:', params);
      const response = await apiService.get('api_users/lichsunaptien/', { params });
      console.log('Raw API response:', response);
      
      let records = [];
      let totalCount = 0;
      
      if (Array.isArray(response.data)) {
        console.log('Response is an array');
        const allRecords = response.data;
        totalCount = allRecords.length;
        records = allRecords;
      } else if (response.data.records) {
        console.log('Response has records property');
        records = response.data.records;
        totalCount = response.data.totalRecords || response.data.records.length;
      } else {
        console.log('Using response data directly');
        records = response.data;
        totalCount = response.data.length;
      }
      
      console.log('Processed records:', records);
      console.log('Total count:', totalCount);
      
      setTopUpHistory(records);
      setPagination(prev => ({
        ...prev,
        totalRecords: totalCount
      }));
      
      setLastFetchTime(new Date());
      return records;
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setErrorTopUp(err.message || 'An error occurred while loading top-up history');
      throw err;
    } finally {
      setLoadingTopUp(false);
    }
  };

  // Fetch recent transactions from API
  const fetchRecentTransactions = async () => {
    setLoadingTransactions(true);
    setErrorTransactions(null);
    
    try {
      const response = await apiService.get('api_users/lichsuthanhtoan/');
      
      let transactions = [];
      
      if (Array.isArray(response.data)) {
        transactions = response.data;
      } else if (response.data.records) {
        transactions = response.data.records;
      } else {
        transactions = response.data;
      }
      
      setRecentTransactions(transactions);
      setLastFetchTime(new Date());
      return transactions;
    } catch (err) {
      console.error('Error fetching recent transactions:', err);
      setErrorTransactions(err.message || 'An error occurred while loading recent transactions');
      throw err;
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Use auto-fetch hook for both APIs
  const {
    data: autoFetchedTopUp,
    isLoading: isLoadingTopUpAuto,
    error: autoFetchErrorTopUp,
    manualFetch: manualFetchTopUp
  } = useAutoFetch(
    fetchTopUpHistory,
    interval,
    globalEnabled,
    [pagination.currentPage, pagination.recordsPerPage]
  );

  const {
    data: autoFetchedTransactions,
    isLoading: isLoadingTransactionsAuto,
    error: autoFetchErrorTransactions,
    manualFetch: manualFetchTransactions
  } = useAutoFetch(
    fetchRecentTransactions,
    interval,
    globalEnabled,
    []
  );
  
  // Update states when auto-fetched data changes
  useEffect(() => {
    if (autoFetchedTopUp && !isLoadingTopUpAuto) {
      console.log('Received auto-fetched data:', autoFetchedTopUp);
      setTopUpHistory(autoFetchedTopUp);
    }
    if (autoFetchErrorTopUp) {
      console.error('Auto-fetch error:', autoFetchErrorTopUp);
      setErrorTopUp(autoFetchErrorTopUp.message || 'Failed to fetch top-up history');
    }
  }, [autoFetchedTopUp, isLoadingTopUpAuto, autoFetchErrorTopUp]);

  useEffect(() => {
    if (autoFetchedTransactions && !isLoadingTransactionsAuto) {
      setRecentTransactions(autoFetchedTransactions);
    }
    if (autoFetchErrorTransactions) {
      setErrorTransactions(autoFetchErrorTransactions.message || 'Failed to fetch recent transactions');
    }
  }, [autoFetchedTransactions, isLoadingTransactionsAuto, autoFetchErrorTransactions]);

  // Filter top-up history based on search and filters
  const filteredTopUpHistory = useMemo(() => {
    console.log('Filtering top-up history. Current data:', topUpHistory);
    console.log('Current filters:', {
      searchTerm,
      dateFilter,
      sortOrder,
      pagination: {
        currentPage: pagination.currentPage,
        recordsPerPage: pagination.recordsPerPage
      }
    });

    let result = [...topUpHistory];
    
    if (searchTerm) {
      result = result.filter(payment => 
        payment.ma_nap_tien?.toString().includes(searchTerm) ||
        payment.sinh_vien?.ma_sv?.toString().includes(searchTerm) ||
        payment.ma_giao_dich?.toString().includes(searchTerm) ||
        payment.sinh_vien?.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('After search filter:', result);
    }
    
    if (dateFilter !== 'all') {
      result = result.filter(payment => {
        const paymentDate = new Date(payment.thoi_gian_nap).toISOString().split('T')[0];
        return paymentDate === dateFilter;
      });
      console.log('After date filter:', result);
    }
    
    if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.thoi_gian_nap) - new Date(a.thoi_gian_nap));
    } else if (sortOrder === 'oldest') {
      result.sort((a, b) => new Date(a.thoi_gian_nap) - new Date(b.thoi_gian_nap));
    }
    console.log('After sorting:', result);
    
    setPagination(prev => ({
      ...prev,
      totalRecords: result.length
    }));
    
    const startIndex = (pagination.currentPage - 1) * pagination.recordsPerPage;
    const paginatedResult = result.slice(startIndex, startIndex + pagination.recordsPerPage);
    console.log('Final paginated result:', paginatedResult);
    
    return paginatedResult;
  }, [topUpHistory, searchTerm, dateFilter, pagination.currentPage, pagination.recordsPerPage, sortOrder]);

  // Process revenue data from API
  useEffect(() => {
    if (topUpHistory.length > 0) {
      // Group payments by date and calculate total revenue for each date
      const paymentsByDate = topUpHistory.reduce((acc, payment) => {
        // Format date (without time)
        const date = new Date(payment.thoi_gian_nap).toLocaleDateString('vi-VN');
        
        if (!acc[date]) {
          acc[date] = 0;
        }
        
        acc[date] += payment.so_tien;
        return acc;
      }, {});
      
      // Convert to arrays for chart
      const dates = Object.keys(paymentsByDate);
      const revenues = Object.values(paymentsByDate);
      
      setRevenueData({ dates, revenues });
    }
  }, [topUpHistory]);

  // Filter recent transactions based on search and filters
  const filteredRecentTransactions = useMemo(() => {
    let result = [...recentTransactions];
    
    if (searchTerm) {
      result = result.filter(payment => 
        payment.ma_thanh_toan?.toString().includes(searchTerm) ||
        payment.sinh_vien?.ma_sv?.toString().includes(searchTerm) ||
        payment.sinh_vien?.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (dateFilter !== 'all') {
      result = result.filter(payment => {
        const paymentDate = new Date(payment.thoi_gian).toISOString().split('T')[0];
        return paymentDate === dateFilter;
      });
    }
    
    if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.thoi_gian) - new Date(a.thoi_gian));
    } else if (sortOrder === 'oldest') {
      result.sort((a, b) => new Date(a.thoi_gian) - new Date(b.thoi_gian));
    }
    
    setPagination(prev => ({
      ...prev,
      totalRecords: result.length
    }));
    
    const startIndex = (pagination.currentPage - 1) * pagination.recordsPerPage;
    return result.slice(startIndex, startIndex + pagination.recordsPerPage);
  }, [recentTransactions, searchTerm, dateFilter, pagination.currentPage, pagination.recordsPerPage, sortOrder]);

  // Calculate statistics
  const totalRevenue = filteredTopUpHistory.reduce((sum, payment) => sum + payment.so_tien, 0);
  
  const averageAmount = filteredTopUpHistory.length > 0 ? totalRevenue / filteredTopUpHistory.length : 0;
  
  // These might need to be adjusted if status is added later
  const completedPayments = filteredTopUpHistory.length;
  const refundedPayments = 0;
  const pendingPayments = 0;

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter changes
  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
  };
  
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };
  
  const handleMethodFilterChange = (e) => {
    setMethodFilter(e.target.value);
  };

  // Handle receipt view
  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setIsReceiptModalOpen(true);
  };

  // Handle invoice input change
  const handleInvoiceInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceDetails({
      ...invoiceDetails,
      [name]: value
    });
  };

  // Handle invoice form submission - adjust as needed for your API
  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Send new payment data to API
      const response = await apiService.post('api/payments', invoiceDetails);
      
      // Add new payment to the list
      setTopUpHistory([response.data, ...topUpHistory]);
      
      // Close modal and reset form
      setIsInvoiceModalOpen(false);
      setInvoiceDetails({
        MSSV: '',
        licenseNumber: '',
        email: '',
        amount: '',
        parkingSpot: ''
      });
    } catch (err) {
      alert('Failed to create new invoice. Please try again.');
      console.error('Error creating invoice:', err);
    }
  };

  // Format date string for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Initialize charts
  useEffect(() => {
    // Load Chart.js from CDN
    const loadChartJs = () => {
      return new Promise((resolve) => {
        if (window.Chart) {
          resolve(window.Chart);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
        script.integrity = 'sha512-ElRFoEQdI5Ht6kZvyzXhYG9NqjtkmlkfYk0wr6wHxU9JEHakS7UJZNeml5ALk+8IKlU6jDgMabC3vkumRokgJA==';
        script.crossOrigin = 'anonymous';
        script.referrerPolicy = 'no-referrer';
        
        script.onload = () => {
          resolve(window.Chart);
        };
        
        document.body.appendChild(script);
      });
    };

    const initCharts = async () => {
      if (!topUpHistory.length) return;
      
      const Chart = await loadChartJs();
      
      // Use API data for revenue chart
      const { dates, revenues } = revenueData;
      
      // Since we don't have payment methods in the current data,
      // we'll use dummy data for the payment method chart
      const methodLabels = ['Thẻ tín dụng', 'Thanh toán di động', 'Tiền mặt'];
      const methodCounts = [
        Math.floor(topUpHistory.length * 0.5), // 50% credit card
        Math.floor(topUpHistory.length * 0.3), // 30% mobile payment
        topUpHistory.length - Math.floor(topUpHistory.length * 0.5) - Math.floor(topUpHistory.length * 0.3) // remainder for cash
      ];
      
      // Create the revenue chart
      if (revenueChartRef.current && dates.length > 0) {
        // Destroy existing chart if it exists
        if (revenueChartInstance.current) {
          revenueChartInstance.current.destroy();
        }
        
        const ctx = revenueChartRef.current.getContext('2d');
        revenueChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: dates,
            datasets: [{
              label: 'Doanh thu (VND)',
              data: revenues,
              fill: true,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return value.toLocaleString('vi-VN') + ' đ';
                  }
                }
              }
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return context.raw.toLocaleString('vi-VN') + ' đ';
                  }
                }
              }
            }
          }
        });
      }

      // Create the payment method chart
      if (paymentMethodChartRef.current) {
        // Destroy existing chart if it exists
        if (paymentMethodChartInstance.current) {
          paymentMethodChartInstance.current.destroy();
        }
        
        const ctx = paymentMethodChartRef.current.getContext('2d');
        paymentMethodChartInstance.current = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: methodLabels,
            datasets: [{
              data: methodCounts,
              backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                position: 'right',
                align: 'center'
              }
            },
            layout: {
              padding: {
                left: 10,
                right: 10,
                top: 20,
                bottom: 20
              }
            }
          }
        });
      }
    };

    initCharts();

    // Cleanup function to destroy charts when component unmounts
    return () => {
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
      }
      if (paymentMethodChartInstance.current) {
        paymentMethodChartInstance.current.destroy();
      }
    };
  }, [topUpHistory, revenueData]); // Re-run if topUpHistory or revenueData change

  // Add handlers for pagination
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };
  
  const handleRecordsPerPageChange = (recordsPerPage) => {
    setPagination(prev => ({
      ...prev,
      recordsPerPage,
      currentPage: 1 // Reset to first page when changing records per page
    }));
  };

  // Add handler for sort order change
  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
    // Reset to first page when sort order changes
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  return (
    <>
      {/* Main Content */}
      <div className="content">
        {/* Top Bar - removing search bar and user profile */}
        <div className="top-bar">
          <h1>Thanh toán</h1>
        </div>

        <p className="page-description">Quản lý giao dịch và thanh toán trong hệ thống</p>
        
        {/* Auto-fetch control */}
        {/* <AutoFetchControl /> */}
        
        {/* Last updated indicator */}
        {lastFetchTime && (
          <div className="last-updated">
            <small>Cập nhật lần cuối: {lastFetchTime.toLocaleTimeString('vi-VN')}</small>
            {globalEnabled && <span className="fetch-indicator"></span>}
          </div>
        )}
        
        {/* Payment Statistics */}
        <div className="dashboard-overview">
          <div className="card stat-card">
            <div className="stat-info">
              <h3>{totalRevenue.toLocaleString('vi-VN')} đ</h3>
              <p>Tổng doanh thu</p>
            </div>
            <div className="icon primary-bg">
              <i className="fas fa-money-bill-wave"></i>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-info">
              <h3>{filteredTopUpHistory.length}</h3>
              <p>Giao dịch</p>
            </div>
            <div className="icon success-bg">
              <i className="fas fa-receipt"></i>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="card filter-card">
          <div className="filter-header">
            <h2>Bộ lọc thanh toán</h2>
            <button 
              className="btn-primary" 
              onClick={() => setIsInvoiceModalOpen(true)}
            >
              <i className="fas fa-plus"></i>
              Tạo hóa đơn mới
            </button>
          </div>
          
          <div className="filter-controls">
            <div className="filter-group">
              <label>Thời gian</label>
              <select 
                value={dateFilter} 
                onChange={handleDateFilterChange}
              >
                <option value="all">Tất cả thời gian</option>
                <option value="today">Hôm nay</option>
                <option value="yesterday">Hôm qua</option>
                <option value="thisWeek">Tuần này</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Sắp xếp</label>
              <select
                value={sortOrder}
                onChange={handleSortOrderChange}
              >
                <option value="newest">Mới nhất đến cũ nhất</option>
                <option value="oldest">Cũ nhất đến mới nhất</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="card">
          <h2>Lịch sử nạp tiền</h2>
          <div className="payment-history">
            {loadingTopUp ? (
              <div className="loading">
                <i className="fas fa-circle-notch fa-spin"></i>
                <p>Đang tải dữ liệu thanh toán...</p>
              </div>
            ) : filteredTopUpHistory.length === 0 ? (
              <div className="no-data">
                <i className="fas fa-search"></i>
                <p>Không tìm thấy giao dịch nào phù hợp với bộ lọc</p>
              </div>
            ) : (
              <>
                <table>
                  <thead>
                    <tr>
                      <th>Mã nạp tiền</th>
                      <th>MSSV</th>
                      <th>Họ tên</th>
                      <th>Phương thức</th>
                      <th>Thời gian</th>
                      <th>Số tiền</th>
                      <th>Mã giao dịch</th>
                      <th>Ghi chú</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTopUpHistory.map(payment => {
                      console.log('Rendering payment row:', payment);
                      return (
                        <tr key={payment.ma_nap_tien}>
                          <td>{payment.ma_nap_tien}</td>
                          <td>{payment.sinh_vien?.ma_sv}</td>
                          <td>{payment.sinh_vien?.ho_ten}</td>
                          <td>{payment.phuong_thuc}</td>
                          <td>{formatDate(payment.thoi_gian_nap)}</td>
                          <td>{payment.so_tien?.toLocaleString('vi-VN')} đ</td>
                          <td>{payment.ma_giao_dich || '-'}</td>
                          <td>{payment.ghi_chu || '-'}</td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                onClick={() => handleViewReceipt(payment)}
                                title="Xem hóa đơn"
                                className="btn-primary action-btn"
                              >
                                <i className="fas fa-file-invoice"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
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
        </div>

        {/* Recent Transactions */}
        <div className="card recent-transactions-card">
          <h2>Giao dịch gần đây nhất</h2>
          <div className="recent-transactions">
            {loadingTransactions ? (
              <div className="loading">
                <i className="fas fa-circle-notch fa-spin"></i>
                <p>Đang tải dữ liệu giao dịch...</p>
              </div>
            ) : recentTransactions.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Mã thanh toán</th>
                    <th>MSSV</th>
                    <th>Họ tên</th>
                    <th>Thời gian</th>
                    <th>Số tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.slice(0, 5).map(transaction => (
                    <tr key={`recent-${transaction.ma_thanh_toan}`}>
                      <td>{transaction.ma_thanh_toan}</td>
                      <td>{transaction.sinh_vien?.ma_sv}</td>
                      <td>{transaction.sinh_vien?.ho_ten}</td>
                      <td>{formatDate(transaction.thoi_gian)}</td>
                      <td>{transaction.so_tien?.toLocaleString('vi-VN')} đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">
                <p>Chưa có giao dịch nào</p>
              </div>
            )}
            {errorTransactions && (
              <div className="error-message">
                <p>{errorTransactions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Error Display - Only shown when there's an error */}
        {errorTopUp && (
          <div className="card error-card">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Lỗi khi tải dữ liệu</h2>
            <p>{errorTopUp}</p>
            <button 
              className="btn-primary"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Payment Analytics */}
        <div className="chart-container">
          <div className="card chart">
            <h2 className="card-title">Doanh thu 7 ngày qua</h2>
            <canvas ref={revenueChartRef} width="350" height="250"></canvas>
          </div>
        </div>

        {/* Receipt Modal */}
        {isReceiptModalOpen && selectedPayment && (
          <div className="modal-overlay">
            <div className="modal receipt-modal">
              <div className="modal-header">
                <h2>Hóa đơn thanh toán</h2>
                <button 
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="close-btn"
                >
                  &times;
                </button>
              </div>
              
              <div className="receipt-header">
                <h3>Smart Parking System</h3>
                <p>Trường Đại Học Bách Khoa</p>
              </div>
              
              <div className="receipt-details">
                <div className="receipt-row">
                  <strong>Mã giao dịch:</strong>
                  <span>{selectedPayment.ma_nap_tien}</span>
                </div>
                <div className="receipt-row">
                  <strong>Ngày giờ:</strong>
                  <span>{formatDate(selectedPayment.thoi_gian_nap)}</span>
                </div>
              </div>
              
              <div className="receipt-customer-info">
                <div className="receipt-row">
                  <span>MSSV:</span>
                  <span>{selectedPayment.sinh_vien?.ma_sv}</span>
                </div>
                <div className="receipt-row">
                  <span>Họ tên:</span>
                  <span>{selectedPayment.sinh_vien?.ho_ten}</span>
                </div>
                <div className="receipt-row">
                  <span>Phương thức:</span>
                  <span>{selectedPayment.phuong_thuc}</span>
                </div>
                <div className="receipt-row">
                  <span>Số tiền:</span>
                  <span>{selectedPayment.so_tien?.toLocaleString('vi-VN')} đ</span>
                </div>
                {selectedPayment.ma_giao_dich && (
                  <div className="receipt-row">
                    <span>Mã giao dịch:</span>
                    <span>{selectedPayment.ma_giao_dich}</span>
                  </div>
                )}
                {selectedPayment.ghi_chu && (
                  <div className="receipt-row">
                    <span>Ghi chú:</span>
                    <span>{selectedPayment.ghi_chu}</span>
                  </div>
                )}
              </div>
              
              <div className="receipt-total">
                <strong>Tổng cộng: </strong>
                <span className="total-amount">
                  {selectedPayment.so_tien?.toLocaleString('vi-VN')} đ
                </span>
              </div>
              
              <div className="modal-footer">
                <button 
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="btn-primary"
                >
                  Đóng
                </button>
                <button 
                  onClick={() => {
                    window.print();
                  }}
                  className="btn-secondary"
                >
                  <i className="fas fa-print"></i> In hóa đơn
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        {isInvoiceModalOpen && (
          <div className="modal-overlay">
            <div className="modal invoice-modal">
              <div className="modal-header">
                <h2>Tạo hóa đơn mới</h2>
                <button 
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="close-btn"
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleInvoiceSubmit}>
                <div className="form-group">
                  <label htmlFor="MSSV">MSSV:</label>
                  <input 
                    type="text" 
                    id="MSSV" 
                    name="MSSV"
                    value={invoiceDetails.MSSV}
                    onChange={handleInvoiceInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="amount">Số tiền (VND):</label>
                  <input 
                    type="number" 
                    id="amount" 
                    name="amount"
                    value={invoiceDetails.amount}
                    onChange={handleInvoiceInputChange}
                    min="1000"
                    step="1000"
                    required
                  />
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button"
                    onClick={() => setIsInvoiceModalOpen(false)}
                    className="btn-secondary"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    className="btn-primary"
                  >
                    Tạo hóa đơn
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </>
  );
}

export default Payment;