import React from 'react';
import { useAutoFetchSettings } from '../context/AutoFetchContext';
import './styles/AutoFetchControl.css';

/**
 * Component for controlling auto-fetch settings
 */
const AutoFetchControl = () => {
  const { interval, updateInterval, globalEnabled, toggleGlobalEnabled } = useAutoFetchSettings();

  const handleIntervalChange = (e) => {
    const newInterval = parseInt(e.target.value, 10);
    updateInterval(newInterval);
  };

  return (
    <div className="auto-fetch-control">
      <div className="auto-fetch-toggle">
        <label className="toggle-switch">
          <input 
            type="checkbox" 
            checked={globalEnabled} 
            onChange={toggleGlobalEnabled}
          />
          <span className="toggle-slider"></span>
        </label>
        <span>Tự động cập nhật dữ liệu</span>
      </div>
      
      {globalEnabled && (
        <div className="interval-control">
          <label>Tần suất cập nhật:</label>
          <select value={interval} onChange={handleIntervalChange}>
            <option value={5000}>5 giây</option>
            <option value={10000}>10 giây</option>
            <option value={30000}>30 giây</option>
            <option value={60000}>1 phút</option>
            <option value={300000}>5 phút</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default AutoFetchControl; 