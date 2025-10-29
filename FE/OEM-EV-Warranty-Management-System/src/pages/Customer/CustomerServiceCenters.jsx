import React, { useState, useEffect } from "react";
import * as S from "./CustomerServiceCenters.styles";
import {
  FaMapMarkerAlt, FaPhone, FaClock, FaSearch, FaSpinner, FaStar
} from "react-icons/fa";
import apiClient from "../../api/apiClient";
import GoongMap from "../../components/GoongMap";

export default function CustomerServiceCenters() {
  const [serviceCenters, setServiceCenters] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCenter, setSelectedCenter] = useState(null);

  useEffect(() => {
    fetchServiceCenters();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [serviceCenters, searchTerm]);

  const fetchServiceCenters = async () => {
    try {
      setLoading(true);
      const response = await apiClient('/api/service-centers?page=0&size=100');
      if (response.content) {
        setServiceCenters(response.content);
        // Auto-select first center
        if (response.content.length > 0) {
          setSelectedCenter(response.content[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching service centers:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...serviceCenters];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(center =>
        center.serviceCenterName?.toLowerCase().includes(term) ||
        center.address?.toLowerCase().includes(term) ||
        center.phone?.includes(term)
      );
    }

    setFilteredCenters(filtered);
  };

  if (loading) {
    return (
      <S.LoadingContainer>
        <FaSpinner className="spinner" />
        <p>Đang tải dữ liệu...</p>
      </S.LoadingContainer>
    );
  }

  return (
    <S.Container>
      <S.Header>
        <h1>
          <FaMapMarkerAlt /> Trung Tâm Dịch Vụ
        </h1>
        <p>Tìm trung tâm dịch vụ gần bạn nhất</p>
      </S.Header>

      <S.SearchBar>
        <S.SearchBox>
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm theo tên, địa chỉ, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </S.SearchBox>
      </S.SearchBar>

      <S.ResultsInfo>
        Hiển thị <strong>{filteredCenters.length}</strong> / <strong>{serviceCenters.length}</strong> trung tâm
      </S.ResultsInfo>

      {/* Map Section */}
      {selectedCenter && (
        <S.MapSection>
          <S.MapHint>
            💡 Click vào trung tâm bên dưới để xem vị trí trên bản đồ
          </S.MapHint>
          <GoongMap
            latitude={parseFloat(selectedCenter.latitude)}
            longitude={parseFloat(selectedCenter.longitude)}
            height="400px"
            editable={false}
            showMarker={true}
          />
          <S.MapLabel>
            <div style={{ fontSize: "18px", fontWeight: "600", color: "#10b981" }}>
              📍 {selectedCenter.serviceCenterName}
            </div>
            <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
              {selectedCenter.address}
            </div>
          </S.MapLabel>
        </S.MapSection>
      )}

      {filteredCenters.length === 0 ? (
        <S.EmptyState>
          <FaMapMarkerAlt size={64} />
          <p>Không tìm thấy trung tâm dịch vụ nào</p>
        </S.EmptyState>
      ) : (
        <S.CenterGrid>
          {filteredCenters.map((center) => (
            <S.CenterCard
              key={center.serviceCenterId}
              $isSelected={selectedCenter?.serviceCenterId === center.serviceCenterId}
              onClick={() => setSelectedCenter(center)}
            >
              <S.CenterHeader>
                <FaMapMarkerAlt style={{ color: "#10b981", fontSize: "20px" }} />
                <h3>{center.serviceCenterName}</h3>
              </S.CenterHeader>

              <S.CenterInfo>
                <S.InfoRow>
                  <FaMapMarkerAlt style={{ color: "#10b981" }} />
                  <span>{center.address}</span>
                </S.InfoRow>

                <S.InfoRow>
                  <FaPhone style={{ color: "#10b981" }} />
                  <a href={`tel:${center.phone}`}>{center.phone}</a>
                </S.InfoRow>

                <S.InfoRow>
                  <FaClock style={{ color: "#10b981" }} />
                  <span>{center.openingHours || "8:00 - 17:00"}</span>
                </S.InfoRow>

                {center.averageRating && (
                  <S.RatingBadge>
                    <FaStar style={{ color: "#fbbf24" }} />
                    <span>{center.averageRating.toFixed(1)}</span>
                  </S.RatingBadge>
                )}
              </S.CenterInfo>

              {selectedCenter?.serviceCenterId === center.serviceCenterId && (
                <S.SelectedBadge>
                  ✓ Đang xem trên bản đồ
                </S.SelectedBadge>
              )}
            </S.CenterCard>
          ))}
        </S.CenterGrid>
      )}
    </S.Container>
  );
}
