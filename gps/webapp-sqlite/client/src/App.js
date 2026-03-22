import React, { useState, useEffect } from 'react';
import { saveGPSData, getGPSData } from './api';
import './App.css';

function App() {
  // 状态管理
  const [gpsData, setGpsData] = useState([]);
  const [formData, setFormData] = useState({
    longitude: '',
    latitude: '',
    altitude: '',
    vbat: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // 加载数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getGPSData();
        setGpsData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load GPS data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证表单数据
    if (!formData.longitude || !formData.latitude || !formData.altitude || !formData.vbat) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 转换数据类型
      const dataToSend = {
        longitude: parseFloat(formData.longitude),
        latitude: parseFloat(formData.latitude),
        altitude: parseFloat(formData.altitude),
        vbat: parseFloat(formData.vbat)
      };

      // 发送数据到后端
      await saveGPSData(dataToSend);
      
      // 重新加载数据
      const updatedData = await getGPSData();
      setGpsData(updatedData);
      
      // 重置表单
      setFormData({
        longitude: '',
        latitude: '',
        altitude: '',
        vbat: ''
      });
      
      setSuccess('GPS data saved successfully');
      
      // 3秒后清除成功消息
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError('Failed to save GPS data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 格式化时间
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="app-container">
      <h1>GPS Data Tracker</h1>

      {/* 成功消息 */}
      {success && <div className="error" style={{ backgroundColor: '#d4edda', color: '#155724' }}>{success}</div>}
      
      {/* 错误消息 */}
      {error && <div className="error">{error}</div>}

      {/* 表单 */}
      <div className="form-container">
        <h2>Add New GPS Data</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="longitude">Longitude</label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              step="0.0001"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="latitude">Latitude</label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              step="0.0001"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="altitude">Altitude</label>
            <input
              type="number"
              id="altitude"
              name="altitude"
              value={formData.altitude}
              onChange={handleInputChange}
              step="0.1"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="vbat">VBat</label>
            <input
              type="number"
              id="vbat"
              name="vbat"
              value={formData.vbat}
              onChange={handleInputChange}
              step="0.1"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save GPS Data'}
          </button>
        </form>
      </div>

      {/* 数据列表 */}
      <div className="data-list">
        <h2>GPS Data Records</h2>
        {loading ? (
          <div className="loading">Loading data...</div>
        ) : gpsData.length === 0 ? (
          <div className="loading">No GPS data found</div>
        ) : (
          gpsData.map((data) => (
            <div key={data.id} className="data-item">
              <h3>Record #{data.id}</h3>
              <p>Longitude: {data.longitude}</p>
              <p>Latitude: {data.latitude}</p>
              <p>Altitude: {data.altitude}</p>
              <p>VBat: {data.vbat}</p>
              <p className="timestamp">Recorded at: {formatDate(data.createdAt)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
