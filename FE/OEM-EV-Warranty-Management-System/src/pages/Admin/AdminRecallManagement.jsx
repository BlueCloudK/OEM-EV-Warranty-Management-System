import React, { useState, useEffect } from "react";
import * as S from "./AdminRecallManagement.styles";
import {
  FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaClock,
  FaHourglassHalf, FaUserCheck, FaFileAlt, FaSearch, FaFilter,
  FaSpinner, FaEye
} from "react-icons/fa";
import apiClient from "../../api/apiClient";

export default function AdminRecallManagement() {
  const [recalls, setRecalls] = useState([]);
  const [filteredRecalls, setFilteredRecalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecall, setSelectedRecall] = useState(null);

  const [adminNote, setAdminNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
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
      const response = await apiClient('/api/recall-requests/admin');
      console.log('Recall data:', response); // Debug: xem structure của data
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
        r.installedPart?.vehicle?.customer?.user?.fullName?.toLowerCase().includes(term) ||
        r.reason?.toLowerCase().includes(term)
      );
    }

    setFilteredRecalls(filtered);
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!selectedRecall) return;

    try {
      setSubmitting(true);
      await apiClient(
        `/api/recall-requests/${selectedRecall.recallRequestId}/approve?note=${encodeURIComponent(adminNote || '')}`,
        { method: 'PATCH' }
      );
      alert("Đã phê duyệt yêu cầu recall thành công!");
      setShowApproveModal(false);
      setAdminNote("");
      setSelectedRecall(null);
      fetchRecalls();
    } catch (error) {
      console.error("Error approving recall:", error);
      alert(error.message || "Không thể phê duyệt yêu cầu recall");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!selectedRecall || !rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      setSubmitting(true);
      await apiClient(
        `/api/recall-requests/${selectedRecall.recallRequestId}/reject?note=${encodeURIComponent(rejectReason)}`,
        { method: 'PATCH' }
      );
      alert("Đã từ chối yêu cầu recall");
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedRecall(null);
      fetchRecalls();
    } catch (error) {
      console.error("Error rejecting recall:", error);
      alert(error.message || "Không thể từ chối yêu cầu recall");
    } finally {
      setSubmitting(false);
    }
  };

  const openApproveModal = (recall) => {
    setSelectedRecall(recall);
    setAdminNote("");
    setShowApproveModal(true);
  };

  const openRejectModal = (recall) => {
    setSelectedRecall(recall);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const openDetailModal = (recall) => {
    setSelectedRecall(recall);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING_ADMIN_APPROVAL: { color: "#f39c12", label: "Chờ duyệt" },
      REJECTED_BY_ADMIN: { color: "#e74c3c", label: "Admin từ chối" },
      WAITING_CUSTOMER_CONFIRM: { color: "#3498db", label: "Chờ khách hàng" },
      REJECTED_BY_CUSTOMER: { color: "#95a5a6", label: "Khách từ chối" },
      CLAIM_CREATED: { color: "#27ae60", label: "Đã tạo claim" },
      COMPLETED: { color: "#1a73e8", label: "Hoàn thành" }
    };
    const config = statusMap[status] || { color: "#7f8c8d", label: status };
    return <S.StatusBadge color={config.color}>{config.label}</S.StatusBadge>;
  };

  const getStatistics = () => {
    return {
      total: recalls.length,
      pending: recalls.filter(r => r.status === "PENDING_ADMIN_APPROVAL").length,
      approved: recalls.filter(r => r.status === "WAITING_CUSTOMER_CONFIRM").length,
      rejected: recalls.filter(r => r.status === "REJECTED_BY_ADMIN").length,
      customerRejected: recalls.filter(r => r.status === "REJECTED_BY_CUSTOMER").length,
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
          <FaExclamationTriangle /> Quản lý Yêu cầu Recall
        </h1>
        <p>Phê duyệt hoặc từ chối yêu cầu recall từ EVM Staff</p>
      </S.Header>

      <S.StatsGrid>
        <S.StatCard color="#667eea" onClick={() => setStatusFilter("ALL")}>
          <S.StatIcon color="#667eea"><FaFileAlt /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.total}</S.StatNumber>
            <S.StatLabel>Tổng yêu cầu</S.StatLabel>
          </S.StatContent>
        </S.StatCard>

        <S.StatCard color="#f39c12" onClick={() => setStatusFilter("PENDING_ADMIN_APPROVAL")}>
          <S.StatIcon color="#f39c12"><FaClock /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.pending}</S.StatNumber>
            <S.StatLabel>Chờ duyệt</S.StatLabel>
          </S.StatContent>
        </S.StatCard>

        <S.StatCard color="#3498db" onClick={() => setStatusFilter("WAITING_CUSTOMER_CONFIRM")}>
          <S.StatIcon color="#3498db"><FaHourglassHalf /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.approved}</S.StatNumber>
            <S.StatLabel>Chờ khách hàng</S.StatLabel>
          </S.StatContent>
        </S.StatCard>

        <S.StatCard color="#e74c3c" onClick={() => setStatusFilter("REJECTED_BY_ADMIN")}>
          <S.StatIcon color="#e74c3c"><FaTimesCircle /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.rejected}</S.StatNumber>
            <S.StatLabel>Admin từ chối</S.StatLabel>
          </S.StatContent>
        </S.StatCard>

        <S.StatCard color="#95a5a6" onClick={() => setStatusFilter("REJECTED_BY_CUSTOMER")}>
          <S.StatIcon color="#95a5a6"><FaUserCheck /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.customerRejected}</S.StatNumber>
            <S.StatLabel>Khách từ chối</S.StatLabel>
          </S.StatContent>
        </S.StatCard>

        <S.StatCard color="#27ae60" onClick={() => setStatusFilter("CLAIM_CREATED")}>
          <S.StatIcon color="#27ae60"><FaCheckCircle /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.claimCreated}</S.StatNumber>
            <S.StatLabel>Đã tạo claim</S.StatLabel>
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
            placeholder="Tìm theo ID, xe, khách hàng, lý do..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </S.SearchBox>

        <S.FilterGroup>
          <S.FilterLabel><FaFilter /> Trạng thái:</S.FilterLabel>
          <S.FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">Tất cả</option>
            <option value="PENDING_ADMIN_APPROVAL">Chờ duyệt</option>
            <option value="WAITING_CUSTOMER_CONFIRM">Chờ khách hàng</option>
            <option value="REJECTED_BY_ADMIN">Admin từ chối</option>
            <option value="REJECTED_BY_CUSTOMER">Khách từ chối</option>
            <option value="CLAIM_CREATED">Đã tạo claim</option>
            <option value="COMPLETED">Đã hoàn thành</option>
          </S.FilterSelect>
        </S.FilterGroup>
      </S.FilterBar>

      <S.ResultsInfo>
        Hiển thị <strong>{filteredRecalls.length}</strong> / <strong>{recalls.length}</strong> yêu cầu
      </S.ResultsInfo>

      {filteredRecalls.length === 0 ? (
        <S.EmptyState>
          <FaExclamationTriangle size={64} />
          <p>Không tìm thấy yêu cầu recall nào</p>
        </S.EmptyState>
      ) : (
        <S.Table>
          <S.TableHeader>
            <tr>
              <S.TableHeaderCell>ID</S.TableHeaderCell>
              <S.TableHeaderCell>Xe</S.TableHeaderCell>
              <S.TableHeaderCell>Khách hàng</S.TableHeaderCell>
              <S.TableHeaderCell>Phụ tùng</S.TableHeaderCell>
              <S.TableHeaderCell>Lý do</S.TableHeaderCell>
              <S.TableHeaderCell>Người tạo</S.TableHeaderCell>
              <S.TableHeaderCell>Ngày tạo</S.TableHeaderCell>
              <S.TableHeaderCell>Trạng thái</S.TableHeaderCell>
              <S.TableHeaderCell>Hành động</S.TableHeaderCell>
            </tr>
          </S.TableHeader>
          <S.TableBody>
            {filteredRecalls.map((recall) => {
                // Handle both nested and flat data structures
                const vehicleInfo = recall.vehicleName || recall.installedPart?.vehicle?.model || 'N/A';
                const vehicleVin = recall.vehicleId || recall.installedPart?.vehicle?.vin || 'N/A';
                const customerName = recall.customerName || recall.installedPart?.vehicle?.customer?.user?.fullName || 'N/A';
                const partName = recall.partName || recall.installedPart?.part?.partName || 'N/A';
                const partNumber = recall.installedPart?.part?.partNumber || '';
                const creatorName = recall.createdByName || recall.createdBy?.fullName || 'N/A';

                return (
                    <S.TableRow key={recall.recallRequestId}>
                        <S.TableCell>#{recall.recallRequestId}</S.TableCell>
                        <S.TableCell>
                            <div style={{fontWeight: '500'}}>{vehicleInfo}</div>
                            <small style={{color: '#7f8c8d'}}>VIN: {vehicleVin}</small>
                        </S.TableCell>
                        <S.TableCell>
                            <div style={{fontWeight: '500'}}>{customerName}</div>
                        </S.TableCell>
                        <S.TableCell>
                            <div style={{fontWeight: '500'}}>{partName}</div>
                            {partNumber && <small style={{color: '#7f8c8d'}}>{partNumber}</small>}
                        </S.TableCell>
                        <S.TableCell>
                            <div style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                {recall.reason?.length > 50
                                    ? recall.reason.substring(0, 50) + "..."
                                    : recall.reason || 'N/A'}
                            </div>
                        </S.TableCell>
                        <S.TableCell>
                            <div style={{fontWeight: '500'}}>{creatorName}</div>
                        </S.TableCell>
                        <S.TableCell>
                            {recall.createdAt ? new Date(recall.createdAt).toLocaleDateString('vi-VN') : "N/A"}
                        </S.TableCell>
                        <S.TableCell>
                            {getStatusBadge(recall.status)}
                        </S.TableCell>
                        <S.TableCell>
                            <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
                                <S.ActionButton onClick={() => openDetailModal(recall)}>
                                    <FaEye/> Chi tiết
                                </S.ActionButton>
                                {recall.status === "PENDING_ADMIN_APPROVAL" && (
                                    <>
                                        <S.ActionButton
                                            style={{background: "#27ae60"}}
                                            onClick={() => openApproveModal(recall)}
                                        >
                                            <FaCheckCircle/> Duyệt
                                        </S.ActionButton>
                                        <S.ActionButton
                                            style={{background: "#e74c3c"}}
                                            onClick={() => openRejectModal(recall)}
                                        >
                                            <FaTimesCircle/> Từ chối
                                        </S.ActionButton>
                                    </>
                                )}
                            </div>
                        </S.TableCell>
                    </S.TableRow>
                )
            })}
          </S.TableBody>
        </S.Table>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRecall && (
        <S.ModalOverlay onClick={() => !submitting && setShowApproveModal(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <h2>
                <FaCheckCircle /> Phê duyệt Recall
              </h2>
              <S.CloseButton onClick={() => !submitting && setShowApproveModal(false)}>
                &times;
              </S.CloseButton>
            </S.ModalHeader>
            <S.Form onSubmit={handleApprove}>
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
                <S.Label>Khách hàng:</S.Label>
                <S.Input
                  type="text"
                  value={selectedRecall.installedPart?.vehicle?.customer?.user?.fullName || "N/A"}
                  disabled
                />
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>Lý do recall:</S.Label>
                <S.TextArea value={selectedRecall.reason} disabled />
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>Ghi chú của Admin (tùy chọn):</S.Label>
                <S.TextArea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Nhập ghi chú nếu cần..."
                  disabled={submitting}
                />
              </S.FormGroup>
              <S.ModalFooter>
                <S.Button type="button" onClick={() => setShowApproveModal(false)} disabled={submitting}>
                  Hủy
                </S.Button>
                <S.Button primary type="submit" disabled={submitting}>
                  {submitting ? <><FaSpinner className="spinner" /> Đang xử lý...</> : <><FaCheckCircle /> Phê duyệt</>}
                </S.Button>
              </S.ModalFooter>
            </S.Form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRecall && (
        <S.ModalOverlay onClick={() => !submitting && setShowRejectModal(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <h2><FaTimesCircle /> Từ chối Recall</h2>
              <S.CloseButton onClick={() => !submitting && setShowRejectModal(false)}>&times;</S.CloseButton>
            </S.ModalHeader>
            <S.Form onSubmit={handleReject}>
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
                <S.Label>Lý do recall:</S.Label>
                <S.TextArea value={selectedRecall.reason} disabled />
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>Lý do từ chối: *</S.Label>
                <S.TextArea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối yêu cầu recall..."
                  required
                  disabled={submitting}
                />
              </S.FormGroup>
              <S.ModalFooter>
                <S.Button type="button" onClick={() => setShowRejectModal(false)} disabled={submitting}>
                  Hủy
                </S.Button>
                <S.Button danger type="submit" disabled={submitting}>
                  {submitting ? <><FaSpinner className="spinner" /> Đang xử lý...</> : <><FaTimesCircle /> Từ chối</>}
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
                  <S.DetailLabel>Người tạo:</S.DetailLabel>
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
                  <S.DetailLabel>Khách hàng:</S.DetailLabel>
                  <S.DetailValue>
                    {selectedRecall.installedPart?.vehicle?.customer?.user?.fullName || "N/A"}
                  </S.DetailValue>
                </S.DetailItem>
              </S.DetailSection>

              <S.DetailSection fullWidth>
                <S.SectionTitle>Thông tin Phụ tùng</S.SectionTitle>
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
                  <S.SectionTitle>Ghi chú Admin</S.SectionTitle>
                  <S.DetailValue>{selectedRecall.adminNote}</S.DetailValue>
                </S.DetailSection>
              )}

              {selectedRecall.approvedBy && (
                <S.DetailSection>
                  <S.SectionTitle>Người phê duyệt</S.SectionTitle>
                  <S.DetailValue>{selectedRecall.approvedBy.fullName || "N/A"}</S.DetailValue>
                </S.DetailSection>
              )}

              {selectedRecall.customerNote && (
                <S.DetailSection fullWidth>
                  <S.SectionTitle>Phản hồi Khách hàng</S.SectionTitle>
                  <S.DetailValue>{selectedRecall.customerNote}</S.DetailValue>
                </S.DetailSection>
              )}

              {selectedRecall.warrantyClaim && (
                <S.DetailSection fullWidth>
                  <S.SectionTitle>Warranty Claim đã tạo</S.SectionTitle>
                  <S.DetailItem>
                    <S.DetailLabel>Claim ID:</S.DetailLabel>
                    <S.DetailValue>#{selectedRecall.warrantyClaim.warrantyClaimId}</S.DetailValue>
                  </S.DetailItem>
                </S.DetailSection>
              )}
            </S.DetailGrid>
            <S.ModalFooter>
              <S.Button onClick={() => setShowDetailModal(false)}>Đóng</S.Button>
            </S.ModalFooter>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </S.Container>
  );
}
