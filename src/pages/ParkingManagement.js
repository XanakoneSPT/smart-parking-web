import React, { useState, useEffect } from 'react';
import './styles/style-parking.css';
import Footer from '../components/Footer';
import { apiService } from '../services/api';
import { API_URL } from '../services/api';

function ParkingManagement() {
  // STATE MANAGEMENT
  // -----------------
  
  // Parking spots state
  const [parkingSpots, setParkingSpots] = useState([
    { id: 'A1', status: 'available' },
    { id: 'A2', status: 'occupied' },
    { id: 'A3', status: 'occupied' },
    { id: 'A4', status: 'available' },
    { id: 'B1', status: 'occupied' },
    { id: 'B2', status: 'available' },
    { id: 'B3', status: 'occupied' },
    { id: 'B4', status: 'available' },
    { id: 'C1', status: 'available' },
    { id: 'C2', status: 'available' },
    { id: 'C3', status: 'occupied' },
    { id: 'C4', status: 'available' }
  ]);
  
  // License plate records state
  const [plateRecords, setPlateRecords] = useState([
    { id: 1, time: '14:35', plateNumber: '29A-12345', status: 'check-in', spot: 'A3' },
    { id: 2, time: '14:22', plateNumber: '30B-67890', status: 'check-out', spot: 'B1' },
    { id: 3, time: '13:57', plateNumber: '33C-45678', status: 'check-in', spot: 'C3' },
    { id: 4, time: '13:30', plateNumber: '29B-98765', status: 'check-in', spot: 'B3' },
    { id: 5, time: '13:15', plateNumber: '30A-56789', status: 'check-out', spot: 'A2' }
  ]);
  
  // UI related states
  const [activeCamera, setActiveCamera] = useState('occupancy');
  
  // Alerts state
  const [alerts, setAlerts] = useState([
    { id: 1, time: '14:30', message: 'Unauthorized vehicle detected at Zone B', type: 'warning' },
    { id: 2, time: '13:22', message: 'Camera 2 connection lost', type: 'error' },
    { id: 3, time: '12:45', message: 'Zone A approaching capacity (85%)', type: 'info' }
  ]);
  
  // Parking rules state
  const [parkingRules, setParkingRules] = useState([
    { id: 1, zone: 'A', maximumHours: 3, hourlyRate: 5, status: 'active' },
    { id: 2, zone: 'B', maximumHours: 8, hourlyRate: 3, status: 'active' },
    { id: 3, zone: 'C', maximumHours: 24, hourlyRate: 2, status: 'active' }
  ]);
  
  // Form states
  const [manualEntry, setManualEntry] = useState({
    plateNumber: '',
    vehicleType: 'car',
    spotId: ''
  });
  
  // DATA FETCHING
  // ---------------
  
  // Fetch plate records
  // useEffect(() => {
  //   const fetchPlateRecords = async () => {
  //     try {
  //       const response = await apiService.get('plate-records/');
  //       setPlateRecords(response.data);
  //     } catch (error) {
  //       console.error('Error fetching plate records:', error);
  //     }
  //   };
    
  //   fetchPlateRecords();
  // }, []);
  
  // Simulate camera feed refresh
  useEffect(() => {
    const timer = setInterval(() => {
      // Visual indicator that the camera feed is "live"
      const cameraFeed = document.getElementById('camera-feed');
      if (cameraFeed) {
        cameraFeed.classList.add('refreshing');
        setTimeout(() => {
          cameraFeed.classList.remove('refreshing');
        }, 300);
      }
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);
  
  // EVENT HANDLERS
  // ---------------
  
  // Handle form input changes
  const handleEntryChange = (e) => {
    const { name, value } = e.target;
    setManualEntry(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    
    try {
      await apiService.post('parking/entry/', manualEntry);
      
      // Refetch the data to get the updated state
      const parkingResponse = await apiService.get('parking/');
      setParkingSpots(parkingResponse.data);
      
      const recordsResponse = await apiService.get('plate-records/');
      setPlateRecords(recordsResponse.data);
      
      // Reset form
      setManualEntry({
        plateNumber: '',
        vehicleType: 'car',
        spotId: ''
      });
    } catch (error) {
      console.error('Error submitting entry:', error);
    }
  };
  
  // Handle parking spot status change
  const handleSpotClick = async (spotId) => {
    try {
      await apiService.put(`parking/${spotId}/toggle/`);
      
      // Refetch parking spots
      const response = await apiService.get('parking/');
      setParkingSpots(response.data);
    } catch (error) {
      console.error('Error toggling spot status:', error);
    }
  };
  
  // Handle camera view change
  const handleCameraChange = (camera) => {
    setActiveCamera(camera);
  };
  
  // Handle adding a new parking rule
  const handleAddRule = () => {
    const newRule = {
      id: parkingRules.length + 1,
      zone: '',
      maximumHours: 2,
      hourlyRate: 1,
      status: 'inactive'
    };
    setParkingRules([...parkingRules, newRule]);
  };
  
  // Handle toggling rule status
  const toggleRuleStatus = (id) => {
    const updatedRules = parkingRules.map(rule => {
      if (rule.id === id) {
        return {
          ...rule,
          status: rule.status === 'active' ? 'inactive' : 'active'
        };
      }
      return rule;
    });
    setParkingRules(updatedRules);
  };

  // RENDER
  // -------
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

      <h1>Quản lý bãi đỗ xe</h1>
      <p style={{ marginBottom: '20px', color: 'var(--gray)' }}>Giám sát và quản lý hệ thống bãi đỗ xe thông minh</p>
      
      {/* Camera and Parking Map Section */}
      <div className="camera-parking-container">
        {/* Camera Feeds */}
        <div className="card camera-section">
          <div className="camera-controls">
            <h2>Camera trực tiếp</h2>
            <div className="camera-selector">
              <button 
                className={activeCamera === 'occupancy' ? 'active' : ''} 
                onClick={() => handleCameraChange('occupancy')}
              >
                Camera phát hiện chỗ trống
              </button>
              <button 
                className={activeCamera === 'plate' ? 'active' : ''} 
                onClick={() => handleCameraChange('plate')}
              >
                Camera nhận diện biển số
              </button>
            </div>
          </div>
          
          <div id="camera-feed" className="camera-feed">
            {activeCamera === 'occupancy' ? (
              <div className="camera-feed-content occupancy-camera">
                <div className="camera-overlay">
                  {/* {parkingSpots.map(spot => (
                    <div 
                      key={spot.id}
                      className={`overlay-spot ${spot.status}`}
                      style={{
                        left: `${(parseInt(spot.id.charAt(1)) - 1) * 25 + 5}%`,
                        top: spot.id.charAt(0) === 'A' ? '20%' : 
                              spot.id.charAt(0) === 'B' ? '50%' : '80%'
                      }}
                      onClick={() => handleSpotClick(spot.id)}
                    >
                      {spot.id}
                    </div>
                  ))} */}
                </div>
                <img src={`${API_URL}video_feed`} alt="Occupancy Camera Feed" />
                <div className="camera-info">
                  <span className="camera-label">Camera phát hiện chỗ trống</span>
                  <span className="camera-status">Trực tiếp</span>
                </div>
              </div>
            ) : (
              <div className="camera-feed-content plate-camera">
                <div className="plate-recognition-box">
                  <div className="plate-overlay">
                    <div className="detected-plate">29A-12345</div>
                  </div>
                </div>
                <img src={`${API_URL}lp_detection_feed`} alt="License Plate Camera Feed" />
                <div className="camera-info">
                  <span className="camera-label">Camera nhận diện biển số</span>
                  <span className="camera-status">Trực tiếp</span>
                </div>
              </div>
            )}
          </div> 
        </div>
      </div>

      {/* License Plate Recognition and Manual Entry Section */}
      <div className="tables-container">
        {/* License Plate Recognition Records */}
        {/* <div className="card">
          <h2>Nhận diện biển số xe</h2>
          <div className="plate-records">
            <table>
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Biển số</th>
                  <th>Trạng thái</th>
                  <th>Vị trí</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {plateRecords.map(record => (
                  <tr key={record.id}>
                    <td>{record.time}</td>
                    <td>{record.plateNumber}</td>
                    <td>
                      <span className={`status ${record.status === 'check-in' ? 'available' : 'occupied'}`}>
                        {record.status === 'check-in' ? 'Vào' : 'Ra'}
                      </span>
                    </td>
                    <td>{record.spot}</td>
                    <td>
                      <button className="action-button">
                        <i className="fas fa-info-circle"></i>
                      </button>
                      <button className="action-button">
                        <i className="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div> */}

        {/* Manual Entry Form */}
        <div className="card">
          <h2>Nhập thủ công</h2>
          <form className="manual-entry-form" onSubmit={handleEntrySubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="plateNumber">Biển số xe:</label>
                <input 
                  type="text" 
                  id="plateNumber" 
                  name="plateNumber" 
                  placeholder="Ví dụ: 29A-12345"
                  value={manualEntry.plateNumber}
                  onChange={handleEntryChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="vehicleType">Loại xe:</label>
                <select 
                  id="vehicleType" 
                  name="vehicleType"
                  value={manualEntry.vehicleType}
                  onChange={handleEntryChange}
                >
                  <option value="car">Xe ô tô</option>
                  <option value="motorcycle">Xe máy</option>
                  <option value="bikecycle">Xe đạp</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="spotId">Vị trí đỗ:</label>
                <select 
                  id="spotId" 
                  name="spotId"
                  value={manualEntry.spotId}
                  onChange={handleEntryChange}
                  required
                >
                  <option value="">-- Chọn vị trí --</option>
                  {parkingSpots
                    .filter(spot => spot.status === 'available')
                    .map(spot => (
                      <option key={spot.id} value={spot.id}>{spot.id}</option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <button type="submit" className="submit-button">
                  <i className="fas fa-plus"></i> Thêm xe
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Alerts Section */}
      {/* <div className="tables-container">
        <div className="card">
          <div className="card-header">
            <h2>Cảnh báo và thông báo</h2>
            <button className="refresh-button">
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>
          <div className="alerts-container">
            {alerts.map(alert => (
              <div key={alert.id} className={`alert-item ${alert.type}`}>
                <div className="alert-icon">
                  {alert.type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
                  {alert.type === 'error' && <i className="fas fa-times-circle"></i>}
                  {alert.type === 'info' && <i className="fas fa-info-circle"></i>}
                </div>
                <div className="alert-content">
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-time">{alert.time}</div>
                </div>
                <button className="alert-dismiss">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      <Footer />
    </div>
  );
}

export default ParkingManagement;