import React, { useState, useEffect } from "react";
import { useWarrantyClaimsManagement } from "../../hooks/useWarrantyClaimsManagement";
import useAutoRefresh from "../../hooks/useAutoRefresh";
import PaidWarrantyClaimForm from "../../components/PaidWarrantyClaimForm";
import * as S from "./WarrantyClaimsManagement.styles";
import {
  FaClipboardList,
  FaPlus,
  FaEdit,
  FaSpinner,
  FaEye,
  FaCheck,
  FaTrash,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import styled from "styled-components";

// Function to convert status to Vietnamese
const getStatusLabel = (status) => {
  const statusMap = {
    SUBMITTED: "Chờ duyệt",
    PENDING_PAYMENT: "Chờ thanh toán",
    PAYMENT_CONFIRMED: "Đã xác nhận thanh toán",
    MANAGER_REVIEW: "Đã duyệt",
    PROCESSING: "Đang xử lý",
    COMPLETED: "Hoàn thành",
    REJECTED: "Từ chối",
  };
  return statusMap[status] || status;
};

// Modal wrapper for the PaidWarrantyClaimForm
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
`;

const ModalWrapper = styled.div`
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.3s;
  color: #666;

  &:hover {
    background: white;
    color: #333;
    transform: scale(1.1);
  }
`;

// Claim Detail Modal
const ClaimDetailModal = ({ isOpen, onClose, claim }) => {
  if (!isOpen || !claim) return null;

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <h2>Chi tiết Yêu cầu Bảo hành #{claim.warrantyClaimId}</h2>
        <div style={{ marginTop: "20px" }}>
          <p>
            <strong>Trạng thái:</strong> {getStatusLabel(claim.status)}
          </p>
          <p>
            <strong>Ngày tạo:</strong>{" "}
            {new Date(claim.claimDate).toLocaleDateString("vi-VN")}
          </p>
          <p>
            <strong>Khách hàng:</strong> {claim.customerName || "N/A"}
          </p>
          <p>
            <strong>Xe (VIN):</strong> {claim.vehicleVin || "N/A"}
          </p>
          <p>
            <strong>Linh kiện:</strong> {claim.partName || "N/A"}
          </p>
          <p>
            <strong>Loại bảo hành:</strong>{" "}
            {claim.isPaidWarranty ? "Tính phí" : "Miễn phí"}
          </p>
          {claim.isPaidWarranty && claim.warrantyFee && (
            <p>
              <strong>Phí:</strong>{" "}
              {parseFloat(claim.warrantyFee).toLocaleString("vi-VN")} VNĐ
            </p>
          )}
          <p>
            <strong>Mô tả:</strong> {claim.description || "N/A"}
          </p>
          {claim.rejectionReason && (
            <p style={{ color: "#f44336" }}>
              <strong>Lý do từ chối:</strong> {claim.rejectionReason}
            </p>
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <S.Button onClick={onClose}>Đóng</S.Button>
        </div>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

// Edit Claim Modal
const EditClaimModal = ({ isOpen, onClose, claim, onUpdate }) => {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (claim) {
      setDescription(claim.description || "");
    }
  }, [claim]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description || description.trim().length < 10) {
      setError("Mô tả phải có ít nhất 10 ký tự");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:8080/api/warranty-claims/${claim.warrantyClaimId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vehicleId: claim.vehicleId,
            installedPartId: claim.installedPartId,
            description: description.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Không thể cập nhật yêu cầu bảo hành"
        );
      }

      alert("Đã cập nhật yêu cầu bảo hành thành công!");
      onUpdate();
      onClose();
    } catch (err) {
      console.error("Error updating claim:", err);
      setError(err.message || "Có lỗi xảy ra khi cập nhật yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !claim) return null;

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <h2>Chỉnh sửa Yêu cầu Bảo hành #{claim.warrantyClaimId}</h2>
        {error && (
          <div
            style={{
              color: "#f44336",
              marginTop: "10px",
              padding: "10px",
              background: "#ffebee",
              borderRadius: "4px",
            }}
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <S.FormGroup style={{ marginTop: "20px" }}>
            <S.Label>Khách hàng</S.Label>
            <S.Input type="text" value={claim.customerName || "N/A"} disabled />
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Xe (VIN)</S.Label>
            <S.Input type="text" value={claim.vehicleVin || "N/A"} disabled />
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Linh kiện</S.Label>
            <S.Input type="text" value={claim.partName || "N/A"} disabled />
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Mô tả lỗi *</S.Label>
            <S.TextArea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết về vấn đề cần bảo hành (tối thiểu 10 ký tự)"
              required
            />
          </S.FormGroup>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "20px",
            }}
          >
            <S.Button type="button" onClick={onClose} disabled={loading}>
              Hủy
            </S.Button>
            <S.Button primary type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </S.Button>
          </div>
        </form>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

// Simplified vehicle selection modal for new claims
const VehicleSelectionModal = ({
  isOpen,
  onClose,
  vehicles,
  installedParts,
  onSelect,
  fetchInstalledPartsForVehicle,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedInstalledPartId, setSelectedInstalledPartId] = useState("");
  const [partSearchTerm, setPartSearchTerm] = useState("");
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState("");

  // Filter parts based on search term
  const filteredParts = installedParts.filter(p =>
    p.partName.toLowerCase().includes(partSearchTerm.toLowerCase())
  );

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(v =>
    v.vehicleName.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) ||
    v.vehicleVin.toLowerCase().includes(vehicleSearchTerm.toLowerCase())
  );

  const handleVehicleSelect = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    setSelectedInstalledPartId("");
    if (vehicleId) {
      fetchInstalledPartsForVehicle(vehicleId);
    }
  };

  const handleNext = () => {
    if (selectedVehicleId && selectedInstalledPartId) {
      // Pass both IDs at once to avoid async state update issues
      onSelect(selectedVehicleId, selectedInstalledPartId);
      // Don't call onClose() here - let parent handle closing modal
      // to avoid resetting selectedVehicleId/selectedInstalledPartId to null
    } else {
      alert("Vui lòng chọn xe và linh kiện");
    }
  };

  if (!isOpen) return null;

  return (
    <S.ModalOverlay>
      <S.ModalContent>
        <h2>Chọn Xe và Linh Kiện</h2>
        <S.FormGroup>
          <S.Label>Xe *</S.Label>
          <S.Input
            type="text"
            placeholder="Tìm kiếm xe (nhập tên hoặc VIN...)"
            value={vehicleSearchTerm}
            onChange={(e) => setVehicleSearchTerm(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
          <div
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white',
              padding: '4px',
              marginBottom: '10px'
            }}
          >
            {filteredVehicles.length === 0 ? (
              <div style={{ padding: '12px', color: '#6b7280', textAlign: 'center' }}>
                Không tìm thấy xe nào phù hợp
              </div>
            ) : (
              filteredVehicles.map((v) => {
                const isSelected = selectedVehicleId === String(v.vehicleId);
                return (
                  <div
                    key={v.vehicleId}
                    onClick={() => handleVehicleSelect(String(v.vehicleId))}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f3f4f6',
                      background: isSelected ? '#eff6ff' : 'white',
                      borderLeft: isSelected ? '4px solid #3b82f6' : '4px solid transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: '600', color: '#1f2937' }}>
                      {v.vehicleName}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      VIN: {v.vehicleVin}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </S.FormGroup>
        <S.FormGroup>
          <S.Label>Linh kiện đã lắp đặt *</S.Label>
          <S.Input
            type="text"
            placeholder="Tìm kiếm linh kiện (nhập tên linh kiện...)"
            value={partSearchTerm}
            onChange={(e) => setPartSearchTerm(e.target.value)}
            disabled={!selectedVehicleId}
            style={{ marginBottom: '10px' }}
          />
          <div
            style={{
              maxHeight: '300px',
              overflowY: 'auto',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: selectedVehicleId ? 'white' : '#f3f4f6',
              padding: '4px'
            }}
          >
            {!selectedVehicleId ? (
              <div style={{ padding: '12px', color: '#6b7280', textAlign: 'center' }}>
                Vui lòng chọn xe trước
              </div>
            ) : filteredParts.length === 0 ? (
              <div style={{ padding: '12px', color: '#6b7280', textAlign: 'center' }}>
                Không tìm thấy linh kiện nào phù hợp
              </div>
            ) : (
              filteredParts.map((p) => {
                const installDate = new Date(p.installationDate).toLocaleDateString("vi-VN");
                const expiryDate = new Date(p.warrantyExpirationDate).toLocaleDateString("vi-VN");
                const today = new Date();
                const expiry = new Date(p.warrantyExpirationDate);
                const isExpired = today > expiry;
                const daysRemaining = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
                const isSelected = selectedInstalledPartId === String(p.installedPartId);

                return (
                  <div
                    key={p.installedPartId}
                    onClick={() => setSelectedInstalledPartId(String(p.installedPartId))}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f3f4f6',
                      background: isSelected ? '#eff6ff' : 'white',
                      borderLeft: isSelected ? '4px solid #3b82f6' : '4px solid transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                      {p.partName}
                    </div>
                    <div style={{ fontSize: '13px', color: '#4b5563', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <span>📅 Lắp: {installDate}</span>
                      <span>🛡️ BH đến: {expiryDate}</span>
                      <span style={{
                        color: isExpired ? '#ef4444' : '#10b981',
                        fontWeight: '500'
                      }}>
                        {isExpired
                          ? `(HẾT HẠN ${Math.abs(daysRemaining)} ngày)`
                          : `(Còn ${daysRemaining} ngày)`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </S.FormGroup>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <S.Button type="button" onClick={onClose}>
            Hủy
          </S.Button>
          <S.Button primary type="button" onClick={handleNext}>
            Tiếp tục
          </S.Button>
        </div>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

// Main Page Component
const WarrantyClaimsManagement = () => {
  const {
    claims,
    vehicles,
    installedParts,
    loading,
    error,
    pagination,
    filterStatus,
    prefilledVehicle,
    handleFilterChange,
    handlePageChange,
    fetchInstalledPartsForVehicle,
    fetchClaims,
    sortConfig,
    handleSort
  } = useWarrantyClaimsManagement();

  const [showVehicleSelection, setShowVehicleSelection] = useState(false);
  const [showWarrantyForm, setShowWarrantyForm] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [selectedInstalledPartId, setSelectedInstalledPartId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClaim, setEditingClaim] = useState(null);

  // Auto-refresh logic
  const hasPendingClaims = claims.some(c =>
    ['SUBMITTED', 'PENDING_PAYMENT', 'PROCESSING'].includes(c.status)
  );

  const { lastUpdated, isRefreshing } = useAutoRefresh({
    fetchData: (silent) => fetchClaims(silent),
    shouldPoll: hasPendingClaims
  });

  // Debug state changes
  useEffect(() => {
    console.log("[WarrantyClaimsManagement] State changed:", {
      showVehicleSelection,
      showWarrantyForm,
      selectedVehicleId,
      selectedInstalledPartId,
    });
  }, [
    showVehicleSelection,
    showWarrantyForm,
    selectedVehicleId,
    selectedInstalledPartId,
  ]);

  // Auto-open form if prefilled vehicle is provided
  useEffect(() => {
    if (prefilledVehicle) {
      setSelectedVehicleId(prefilledVehicle.vehicleId);
      fetchInstalledPartsForVehicle(prefilledVehicle.vehicleId);
      setShowVehicleSelection(true);
    }
  }, [prefilledVehicle]);

  const openCreateForm = () => {
    setShowVehicleSelection(true);
  };

  const handleVehicleAndPartSelected = (vehicleId, installedPartId) => {
    console.log(
      "[WarrantyClaimsManagement] handleVehicleAndPartSelected called with:",
      { vehicleId, installedPartId }
    );
    console.log("[WarrantyClaimsManagement] Setting state...");
    // Set both IDs at once
    setSelectedVehicleId(vehicleId);
    setSelectedInstalledPartId(installedPartId);
    setShowVehicleSelection(false);
    setShowWarrantyForm(true);
    console.log(
      "[WarrantyClaimsManagement] setState calls completed - next render will have updated state"
    );
  };

  const handleClaimSuccess = async (response) => {
    console.log("Claim created successfully:", response);
    setShowWarrantyForm(false);
    setSelectedVehicleId(null);
    setSelectedInstalledPartId(null);
    // Refresh claims list
    await fetchClaims();
  };

  const handleClaimCancel = () => {
    setShowWarrantyForm(false);
    setSelectedVehicleId(null);
    setSelectedInstalledPartId(null);
  };

  const handleViewClaim = (claim) => {
    console.log("[WarrantyClaimsManagement] View claim:", claim);
    setSelectedClaim(claim);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedClaim(null);
  };

  const handleEditClaim = (claim) => {
    console.log("[WarrantyClaimsManagement] Edit claim:", claim);
    setEditingClaim(claim);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingClaim(null);
  };

  const handleEditSuccess = async () => {
    await fetchClaims();
  };

  const handleConfirmPayment = async (claimId) => {
    const confirmed = await window.confirm(
      "Xác nhận khách hàng đã thanh toán phí bảo hành tại quầy?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:8080/api/warranty-claims/${claimId}/confirm-payment`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể xác nhận thanh toán");
      }

      alert("Đã xác nhận thanh toán thành công!");
      await fetchClaims(); // Refresh list
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert("Có lỗi xảy ra khi xác nhận thanh toán: " + error.message);
    }
  };

  const handleDeleteClaim = async (claimId) => {
    const confirmed = await window.confirm("Bạn có chắc muốn xóa yêu cầu bảo hành này?");

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:8080/api/warranty-claims/${claimId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể xóa yêu cầu bảo hành");
      }

      alert("Đã xóa yêu cầu bảo hành thành công!");
      await fetchClaims(); // Refresh list
    } catch (error) {
      console.error("Error deleting claim:", error);
      alert("Có lỗi xảy ra khi xóa yêu cầu: " + error.message);
    }
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort style={{ color: '#ccc', marginLeft: '5px' }} />;
    if (sortConfig.direction === 'ASC') return <FaSortUp style={{ color: '#3498db', marginLeft: '5px' }} />;
    return <FaSortDown style={{ color: '#3498db', marginLeft: '5px' }} />;
  };

  return (
    <S.PageContainer>
      <S.ContentWrapper>
        <S.Header>
          <S.HeaderTop>
            <S.HeaderTitle>
              <FaClipboardList /> Quản lý Yêu cầu Bảo hành
              {lastUpdated && (
                <small style={{ color: '#7f8c8d', fontSize: '12px', marginLeft: '12px', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isRefreshing && <FaSpinner className="spinner" />}
                  Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
                </small>
              )}
            </S.HeaderTitle>
            <S.Button primary onClick={openCreateForm}>
              <FaPlus /> Tạo Yêu cầu
            </S.Button>
          </S.HeaderTop>
          <S.FilterContainer>
            <S.Select
              value={filterStatus}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="SUBMITTED">Tiếp nhận</option>
              <option value="PENDING_PAYMENT">Chờ thanh toán</option>
              <option value="PAYMENT_CONFIRMED">Đã xác nhận thanh toán</option>
              <option value="MANAGER_REVIEW">Đã duyệt</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="REJECTED">Từ chối</option>
            </S.Select>
          </S.FilterContainer>
        </S.Header>

        {loading ? (
          <S.LoadingState>
            <FaSpinner /> <p>Đang tải...</p>
          </S.LoadingState>
        ) : error ? (
          <S.EmptyState>{error}</S.EmptyState>
        ) : claims.length === 0 ? (
          <S.EmptyState>
            <h3>Không có yêu cầu bảo hành nào</h3>
          </S.EmptyState>
        ) : (
          <S.TableContainer>
            <S.Table>
              <thead>
                <tr>
                  <S.Th onClick={() => handleSort('warrantyClaimId')} style={{ cursor: 'pointer' }}>
                    ID {renderSortIcon('warrantyClaimId')}
                  </S.Th>
                  <S.Th>Khách hàng</S.Th>
                  <S.Th onClick={() => handleSort('vehicleVin')} style={{ cursor: 'pointer' }}>
                    Xe {renderSortIcon('vehicleVin')}
                  </S.Th>
                  <S.Th onClick={() => handleSort('partName')} style={{ cursor: 'pointer' }}>
                    Linh kiện {renderSortIcon('partName')}
                  </S.Th>
                  <S.Th>Loại BH</S.Th>
                  <S.Th>Phí</S.Th>
                  <S.Th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                    Trạng thái {renderSortIcon('status')}
                  </S.Th>
                  <S.Th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>
                    Ngày yêu cầu {renderSortIcon('createdAt')}
                  </S.Th>
                  <S.Th>Thao tác</S.Th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr key={claim.warrantyClaimId}>
                    <S.Td>{claim.warrantyClaimId}</S.Td>
                    <S.Td>{claim.customerName}</S.Td>
                    <S.Td>{claim.vehicleVin}</S.Td>
                    <S.Td>{claim.partName}</S.Td>
                    <S.Td>
                      {claim.isPaidWarranty ? (
                        <span style={{ color: "#ff9800", fontWeight: "bold" }}>
                          Tính phí
                        </span>
                      ) : (
                        <span style={{ color: "#4caf50", fontWeight: "bold" }}>
                          Miễn phí
                        </span>
                      )}
                    </S.Td>
                    <S.Td>
                      {claim.isPaidWarranty && claim.warrantyFee ? (
                        <span style={{ color: "#ff6f00", fontWeight: "bold" }}>
                          {parseFloat(claim.warrantyFee).toLocaleString(
                            "vi-VN"
                          )}{" "}
                          VNĐ
                        </span>
                      ) : (
                        "-"
                      )}
                    </S.Td>
                    <S.Td>
                      <S.StatusBadge $status={claim.status}>
                        {getStatusLabel(claim.status)}
                      </S.StatusBadge>
                    </S.Td>
                    <S.DateCell>
                      {new Date(claim.claimDate).toLocaleDateString("vi-VN")}
                    </S.DateCell>
                    <S.Td>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <S.Button $small onClick={() => handleViewClaim(claim)}>
                          <FaEye /> Xem
                        </S.Button>
                        {claim.status === "PENDING_PAYMENT" && (
                          <S.Button
                            $small
                            style={{ background: "#4caf50" }}
                            onClick={() =>
                              handleConfirmPayment(claim.warrantyClaimId)
                            }
                          >
                            <FaCheck /> Xác nhận TT
                          </S.Button>
                        )}
                        {(claim.status === "SUBMITTED" ||
                          claim.status === "PENDING_PAYMENT") && (
                            <>
                              <S.Button
                                $small
                                style={{ background: "#2196f3" }}
                                onClick={() => handleEditClaim(claim)}
                              >
                                <FaEdit /> Sửa
                              </S.Button>
                              <S.Button
                                $small
                                style={{ background: "#f44336" }}
                                onClick={() =>
                                  handleDeleteClaim(claim.warrantyClaimId)
                                }
                              >
                                <FaTrash /> Xóa
                              </S.Button>
                            </>
                          )}
                      </div>
                    </S.Td>
                  </tr>
                ))}
              </tbody>
            </S.Table>
          </S.TableContainer>
        )}

        {/* Pagination Controls */}
        {pagination && !error && (
          <S.PaginationContainer>
            <S.Button
              $small
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 0}
            >
              Trước
            </S.Button>
            <span style={{ margin: "0 15px", fontWeight: "bold" }}>
              Trang {pagination.currentPage + 1} / {pagination.totalPages}
              <span
                style={{ marginLeft: "10px", color: "#666", fontSize: "0.9em" }}
              >
                (Tổng: {pagination.totalElements} yêu cầu)
              </span>
            </span>
            <S.Button
              $small
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages - 1}
            >
              Tiếp
            </S.Button>
          </S.PaginationContainer>
        )}

        {/* Vehicle Selection Modal */}
        <VehicleSelectionModal
          isOpen={showVehicleSelection}
          onClose={() => {
            setShowVehicleSelection(false);
            setSelectedVehicleId(null);
            setSelectedInstalledPartId(null);
          }}
          vehicles={vehicles}
          installedParts={installedParts}
          onSelect={handleVehicleAndPartSelected}
          fetchInstalledPartsForVehicle={fetchInstalledPartsForVehicle}
        />

        {/* Paid Warranty Claim Form Modal */}
        {(() => {
          console.log(
            "[WarrantyClaimsManagement] Render check - Form modal conditions:",
            {
              showWarrantyForm,
              selectedVehicleId,
              selectedInstalledPartId,
              shouldRender:
                showWarrantyForm &&
                selectedVehicleId &&
                selectedInstalledPartId,
            }
          );
          return (
            showWarrantyForm &&
            selectedVehicleId &&
            selectedInstalledPartId && (
              <ModalOverlay>
                <ModalWrapper>
                  <CloseButton onClick={handleClaimCancel}>×</CloseButton>
                  <PaidWarrantyClaimForm
                    vehicleId={selectedVehicleId}
                    installedPartId={selectedInstalledPartId}
                    onSuccess={handleClaimSuccess}
                    onCancel={handleClaimCancel}
                  />
                </ModalWrapper>
              </ModalOverlay>
            )
          );
        })()}

        {/* Claim Detail Modal */}
        <ClaimDetailModal
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
          claim={selectedClaim}
        />

        {/* Edit Claim Modal */}
        <EditClaimModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          claim={editingClaim}
          onUpdate={handleEditSuccess}
        />
      </S.ContentWrapper>
    </S.PageContainer>
  );
};

export default WarrantyClaimsManagement;
