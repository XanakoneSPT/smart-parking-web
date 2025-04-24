import React from 'react';
import { useState, useEffect, useRef } from 'react';
import './styles/style-report.css';
import Footer from '../components/Footer';

function Reports() {
  // Refs for the chart canvases
  const weeklyRevenueChartRef = useRef(null);
  const monthlyOccupancyChartRef = useRef(null);
  const comparisonChartRef = useRef(null);
  
  // Chart instances
  const weeklyRevenueChartInstance = useRef(null);
  const revenueChartInstance = useRef(null);
  const comparisonChartInstance = useRef(null);

  // State for date filters
  const [dateRange, setDateRange] = useState({
    startDate: '2025-03-01',
    endDate: '2025-04-07'
  });

  // State for report data
  const [reportData, setReportData] = useState({
    totalRevenue: 30000,
    avgOccupancy: 68,
    peakHours: '8:00 - 10:00',
    totalVehicles: 3247
  });

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 7;

  // Sample transaction data
  const [transactions, setTransactions] = useState([
    { id: 1, date: '2025-04-07', vehicleId: 'ABC-123', duration: '2h 45m', amount: '2000₫', paymentMethod: 'Thẻ tín dụng' },
    { id: 2, date: '2025-04-07', vehicleId: 'XYZ-789', duration: '4h 20m', amount: '2000₫', paymentMethod: 'Ứng dụng di động' },
    { id: 3, date: '2025-04-06', vehicleId: 'DEF-456', duration: '1h 30m', amount: '2000₫', paymentMethod: 'Tiền mặt' },
    { id: 4, date: '2025-04-06', vehicleId: 'GHI-321', duration: '6h 15m', amount: '2000₫', paymentMethod: 'Thẻ tín dụng' },
    { id: 5, date: '2025-04-05', vehicleId: 'JKL-654', duration: '3h 00m', amount: '2000₫', paymentMethod: 'Ứng dụng di động' },
    { id: 6, date: '2025-04-05', vehicleId: 'MNO-987', duration: '8h 45m', amount: '2000₫', paymentMethod: 'Thẻ tín dụng' },
    { id: 7, date: '2025-04-04', vehicleId: 'PQR-258', duration: '5h 30m', amount: '2000₫', paymentMethod: 'Ứng dụng di động' },
    { id: 8, date: '2025-04-04', vehicleId: 'STU-147', duration: '2h 15m', amount: '2000₫', paymentMethod: 'Tiền mặt' },
    { id: 9, date: '2025-04-03', vehicleId: 'VWX-369', duration: '7h 00m', amount: '2000₫', paymentMethod: 'Thẻ tín dụng' },
    { id: 10, date: '2025-04-03', vehicleId: 'YZA-852', duration: '4h 45m', amount: '2000₫', paymentMethod: 'Ứng dụng di động' },
    { id: 11, date: '2025-04-02', vehicleId: 'BCD-741', duration: '3h 30m', amount: '2000₫', paymentMethod: 'Tiền mặt' },
    { id: 12, date: '2025-04-02', vehicleId: 'EFG-963', duration: '1h 45m', amount: '2000₫', paymentMethod: 'Ứng dụng di động' },
    { id: 13, date: '2025-04-01', vehicleId: 'HIJ-582', duration: '9h 15m', amount: '2000₫', paymentMethod: 'Thẻ tín dụng' },
    { id: 14, date: '2025-04-01', vehicleId: 'KLM-159', duration: '5h 00m', amount: '2000₫', paymentMethod: 'Ứng dụng di động' },
    { id: 15, date: '2025-03-31', vehicleId: 'NOP-753', duration: '2h 30m', amount: '2000₫', paymentMethod: 'Tiền mặt' }
  ]);

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = transactions.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(transactions.length / recordsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle date range change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  // Initialize charts function that can be called to update charts
  const initCharts = async () => {
    const Chart = await loadChartJs();
    
    // Sample data for the weekly revenue chart
    const weeklyRevenueData = {
      labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
      datasets: [{
        label: 'Tuần này',
        data: [500000, 550000, 520000, 640000, 710000, 800000, 670000],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }, {
        label: 'Tuần trước',
        data: [450000, 510000, 530000, 600000, 650000, 740000, 620000],
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }]
    };

    // Sample data for the monthly occupancy chart
    const monthlyOccupancyData = {
      labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
      datasets: [{
        label: 'Tỷ lệ lấp đầy (%)',
        data: [
          65, 68, 70, 72, 75, 80, 82,
          75, 70, 65, 60, 62, 65, 68,
          70, 72, 75, 78, 80, 82, 85,
          80, 78, 75, 72, 70, 68, 65,
          62, 60
        ],
        fill: true,
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        tension: 0.4
      }]
    };

    // Sample data for the comparison chart (payment methods)
    const comparisonData = {
      labels: ['Thẻ tín dụng', 'Ứng dụng di động', 'Tiền mặt'],
      datasets: [{
        label: 'Phương thức thanh toán',
        data: [45, 35, 20],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
      }]
    };

    // Create the weekly revenue chart
    if (weeklyRevenueChartRef.current) {
      // Destroy existing chart if it exists
      if (weeklyRevenueChartInstance.current) {
        weeklyRevenueChartInstance.current.destroy();
      }
      
      const ctx = weeklyRevenueChartRef.current.getContext('2d');
      weeklyRevenueChartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: weeklyRevenueData,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Doanh thu (VNĐ)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Ngày trong tuần'
              }
            }
          }
        }
      });
    }

    // Create the monthly occupancy chart
    if (monthlyOccupancyChartRef.current) {
      // Destroy existing chart if it exists
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
      }
      
      const ctx = monthlyOccupancyChartRef.current.getContext('2d');
      revenueChartInstance.current = new Chart(ctx, {
        type: 'line',
        data: monthlyOccupancyData,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Tỷ lệ lấp đầy (%)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Ngày trong tháng'
              }
            }
          }
        }
      });
    }

    // Create the comparison chart
    if (comparisonChartRef.current) {
      // Destroy existing chart if it exists
      if (comparisonChartInstance.current) {
        comparisonChartInstance.current.destroy();
      }
      
      const ctx = comparisonChartRef.current.getContext('2d');
      comparisonChartInstance.current = new Chart(ctx, {
        type: 'pie',
        data: comparisonData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
            },
            title: {
              display: true,
              text: 'Phân bố phương thức thanh toán'
            }
          }
        }
      });
    }
  };

  // Generate report based on filters
  const generateReport = () => {
    // In a real app, this would fetch data from an API based on the date range
    console.log(`Tạo báo cáo từ ${dateRange.startDate} đến ${dateRange.endDate}`);
    
    // Mock updating the report data
    setReportData({
      totalRevenue: Math.floor(500000000 + Math.random() * 100000000),
      avgOccupancy: Math.floor(60 + Math.random() * 20),
      peakHours: '8:00 - 10:00',
      totalVehicles: Math.floor(3000 + Math.random() * 500)
    });
    
    // Reinitialize charts (in a real app, this would update with new data)
    initCharts();
  };

  // Export report function
  const exportReport = (format) => {
    alert(`Xuất báo cáo định dạng ${format} từ ${dateRange.startDate} đến ${dateRange.endDate}`);
    // In a real app, this would generate and download a file
  };

  // Initialize charts on component mount
  useEffect(() => {
    initCharts();

    // Cleanup function to destroy charts when component unmounts
    return () => {
      if (weeklyRevenueChartInstance.current) {
        weeklyRevenueChartInstance.current.destroy();
      }
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
      }
      if (comparisonChartInstance.current) {
        comparisonChartInstance.current.destroy();
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <>
      {/* Main Content */}
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

        <h1>Báo cáo & Phân tích</h1>
        <p style={{ marginBottom: '20px', color: 'var(--gray)' }}>Tạo và xuất báo cáo về hiệu suất bãi đỗ xe</p>
        
        {/* Report Filters */}
        <div className="card">
          <h2 style={{ marginBottom: '15px' }}>Bộ lọc báo cáo</h2>
          <div className="report-filters">
            <div className="filter-group">
              <label>Từ ngày:</label>
              <input 
                type="date" 
                name="startDate" 
                value={dateRange.startDate} 
                onChange={handleDateChange}
              />
            </div>
            <div className="filter-group">
              <label>Đến ngày:</label>
              <input 
                type="date" 
                name="endDate" 
                value={dateRange.endDate} 
                onChange={handleDateChange}
              />
            </div>
            <div className="filter-actions">
              <button className="btn primary" onClick={generateReport}>
                <i className="fas fa-sync-alt"></i> Tạo báo cáo
              </button>
              <div className="export-dropdown">
                <button className="btn secondary">
                  <i className="fas fa-download"></i> Xuất báo cáo
                </button>
                <div className="export-options">
                  <div onClick={() => exportReport('PDF')}>
                    <i className="fas fa-file-pdf"></i> Xuất PDF
                  </div>
                  <div onClick={() => exportReport('Excel')}>
                    <i className="fas fa-file-excel"></i> Xuất Excel
                  </div>
                  <div onClick={() => exportReport('CSV')}>
                    <i className="fas fa-file-csv"></i> Xuất CSV
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Summary */}
        <div className="dashboard-overview">
          <div className="card stat-card">
            <div className="stat-info">
              <h3>{reportData.totalRevenue.toLocaleString()} ₫</h3>
              <p>Tổng doanh thu</p>
              <div className="trend up">
                <i className="fas fa-arrow-up"></i> 8,3%
              </div>
            </div>
            <div className="icon" style={{ backgroundColor: 'var(--warning)' }}>
              <i className="fas fa-dollar-sign"></i>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-info">
              <h3>{reportData.avgOccupancy}%</h3>
              <p>Tỷ lệ lấp đầy trung bình</p>
              <div className="trend up">
                <i className="fas fa-arrow-up"></i> 3,2%
              </div>
            </div>
            <div className="icon" style={{ backgroundColor: 'var(--primary)' }}>
              <i className="fas fa-chart-line"></i>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-info">
              <h3>{reportData.peakHours}</h3>
              <p>Giờ cao điểm</p>
              <div className="trend none">
                <i className="fas fa-minus"></i> Không thay đổi
              </div>
            </div>
            <div className="icon" style={{ backgroundColor: 'var(--info)' }}>
              <i className="fas fa-clock"></i>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-info">
              <h3>{reportData.totalVehicles.toLocaleString()}</h3>
              <p>Tổng số phương tiện</p>
              <div className="trend up">
                <i className="fas fa-arrow-up"></i> 5,7%
              </div>
            </div>
            <div className="icon" style={{ backgroundColor: 'var(--success)' }}>
              <i className="fas fa-car"></i>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="chart-container">
          <div className="card chart">
            <h2 style={{ marginBottom: '15px' }}>Doanh thu theo tuần</h2>
            <canvas ref={weeklyRevenueChartRef} width="350" height="250"></canvas>
          </div>
          <div className="card chart">
            <h2 style={{ marginBottom: '15px' }}>Tỷ lệ lấp đầy theo tháng</h2>
            <canvas ref={monthlyOccupancyChartRef} width="350" height="250"></canvas>
          </div>
        </div>

        {/* Payment Method Chart */}
        <div className="card">
          <h2 style={{ marginBottom: '15px' }}>Phân tích phương thức thanh toán</h2>
          <div className="payment-analysis">
            <div className="payment-chart">
              <canvas ref={comparisonChartRef} width="200" height="200"></canvas>
            </div>
            <div className="payment-stats">
              <div className="payment-stat">
                <h3>Thẻ tín dụng</h3>
                <div className="progress-bar">
                  <div className="progress" style={{ width: '45%', backgroundColor: 'rgba(255, 99, 132, 0.8)' }}></div>
                </div>
                <p>45% | 2.250.000₫</p>
              </div>
              <div className="payment-stat">
                <h3>Ứng dụng di động</h3>
                <div className="progress-bar">
                  <div className="progress" style={{ width: '35%', backgroundColor: 'rgba(54, 162, 235, 0.8)' }}></div>
                </div>
                <p>35% | 1.715.000₫</p>
              </div>
              <div className="payment-stat">
                <h3>Tiền mặt</h3>
                <div className="progress-bar">
                  <div className="progress" style={{ width: '20%', backgroundColor: 'rgba(255, 206, 86, 0.8)' }}></div>
                </div>
                <p>20% | 978.000₫</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="card">
          <h2 style={{ marginBottom: '15px' }}>Lịch sử giao dịch</h2>
          <table>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>ID Phương tiện</th>
                <th>Thời lượng</th>
                <th>Số tiền</th>
                <th>Phương thức thanh toán</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.date}</td>
                  <td>{transaction.vehicleId}</td>
                  <td>{transaction.duration}</td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.paymentMethod}</td>
                  <td>
                    <button className="btn-icon">
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="btn-icon">
                      <i className="fas fa-print"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button 
                key={number} 
                onClick={() => handlePageChange(number)}
                className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
              >
                {number}
              </button>
            ))}
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

export default Reports;