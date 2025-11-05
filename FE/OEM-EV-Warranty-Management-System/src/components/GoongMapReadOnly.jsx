import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const MapContainer = styled.div`
    width: 100%;
    height: ${props => props.$height || '400px'};
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid #e5e7eb;

    .goong-popup-content {
        padding: 10px;
        font-family: Arial, sans-serif;
    }
    .goong-popup-close-button {
        padding: 5px;
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
 * - latitude: Vĩ độ (cho marker đơn)
 * - longitude: Kinh độ (cho marker đơn)
 * - locations: Mảng các địa điểm để hiển thị nhiều marker [{latitude, longitude, serviceCenterName, address}]
 * - selectedLocation: Địa điểm được chọn để zoom tới và highlight
 * - height: Chiều cao của map (default: '400px')
 * - showMarker: Hiển thị marker/pin (default: true)
 */
const GoongMapReadOnly = ({
  latitude = 21.0285,
  longitude = 105.8542,
  locations = [],
  selectedLocation = null, // New prop
  height = '400px',
  showMarker = true
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
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
      // Cleanup markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      // Then remove map
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [locations]); // Re-initialize map when locations change

  useEffect(() => {
    if (mapRef.current && selectedLocation) {
      mapRef.current.flyTo({
        center: [selectedLocation.longitude, selectedLocation.latitude],
        zoom: 15
      });
      // Optionally, you can highlight the selected marker here if needed
      // This would require storing more info about markers in markersRef
    }
  }, [selectedLocation]); // Watch for selectedLocation changes

  const initMap = () => {
    if (!window.goongjs || !mapContainerRef.current) return;

    try {
      window.goongjs.accessToken = GOONG_MAPTILES_KEY;

      const initialCenter = locations.length > 0
        ? [locations[0].longitude, locations[0].latitude]
        : [longitude, latitude];

      const map = new window.goongjs.Map({
        container: mapContainerRef.current,
        style: 'https://tiles.goong.io/assets/goong_map_web.json',
        center: initialCenter,
        zoom: locations.length > 0 ? 10 : 15
      });

      map.on('webglcontextlost', (e) => {
        console.error("WebGL context lost.", e);
        setError('Bản đồ đã bị lỗi. Đang thử tải lại...');
        e.preventDefault();
        setTimeout(initMap, 1000);
      });

      map.on('webglcontextrestored', (e) => {
        console.log("WebGL context restored.", e);
        initMap();
      });

      map.on('styleimagemissing', (e) => {
        const id = e.id;
        // Create a dummy image to prevent errors
        const width = 1;
        const height = 1;
        const data = new Uint8Array(width * height * 4);
        map.addImage(id, { width, height, data });
      });

      if (locations.length > 0) {
        const bounds = new window.goongjs.LngLatBounds();
        
        locations.forEach(location => {
          const popup = new window.goongjs.Popup({ offset: 25 }).setHTML(
            `<h3>${location.serviceCenterName}</h3><p>${location.address}</p>`
          );

          const marker = new window.goongjs.Marker()
            .setLngLat([location.longitude, location.latitude])
            .setPopup(popup)
            .addTo(map);
            
          markersRef.current.push(marker);
          bounds.extend([location.longitude, location.latitude]);
        });

        if (locations.length > 1) {
            map.fitBounds(bounds, { padding: 50 });
        }

      } else if (showMarker) {
        const marker = new window.goongjs.Marker({
          draggable: false,
          scale: 1
        })
          .setLngLat([longitude, latitude])
          .addTo(map);
        markersRef.current.push(marker);
      }

      mapRef.current = map;
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
