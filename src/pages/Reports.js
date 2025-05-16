import React from 'react';
import { useState, useEffect, useRef } from 'react';
import './styles/style-report.css';
import Footer from '../components/Footer';
import { API_URL, apiService } from '../services/api';
import TablePagination from '../components/TablePagination';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import useAutoFetch from '../hooks/useAutoFetch';
import { useAutoFetchSettings } from '../context/AutoFetchContext';
import AutoFetchControl from '../components/AutoFetchControl';

function Reports() {
  // Refs for the chart canvases
  const weeklyRevenueChartRef = useRef(null);
  const monthlyOccupancyChartRef = useRef(null);

  // Chart instances
  const weeklyRevenueChartInstance = useRef(null);
  const revenueChartInstance = useRef(null);

  // State for date filters
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // State for report data
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    avgOccupancy: 0,
    peakHours: '',
    totalVehicles: 0
  });

  // State for loading and error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Get auto-fetch settings
  const { interval, globalEnabled } = useAutoFetchSettings();

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // State for transactions
  const [transactions, setTransactions] = useState([]);

  // Add sort order state
  const [sortOrder, setSortOrder] = useState('newest');

  // Pagination logic
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Add handler for records per page change
  const handleRecordsPerPageChange = (newRecordsPerPage) => {
    setRecordsPerPage(newRecordsPerPage);
    setCurrentPage(1); // Reset to first page
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
  const initCharts = async (data) => {
    const Chart = await loadChartJs();
    
    // Get data from API response or use empty arrays if not available
    const weeklyRevenue = data?.weeklyRevenue || {
      currentWeek: [0, 0, 0, 0, 0, 0, 0],
      previousWeek: [0, 0, 0, 0, 0, 0, 0]
    };
    
    const monthlyOccupancy = data?.monthlyOccupancy || Array(30).fill(0);
    
    // Data for the weekly revenue chart
    const weeklyRevenueData = {
      labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
      datasets: [{
        label: 'Tuần này',
        data: weeklyRevenue.currentWeek,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }, {
        label: 'Tuần trước',
        data: weeklyRevenue.previousWeek,
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }]
    };

    // Data for the monthly occupancy chart
    const monthlyOccupancyData = {
      labels: Array.from({ length: monthlyOccupancy.length }, (_, i) => (i + 1).toString()),
      datasets: [{
        label: 'Tỷ lệ lấp đầy (%)',
        data: monthlyOccupancy,
        fill: true,
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        tension: 0.4
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
  };

  // Fetch transactions data with sorting
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Reuse the same data sources as generateReport
      const historyParams = new URLSearchParams();
      historyParams.append('fromDate', dateRange.startDate);
      historyParams.append('toDate', dateRange.endDate);
      
      // Fetch parking history for transaction data
      const historyResponse = await apiService.get(`api_users/lichsuravao/?${historyParams}`);
      let parkingHistory = [];
      
      if (Array.isArray(historyResponse.data)) {
        parkingHistory = historyResponse.data;
      } else if (historyResponse.data && historyResponse.data.records) {
        parkingHistory = historyResponse.data.records;
      }
      
      // Fetch payment data
      const paymentParams = new URLSearchParams();
      paymentParams.append('fromDate', dateRange.startDate);
      paymentParams.append('toDate', dateRange.endDate);
      
      const paymentResponse = await apiService.get(`api_users/lichsuthanhtoan/?${paymentParams}`);
      let paymentHistory = [];
      
      if (Array.isArray(paymentResponse.data)) {
        paymentHistory = paymentResponse.data;
      } else if (paymentResponse.data && paymentResponse.data.records) {
        paymentHistory = paymentResponse.data.records;
      }
      
      // Create transactions data from parking history
      let allTransactions = parkingHistory.map(record => {
        // Find matching payment if available
        const relatedPayment = paymentHistory.find(p => 
          p.sinh_vien && record.sinh_vien && p.sinh_vien.ma_sv === record.sinh_vien.ma_sv
        );
        
        // Calculate duration
        let duration = "N/A";
        let amount = 0;
        
        if (record.thoi_gian_vao && record.thoi_gian_ra) {
          const entryTime = new Date(record.thoi_gian_vao);
          const exitTime = new Date(record.thoi_gian_ra);
          const durationMs = exitTime - entryTime;
          const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
          const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
          duration = `${durationHours}h ${durationMinutes}m`;
          
          // Calculate amount based on duration
          amount = relatedPayment ? relatedPayment.so_tien : 0;
        }
        
        return {
          id: record.id,
          date: new Date(record.thoi_gian_vao).toLocaleDateString('vi-VN'),
          time: new Date(record.thoi_gian_vao).toLocaleTimeString('vi-VN'),
          studentId: record.sinh_vien ? record.sinh_vien.ma_sv : 'N/A',
          studentName: record.sinh_vien ? record.sinh_vien.ho_ten : 'N/A',
          plateNumber: record.bien_so_xe || 'N/A',
          duration: duration,
          paymentStatus: relatedPayment ? 'Đã thanh toán' : 'Chưa thanh toán',
          amount: amount
        };
      });
      
      // Apply sorting
      if (sortOrder === 'newest') {
        allTransactions.sort((a, b) => {
          const dateA = new Date(a.date.split('/').reverse().join('-') + 'T' + a.time);
          const dateB = new Date(b.date.split('/').reverse().join('-') + 'T' + b.time);
          return dateB - dateA;
        });
      } else if (sortOrder === 'oldest') {
        allTransactions.sort((a, b) => {
          const dateA = new Date(a.date.split('/').reverse().join('-') + 'T' + a.time);
          const dateB = new Date(b.date.split('/').reverse().join('-') + 'T' + b.time);
          return dateA - dateB;
        });
      }
      
      // Update total records
      setTotalRecords(allTransactions.length);
      setTotalPages(Math.ceil(allTransactions.length / recordsPerPage));
      
      // Apply pagination
      const startIndex = (currentPage - 1) * recordsPerPage;
      const endIndex = startIndex + recordsPerPage;
      const paginatedTransactions = allTransactions.slice(startIndex, endIndex);
      
      setTransactions(paginatedTransactions);
      setLastFetchTime(new Date());
      
      return paginatedTransactions;
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transaction data. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Use auto-fetch for transactions
  const {
    data: autoFetchedTransactions,
    isLoading: isLoadingTransactions,
    error: autoFetchError,
    manualFetch
  } = useAutoFetch(
    fetchTransactions,
    interval,
    globalEnabled,
    [dateRange, currentPage, recordsPerPage, sortOrder]
  );
  
  // Update transactions state when auto-fetched data changes
  useEffect(() => {
    if (autoFetchedTransactions && !isLoadingTransactions) {
      setTransactions(autoFetchedTransactions);
    }
    if (autoFetchError) {
      setError(autoFetchError.message || 'Failed to fetch transaction data');
    }
  }, [autoFetchedTransactions, isLoadingTransactions, autoFetchError]);

  // Generate report function
  const generateReport = async () => {
    try {
      // This will trigger a manual fetch of the transactions data
      manualFetch();
      
      // Analyze the data for report statistics
      // This is a simplified implementation and may need to be expanded based on actual data
      if (transactions.length > 0) {
        // Calculate total revenue
        const totalRevenue = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
        
        // Calculate average occupancy (placeholder)
        const avgOccupancy = Math.floor(Math.random() * 30) + 50; // Random value between 50-80%
        
        // Determine peak hours (placeholder)
        const peakHours = '17:00 - 19:00';
        
        // Total vehicles
        const totalVehicles = transactions.length;
        
        // Update report data
        setReportData({
          totalRevenue,
          avgOccupancy,
          peakHours,
          totalVehicles
        });
        
        // Init or update charts
        initCharts({
          weeklyRevenue: {
            currentWeek: Array(7).fill(0).map(() => Math.floor(Math.random() * 5000000)),
            previousWeek: Array(7).fill(0).map(() => Math.floor(Math.random() * 5000000))
          },
          monthlyOccupancy: Array(30).fill(0).map(() => Math.floor(Math.random() * 40) + 40)
        });
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again.');
    }
  };

  // Run generate report on date range change
  useEffect(() => {
    generateReport();
  }, [dateRange]);

  // Export report function
  const exportReport = async (format) => {
    try {
      setLoading(true);
      
      // Get current date and time for filename
      const date = new Date().toISOString().split('T')[0];
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      let filename = `parking-report-${date}`;
      
      // Create data array for export
      const exportData = transactions.map(transaction => ({
        Date: new Date(transaction.date).toLocaleDateString('vi-VN'),
        'License Plate': transaction.plateNumber,
        Duration: transaction.duration,
        Amount: transaction.amount
      }));
      
      // Add summary data
      const summaryData = [
        { label: 'Tổng doanh thu', value: reportData.totalRevenue },
        { label: 'Tỷ lệ lấp đầy trung bình', value: `${reportData.avgOccupancy}%` },
        { label: 'Giờ cao điểm', value: reportData.peakHours },
        { label: 'Tổng số phương tiện', value: reportData.totalVehicles }
      ];
      
      if (format === 'CSV') {
        // Create CSV content
        let content = 'Ngày,Biển số xe,Thời lượng,Số tiền (VND)\n';
        
        // Add data rows
        transactions.forEach(transaction => {
          const date = new Date(transaction.date).toLocaleDateString('vi-VN');
          const amount = transaction.amount.toString();
          content += `"${date}","${transaction.plateNumber}","${transaction.duration}","${amount}"\n`;
        });
        
        // Add summary
        content += '\n';
        content += `"Tổng doanh thu","","","${reportData.totalRevenue}"\n`;
        content += `"Tỷ lệ lấp đầy trung bình","${reportData.avgOccupancy}%","",""\n`;
        content += `"Giờ cao điểm","${reportData.peakHours}","",""\n`;
        content += `"Tổng số phương tiện","${reportData.totalVehicles}","",""\n`;
        
        // Create and trigger download
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
      } else if (format === 'EXCEL') {
        // Create a new workbook
        const wb = XLSX.utils.book_new();
        
        // Create worksheet with transaction data
        const ws = XLSX.utils.json_to_sheet(exportData);
        
        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, "Transactions");
        
        // Create summary worksheet
        const summaryWs = XLSX.utils.json_to_sheet(summaryData.map(item => ({
          "Metric": item.label,
          "Value": item.value
        })));
        
        // Add the summary worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");
        
        // Generate Excel file and trigger download
        XLSX.writeFile(wb, `${filename}.xlsx`);
        
      } else if (format === 'PDF') {
        try {
          // Create a PDF using html2pdf - this uses the HTML approach but properly converts to PDF
          const element = document.createElement('div');
          element.innerHTML = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h1 style="color: #4285F4;">Báo cáo bãi đỗ xe</h1>
              <p>Thời gian: ${dateRange.startDate} đến ${dateRange.endDate}</p>
              
              <div style="margin-top: 30px;">
                <h2>Thống kê tổng quan</h2>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Tổng doanh thu</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(reportData.totalRevenue)}</td>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Tỷ lệ lấp đầy trung bình</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${reportData.avgOccupancy}%</td>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Giờ cao điểm</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${reportData.peakHours}</td>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Tổng số phương tiện</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${reportData.totalVehicles}</td>
                  </tr>
                </table>
              </div>
              
              <h2>Chi tiết giao dịch</h2>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Ngày</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Biển số xe</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Thời lượng</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Số tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${transactions.map(transaction => `
                    <tr>
                      <td style="border: 1px solid #ddd; padding: 8px;">${new Date(transaction.date).toLocaleDateString('vi-VN')}</td>
                      <td style="border: 1px solid #ddd; padding: 8px;">${transaction.plateNumber}</td>
                      <td style="border: 1px solid #ddd; padding: 8px;">${transaction.duration}</td>
                      <td style="border: 1px solid #ddd; padding: 8px;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(transaction.amount)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <p style="margin-top: 20px; font-style: italic; color: #666;">Báo cáo được tạo tự động từ hệ thống Smart Parking</p>
            </div>
          `;

          // Configure PDF options
          const opt = {
            margin: 10,
            filename: `${filename}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };

          // Generate PDF
          html2pdf().from(element).set(opt).save();
          
        } catch (pdfError) {
          console.error('PDF generation error:', pdfError);
          setError(`Failed to generate PDF: ${pdfError.message}`);
          throw pdfError;
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error(`Error exporting report as ${format}:`, err);
      setError(`Failed to export report as ${format}. Please try again later.`);
      setLoading(false);
    }
  };

  // Initialize charts and fetch initial data on component mount
  useEffect(() => {
    generateReport();
    
    // Cleanup function to destroy charts when component unmounts
    return () => {
      if (weeklyRevenueChartInstance.current) {
        weeklyRevenueChartInstance.current.destroy();
      }
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Add handler for sort order change
  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
    setCurrentPage(1); // Reset to first page
  };

  return (
    <>
      {/* Main Content */}
      <div className="content">
        {/* Top Bar - removing search bar and user profile */}
        <div className="top-bar">
          <h1>Báo cáo thống kê</h1>
        </div>

        <p className="page-description">Phân tích dữ liệu và tạo các báo cáo thống kê</p>
        
        {/* Auto-fetch control */}
        <AutoFetchControl />
        
        {/* Last updated indicator */}
        {lastFetchTime && (
          <div className="last-updated">
            <small>Cập nhật lần cuối: {lastFetchTime.toLocaleTimeString('vi-VN')}</small>
            {globalEnabled && <span className="fetch-indicator"></span>}
          </div>
        )}

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
              <button className="btn primary" onClick={generateReport} disabled={loading}>
                {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sync-alt"></i>} Tạo báo cáo
              </button>
              <div className="export-dropdown">
                <button className="btn secondary" disabled={loading}>
                  <i className="fas fa-download"></i> Xuất báo cáo
                </button>
                <div className="export-options">
                  <div onClick={() => !loading && exportReport('PDF')}>
                    <i className="fas fa-file-pdf"></i> Xuất PDF
                  </div>
                  <div onClick={() => !loading && exportReport('EXCEL')}>
                    <i className="fas fa-file-excel"></i> Xuất Excel
                  </div>
                  <div onClick={() => !loading && exportReport('CSV')}>
                    <i className="fas fa-file-csv"></i> Xuất CSV
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
            <button onClick={generateReport}>Thử lại</button>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && !error ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu báo cáo...</p>
          </div>
        ) : (
          <>
            {/* Report Summary */}
            <div className="dashboard-overview">
              <div className="card stat-card">
                <div className="stat-info">
                  <h3>{formatCurrency(reportData.totalRevenue)}</h3>
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

            {/* Transaction History */}
            <div className="card">
              <h2 style={{ marginBottom: '15px' }}>Lịch sử giao dịch</h2>
              
              <div className="table-controls">
                <div className="sort-control">
                  <label>Sắp xếp:</label>
                  <select value={sortOrder} onChange={handleSortOrderChange}>
                    <option value="newest">Mới nhất đến cũ nhất</option>
                    <option value="oldest">Cũ nhất đến mới nhất</option>
                  </select>
                </div>
              </div>
              
              {transactions.length > 0 ? (
                <>
                  <table>
                    <thead>
                      <tr>
                        <th>Ngày</th>
                        <th>Biển số xe</th>
                        <th>Thời lượng</th>
                        <th>Số tiền</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(transaction => (
                        <tr key={transaction.id}>
                          <td>{new Date(transaction.date).toLocaleDateString('vi-VN')}</td>
                          <td>{transaction.plateNumber}</td>
                          <td>{transaction.duration}</td>
                          <td>{formatCurrency(transaction.amount)}</td>
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
                  
                  {/* Replace custom pagination with TablePagination */}
                  <TablePagination
                    totalRecords={totalRecords}
                    currentPage={currentPage}
                    recordsPerPage={recordsPerPage}
                    onPageChange={handlePageChange}
                    onRecordsPerPageChange={handleRecordsPerPageChange}
                  />
                </>
              ) : (
                <div className="no-data-message">
                  <i className="fas fa-info-circle"></i>
                  <p>Không có dữ liệu giao dịch cho khoảng thời gian đã chọn</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Reports;