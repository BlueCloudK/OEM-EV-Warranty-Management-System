import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const MapContainer = styled.div`
  width: 100%;
  height: ${props => props.$height || '400px'};
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
`;

const MapPlaceholder = styled.div`
  width: 100%;
  height: ${props => props.$height || '400px'};
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 14px;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
`;

/**
 * GoongMap Component - Tích hợp Goong.io Map
 *
 * Props:
 * - latitude: Vĩ độ
 * - longitude: Kinh độ
 * - height: Chiều cao của map (default: '400px')
 * - onLocationChange: Callback khi click vào map để chọn location
 * - editable: Cho phép click để chọn vị trí mới
 * - showMarker: Hiển thị marker/pin (default: true)
 * - markerScale: Kích thước marker (default: 1, 2 = gấp đôi)
 * - apiKey: Goong API Key (nếu không truyền sẽ dùng key mặc định)
 */
const GoongMap = ({
  latitude = 10.76,
  longitude = 106.66,
  height = '400px',
  onLocationChange = null,
  editable = false,
  showMarker = true,
  markerScale = 1,
  apiKey = null
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [error, setError] = useState(null);

  // Goong API Key - Lấy từ environment variables (Vite)
  const GOONG_API_KEY = apiKey || import.meta.env.VITE_GOONG_API_KEY;
  const GOONG_MAPTILES_KEY = apiKey || import.meta.env.VITE_GOONG_MAPTILES_KEY;

  // Debug: Check if env variables are loaded
  console.log('🗺️ Goong Map Debug:');
  console.log('- VITE_GOONG_MAPTILES_KEY:', GOONG_MAPTILES_KEY ? '✅ Loaded' : '❌ Not found');
  console.log('- VITE_GOONG_API_KEY:', GOONG_API_KEY ? '✅ Loaded' : '❌ Not found');

  useEffect(() => {
    // Load Goong JS SDK
    if (!window.goongjs) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js';
      script.async = true;
      script.onload = () => {
        const link = document.createElement('link');
        link.href = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        initMap();
      };
      script.onerror = () => {
        setError('Không thể tải Goong Map SDK');
      };
      document.body.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    // Update map center and marker position when lat/lng changes
    if (mapRef.current) {
      // Always pan the map to new coordinates
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: 15
      });

      // Update marker position if it exists
      if (markerRef.current) {
        markerRef.current.setLngLat([longitude, latitude]);
      }
    }
  }, [latitude, longitude]);

  const initMap = () => {
    if (!window.goongjs || !mapContainerRef.current) return;

    try {
      window.goongjs.accessToken = GOONG_MAPTILES_KEY;

      const map = new window.goongjs.Map({
        container: mapContainerRef.current,
        style: 'https://tiles.goong.io/assets/goong_map_web.json',
        center: [longitude, latitude],
        zoom: 15
      });

      // Add marker (only if showMarker is true)
      let marker = null;
      if (showMarker) {
        marker = new window.goongjs.Marker({
          draggable: editable,
          scale: markerScale
        })
          .setLngLat([longitude, latitude])
          .addTo(map);

        // Handle marker drag end
        if (editable) {
          marker.on('dragend', () => {
            const lngLat = marker.getLngLat();
            if (onLocationChange) {
              onLocationChange({
                latitude: lngLat.lat,
                longitude: lngLat.lng
              });
            }
          });

          // Handle map click
          map.on('click', (e) => {
            const { lng, lat } = e.lngLat;
            marker.setLngLat([lng, lat]);
            if (onLocationChange) {
              onLocationChange({
                latitude: lat,
                longitude: lng
              });
            }
          });
        }
      }

      mapRef.current = map;
      markerRef.current = marker;
    } catch (err) {
      console.error('Error initializing Goong Map:', err);
      setError('Lỗi khởi tạo bản đồ: ' + err.message);
    }
  };

  if (error) {
    return (
      <MapPlaceholder $height={height}>
        ❌ {error}
      </MapPlaceholder>
    );
  }

  if (!GOONG_MAPTILES_KEY) {
    return (
      <MapPlaceholder $height={height}>
        ⚠️ Chưa cấu hình Goong API Key
        <br />
        <small style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
          Vui lòng tạo file .env và thêm REACT_APP_GOONG_MAPTILES_KEY
        </small>
        <small style={{ fontSize: '11px', marginTop: '4px', display: 'block', color: '#9ca3af' }}>
          Xem hướng dẫn trong file GOONG_SETUP_GUIDE.md
        </small>
      </MapPlaceholder>
    );
  }

  return <MapContainer ref={mapContainerRef} $height={height} />;
};

export default GoongMap;
