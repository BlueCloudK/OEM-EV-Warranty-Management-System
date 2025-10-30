import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const MapContainer = styled.div`
    width: 100%;
    height: ${props => props.$height || '400px'};
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid #e5e7eb;

    /* Ẩn tất cả markers trừ marker của center */
    .mapboxgl-marker:not([style*="pointer-events: none"]) {
        pointer-events: none !important;
        cursor: default !important;
    }
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
 * GoongMapReadOnly Component - Bản đồ chỉ đọc cho Customer và Home
 *
 * Props:
 * - latitude: Vĩ độ
 * - longitude: Kinh độ
 * - height: Chiều cao của map (default: '400px')
 * - showMarker: Hiển thị marker/pin (default: true)
 */
const GoongMapReadOnly = ({
  latitude = 21.0285,
  longitude = 105.8542,
  height = '400px',
  showMarker = true
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [error, setError] = useState(null);

  // Goong API Key
  const GOONG_MAPTILES_KEY = import.meta.env.VITE_GOONG_MAPTILES_KEY;

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
      // Cleanup marker first
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      // Then remove map
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Update map center and marker position when lat/lng changes
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: 15
      });

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

      // Ẩn tất cả markers mặc định
      map.on('load', () => {
          const style = document.createElement('style');
          style.textContent = `
            .mapboxgl-canvas-container.mapboxgl-interactive {
            cursor: grab !important;
            }
          `;
          document.head.appendChild(style);
      });

      // Suppress styleimagemissing errors
      map.on('styleimagemissing', (e) => {
        console.warn('Missing map image:', e.id);
      });

        // Add static marker (not draggable) - CHỈ KHI showMarker = true
        let marker = null;
        if (showMarker) {
            marker = new window.goongjs.Marker({
                draggable: false,
                scale: 1
            })
                .setLngLat([longitude, latitude])
                .addTo(map);
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
      </MapPlaceholder>
    );
  }

  return <MapContainer ref={mapContainerRef} $height={height} />;
};

export default GoongMapReadOnly;
