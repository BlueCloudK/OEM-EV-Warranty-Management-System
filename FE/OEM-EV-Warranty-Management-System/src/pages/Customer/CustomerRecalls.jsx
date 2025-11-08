import React, { useState, useEffect } from "react";
import * as S from "./CustomerRecalls.styles";
import {
  FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaClock,
  FaHourglassHalf, FaFileAlt, FaSearch, FaFilter, FaSpinner, FaEye,
  FaThumbsUp, FaThumbsDown
} from "react-icons/fa";
import { recallResponsesApi } from "../../api/recallResponses";

export default function CustomerRecalls() {
  const [recallResponses, setRecallResponses] = useState([]);
  const [filteredResponses, setFilteredResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);

  const [customerNote, setCustomerNote] = useState("");
  const [acceptRecall, setAcceptRecall] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecallResponses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [recallResponses, searchTerm, statusFilter]);

  const fetchRecallResponses = async () => {
    try {
      setLoading(true);
      // NEW FLOW: Fetch RecallResponses instead of RecallRequests
      const response = await recallResponsesApi.getMyResponses();
      console.log("📋 Recall Responses loaded:", response);
      console.log("📋 First response sample:", response?.content?.[0] || response?.[0]);

      const data = response?.content || response || [];

      // Debug: Check structure of first item
      if (data.length > 0) {
        console.log("📋 First item structure:", {
          recallResponseId: data[0].recallResponseId,
          status: data[0].status,
          vehicle: data[0].vehicle,
          vehicleId: data[0].vehicleId,
          recallRequest: data[0].recallRequest,
          recallRequestId: data[0].recallRequestId,
          hasVehicle: !!data[0].vehicle,
          hasRecallRequest: !!data[0].recallRequest,
        });
      }

      setRecallResponses(data);
    } catch (error) {
      console.error("Error fetching recall responses:", error);
      alert("Không thể tải danh sách thông báo recall");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...recallResponses];

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.recallResponseId?.toString().includes(term) ||
        r.recallRequest?.part?.partName?.toLowerCase().includes(term) ||
        r.vehicle?.vehicleVin?.toLowerCase().includes(term) ||
        r.recallRequest?.reason?.toLowerCase().includes(term)
      );
    }

    setFilteredResponses(filtered);
  };

  const handleConfirmRecall = async (e) => {
    e.preventDefault();
    if (!selectedResponse) return;

    try {
      setSubmitting(true);
      // NEW FLOW: Confirm via RecallResponse API
      await recallResponsesApi.confirm(selectedResponse.recallResponseId, {
        accepted: acceptRecall,
        customerNote: customerNote.trim() || null
      });

      if (acceptRecall) {
        alert("✅ Bạn đã chấp nhận yêu cầu recall. Vui lòng liên hệ trung tâm bảo hành để được hỗ trợ.");
      } else {
        alert("❌ Bạn đã từ chối yêu cầu recall.");
      }

      setShowConfirmModal(false);
      setCustomerNote("");
      setAcceptRecall(true);
      setSelectedResponse(null);
      fetchRecallResponses();
    } catch (error) {
      console.error("Error confirming recall:", error);
      alert(error.message || "Không thể xác nhận yêu cầu recall");
    } finally {
      setSubmitting(false);
    }
  };

  const openConfirmModal = (response) => {
    setSelectedResponse(response);
    setCustomerNote("");
    setAcceptRecall(true);
    setShowConfirmModal(true);
  };

  const openDetailModal = (response) => {
    setSelectedResponse(response);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    // RecallResponse statuses: PENDING, ACCEPTED, DECLINED, IN_PROGRESS, COMPLETED
    const statusMap = {
      PENDING: { color: "#3498db", label: "Chờ bạn xác nhận", icon: <FaHourglassHalf /> },
      ACCEPTED: { color: "#27ae60", label: "Đã chấp nhận", icon: <FaCheckCircle /> },
      DECLINED: { color: "#e74c3c", label: "Bạn đã từ chối", icon: <FaThumbsDown /> },
      IN_PROGRESS: { color: "#f39c12", label: "Đang sửa chữa", icon: <FaClock /> },
      COMPLETED: { color: "#1a73e8", label: "Đã hoàn thành", icon: <FaCheckCircle /> }
    };
    const config = statusMap[status] || { color: "#7f8c8d", label: status, icon: <FaFileAlt /> };
    return (
      <S.StatusBadge color={config.color}>
        {config.icon} {config.label}
      </S.StatusBadge>
    );
  };

  const getStatistics = () => {
    return {
      total: recallResponses.length,
      pending: recallResponses.filter(r => r.status === "PENDING").length,
      accepted: recallResponses.filter(r => r.status === "ACCEPTED").length,
      declined: recallResponses.filter(r => r.status === "DECLINED").length,
      inProgress: recallResponses.filter(r => r.status === "IN_PROGRESS").length,
      completed: recallResponses.filter(r => r.status === "COMPLETED").length
    };
  };

  const stats = getStatistics();

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
          <FaExclamationTriangle /> Thông báo Recall
        </h1>
        <p>Các thông báo thu hồi phụ tùng cho xe của bạn</p>
      </S.Header>

      <S.StatsGrid>
        <S.StatCard color="#667eea" onClick={() => setStatusFilter("ALL")}>
          <S.StatIcon color="#667eea"><FaFileAlt /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.total}</S.StatNumber>
            <S.StatLabel>Tổng thông báo</S.StatLabel>
          </S.StatContent>
        </S.StatCard>

        <S.StatCard color="#3498db" onClick={() => setStatusFilter("PENDING")}>
          <S.StatIcon color="#3498db"><FaHourglassHalf /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.pending}</S.StatNumber>
            <S.StatLabel>Chờ bạn xác nhận</S.StatLabel>
          </S.StatContent>
        </S.StatCard>

        <S.StatCard color="#27ae60" onClick={() => setStatusFilter("ACCEPTED")}>
          <S.StatIcon color="#27ae60"><FaCheckCircle /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.accepted}</S.StatNumber>
            <S.StatLabel>Đã chấp nhận</S.StatLabel>
          </S.StatContent>
        </S.StatCard>

        <S.StatCard color="#e74c3c" onClick={() => setStatusFilter("DECLINED")}>
          <S.StatIcon color="#e74c3c"><FaThumbsDown /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.declined}</S.StatNumber>
            <S.StatLabel>Đã từ chối</S.StatLabel>
          </S.StatContent>
        </S.StatCard>

        <S.StatCard color="#f39c12" onClick={() => setStatusFilter("IN_PROGRESS")}>
          <S.StatIcon color="#f39c12"><FaClock /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.inProgress}</S.StatNumber>
            <S.StatLabel>Đang sửa chữa</S.StatLabel>
          </S.StatContent>
        </S.StatCard>

        <S.StatCard color="#1a73e8" onClick={() => setStatusFilter("COMPLETED")}>
          <S.StatIcon color="#1a73e8"><FaCheckCircle /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.completed}</S.StatNumber>
            <S.StatLabel>Đã hoàn thành</S.StatLabel>
          </S.StatContent>
        </S.StatCard>
      </S.StatsGrid>

      <S.FilterBar>
        <S.SearchBox>
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm theo ID, xe, phụ tùng, lý do..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </S.SearchBox>

        <S.FilterGroup>
          <S.FilterLabel><FaFilter /> Trạng thái:</S.FilterLabel>
          <S.FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">Tất cả</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="ACCEPTED">Đã chấp nhận</option>
            <option value="DECLINED">Đã từ chối</option>
            <option value="IN_PROGRESS">Đang sửa chữa</option>
            <option value="COMPLETED">Đã hoàn thành</option>
          </S.FilterSelect>
        </S.FilterGroup>
      </S.FilterBar>

      <S.ResultsInfo>
        Hiển thị <strong>{filteredResponses.length}</strong> / <strong>{recallResponses.length}</strong> thông báo
      </S.ResultsInfo>

      {filteredResponses.length === 0 ? (
        <S.EmptyState>
          <FaExclamationTriangle size={64} />
          <p>Không có thông báo recall nào</p>
        </S.EmptyState>
      ) : (
        <S.Table>
          <S.TableHeader>
            <tr>
              <S.TableHeaderCell>ID</S.TableHeaderCell>
              <S.TableHeaderCell>Xe</S.TableHeaderCell>
              <S.TableHeaderCell>Phụ tùng</S.TableHeaderCell>
              <S.TableHeaderCell>Lý do Recall</S.TableHeaderCell>
              <S.TableHeaderCell>Ngày tạo</S.TableHeaderCell>
              <S.TableHeaderCell>Trạng thái</S.TableHeaderCell>
              <S.TableHeaderCell>Hành động</S.TableHeaderCell>
            </tr>
          </S.TableHeader>
          <S.TableBody>
            {filteredResponses.map((response) => {
              // Safe data extraction with fallbacks
              const vehicleModel = response.vehicle?.vehicleModel || response.vehicleName || 'Xe không xác định';
              const vehicleVin = response.vehicle?.vehicleVin || response.vehicleVin || 'VIN không có';
              const partName = response.recallRequest?.part?.partName || response.partName || 'Phụ tùng không xác định';
              const partNumber = response.recallRequest?.part?.partNumber || response.partNumber || 'Mã không có';
              const reason = response.recallRequest?.reason || response.reason || 'Chưa có thông tin lý do';

              return (
                <S.TableRow key={response.recallResponseId}>
                  <S.TableCell>#{response.recallResponseId}</S.TableCell>
                  <S.TableCell>
                    <div>{vehicleModel}</div>
                    <small>{vehicleVin}</small>
                  </S.TableCell>
                  <S.TableCell>
                    <div>{partName}</div>
                    <small>{partNumber}</small>
                  </S.TableCell>
                  <S.TableCell>
                    {reason.length > 60 ? reason.substring(0, 60) + "..." : reason}
                  </S.TableCell>
                  <S.TableCell>
                    {response.createdAt ? new Date(response.createdAt).toLocaleDateString('vi-VN') : "N/A"}
                  </S.TableCell>
                  <S.TableCell>
                    {getStatusBadge(response.status)}
                  </S.TableCell>
                  <S.TableCell>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <S.ActionButton onClick={() => openDetailModal(response)}>
                        <FaEye /> Chi tiết
                      </S.ActionButton>
                      {response.status === "PENDING" && (
                        <S.ActionButton
                          style={{ background: "#27ae60" }}
                          onClick={() => openConfirmModal(response)}
                        >
                          <FaThumbsUp /> Xác nhận
                        </S.ActionButton>
                      )}
                    </div>
                  </S.TableCell>
                </S.TableRow>
              );
            })}
          </S.TableBody>
        </S.Table>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && selectedResponse && (() => {
        // Safe data extraction
        const vehicleModel = selectedResponse.vehicle?.vehicleModel || selectedResponse.vehicleName || 'Xe không xác định';
        const vehicleVin = selectedResponse.vehicle?.vehicleVin || selectedResponse.vehicleVin || 'VIN không có';
        const partName = selectedResponse.recallRequest?.part?.partName || selectedResponse.partName || 'Phụ tùng không xác định';
        const partNumber = selectedResponse.recallRequest?.part?.partNumber || selectedResponse.partNumber || 'Mã không có';
        const reason = selectedResponse.recallRequest?.reason || selectedResponse.reason || 'Chưa có thông tin lý do';
        const adminNote = selectedResponse.recallRequest?.adminNote || selectedResponse.adminNote;

        return (
          <S.ModalOverlay onClick={() => !submitting && setShowConfirmModal(false)}>
            <S.ModalContent onClick={(e) => e.stopPropagation()}>
              <S.ModalHeader>
                <h2><FaThumbsUp /> Xác nhận Recall</h2>
                <S.CloseButton onClick={() => !submitting && setShowConfirmModal(false)}>&times;</S.CloseButton>
              </S.ModalHeader>
              <S.Form onSubmit={handleConfirmRecall}>
                <S.FormGroup>
                  <S.Label>Recall Response ID:</S.Label>
                  <S.Input type="text" value={`#${selectedResponse.recallResponseId}`} disabled />
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>Xe:</S.Label>
                  <S.Input
                    type="text"
                    value={`${vehicleModel} (${vehicleVin})`}
                    disabled
                  />
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>Phụ tùng cần thay:</S.Label>
                  <S.Input
                    type="text"
                    value={`${partName} (${partNumber})`}
                    disabled
                  />
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>Lý do recall:</S.Label>
                  <S.TextArea value={reason} disabled />
                </S.FormGroup>
                {adminNote && (
                  <S.FormGroup>
                    <S.Label>Ghi chú từ Admin:</S.Label>
                    <S.TextArea value={adminNote} disabled />
                  </S.FormGroup>
                )}

              <S.FormGroup>
                <S.Label>Quyết định của bạn: *</S.Label>
                <S.RadioGroup>
                  <S.RadioLabel>
                    <input
                      type="radio"
                      name="decision"
                      checked={acceptRecall}
                      onChange={() => setAcceptRecall(true)}
                      disabled={submitting}
                    />
                    <FaThumbsUp style={{ color: "#27ae60" }} />
                    <span>Chấp nhận - Hệ thống sẽ tự động tạo yêu cầu bảo hành</span>
                  </S.RadioLabel>
                  <S.RadioLabel>
                    <input
                      type="radio"
                      name="decision"
                      checked={!acceptRecall}
                      onChange={() => setAcceptRecall(false)}
                      disabled={submitting}
                    />
                    <FaThumbsDown style={{ color: "#e74c3c" }} />
                    <span>Từ chối - Bạn sẽ không được bảo hành cho phụ tùng này</span>
                  </S.RadioLabel>
                </S.RadioGroup>
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>Ghi chú của bạn (tùy chọn):</S.Label>
                <S.TextArea
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Nhập ghi chú nếu bạn muốn..."
                  disabled={submitting}
                />
              </S.FormGroup>

              {!acceptRecall && (
                <S.WarningBox>
                  <FaExclamationTriangle />
                  <div>
                    <strong>Cảnh báo:</strong> Nếu bạn từ chối yêu cầu recall này, bạn sẽ không được bảo hành miễn phí cho phụ tùng này trong tương lai.
                  </div>
                </S.WarningBox>
              )}

              <S.ModalFooter>
                <S.Button type="button" onClick={() => setShowConfirmModal(false)} disabled={submitting}>
                  Hủy
                </S.Button>
                <S.Button
                  primary={acceptRecall}
                  danger={!acceptRecall}
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <><FaSpinner className="spinner" /> Đang xử lý...</>
                  ) : acceptRecall ? (
                    <><FaThumbsUp /> Chấp nhận Recall</>
                  ) : (
                    <><FaThumbsDown /> Từ chối Recall</>
                  )}
                </S.Button>
              </S.ModalFooter>
            </S.Form>
          </S.ModalContent>
        </S.ModalOverlay>
        );
      })()}

      {/* Detail Modal */}
      {showDetailModal && selectedResponse && (() => {
        // Safe data extraction
        const vehicleModel = selectedResponse.vehicle?.vehicleModel || selectedResponse.vehicleName || 'Xe không xác định';
        const vehicleVin = selectedResponse.vehicle?.vehicleVin || selectedResponse.vehicleVin || 'VIN không có';
        const vehicleYear = selectedResponse.vehicle?.year || selectedResponse.year || 'N/A';
        const partName = selectedResponse.recallRequest?.part?.partName || selectedResponse.partName || 'Phụ tùng không xác định';
        const partNumber = selectedResponse.recallRequest?.part?.partNumber || selectedResponse.partNumber || 'Mã không có';
        const reason = selectedResponse.recallRequest?.reason || selectedResponse.reason || 'Chưa có thông tin lý do';
        const adminNote = selectedResponse.recallRequest?.adminNote || selectedResponse.adminNote;
        const recallRequestId = selectedResponse.recallRequest?.recallRequestId || selectedResponse.recallRequestId;

        return (
          <S.ModalOverlay onClick={() => setShowDetailModal(false)}>
            <S.ModalContent large onClick={(e) => e.stopPropagation()}>
              <S.ModalHeader>
                <h2><FaEye /> Chi tiết Recall Response #{selectedResponse.recallResponseId}</h2>
                <S.CloseButton onClick={() => setShowDetailModal(false)}>&times;</S.CloseButton>
              </S.ModalHeader>
              <S.DetailGrid>
                <S.DetailSection>
                  <S.SectionTitle>Thông tin Recall Response</S.SectionTitle>
                  <S.DetailItem>
                    <S.DetailLabel>Response ID:</S.DetailLabel>
                    <S.DetailValue>#{selectedResponse.recallResponseId}</S.DetailValue>
                  </S.DetailItem>
                  <S.DetailItem>
                    <S.DetailLabel>Trạng thái:</S.DetailLabel>
                    <S.DetailValue>{getStatusBadge(selectedResponse.status)}</S.DetailValue>
                  </S.DetailItem>
                  <S.DetailItem>
                    <S.DetailLabel>Ngày tạo:</S.DetailLabel>
                    <S.DetailValue>
                      {selectedResponse.createdAt ? new Date(selectedResponse.createdAt).toLocaleString('vi-VN') : "N/A"}
                    </S.DetailValue>
                  </S.DetailItem>
                  {recallRequestId && (
                    <S.DetailItem>
                      <S.DetailLabel>Chiến dịch Recall:</S.DetailLabel>
                      <S.DetailValue>#{recallRequestId}</S.DetailValue>
                    </S.DetailItem>
                  )}
                </S.DetailSection>

                <S.DetailSection>
                  <S.SectionTitle>Thông tin Xe</S.SectionTitle>
                  <S.DetailItem>
                    <S.DetailLabel>Xe:</S.DetailLabel>
                    <S.DetailValue>{vehicleModel}</S.DetailValue>
                  </S.DetailItem>
                  <S.DetailItem>
                    <S.DetailLabel>VIN:</S.DetailLabel>
                    <S.DetailValue>{vehicleVin}</S.DetailValue>
                  </S.DetailItem>
                  <S.DetailItem>
                    <S.DetailLabel>Năm sản xuất:</S.DetailLabel>
                    <S.DetailValue>{vehicleYear}</S.DetailValue>
                  </S.DetailItem>
                </S.DetailSection>

                <S.DetailSection fullWidth>
                  <S.SectionTitle>Thông tin Phụ tùng cần thay</S.SectionTitle>
                  <S.DetailItem>
                    <S.DetailLabel>Tên phụ tùng:</S.DetailLabel>
                    <S.DetailValue>{partName}</S.DetailValue>
                  </S.DetailItem>
                  <S.DetailItem>
                    <S.DetailLabel>Mã phụ tùng:</S.DetailLabel>
                    <S.DetailValue>{partNumber}</S.DetailValue>
                  </S.DetailItem>
                </S.DetailSection>

                <S.DetailSection fullWidth>
                  <S.SectionTitle>Lý do Recall</S.SectionTitle>
                  <S.DetailValue>{reason}</S.DetailValue>
                </S.DetailSection>

                {adminNote && (
                  <S.DetailSection fullWidth>
                    <S.SectionTitle>Ghi chú từ Admin</S.SectionTitle>
                    <S.DetailValue>{adminNote}</S.DetailValue>
                  </S.DetailSection>
                )}

                {selectedResponse.customerNote && (
                  <S.DetailSection fullWidth>
                    <S.SectionTitle>Phản hồi của bạn</S.SectionTitle>
                    <S.DetailValue>{selectedResponse.customerNote}</S.DetailValue>
                  </S.DetailSection>
                )}

                {selectedResponse.warrantyClaim && (
                  <S.DetailSection fullWidth>
                    <S.SectionTitle>Yêu cầu Bảo hành đã tạo</S.SectionTitle>
                    <S.DetailItem>
                      <S.DetailLabel>Warranty Claim ID:</S.DetailLabel>
                      <S.DetailValue>#{selectedResponse.warrantyClaim.warrantyClaimId}</S.DetailValue>
                    </S.DetailItem>
                    <S.InfoBox>
                      <FaCheckCircle />
                      <div>
                        Yêu cầu bảo hành đã được tự động tạo và đang được xử lý. Bạn có thể xem chi tiết tại trang "Lịch sử Bảo hành".
                      </div>
                    </S.InfoBox>
                  </S.DetailSection>
                )}
            </S.DetailGrid>
            <S.ModalFooter>
              {selectedResponse.status === "PENDING" && (
                <S.Button
                  primary
                  onClick={() => {
                    setShowDetailModal(false);
                    openConfirmModal(selectedResponse);
                  }}
                >
                  <FaThumbsUp /> Xác nhận ngay
                </S.Button>
              )}
              <S.Button onClick={() => setShowDetailModal(false)}>Đóng</S.Button>
            </S.ModalFooter>
          </S.ModalContent>
        </S.ModalOverlay>
        );
      })()}
    </S.Container>
  );
}
