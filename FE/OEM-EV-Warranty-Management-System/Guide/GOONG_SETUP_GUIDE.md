# Hướng dẫn cấu hình Goong.io Map

## 1. Đăng ký tài khoản Goong.io

1. Truy cập: https://account.goong.io/
2. Đăng ký tài khoản mới (hoặc đăng nhập nếu đã có)
3. Xác thực email

## 2. Lấy API Key

1. Đăng nhập vào https://account.goong.io/
2. Vào menu "API Keys" hoặc "Credentials"
3. Tạo API Key mới:
   - **Map Tiles API Key** - Dùng để hiển thị bản đồ
   - **Place API Key** (optional) - Dùng để tìm kiếm địa điểm

4. Copy API Key đã tạo

## 3. Cấu hình API Key trong project

### Cách 1: Cập nhật trực tiếp trong GoongMap.jsx

Mở file: `src/components/GoongMap.jsx`

Tìm dòng:
```javascript
const GOONG_API_KEY = apiKey || 'YOUR_GOONG_API_KEY_HERE';
const GOONG_MAPTILES_KEY = apiKey || 'YOUR_GOONG_MAPTILES_KEY_HERE';
```

Thay thế bằng API Key của bạn:
```javascript
const GOONG_API_KEY = apiKey || 'YOUR_ACTUAL_API_KEY';
const GOONG_MAPTILES_KEY = apiKey || 'YOUR_ACTUAL_MAPTILES_KEY';
```

### Cách 2: Sử dụng Environment Variables (Khuyến nghị)

1. Tạo file `.env` trong thư mục root của Frontend:
```
REACT_APP_GOONG_API_KEY=your_api_key_here
REACT_APP_GOONG_MAPTILES_KEY=your_maptiles_key_here
```

2. Cập nhật `GoongMap.jsx`:
```javascript
const GOONG_API_KEY = apiKey || process.env.REACT_APP_GOONG_API_KEY;
const GOONG_MAPTILES_KEY = apiKey || process.env.REACT_APP_GOONG_MAPTILES_KEY;
```

3. Restart development server sau khi tạo `.env`

## 4. Sử dụng GoongMap Component

### Trong AdminServiceCenters (Đã tích hợp)

Khi tạo/sửa Service Center:
1. Nhập tọa độ (latitude, longitude) vào form
2. Map sẽ tự động hiển thị vị trí
3. Click vào map hoặc kéo marker để chọn vị trí mới
4. Tọa độ sẽ tự động cập nhật

### Sử dụng trong component khác

```jsx
import GoongMap from '../components/GoongMap';

function MyComponent() {
  const [location, setLocation] = useState({
    latitude: 21.0285,
    longitude: 105.8542
  });

  return (
    <GoongMap
      latitude={location.latitude}
      longitude={location.longitude}
      height="400px"
      editable={true}
      onLocationChange={(newLocation) => {
        setLocation(newLocation);
        console.log('New location:', newLocation);
      }}
    />
  );
}
```

## 5. Props của GoongMap Component

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `latitude` | number | 21.0285 | Vĩ độ |
| `longitude` | number | 105.8542 | Kinh độ |
| `height` | string | '400px' | Chiều cao của map |
| `editable` | boolean | false | Cho phép click/drag để chọn vị trí |
| `onLocationChange` | function | null | Callback khi vị trí thay đổi |
| `apiKey` | string | null | API Key (nếu không dùng default) |

## 6. Tìm tọa độ GPS

### Cách 1: Google Maps
1. Mở https://www.google.com/maps
2. Right-click vào vị trí muốn lấy tọa độ
3. Click vào tọa độ hiển thị để copy
4. Format: `21.028511, 105.804817`
   - Số đầu: Latitude (Vĩ độ)
   - Số sau: Longitude (Kinh độ)

### Cách 2: Goong Maps
1. Mở https://map.goong.io
2. Click vào vị trí
3. Copy tọa độ hiển thị

### Tọa độ một số địa điểm ở Việt Nam:

```javascript
// Hà Nội
{ latitude: 21.0285, longitude: 105.8542 }

// TP. Hồ Chí Minh
{ latitude: 10.8231, longitude: 106.6297 }

// Đà Nẵng
{ latitude: 16.0544, longitude: 108.2022 }

// Cần Thơ
{ latitude: 10.0452, longitude: 105.7469 }

// Hải Phòng
{ latitude: 20.8449, longitude: 106.6881 }
```

## 7. Testing

### Test trong AdminServiceCenters:
1. Login với tài khoản ADMIN
2. Vào `/admin/service-centers`
3. Click "Tạo mới"
4. Nhập thông tin:
   - Tên: "Trung tâm bảo hành Hà Nội"
   - Địa chỉ: "123 Nguyễn Trãi, Thanh Xuân, Hà Nội"
   - Phone: "024-1234567"
   - Giờ mở cửa: "8:00 - 17:00"
   - Latitude: `21.0285`
   - Longitude: `105.8542`
5. Map sẽ hiển thị vị trí tại Hà Nội
6. Click hoặc kéo marker để thay đổi vị trí
7. Tọa độ sẽ tự động cập nhật

## 8. Troubleshooting

### Map không hiển thị?
- ✅ Kiểm tra API Key đã được cấu hình chưa
- ✅ Kiểm tra Console có lỗi không
- ✅ Kiểm tra network tab xem có load được Goong JS SDK không
- ✅ Kiểm tra tọa độ có hợp lệ không (-90 to 90 for lat, -180 to 180 for lng)

### Marker không di chuyển khi kéo?
- ✅ Kiểm tra prop `editable={true}`
- ✅ Kiểm tra prop `onLocationChange` đã được truyền chưa

### API Key bị lỗi?
- ✅ Kiểm tra API Key có đúng không
- ✅ Kiểm tra API Key có bị limit/expire không
- ✅ Đăng nhập lại vào https://account.goong.io/ để check

## 9. Goong.io Resources

- Documentation: https://docs.goong.io/
- Map Tiles API: https://docs.goong.io/rest/map-tiles/
- Place API: https://docs.goong.io/rest/place/
- Examples: https://docs.goong.io/example/
- Support: support@goong.io

## 10. Giới hạn Free Tier

Goong.io Free tier thường có giới hạn:
- 10,000 requests/month cho Map Tiles API
- 1,000 requests/month cho Place API

Nếu cần nhiều hơn, cần nâng cấp lên paid plan.

---

**Lưu ý:** Không commit API Key lên Git! Luôn sử dụng environment variables và thêm `.env` vào `.gitignore`.
