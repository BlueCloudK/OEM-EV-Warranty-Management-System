import React, { useState, useEffect } from "react";
import * as S from "./CustomerServiceCenters.styles";
import {
  FaMapMarkerAlt, FaPhone, FaClock, FaSpinner, FaStar
} from "react-icons/fa";
import apiClient from "../../api/apiClient";
import GoongMapReadOnly from "../../components/GoongMapReadOnly";

export default function CustomerServiceCenters() {
  const [serviceCenters, setServiceCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState(null);

  useEffect(() => {
    fetchServiceCenters();
  }, []);

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

      {/* Map Section */}
      <S.MapSection>
        <GoongMapReadOnly
          locations={serviceCenters}
          selectedLocation={selectedCenter}
          height="400px"
        />
      </S.MapSection>

      {serviceCenters.length === 0 ? (
        <S.EmptyState>
          <FaMapMarkerAlt size={64} />
          <p>Không tìm thấy trung tâm dịch vụ nào</p>
        </S.EmptyState>
      ) : (
        <S.CenterGrid>
          {serviceCenters.map((center) => (
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
