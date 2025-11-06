import React, { useState, useEffect } from "react";
import * as S from "./CustomerRecalls.styles";
import {
  FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaClock,
  FaHourglassHalf, FaFileAlt, FaSearch, FaFilter, FaSpinner, FaEye,
  FaThumbsUp, FaThumbsDown
} from "react-icons/fa";
import apiClient from "../../api/apiClient";

export default function CustomerRecalls() {
  const [recalls, setRecalls] = useState([]);
  const [filteredRecalls, setFilteredRecalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecall, setSelectedRecall] = useState(null);

  const [customerNote, setCustomerNote] = useState("");
  const [acceptRecall, setAcceptRecall] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecalls();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [recalls, searchTerm, statusFilter]);

  const fetchRecalls = async () => {
    try {
      setLoading(true);
      const response = await apiClient('/api/recall-requests/my-recalls');
      setRecalls(response || []);
    } catch (error) {
      console.error("Error fetching recalls:", error);
      alert("Không thể tải danh sách yêu cầu recall");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...recalls];

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.recallRequestId?.toString().includes(term) ||
        r.installedPart?.part?.partName?.toLowerCase().includes(term) ||
        r.installedPart?.vehicle?.vin?.toLowerCase().includes(term) ||
        r.reason?.toLowerCase().includes(term)
      );
    }

    setFilteredRecalls(filtered);
  };

  const handleConfirmRecall = async (e) => {
    e.preventDefault();
    if (!selectedRecall) return;

    try {
      setSubmitting(true);
      await apiClient(`/api/recall-requests/${selectedRecall.recallRequestId}/customer-confirm`, {
        method: 'PATCH',
        body: JSON.stringify({
          accepted: acceptRecall,
          customerNote: customerNote.trim() || null
        })
      });

      if (acceptRecall) {
        alert("Bạn đã chấp nhận yêu cầu recall. Hệ thống sẽ tự động tạo yêu cầu bảo hành cho bạn.");
      } else {
        alert("Bạn đã từ chối yêu cầu recall.");
      }

      setShowConfirmModal(false);
      setCustomerNote("");
      setAcceptRecall(true);
      setSelectedRecall(null);
      fetchRecalls();
    } catch (error) {
      console.error("Error confirming recall:", error);
      alert(error.message || "Không thể xác nhận yêu cầu recall");
    } finally {
      setSubmitting(false);
    }
  };

  const openConfirmModal = (recall) => {
    setSelectedRecall(recall);
    setCustomerNote("");
    setAcceptRecall(true);
    setShowConfirmModal(true);
  };

  const openDetailModal = (recall) => {
    setSelectedRecall(recall);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING_ADMIN_APPROVAL: { color: "#f39c12", label: "Đang chờ phê duyệt", icon: <FaClock /> },
      REJECTED_BY_ADMIN: { color: "#e74c3c", label: "Bị từ chối", icon: <FaTimesCircle /> },
      WAITING_CUSTOMER_CONFIRM: { color: "#3498db", label: "Chờ bạn xác nhận", icon: <FaHourglassHalf /> },
      REJECTED_BY_CUSTOMER: { color: "#95a5a6", label: "Bạn đã từ chối", icon: <FaThumbsDown /> },
      CLAIM_CREATED: { color: "#27ae60", label: "Đã tạo yêu cầu bảo hành", icon: <FaCheckCircle /> },
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
      total: recalls.length,
      pending: recalls.filter(r => r.status === "PENDING_ADMIN_APPROVAL").length,
      waiting: recalls.filter(r => r.status === "WAITING_CUSTOMER_CONFIRM").length,
      rejected: recalls.filter(r => r.status === "REJECTED_BY_ADMIN" || r.status === "REJECTED_BY_CUSTOMER").length,
      claimCreated: recalls.filter(r => r.status === "CLAIM_CREATED").length,
      completed: recalls.filter(r => r.status === "COMPLETED").length
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

        <S.StatCard color="#f39c12" onClick={() => setStatusFilter("PENDING_ADMIN_APPROVAL")}>
          <S.StatIcon color="#f39c12"><FaClock /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.pending}</S.StatNumber>
            <S.StatLabel>Đang chờ duyệt</S.StatLabel>
          </S.StatContent>
        </S.StatCard>

        <S.StatCard color="#3498db" onClick={() => setStatusFilter("WAITING_CUSTOMER_CONFIRM")}>
          <S.StatIcon color="#3498db"><FaHourglassHalf /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.waiting}</S.StatNumber>
            <S.StatLabel>Chờ bạn xác nhận</S.StatLabel>
          </S.StatContent>
        </S.StatCard>

        <S.StatCard color="#e74c3c">
          <S.StatIcon color="#e74c3c"><FaTimesCircle /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.rejected}</S.StatNumber>
            <S.StatLabel>Bị từ chối</S.StatLabel>
          </S.StatContent>
        </S.StatCard>

        <S.StatCard color="#27ae60" onClick={() => setStatusFilter("CLAIM_CREATED")}>
          <S.StatIcon color="#27ae60"><FaCheckCircle /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.claimCreated}</S.StatNumber>
            <S.StatLabel>Đã tạo yêu cầu BH</S.StatLabel>
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
            <option value="PENDING_ADMIN_APPROVAL">Đang chờ duyệt</option>
            <option value="WAITING_CUSTOMER_CONFIRM">Chờ xác nhận</option>
            <option value="REJECTED_BY_ADMIN">Bị từ chối (Admin)</option>
            <option value="REJECTED_BY_CUSTOMER">Bạn đã từ chối</option>
            <option value="CLAIM_CREATED">Đã tạo yêu cầu BH</option>
            <option value="COMPLETED">Đã hoàn thành</option>
          </S.FilterSelect>
        </S.FilterGroup>
      </S.FilterBar>

      <S.ResultsInfo>
        Hiển thị <strong>{filteredRecalls.length}</strong> / <strong>{recalls.length}</strong> thông báo
      </S.ResultsInfo>

      {filteredRecalls.length === 0 ? (
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
            {filteredRecalls.map((recall) => (
              <S.TableRow key={recall.recallRequestId}>
                <S.TableCell>#{recall.recallRequestId}</S.TableCell>
                <S.TableCell>
                  <div>{recall.installedPart?.vehicle?.model}</div>
                  <small>{recall.installedPart?.vehicle?.vin}</small>
                </S.TableCell>
                <S.TableCell>
                  <div>{recall.installedPart?.part?.partName}</div>
                  <small>{recall.installedPart?.part?.partNumber}</small>
                </S.TableCell>
                <S.TableCell>
                  {recall.reason?.length > 60
                    ? recall.reason.substring(0, 60) + "..."
                    : recall.reason}
                </S.TableCell>
                <S.TableCell>
                  {recall.createdAt ? new Date(recall.createdAt).toLocaleDateString('vi-VN') : "N/A"}
                </S.TableCell>
                <S.TableCell>
                  {getStatusBadge(recall.status)}
                </S.TableCell>
                <S.TableCell>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <S.ActionButton onClick={() => openDetailModal(recall)}>
                      <FaEye /> Chi tiết
                    </S.ActionButton>
                    {recall.status === "WAITING_CUSTOMER_CONFIRM" && (
                      <S.ActionButton
                        style={{ background: "#27ae60" }}
                        onClick={() => openConfirmModal(recall)}
                      >
                        <FaThumbsUp /> Xác nhận
                      </S.ActionButton>
                    )}
                  </div>
                </S.TableCell>
              </S.TableRow>
            ))}
          </S.TableBody>
        </S.Table>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && selectedRecall && (
        <S.ModalOverlay onClick={() => !submitting && setShowConfirmModal(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <h2><FaThumbsUp /> Xác nhận Recall</h2>
              <S.CloseButton onClick={() => !submitting && setShowConfirmModal(false)}>&times;</S.CloseButton>
            </S.ModalHeader>
            <S.Form onSubmit={handleConfirmRecall}>
              <S.FormGroup>
                <S.Label>Recall ID:</S.Label>
                <S.Input type="text" value={`#${selectedRecall.recallRequestId}`} disabled />
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>Xe:</S.Label>
                <S.Input
                  type="text"
                  value={`${selectedRecall.installedPart?.vehicle?.model} (${selectedRecall.installedPart?.vehicle?.vin})`}
                  disabled
                />
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>Phụ tùng cần thay:</S.Label>
                <S.Input
                  type="text"
                  value={`${selectedRecall.installedPart?.part?.partName} (${selectedRecall.installedPart?.part?.partNumber})`}
                  disabled
                />
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>Lý do recall:</S.Label>
                <S.TextArea value={selectedRecall.reason} disabled />
              </S.FormGroup>
              {selectedRecall.adminNote && (
                <S.FormGroup>
                  <S.Label>Ghi chú từ Admin:</S.Label>
                  <S.TextArea value={selectedRecall.adminNote} disabled />
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
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRecall && (
        <S.ModalOverlay onClick={() => setShowDetailModal(false)}>
          <S.ModalContent large onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <h2><FaEye /> Chi tiết Recall #{selectedRecall.recallRequestId}</h2>
              <S.CloseButton onClick={() => setShowDetailModal(false)}>&times;</S.CloseButton>
            </S.ModalHeader>
            <S.DetailGrid>
              <S.DetailSection>
                <S.SectionTitle>Thông tin Recall</S.SectionTitle>
                <S.DetailItem>
                  <S.DetailLabel>Recall ID:</S.DetailLabel>
                  <S.DetailValue>#{selectedRecall.recallRequestId}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Trạng thái:</S.DetailLabel>
                  <S.DetailValue>{getStatusBadge(selectedRecall.status)}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Ngày tạo:</S.DetailLabel>
                  <S.DetailValue>
                    {selectedRecall.createdAt ? new Date(selectedRecall.createdAt).toLocaleString('vi-VN') : "N/A"}
                  </S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Người tạo yêu cầu:</S.DetailLabel>
                  <S.DetailValue>{selectedRecall.createdBy?.fullName || "N/A"}</S.DetailValue>
                </S.DetailItem>
              </S.DetailSection>

              <S.DetailSection>
                <S.SectionTitle>Thông tin Xe</S.SectionTitle>
                <S.DetailItem>
                  <S.DetailLabel>Xe:</S.DetailLabel>
                  <S.DetailValue>{selectedRecall.installedPart?.vehicle?.model || "N/A"}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>VIN:</S.DetailLabel>
                  <S.DetailValue>{selectedRecall.installedPart?.vehicle?.vin || "N/A"}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Năm sản xuất:</S.DetailLabel>
                  <S.DetailValue>{selectedRecall.installedPart?.vehicle?.year || "N/A"}</S.DetailValue>
                </S.DetailItem>
              </S.DetailSection>

              <S.DetailSection fullWidth>
                <S.SectionTitle>Thông tin Phụ tùng cần thay</S.SectionTitle>
                <S.DetailItem>
                  <S.DetailLabel>Tên phụ tùng:</S.DetailLabel>
                  <S.DetailValue>{selectedRecall.installedPart?.part?.partName || "N/A"}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Mã phụ tùng:</S.DetailLabel>
                  <S.DetailValue>{selectedRecall.installedPart?.part?.partNumber || "N/A"}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Ngày lắp đặt:</S.DetailLabel>
                  <S.DetailValue>
                    {selectedRecall.installedPart?.installationDate
                      ? new Date(selectedRecall.installedPart.installationDate).toLocaleDateString('vi-VN')
                      : "N/A"}
                  </S.DetailValue>
                </S.DetailItem>
              </S.DetailSection>

              <S.DetailSection fullWidth>
                <S.SectionTitle>Lý do Recall</S.SectionTitle>
                <S.DetailValue>{selectedRecall.reason || "N/A"}</S.DetailValue>
              </S.DetailSection>

              {selectedRecall.adminNote && (
                <S.DetailSection fullWidth>
                  <S.SectionTitle>Ghi chú từ Admin</S.SectionTitle>
                  <S.DetailValue>{selectedRecall.adminNote}</S.DetailValue>
                </S.DetailSection>
              )}

              {selectedRecall.customerNote && (
                <S.DetailSection fullWidth>
                  <S.SectionTitle>Phản hồi của bạn</S.SectionTitle>
                  <S.DetailValue>{selectedRecall.customerNote}</S.DetailValue>
                </S.DetailSection>
              )}

              {selectedRecall.warrantyClaim && (
                <S.DetailSection fullWidth>
                  <S.SectionTitle>Yêu cầu Bảo hành đã tạo</S.SectionTitle>
                  <S.DetailItem>
                    <S.DetailLabel>Warranty Claim ID:</S.DetailLabel>
                    <S.DetailValue>#{selectedRecall.warrantyClaim.warrantyClaimId}</S.DetailValue>
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
              {selectedRecall.status === "WAITING_CUSTOMER_CONFIRM" && (
                <S.Button
                  primary
                  onClick={() => {
                    setShowDetailModal(false);
                    openConfirmModal(selectedRecall);
                  }}
                >
                  <FaThumbsUp /> Xác nhận ngay
                </S.Button>
              )}
              <S.Button onClick={() => setShowDetailModal(false)}>Đóng</S.Button>
            </S.ModalFooter>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </S.Container>
  );
}
