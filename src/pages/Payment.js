import React, { useState, useEffect, useRef, useMemo } from 'react';
import Footer from '../components/Footer';
import './styles/style-payment.css';
import { API_URL, apiService } from '../services/api';
import TablePagination from '../components/TablePagination';
import Chart from 'chart.js/auto';

function Payment() {
  // State for top-up history
  const [topUpHistory, setTopUpHistory] = useState([]);
  const [loadingTopUp, setLoadingTopUp] = useState(true);
  const [errorTopUp, setErrorTopUp] = useState(null);

  // State for recent transactions
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [errorTransactions, setErrorTransactions] = useState(null);

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

  // Fetch top-up history from API
  const fetchTopUpHistory = async () => {
    setLoadingTopUp(true);
    setErrorTopUp(null);
    
    try {
      const response = await apiService.get('api_users/lichsunaptien/');
      
      let records = [];
      let totalCount = 0;
      
      if (Array.isArray(response.data)) {
        const allRecords = response.data;
        totalCount = allRecords.length;
        records = allRecords;
      } else if (response.data.records) {
        records = response.data.records;
        totalCount = response.data.totalRecords || response.data.records.length;
      } else {
        records = response.data;
        totalCount = response.data.length;
      }
      
      setTopUpHistory(records);
      setLoadingTopUp(false);
    } catch (err) {
      console.error('Error fetching top-up history:', err);
      setErrorTopUp(err.message || 'An error occurred while loading top-up history');
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
      setLoadingTransactions(false);
    } catch (err) {
      console.error('Error fetching recent transactions:', err);
      setErrorTransactions(err.message || 'An error occurred while loading recent transactions');
      setLoadingTransactions(false);
    }
  };

  // Fetch data initially and when filters change
  useEffect(() => {
    fetchTopUpHistory();
    fetchRecentTransactions();
  }, [dateFilter, statusFilter, methodFilter]);

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

  // Initialize charts
  useEffect(() => {
    if (!loadingTopUp && !errorTopUp) {
      // Destroy existing charts if they exist
      if (revenueChartRef.current) {
        revenueChartRef.current.destroy();
      }

      // Revenue Chart
      const revenueCtx = document.getElementById('revenueChart');
      if (revenueCtx) {
        revenueChartRef.current = new Chart(revenueCtx, {
          type: 'line',
          data: {
            labels: revenueData.dates,
            datasets: [{
              label: 'Doanh thu theo ngày',
              data: revenueData.revenues,
              borderColor: '#4CAF50',
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
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
                    return context.parsed.y.toLocaleString('vi-VN') + ' đ';
                  }
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (revenueChartRef.current) {
        revenueChartRef.current.destroy();
      }
    };
  }, [loadingTopUp, errorTopUp, revenueData]);

  return (
    <div className="content">
      {/* Your existing JSX without the last-updated section */}
    </div>
  );
}

export default Payment;