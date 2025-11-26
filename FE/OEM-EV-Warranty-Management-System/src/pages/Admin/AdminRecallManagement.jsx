import React, { useState, useEffect } from "react";
import * as S from "./AdminRecallManagement.styles";
import {
  FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaClock,
  FaHourglassHalf, FaUserCheck, FaFileAlt, FaSearch, FaFilter,
  FaSpinner, FaEye, FaList, FaSort, FaSortUp, FaSortDown
} from "react-icons/fa";
import { recallRequestsApi } from "../../api/recallRequests";
import { recallResponsesApi } from "../../api/recallResponses";
import { dataApi } from "../../api/dataApi";

export default function AdminRecallManagement() {
  const [recalls, setRecalls] = useState([]);
  const [filteredRecalls, setFilteredRecalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [selectedRecall, setSelectedRecall] = useState(null);

  const [adminNote, setAdminNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [responses, setResponses] = useState([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefreshing, setAutoRefreshing] = useState(false);

  const [sortConfig, setSortConfig] = useState({ key: 'recallRequestId', direction: 'DESC' });

  useEffect(() => {
    fetchRecalls();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [recalls, searchTerm, statusFilter, sortConfig]);

  // Auto-refresh when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && lastUpdated) {
        const timeSinceUpdate = Date.now() - lastUpdated.getTime();
        // Refresh if more than 30s since last update
        if (timeSinceUpdate > 30000) {
          console.log('🔄 Auto-refreshing (tab became visible)');
          fetchRecalls(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [lastUpdated]);

  // Smart polling: auto-refresh every 30s when there are pending items
  useEffect(() => {
    const hasPendingItems = recalls.some(r =>
      r.status === 'PENDING_ADMIN_APPROVAL' ||
      r.status === 'WAITING_CUSTOMER_CONFIRM'
    );

    if (hasPendingItems) {
      console.log('⏰ Smart polling enabled (pending items detected)');
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing (smart polling)');
        fetchRecalls(true);
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [recalls]);

  const fetchRecalls = async (silent = false) => {
    try {
      if (silent) {
        setAutoRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await recallRequestsApi.getAllForAdmin();
      console.log('📋 Recall Requests loaded:', response);
      setRecalls(response?.content || response || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching recalls:", error);
      if (!silent) {
        alert("Không thể tải danh sách yêu cầu recall");
      }
    } finally {
      setLoading(false);
      setAutoRefreshing(false);
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
        r.partName?.toLowerCase().includes(term) ||
        r.partNumber?.toLowerCase().includes(term) ||
        r.reason?.toLowerCase().includes(term) ||
        r.createdByUsername?.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle null/undefined
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Convert to lowercase for string comparison
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortConfig.direction === 'ASC' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ASC' ? 1 : -1;
      return 0;
    });

    setFilteredRecalls(filtered);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort style={{ color: '#ccc', marginLeft: '5px' }} />;
    if (sortConfig.direction === 'ASC') return <FaSortUp style={{ color: '#3498db', marginLeft: '5px' }} />;
    return <FaSortDown style={{ color: '#3498db', marginLeft: '5px' }} />;
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!selectedRecall) return;

    try {
      setSubmitting(true);
      await recallRequestsApi.approve(selectedRecall.recallRequestId, {
        adminNote: adminNote.trim() || null
      });
      alert("✅ Đã phê duyệt yêu cầu recall! Hệ thống sẽ tự động tạo RecallResponse cho các xe bị ảnh hưởng.");
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
      await recallRequestsApi.reject(selectedRecall.recallRequestId, {
        rejectionReason: rejectReason.trim()
      });
      alert("❌ Đã từ chối yêu cầu recall");
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

  const fetchResponses = async (recallRequestId) => {
    try {
      setLoadingResponses(true);
      const data = await recallResponsesApi.getByCampaign(recallRequestId);
      console.log('📋 Recall Responses loaded:', data);
      
      // Enrich responses with vehicle and customer details
      const enrichedResponses = await Promise.all(
        (data || []).map(async (response) => {
          try {
            if (response.vehicleId) {
              const vehicleDetails = await dataApi.getVehicleById(response.vehicleId);
              console.log('🚗 Vehicle details for', response.vehicleId, ':', vehicleDetails);
              return {
                ...response,
                customerName: vehicleDetails.customerName || 'N/A',
              };
            }
            return response;
          } catch (error) {
            console.error('Error fetching vehicle details for', response.vehicleId, ':', error);
            return response;
          }
        })
      );
      
      setResponses(enrichedResponses);
    } catch (error) {
      console.error('Error fetching recall responses:', error);
      alert('Không thể tải danh sách responses');
    } finally {
      setLoadingResponses(false);
    }
  };

  const openResponsesModal = (recall) => {
    setSelectedRecall(recall);
    fetchResponses(recall.recallRequestId);
    setShowResponsesModal(true);
  };

  const getStatusBadge = (status) => {
    // RecallRequest statuses (campaign-level)
    const statusMap = {
      PENDING_ADMIN_APPROVAL: { color: "#f39c12", label: "Chờ duyệt", icon: <FaClock /> },
      APPROVED_BY_ADMIN: { color: "#27ae60", label: "Admin đã duyệt", icon: <FaCheckCircle /> },
      REJECTED_BY_ADMIN: { color: "#e74c3c", label: "Admin từ chối", icon: <FaTimesCircle /> },
      WAITING_CUSTOMER_CONFIRM: { color: "#3498db", label: "Chờ khách hàng", icon: <FaHourglassHalf /> },
      COMPLETED: { color: "#1a73e8", label: "Hoàn thành", icon: <FaCheckCircle /> }
    };
    const config = statusMap[status] || { color: "#7f8c8d", label: status, icon: <FaFileAlt /> };
    return (
      <S.StatusBadge color={config.color}>
        {config.icon} {config.label}
      </S.StatusBadge>
    );
  };

  const getResponseStatusBadge = (status) => {
    // RecallResponse statuses (individual-level)
    const statusMap = {
      PENDING: { color: "#3498db", label: "Chờ xác nhận", icon: <FaClock /> },
      ACCEPTED: { color: "#27ae60", label: "Đã chấp nhận", icon: <FaCheckCircle /> },
      DECLINED: { color: "#e74c3c", label: "Đã từ chối", icon: <FaTimesCircle /> },
      IN_PROGRESS: { color: "#f39c12", label: "Đang sửa chữa", icon: <FaSpinner /> },
      COMPLETED: { color: "#1a73e8", label: "Hoàn thành", icon: <FaCheckCircle /> }
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
      approved: recalls.filter(r => r.status === "APPROVED_BY_ADMIN").length,
      waitingCustomer: recalls.filter(r => r.status === "WAITING_CUSTOMER_CONFIRM").length,
      rejected: recalls.filter(r => r.status === "REJECTED_BY_ADMIN").length,
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

  const getTimeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'vừa xong';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <S.Container>
      <S.Header>
        <div>
          <h1>
            <FaExclamationTriangle /> Quản lý Yêu cầu Recall
          </h1>
          <p>Phê duyệt hoặc từ chối yêu cầu recall từ EVM Staff</p>
          {lastUpdated && (
            <small style={{ color: '#7f8c8d', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              {autoRefreshing && <FaSpinner className="spinner" style={{ fontSize: '12px' }} />}
              Cập nhật: {getTimeAgo(lastUpdated)}
              {recalls.some(r => r.status === 'PENDING_ADMIN_APPROVAL' || r.status === 'WAITING_CUSTOMER_CONFIRM') && (
                <span style={{ color: '#27ae60' }}>• Auto-refresh đang bật</span>
              )}
            </small>
          )}
        </div>
      </S.Header>

      <S.StatsGrid>
        <S.StatCard color="#667eea" onClick={() => setStatusFilter("ALL")}>
          <S.StatIcon color="#667eea"><FaFileAlt /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.total}</S.StatNumber>
            <S.StatLabel>Tổng chiến dịch</S.StatLabel>
          </S.StatContent>
        </S.StatCard>

        <S.StatCard color="#f39c12" onClick={() => setStatusFilter("PENDING_ADMIN_APPROVAL")}>
          <S.StatIcon color="#f39c12"><FaClock /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.pending}</S.StatNumber>
            <S.StatLabel>Chờ duyệt</S.StatLabel>
          </S.StatContent>
        </S.StatCard>

        <S.StatCard color="#27ae60" onClick={() => setStatusFilter("APPROVED_BY_ADMIN")}>
          <S.StatIcon color="#27ae60"><FaCheckCircle /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.approved}</S.StatNumber>
            <S.StatLabel>Admin đã duyệt</S.StatLabel>
          </S.StatContent>
        </S.StatCard>

        <S.StatCard color="#3498db" onClick={() => setStatusFilter("WAITING_CUSTOMER_CONFIRM")}>
          <S.StatIcon color="#3498db"><FaHourglassHalf /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.waitingCustomer}</S.StatNumber>
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
            placeholder="Tìm theo ID, phụ tùng, lý do, người tạo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </S.SearchBox>

        <S.FilterGroup>
          <S.FilterLabel><FaFilter /> Trạng thái:</S.FilterLabel>
          <S.FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">Tất cả</option>
            <option value="PENDING_ADMIN_APPROVAL">Chờ duyệt</option>
            <option value="APPROVED_BY_ADMIN">Admin đã duyệt</option>
            <option value="WAITING_CUSTOMER_CONFIRM">Chờ khách hàng</option>
            <option value="REJECTED_BY_ADMIN">Admin từ chối</option>
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
              <S.TableHeaderCell onClick={() => handleSort('recallRequestId')} style={{ cursor: 'pointer' }}>
                ID {renderSortIcon('recallRequestId')}
              </S.TableHeaderCell>
              <S.TableHeaderCell onClick={() => handleSort('partName')} style={{ cursor: 'pointer' }}>
                Phụ tùng bị lỗi {renderSortIcon('partName')}
              </S.TableHeaderCell>
              <S.TableHeaderCell onClick={() => handleSort('reason')} style={{ cursor: 'pointer' }}>
                Lý do Recall {renderSortIcon('reason')}
              </S.TableHeaderCell>
              <S.TableHeaderCell onClick={() => handleSort('createdByUsername')} style={{ cursor: 'pointer' }}>
                Người tạo {renderSortIcon('createdByUsername')}
              </S.TableHeaderCell>
              <S.TableHeaderCell onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>
                Ngày tạo {renderSortIcon('createdAt')}
              </S.TableHeaderCell>
              <S.TableHeaderCell onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                Trạng thái {renderSortIcon('status')}
              </S.TableHeaderCell>
              <S.TableHeaderCell>Hành động</S.TableHeaderCell>
            </tr>
          </S.TableHeader>
          <S.TableBody>
            {filteredRecalls.map((recall) => (
              <S.TableRow key={recall.recallRequestId}>
                <S.TableCell>#{recall.recallRequestId}</S.TableCell>
                <S.TableCell>
                  <div style={{ fontWeight: '500' }}>{recall.partName || 'N/A'}</div>
                  <small style={{ color: '#7f8c8d' }}>{recall.partNumber || 'N/A'}</small>
                </S.TableCell>
                <S.TableCell>
                  <div style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {recall.reason?.length > 60
                      ? recall.reason.substring(0, 60) + "..."
                      : recall.reason || 'N/A'}
                  </div>
                </S.TableCell>
                <S.TableCell>
                  <div style={{ fontWeight: '500' }}>{recall.createdByUsername || 'N/A'}</div>
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
                    {recall.status === "PENDING_ADMIN_APPROVAL" && (
                      <>
                        <S.ActionButton
                          style={{ background: "#27ae60" }}
                          onClick={() => openApproveModal(recall)}
                        >
                          <FaCheckCircle /> Duyệt
                        </S.ActionButton>
                        <S.ActionButton
                          style={{ background: "#e74c3c" }}
                          onClick={() => openRejectModal(recall)}
                        >
                          <FaTimesCircle /> Từ chối
                        </S.ActionButton>
                      </>
                    )}
                  </div>
                </S.TableCell>
              </S.TableRow>
            ))}
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
                <S.Label>Recall Campaign ID:</S.Label>
                <S.Input type="text" value={`#${selectedRecall.recallRequestId}`} disabled />
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>Phụ tùng bị lỗi:</S.Label>
                <S.Input
                  type="text"
                  value={`${selectedRecall.partName || 'N/A'} (${selectedRecall.partNumber || 'N/A'})`}
                  disabled
                />
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>Lý do recall:</S.Label>
                <S.TextArea value={selectedRecall.reason || 'N/A'} disabled />
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>Người tạo yêu cầu:</S.Label>
                <S.Input
                  type="text"
                  value={selectedRecall.createdByUsername || "N/A"}
                  disabled
                />
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
              <S.InfoBox>
                <FaExclamationTriangle />
                <div>
                  <strong>Lưu ý:</strong> Khi bạn phê duyệt, hệ thống sẽ tự động tạo RecallResponse cho tất cả các xe đang sử dụng phụ tùng này.
                </div>
              </S.InfoBox>
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
                <S.Label>Recall Campaign ID:</S.Label>
                <S.Input type="text" value={`#${selectedRecall.recallRequestId}`} disabled />
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>Phụ tùng bị lỗi:</S.Label>
                <S.Input
                  type="text"
                  value={`${selectedRecall.partName || 'N/A'} (${selectedRecall.partNumber || 'N/A'})`}
                  disabled
                />
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>Lý do recall:</S.Label>
                <S.TextArea value={selectedRecall.reason || 'N/A'} disabled />
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
                <S.SectionTitle>Thông tin Chiến dịch Recall</S.SectionTitle>
                <S.DetailItem>
                  <S.DetailLabel>Campaign ID:</S.DetailLabel>
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
                  <S.DetailValue>{selectedRecall.createdByUsername || "N/A"}</S.DetailValue>
                </S.DetailItem>
              </S.DetailSection>

              <S.DetailSection fullWidth>
                <S.SectionTitle>Thông tin Phụ tùng bị lỗi</S.SectionTitle>
                <S.DetailItem>
                  <S.DetailLabel>Tên phụ tùng:</S.DetailLabel>
                  <S.DetailValue>{selectedRecall.partName || "N/A"}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Mã phụ tùng:</S.DetailLabel>
                  <S.DetailValue>{selectedRecall.partNumber || "N/A"}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Nhà sản xuất:</S.DetailLabel>
                  <S.DetailValue>{selectedRecall.manufacturer || "N/A"}</S.DetailValue>
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

              {selectedRecall.approvedByUsername && (
                <S.DetailSection>
                  <S.SectionTitle>Người phê duyệt</S.SectionTitle>
                  <S.DetailItem>
                    <S.DetailLabel>Admin:</S.DetailLabel>
                    <S.DetailValue>{selectedRecall.approvedByUsername || "N/A"}</S.DetailValue>
                  </S.DetailItem>
                </S.DetailSection>
              )}

              {selectedRecall.rejectionReason && (
                <S.DetailSection fullWidth>
                  <S.SectionTitle>Lý do từ chối</S.SectionTitle>
                  <S.DetailValue>{selectedRecall.rejectionReason}</S.DetailValue>
                </S.DetailSection>
              )}
            </S.DetailGrid>
            <S.ModalFooter>
              {(selectedRecall.status === 'APPROVED_BY_ADMIN' ||
                selectedRecall.status === 'WAITING_CUSTOMER_CONFIRM' ||
                selectedRecall.status === 'COMPLETED') && (
                <S.Button
                  primary
                  onClick={() => {
                    setShowDetailModal(false);
                    openResponsesModal(selectedRecall);
                  }}
                >
                  <FaList /> Xem Responses ({responses.length || '?'})
                </S.Button>
              )}
              <S.Button onClick={() => setShowDetailModal(false)}>Đóng</S.Button>
            </S.ModalFooter>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {/* Responses Modal */}
      {showResponsesModal && selectedRecall && (
        <S.ModalOverlay onClick={() => setShowResponsesModal(false)}>
          <S.ModalContent large onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <h2><FaList /> Responses cho Campaign #{selectedRecall.recallRequestId}</h2>
              <S.CloseButton onClick={() => setShowResponsesModal(false)}>&times;</S.CloseButton>
            </S.ModalHeader>

            {loadingResponses ? (
              <S.LoadingContainer style={{ minHeight: '200px' }}>
                <FaSpinner className="spinner" />
                <p>Đang tải responses...</p>
              </S.LoadingContainer>
            ) : responses.length === 0 ? (
              <S.EmptyState style={{ margin: '40px' }}>
                <FaExclamationTriangle size={48} />
                <p>Chưa có response nào cho campaign này</p>
              </S.EmptyState>
            ) : (
              <div style={{ padding: '24px' }}>
                <S.InfoBox>
                  <FaCheckCircle />
                  <div>
                    <strong>Tổng quan:</strong> {responses.length} xe bị ảnh hưởng
                    <ul style={{ margin: '8px 0 0 20px', paddingLeft: '0' }}>
                      <li>Chờ xác nhận: {responses.filter(r => r.status === 'PENDING').length}</li>
                      <li>Đã chấp nhận: {responses.filter(r => r.status === 'ACCEPTED').length}</li>
                      <li>Đã từ chối: {responses.filter(r => r.status === 'DECLINED').length}</li>
                      <li>Đang sửa: {responses.filter(r => r.status === 'IN_PROGRESS').length}</li>
                      <li>Hoàn thành: {responses.filter(r => r.status === 'COMPLETED').length}</li>
                    </ul>
                  </div>
                </S.InfoBox>

                <S.Table style={{ marginTop: '20px' }}>
                  <S.TableHeader>
                    <tr>
                      <S.TableHeaderCell>ID</S.TableHeaderCell>
                      <S.TableHeaderCell>Xe</S.TableHeaderCell>
                      <S.TableHeaderCell>Khách hàng</S.TableHeaderCell>
                      <S.TableHeaderCell>Ngày tạo</S.TableHeaderCell>
                      <S.TableHeaderCell>Trạng thái</S.TableHeaderCell>
                      <S.TableHeaderCell>Ghi chú</S.TableHeaderCell>
                    </tr>
                  </S.TableHeader>
                  <S.TableBody>
                    {responses.map((response) => (
                      <S.TableRow key={response.recallResponseId}>
                        <S.TableCell>#{response.recallResponseId}</S.TableCell>
                        <S.TableCell>
                          <div style={{ fontWeight: '500' }}>{response.vehicleModel || 'N/A'}</div>
                          <small style={{ color: '#7f8c8d', fontFamily: 'monospace' }}>{response.vehicleVin || 'N/A'}</small>
                        </S.TableCell>
                        <S.TableCell>
                          <div style={{ fontWeight: '500' }}>{response.customerName || 'N/A'}</div>
                        </S.TableCell>
                        <S.TableCell>
                          {response.createdAt ? new Date(response.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                        </S.TableCell>
                        <S.TableCell>
                          {getResponseStatusBadge(response.status)}
                        </S.TableCell>
                        <S.TableCell>
                          {response.customerNote || '-'}
                        </S.TableCell>
                      </S.TableRow>
                    ))}
                  </S.TableBody>
                </S.Table>
              </div>
            )}

            <S.ModalFooter>
              <S.Button onClick={() => setShowResponsesModal(false)}>Đóng</S.Button>
            </S.ModalFooter>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </S.Container>
  );
}
