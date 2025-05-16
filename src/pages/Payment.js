import React, { useState, useEffect, useRef, useMemo } from 'react';
import Footer from '../components/Footer';
import './styles/style-payment.css';
import { API_URL, apiService } from '../services/api';
import TablePagination from '../components/TablePagination';
import useAutoFetch from '../hooks/useAutoFetch';
import { useAutoFetchSettings } from '../context/AutoFetchContext';
import AutoFetchControl from '../components/AutoFetchControl';

function Payment() {
  // State for payments
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  const [sortOrder, setSortOrder] = useState('newest'); // Default: newest to oldest

  // Fetch payment data from API
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // If the API supports pagination, use these params
      const params = {
        page: pagination.currentPage,
        limit: pagination.recordsPerPage
      };
      
      // Make the API call
      const response = await apiService.get('api_users/lichsuthanhtoan/', { params });
      
      // Check if the response data is an array or has pagination info
      let records = [];
      let totalCount = 0;
      
      if (Array.isArray(response.data)) {
        // API returns all records, store them all for filtering
        const allRecords = response.data;
        totalCount = allRecords.length;
        records = allRecords;
      } else if (response.data.records) {
        // API already returns paginated data
        records = response.data.records;
        totalCount = response.data.totalRecords || response.data.records.length;
      } else {
        // Fallback if the structure is unexpected
        records = response.data;
        totalCount = response.data.length;
      }
      
      // Update state with the data
      setPayments(records);
      
      // Update pagination state
      setPagination(prev => ({
        ...prev,
        totalRecords: totalCount
      }));
      
      setLastFetchTime(new Date());
      return records;
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err.message || 'An error occurred while loading payment data');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Use auto-fetch hook for payments
  const {
    data: autoFetchedPayments,
    isLoading: isLoadingPayments,
    error: autoFetchError,
    manualFetch
  } = useAutoFetch(
    fetchPayments,
    interval,
    globalEnabled,
    [pagination.currentPage, pagination.recordsPerPage]
  );
  
  // Update payments state when auto-fetched data changes
  useEffect(() => {
    if (autoFetchedPayments && !isLoadingPayments) {
      setPayments(autoFetchedPayments);
    }
    if (autoFetchError) {
      setError(autoFetchError.message || 'Failed to fetch payment data');
    }
  }, [autoFetchedPayments, isLoadingPayments, autoFetchError]);

  // Process revenue data from API
  useEffect(() => {
    if (payments.length > 0) {
      // Group payments by date and calculate total revenue for each date
      const paymentsByDate = payments.reduce((acc, payment) => {
        // Format date (without time)
        const date = new Date(payment.thoi_gian).toLocaleDateString('vi-VN');
        
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
  }, [payments]);

  // Filter payments based on search and filters
  const filteredPayments = useMemo(() => {
    let result = [...payments];
    
    // Apply filters
    if (searchTerm) {
      result = result.filter(payment => 
        payment.ma_thanh_toan?.toString().includes(searchTerm) ||
        payment.sinh_vien?.ma_sv?.toString().includes(searchTerm) ||
        payment.sinh_vien?.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply date filter
    if (dateFilter) {
      result = result.filter(payment => {
        const paymentDate = new Date(payment.thoi_gian).toISOString().split('T')[0];
        return paymentDate === dateFilter;
      });
    }
    
    // Apply sorting
    if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.thoi_gian) - new Date(a.thoi_gian));
    } else if (sortOrder === 'oldest') {
      result.sort((a, b) => new Date(a.thoi_gian) - new Date(b.thoi_gian));
    }
    
    // Update total records count for pagination
    setPagination(prev => ({
      ...prev,
      totalRecords: result.length
    }));
    
    // Apply pagination
    const startIndex = (pagination.currentPage - 1) * pagination.recordsPerPage;
    return result.slice(startIndex, startIndex + pagination.recordsPerPage);
  }, [payments, searchTerm, dateFilter, pagination.currentPage, pagination.recordsPerPage, sortOrder]);

  // Calculate statistics
  const totalRevenue = filteredPayments.reduce((sum, payment) => sum + payment.so_tien, 0);
  
  const averageAmount = filteredPayments.length > 0 ? totalRevenue / filteredPayments.length : 0;
  
  // These might need to be adjusted if status is added later
  const completedPayments = filteredPayments.length;
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
      setPayments([response.data, ...payments]);
      
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
      if (!payments.length) return;
      
      const Chart = await loadChartJs();
      
      // Use API data for revenue chart
      const { dates, revenues } = revenueData;
      
      // Since we don't have payment methods in the current data,
      // we'll use dummy data for the payment method chart
      const methodLabels = ['Thẻ tín dụng', 'Thanh toán di động', 'Tiền mặt'];
      const methodCounts = [
        Math.floor(payments.length * 0.5), // 50% credit card
        Math.floor(payments.length * 0.3), // 30% mobile payment
        payments.length - Math.floor(payments.length * 0.5) - Math.floor(payments.length * 0.3) // remainder for cash
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
  }, [payments, revenueData]); // Re-run if payments or revenueData change

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
        {/* Top Bar */}
        <div className="top-bar">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Tìm kiếm thanh toán..." 
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

        <h1>Thanh toán</h1>
        <p className="page-description">Quản lý giao dịch và thanh toán trong hệ thống</p>
        
        {/* Auto-fetch control */}
        <AutoFetchControl />
        
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
              <h3>{filteredPayments.length}</h3>
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
            {loading ? (
              <div className="loading">
                <i className="fas fa-circle-notch fa-spin"></i>
                <p>Đang tải dữ liệu thanh toán...</p>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="no-data">
                <i className="fas fa-search"></i>
                <p>Không tìm thấy giao dịch nào phù hợp với bộ lọc</p>
              </div>
            ) : (
              <>
                <table>
                  <thead>
                    <tr>
                      <th>Mã Nạp Tiền</th>
                      <th>MSSV</th>
                      <th>Họ tên</th>
                      <th>Thời gian</th>
                      <th>Số tiền</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map(payment => (
                      <tr key={payment.ma_thanh_toan}>
                        <td>{payment.ma_thanh_toan}</td>
                        <td>{payment.sinh_vien?.ma_sv}</td>
                        <td>{payment.sinh_vien?.ho_ten}</td>
                        <td>{formatDate(payment.thoi_gian)}</td>
                        <td>{payment.so_tien?.toLocaleString('vi-VN')} đ</td>
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
                    ))}
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

        {/* Error Display - Only shown when there's an error */}
        {error && (
          <div className="card error-card">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Lỗi khi tải dữ liệu</h2>
            <p>{error}</p>
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

        {/* Payment Status Summary */}
        <div className="tables-container">
          <div className="card">
            <h2 className="card-title">Giao dịch gần đây nhất</h2>
            {payments.length > 0 ? (
              <>
                <table>
                  <thead>
                    <tr>
                      <th>Mã thanh toán</th>
                      <th>MSSV</th>
                      <th>Thời gian</th>
                      <th>Số tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice(0, 5).map(payment => (
                      <tr key={`recent-${payment.ma_thanh_toan}`}>
                        <td>{payment.ma_thanh_toan}</td>
                        <td>{payment.sinh_vien?.ma_sv}</td>
                        <td>{formatDate(payment.thoi_gian)}</td>
                        <td>{payment.so_tien?.toLocaleString('vi-VN')} đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <div className="no-data">
                <p>Chưa có giao dịch nào</p>
              </div>
            )}
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
                  <span>{selectedPayment.ma_thanh_toan}</span>
                </div>
                <div className="receipt-row">
                  <strong>Ngày giờ:</strong>
                  <span>{formatDate(selectedPayment.thoi_gian)}</span>
                </div>
              </div>
              
              <div className="receipt-customer-info">
                <div className="receipt-row">
                  <span>Khách hàng:</span>
                  <span>{selectedPayment.sinh_vien?.ho_ten} (MSSV: {selectedPayment.sinh_vien?.ma_sv})</span>
                </div>
                <div className="receipt-row">
                  <span>RFID:</span>
                  <span>{selectedPayment.sinh_vien?.id_rfid}</span>
                </div>
                <div className="receipt-row">
                  <span>Số tiền:</span>
                  <span>{selectedPayment.so_tien?.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="receipt-row">
                  <span>Số dư hiện tại:</span>
                  <span>{selectedPayment.sinh_vien?.so_tien_hien_co?.toLocaleString('vi-VN')} đ</span>
                </div>
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
                    // Print receipt functionality
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