import React, { useState, useEffect, useRef } from 'react';
import Footer from '../components/Footer';
import './styles/style-payment.css';

function Payment() {
  // State for payments
  const [payments, setPayments] = useState([
    { 
      id: 'PAY-2025-0412', 
      MSSV: '102220013', 
      licenseNumber: '29A-12345', 
      amount: 2000, 
      date: '2025-04-02 10:30',
      method: 'Card',
      status: 'completed',
    },
    { 
      id: 'PAY-2025-0411', 
      MSSV: '101220012', 
      licenseNumber: '30A-54321', 
      amount: 2000, 
      date: '2025-04-02 09:15',
      method: 'Mobile Payment',
      status: 'completed',
    },
    { 
      id: 'PAY-2025-0410', 
      MSSV: '101220011', 
      licenseNumber: '29B-78945', 
      amount: 2000, 
      date: '2025-04-01 16:45',
      method: 'Cash',
      status: 'completed',
    },
    { 
      id: 'PAY-2025-0409', 
      MSSV: '102220010', 
      licenseNumber: '33A-36987', 
      amount: 2000, 
      date: '2025-04-01 15:20',
      method: 'Card',
      status: 'refunded',
    },
    { 
      id: 'PAY-2025-0408', 
      MSSV: '102220009', 
      licenseNumber: '30B-25874', 
      amount: 2000, 
      date: '2025-04-01 12:05',
      method: 'Mobile Payment',
      status: 'completed',
    },
    { 
      id: 'PAY-2025-0407', 
      MSSV: '102220008', 
      licenseNumber: '29C-78541', 
      amount: 2000, 
      date: '2025-04-01 10:30',
      method: 'Mobile Payment',
      status: 'pending',
    },
    { 
      id: 'PAY-2025-0406', 
      MSSV: '102220007', 
      licenseNumber: '30A-36985', 
      amount: 2000, 
      date: '2025-03-31 18:45',
      method: 'Card',
      status: 'completed',
    },
    { 
      id: 'PAY-2025-0405', 
      MSSV: '102220006', 
      licenseNumber: '33B-78965', 
      amount: 2000, 
      date: '2025-03-31 14:20',
      method: 'Cash',
      status: 'completed',
    }
  ]);

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
  
  // Charts refs
  const revenueChartRef = useRef(null);
  const paymentMethodChartRef = useRef(null);
  const revenueChartInstance = useRef(null);
  const paymentMethodChartInstance = useRef(null);

  // Filter payments based on search and filters
  const filteredPayments = payments.filter(payment => {
    // Search filter
    const matchesSearch = 
      payment.MSSV.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date filter
    let matchesDate = true;
    const paymentDate = new Date(payment.date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateFilter === 'today') {
      matchesDate = paymentDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'yesterday') {
      matchesDate = paymentDate.toDateString() === yesterday.toDateString();
    } else if (dateFilter === 'thisWeek') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      matchesDate = paymentDate >= weekStart;
    }
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    // Method filter
    const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
    
    return matchesSearch && matchesDate && matchesStatus && matchesMethod;
  });

  // Calculate statistics
  const totalRevenue = filteredPayments.reduce((sum, payment) => 
    payment.status !== 'refunded' ? sum + payment.amount : sum, 0);
  
  const averageAmount = filteredPayments.length > 0 ? 
    totalRevenue / filteredPayments.filter(p => p.status !== 'refunded').length : 0;
  
  const completedPayments = filteredPayments.filter(p => p.status === 'completed').length;
  const refundedPayments = filteredPayments.filter(p => p.status === 'refunded').length;
  const pendingPayments = filteredPayments.filter(p => p.status === 'pending').length;

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

  // Handle refund
  const handleRefund = (paymentId) => {
    if (window.confirm('Bạn có chắc chắn muốn hoàn tiền cho giao dịch này?')) {
      setPayments(payments.map(payment => {
        if (payment.id === paymentId) {
          return { ...payment, status: 'refunded' };
        }
        return payment;
      }));
    }
  };

  // Handle invoice input change
  const handleInvoiceInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceDetails({
      ...invoiceDetails,
      [name]: value
    });
  };

  // Handle invoice form submission
  const handleInvoiceSubmit = (e) => {
    e.preventDefault();
    
    // Generate new payment ID
    const newId = `PAY-2025-${(parseInt(payments[0].id.split('-')[2]) + 1).toString().padStart(4, '0')}`;
    
    // Create new payment record
    const newPayment = {
      id: newId,
      MSSV: invoiceDetails.MSSV,
      licenseNumber: invoiceDetails.licenseNumber,
      amount: Number(invoiceDetails.amount),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      method: 'Pending',
      status: 'pending',
    };
    
    // Add new payment to the list
    setPayments([newPayment, ...payments]);
    
    // Close modal and reset form
    setIsInvoiceModalOpen(false);
    setInvoiceDetails({
      MSSV: '',
      licenseNumber: '',
      email: '',
      amount: '',
      parkingSpot: ''
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
      const Chart = await loadChartJs();
      
      // Revenue data (last 7 days)
      const dates = [];
      const revenueData = [];
      
      // Generate last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }));
        
        // Random revenue between 500k and 1.5M for demo
        revenueData.push(Math.floor(Math.random() * 1000000) + 500000);
      }
      
      // Payment methods data
      const methodLabels = ['Thẻ tín dụng', 'Thanh toán di động', 'Tiền mặt'];
      const methodCounts = [
        payments.filter(p => p.method === 'Credit Card').length,
        payments.filter(p => p.method === 'Mobile Payment').length,
        payments.filter(p => p.method === 'Cash').length
      ];
      
      // Create the revenue chart
      if (revenueChartRef.current) {
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
              data: revenueData,
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
              // padding: 20
              padding: {
                left: 10,
                right: 10,
                top: 200,
                bottom: 20
              }
            },
            // cutout: '60%',
            // radius: '70%'
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
  }, [payments]); // Re-run if payments change

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
              placeholder="Tìm kiếm giao dịch..." 
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

        <h1>Quản lý thanh toán</h1>
        <p className="sub-heading">Quản lý và theo dõi tất cả các giao dịch thanh toán trong hệ thống</p>
        
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
          <div className="card stat-card">
            <div className="stat-info">
              <h3>{pendingPayments}</h3>
              <p>Thanh toán đang chờ</p>
              {pendingPayments > 0 && (
                <div className="trend warning">
                  <i className="fas fa-exclamation-circle"></i> Cần xử lý
                </div>
              )}
            </div>
            <div className="icon danger-bg">
              <i className="fas fa-hourglass-half"></i>
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
              <label>Trạng thái</label>
              <select 
                value={statusFilter} 
                onChange={handleStatusFilterChange}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="pending">Đang chờ</option>
                <option value="refunded">Đã hoàn tiền</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Phương thức</label>
              <select 
                value={methodFilter} 
                onChange={handleMethodFilterChange}
              >
                <option value="all">Tất cả phương thức</option>
                <option value="Credit Card">Thẻ tín dụng</option>
                <option value="Mobile Payment">Thanh toán di động</option>
                <option value="Cash">Tiền mặt</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="card">
          <h2 className="card-title">Danh sách giao dịch</h2>
          
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Mã Nạp Tiền</th>
                  <th>MSSV</th>
                  <th>Biển số xe</th>
                  <th>Thời gian</th>
                  <th>Số tiền</th>
                  <th>Phương thức</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map(payment => (
                  <tr key={payment.id}>
                    <td>{payment.id}</td>
                    <td>{payment.MSSV}</td>
                    <td>{payment.licenseNumber}</td>
                    <td>{payment.date}</td>
                    <td>{payment.amount.toLocaleString('vi-VN')} đ</td>
                    <td>{payment.method}</td>
                    <td>
                      <span className={`status ${
                        payment.status === 'completed' ? 'available' : 
                        payment.status === 'refunded' ? 'occupied' : 'warning'
                      }`}>
                        {payment.status === 'completed' ? 'Đã hoàn thành' : 
                         payment.status === 'refunded' ? 'Đã hoàn tiền' : 'Đang chờ'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleViewReceipt(payment)}
                          title="Xem hóa đơn"
                          className="btn-primary action-btn"
                        >
                          <i className="fas fa-file-invoice"></i>
                        </button>
                        {payment.status === 'completed' && (
                          <button 
                            onClick={() => handleRefund(payment.id)}
                            title="Hoàn tiền"
                            className="btn-warning action-btn"
                          >
                            <i className="fas fa-undo-alt"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Analytics */}
        <div className="chart-container">
          <div className="card chart">
            <h2 className="card-title">Doanh thu 7 ngày qua</h2>
            <canvas ref={revenueChartRef} width="350" height="250"></canvas>
          </div>
          <div className="card chart">
            <h2 className="card-title">Phương thức thanh toán</h2>
            <div className="chart-wrapper">
              <canvas ref={paymentMethodChartRef} width="350" height="250"></canvas>
            </div>
          </div>
        </div>

        {/* Payment Status Summary */}
        <div className="tables-container">
          <div className="card">
            <h2 className="card-title">Tóm tắt trạng thái thanh toán</h2>
            <table>
              <thead>
                <tr>
                  <th>Trạng thái</th>
                  <th>Số lượng</th>
                  <th>Tỷ lệ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Đã hoàn thành</td>
                  <td>{completedPayments}</td>
                  <td>
                    <div className="progress-bar">
                      <div 
                        className="progress success-bg" 
                        style={{ width: `${(completedPayments / filteredPayments.length) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Đang chờ</td>
                  <td>{pendingPayments}</td>
                  <td>
                    <div className="progress-bar">
                      <div 
                        className="progress warning-bg" 
                        style={{ width: `${(pendingPayments / filteredPayments.length) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Đã hoàn tiền</td>
                  <td>{refundedPayments}</td>
                  <td>
                    <div className="progress-bar">
                      <div 
                        className="progress danger-bg" 
                        style={{ width: `${(refundedPayments / filteredPayments.length) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="card">
            <h2 className="card-title">Giao dịch gần đây nhất</h2>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Thời gian</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 5).map(payment => (
                  <tr key={`recent-${payment.id}`}>
                    <td>{payment.id}</td>
                    <td>{payment.date}</td>
                    <td>{payment.amount.toLocaleString('vi-VN')} đ</td>
                    <td>
                      <span className={`status ${
                        payment.status === 'completed' ? 'available' : 
                        payment.status === 'refunded' ? 'occupied' : 'warning'
                      }`}>
                        {payment.status === 'completed' ? 'Đã hoàn thành' : 
                         payment.status === 'refunded' ? 'Đã hoàn tiền' : 'Đang chờ'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  <span>{selectedPayment.id}</span>
                </div>
                <div className="receipt-row">
                  <strong>Ngày giờ:</strong>
                  <span>{selectedPayment.date}</span>
                </div>
                <div className="receipt-row">
                  <strong>Phương thức:</strong>
                  <span>{selectedPayment.method}</span>
                </div>
              </div>
              
              <div className="receipt-customer-info">
                <div className="receipt-row">
                  <span>Khách hàng:</span>
                  <span>{selectedPayment.MSSV}</span>
                </div>
                <div className="receipt-row">
                  <span>Biển số xe:</span>
                  <span>{selectedPayment.licenseNumber}</span>
                </div>
                <div className="receipt-row">
                  <span>Số tiền:</span>
                  <span>{selectedPayment.amount.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
              
              <div className="receipt-total">
                <strong>Tổng cộng: </strong>
                <span className="total-amount">
                  {selectedPayment.amount.toLocaleString('vi-VN')} đ
                </span>
              </div>
              
              <div className="modal-footer">
                <button 
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="btn-primary"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </>
    );
}
export default Payment;