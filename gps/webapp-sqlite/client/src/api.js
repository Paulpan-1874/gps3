// API 服务文件，用于与后端通信

// 基础 URL - 使用相对路径指向后端服务器的 API 路径
const API_BASE_URL = '/api';

// 存储 GPS 数据
export const saveGPSData = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/gps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save GPS data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving GPS data:', error);
    throw error;
  }
};

// 获取所有 GPS 数据
export const getGPSData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/gps`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch GPS data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching GPS data:', error);
    throw error;
  }
};
