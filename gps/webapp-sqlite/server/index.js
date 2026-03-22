const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// POST 接口，接收经纬度、海拔和电压数据
app.post('/api/gps', async (req, res) => {
  try {
    const { longitude, latitude, altitude, vbat } = req.body;
    
    // 处理字符串 "null" 为 null 值
    const processValue = (value) => {
      return value === "null" ? null : value;
    };

    const processedLongitude = processValue(longitude);
    const processedLatitude = processValue(latitude);
    const processedAltitude = processValue(altitude);
    const processedVbat = processValue(vbat);
    
    // 验证数据
    if ((processedLongitude !== null && typeof processedLongitude !== 'string') || 
        (processedLatitude !== null && typeof processedLatitude !== 'string') || 
        (processedAltitude !== null && typeof processedAltitude !== 'string') || 
        (processedVbat !== null && typeof processedVbat !== 'number')) {
      return res.status(400).json({ 
        error: 'Invalid data format',
        details: {
          longitude: typeof processedLongitude,
          latitude: typeof processedLatitude,
          altitude: typeof processedAltitude,
          vbat: typeof processedVbat
        }
      });
    }
    
    // 存储数据到数据库
    const gpsData = await prisma.gPSData.create({
      data: {
        longitude: processedLongitude,
        latitude: processedLatitude,
        altitude: processedAltitude,
        vbat: processedVbat
      }
    });
    
    res.status(201).json(gpsData);
  } catch (error) {
    console.error('Error storing GPS data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET 接口，获取所有 GPS 数据（按时间递减排序）
app.get('/api/gps', async (req, res) => {
  try {
    const gpsData = await prisma.gPSData.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(gpsData);
  } catch (error) {
    console.error('Error fetching GPS data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
