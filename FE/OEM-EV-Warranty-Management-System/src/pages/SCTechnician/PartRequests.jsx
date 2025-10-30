import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import * as S from './PartRequests.styles';
import {
  FaTools,
  FaSpinner,
  FaPlus,
  FaEye,
  FaTimes,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaTruck,
  FaBoxOpen,
  FaFilter,
  FaSyncAlt
} from 'react-icons/fa';

const PartRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Form state
  const [formData, setFormData] = useState({
    warrantyClaimId: '',
    faultyPartId: '',
    serviceCenterId: '',
    issueDescription: '',
    quantity: 1
  });

  // Danh sách để chọn
  const [claims, setClaims] = useState([]);
  const [parts, setParts] = useState([]);
  const [serviceCenters, setServiceCenters] = useState([]);

  // Statistics
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    shipped: 0,
    delivered: 0,
    rejected: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchMyRequests();
    fetchClaims();
    fetchParts();
    fetchServiceCenters();
  }, []);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient('/api/part-requests/my-requests?page=0&size=100&sortBy=requestDate&sortDir=DESC');
      setRequests(response.content || []);
      calculateStats(response.content || []);
    } catch (error) {
      console.error('Error fetching part requests:', error);
      alert('Không thể tải danh sách yêu cầu linh kiện');
    } finally {
      setLoading(false);
    }
  };

  const fetchClaims = async () => {
    try {
      // Use tech-pending endpoint for SC_TECHNICIAN to get claims they can work on
      const response = await apiClient('/api/warranty-claims/tech-pending?page=0&size=100');
      setClaims(response.content || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
    }
  };

  const fetchParts = async () => {
    try {
      const response = await apiClient('/api/parts?page=0&size=1000');
      setParts(response.content || []);
    } catch (error) {
      console.error('Error fetching parts:', error);
    }
  };

  const fetchServiceCenters = async () => {
    try {
      const response = await apiClient('/api/service-centers?page=0&size=100');
      setServiceCenters(response.content || []);
    } catch (error) {
      console.error('Error fetching service centers:', error);
    }
  };

  const calculateStats = (data) => {
    const newStats = {
      pending: data.filter(r => r.status === 'PENDING').length,
      approved: data.filter(r => r.status === 'APPROVED').length,
      shipped: data.filter(r => r.status === 'SHIPPED').length,
      delivered: data.filter(r => r.status === 'DELIVERED').length,
      rejected: data.filter(r => r.status === 'REJECTED').length,
      cancelled: data.filter(r => r.status === 'CANCELLED').length
    };
    setStats(newStats);
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();

    if (!formData.warrantyClaimId || !formData.faultyPartId || !formData.serviceCenterId || !formData.issueDescription) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      // Convert IDs to numbers before sending
      const requestData = {
        ...formData,
        warrantyClaimId: parseInt(formData.warrantyClaimId),
        faultyPartId: parseInt(formData.faultyPartId),
        serviceCenterId: parseInt(formData.serviceCenterId),
        quantity: parseInt(formData.quantity) || 1
      };

      await apiClient('/api/part-requests', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      alert('Tạo yêu cầu linh kiện thành công!');
      setShowCreateModal(false);
      setFormData({
        warrantyClaimId: '',
        faultyPartId: '',
        serviceCenterId: '',
        issueDescription: '',
        quantity: 1
      });
      fetchMyRequests();
    } catch (error) {
      console.error('Error creating part request:', error);
      alert('Không thể tạo yêu cầu linh kiện: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!confirm('Bạn có chắc muốn hủy yêu cầu này không?')) {
      return;
    }

    try {
      await apiClient(`/api/part-requests/${requestId}/cancel`, {
        method: 'PATCH'
      });

      alert('Hủy yêu cầu thành công!');
      fetchMyRequests();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert('Không thể hủy yêu cầu: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  const handleConfirmDelivered = async (requestId) => {
    if (!confirm('Xác nhận đã nhận được linh kiện?')) {
      return;
    }

    try {
      await apiClient(`/api/part-requests/${requestId}/deliver`, {
        method: 'PATCH'
      });

      alert('Xác nhận đã nhận hàng thành công!');
      fetchMyRequests();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error confirming delivery:', error);
      alert('Không thể xác nhận: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: 'Chờ duyệt', icon: <FaClock />, color: '#ffc107' },
      APPROVED: { label: 'Đã duyệt', icon: <FaCheckCircle />, color: '#28a745' },
      SHIPPED: { label: 'Đang vận chuyển', icon: <FaTruck />, color: '#17a2b8' },
      DELIVERED: { label: 'Đã giao', icon: <FaBoxOpen />, color: '#6c757d' },
      REJECTED: { label: 'Từ chối', icon: <FaTimesCircle />, color: '#dc3545' },
      CANCELLED: { label: 'Đã hủy', icon: <FaTimes />, color: '#6c757d' }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return config;
  };

  const filteredRequests = filterStatus === 'ALL'
    ? requests
    : requests.filter(r => r.status === filterStatus);

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
        <div>
          <h1><FaTools /> Yêu Cầu Linh Kiện</h1>
          <p>Quản lý yêu cầu linh kiện thay thế của bạn</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <S.Button onClick={fetchMyRequests} disabled={loading} title="Làm mới dữ liệu">
            <FaSyncAlt style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Làm mới
          </S.Button>
          <S.Button primary onClick={() => setShowCreateModal(true)}>
            <FaPlus /> Tạo Yêu Cầu Mới
          </S.Button>
        </div>
      </S.Header>

      {/* Statistics */}
      <S.StatsGrid>
        <S.StatCard color="#ffc107">
          <S.StatIcon><FaClock /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.pending}</S.StatNumber>
            <S.StatLabel>Chờ duyệt</S.StatLabel>
          </S.StatContent>
        </S.StatCard>
        <S.StatCard color="#28a745">
          <S.StatIcon><FaCheckCircle /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.approved}</S.StatNumber>
            <S.StatLabel>Đã duyệt</S.StatLabel>
          </S.StatContent>
        </S.StatCard>
        <S.StatCard color="#17a2b8">
          <S.StatIcon><FaTruck /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.shipped}</S.StatNumber>
            <S.StatLabel>Đang vận chuyển</S.StatLabel>
          </S.StatContent>
        </S.StatCard>
        <S.StatCard color="#6c757d">
          <S.StatIcon><FaBoxOpen /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.delivered}</S.StatNumber>
            <S.StatLabel>Đã giao</S.StatLabel>
          </S.StatContent>
        </S.StatCard>
      </S.StatsGrid>

      {/* Filter */}
      <S.FilterBar>
        <S.FilterLabel><FaFilter /> Lọc theo trạng thái:</S.FilterLabel>
        <S.FilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="ALL">Tất cả ({requests.length})</option>
          <option value="PENDING">Chờ duyệt ({stats.pending})</option>
          <option value="APPROVED">Đã duyệt ({stats.approved})</option>
          <option value="SHIPPED">Đang vận chuyển ({stats.shipped})</option>
          <option value="DELIVERED">Đã giao ({stats.delivered})</option>
          <option value="REJECTED">Từ chối ({stats.rejected})</option>
          <option value="CANCELLED">Đã hủy ({stats.cancelled})</option>
        </S.FilterSelect>
      </S.FilterBar>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <S.EmptyState>
          <FaTools size={64} />
          <p>Không có yêu cầu linh kiện nào</p>
        </S.EmptyState>
      ) : (
        <S.RequestsGrid>
          {filteredRequests.map((request) => {
            const statusBadge = getStatusBadge(request.status);
            return (
              <S.RequestCard key={request.requestId}>
                <S.CardHeader>
                  <S.RequestId>#{request.requestId}</S.RequestId>
                  <S.StatusBadge color={statusBadge.color}>
                    {statusBadge.icon} {statusBadge.label}
                  </S.StatusBadge>
                </S.CardHeader>

                <S.CardBody>
                  <S.InfoRow>
                    <S.InfoLabel>Claim ID:</S.InfoLabel>
                    <S.InfoValue>#{request.warrantyClaimId}</S.InfoValue>
                  </S.InfoRow>
                  <S.InfoRow>
                    <S.InfoLabel>Linh kiện lỗi:</S.InfoLabel>
                    <S.InfoValue>{request.faultyPartName || request.faultyPartId}</S.InfoValue>
                  </S.InfoRow>
                  <S.InfoRow>
                    <S.InfoLabel>Số lượng:</S.InfoLabel>
                    <S.InfoValue>{request.quantity}</S.InfoValue>
                  </S.InfoRow>
                  <S.InfoRow>
                    <S.InfoLabel>Ngày tạo:</S.InfoLabel>
                    <S.InfoValue>{new Date(request.requestDate).toLocaleDateString('vi-VN')}</S.InfoValue>
                  </S.InfoRow>
                  {request.trackingNumber && (
                    <S.InfoRow>
                      <S.InfoLabel>Mã vận đơn:</S.InfoLabel>
                      <S.InfoValue><strong>{request.trackingNumber}</strong></S.InfoValue>
                    </S.InfoRow>
                  )}
                </S.CardBody>

                <S.CardFooter>
                  <S.Button onClick={() => { setSelectedRequest(request); setShowDetailModal(true); }}>
                    <FaEye /> Chi tiết
                  </S.Button>
                  {request.status === 'PENDING' && (
                    <S.Button danger onClick={() => handleCancelRequest(request.requestId)}>
                      <FaTimes /> Hủy
                    </S.Button>
                  )}
                  {request.status === 'SHIPPED' && (
                    <S.Button primary onClick={() => handleConfirmDelivered(request.requestId)}>
                      <FaCheckCircle /> Xác nhận đã nhận
                    </S.Button>
                  )}
                </S.CardFooter>
              </S.RequestCard>
            );
          })}
        </S.RequestsGrid>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <S.ModalOverlay onClick={() => setShowCreateModal(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <h2>Tạo Yêu Cầu Linh Kiện Mới</h2>
              <S.CloseButton onClick={() => setShowCreateModal(false)}>×</S.CloseButton>
            </S.ModalHeader>

            <S.Form onSubmit={handleCreateRequest}>
              <S.FormGroup>
                <S.Label>Warranty Claim <span style={{color: 'red'}}>*</span></S.Label>
                <S.Select
                  value={formData.warrantyClaimId}
                  onChange={(e) => {
                    const claimId = e.target.value;
                    const selectedClaim = claims.find(c => c.warrantyClaimId === parseInt(claimId));
                    // Auto-fill faultyPartId from claim if available
                    const newFormData = {
                      ...formData,
                      warrantyClaimId: claimId,
                      faultyPartId: selectedClaim?.partId || ''
                    };
                    setFormData(newFormData);
                  }}
                  required
                >
                  <option value="">-- Chọn Claim --</option>
                  {claims.map(claim => (
                    <option key={claim.warrantyClaimId} value={claim.warrantyClaimId}>
                      #{claim.warrantyClaimId} - {claim.description?.substring(0, 50)}
                    </option>
                  ))}
                </S.Select>
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>Linh Kiện Lỗi <span style={{color: 'red'}}>*</span></S.Label>
                <S.Select
                  value={formData.faultyPartId}
                  onChange={(e) => setFormData({...formData, faultyPartId: e.target.value})}
                  required
                  disabled={!formData.warrantyClaimId}
                >
                  <option value="">
                    {!formData.warrantyClaimId
                      ? '-- Chọn Claim trước --'
                      : '-- Chọn Linh Kiện --'}
                  </option>
                  {formData.warrantyClaimId && (() => {
                    const selectedClaim = claims.find(c => c.warrantyClaimId === parseInt(formData.warrantyClaimId));

                    // Nếu claim có partId và partName, hiển thị nó đầu tiên
                    if (selectedClaim && selectedClaim.partId) {
                      const claimPartInList = parts.find(p => p.partId === selectedClaim.partId);

                      if (claimPartInList) {
                        // Part từ claim có trong danh sách parts
                        return (
                          <>
                            <option key={claimPartInList.partId} value={claimPartInList.partId}>
                              ⭐ {claimPartInList.partId} - {claimPartInList.partName} (từ Claim)
                            </option>
                            {parts.filter(p => p.partId !== selectedClaim.partId).map(part => (
                              <option key={part.partId} value={part.partId}>
                                {part.partId} - {part.partName}
                              </option>
                            ))}
                          </>
                        );
                      } else if (selectedClaim.partName) {
                        // Part từ claim chưa có trong danh sách, hiển thị từ thông tin claim
                        return (
                          <>
                            <option key={selectedClaim.partId} value={selectedClaim.partId}>
                              ⭐ {selectedClaim.partId} - {selectedClaim.partName} (từ Claim)
                            </option>
                            {parts.map(part => (
                              <option key={part.partId} value={part.partId}>
                                {part.partId} - {part.partName}
                              </option>
                            ))}
                          </>
                        );
                      }
                    }

                    // Fallback: hiển thị tất cả parts
                    return parts.map(part => (
                      <option key={part.partId} value={part.partId}>
                        {part.partId} - {part.partName}
                      </option>
                    ));
                  })()}
                </S.Select>
                {formData.warrantyClaimId && (() => {
                  const selectedClaim = claims.find(c => c.warrantyClaimId === parseInt(formData.warrantyClaimId));
                  return selectedClaim && selectedClaim.partId ? (
                    <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      ⭐ Linh kiện được tự động chọn từ Claim #{selectedClaim.warrantyClaimId}
                    </small>
                  ) : null;
                })()}
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>Service Center <span style={{color: 'red'}}>*</span></S.Label>
                <S.Select
                  value={formData.serviceCenterId}
                  onChange={(e) => setFormData({...formData, serviceCenterId: e.target.value})}
                  required
                >
                  <option value="">-- Chọn Service Center --</option>
                  {serviceCenters.map(sc => (
                    <option key={sc.serviceCenterId} value={sc.serviceCenterId}>
                      {sc.name} - {sc.address}
                    </option>
                  ))}
                </S.Select>
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>Số Lượng <span style={{color: 'red'}}>*</span></S.Label>
                <S.Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  required
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>Mô Tả Vấn Đề <span style={{color: 'red'}}>*</span></S.Label>
                <S.TextArea
                  rows="4"
                  value={formData.issueDescription}
                  onChange={(e) => setFormData({...formData, issueDescription: e.target.value})}
                  placeholder="Mô tả chi tiết vấn đề của linh kiện (tối thiểu 10 ký tự)"
                  required
                  minLength="10"
                  maxLength="1000"
                />
                <S.CharCount>{formData.issueDescription.length}/1000</S.CharCount>
              </S.FormGroup>

              <S.ModalFooter>
                <S.Button type="button" onClick={() => setShowCreateModal(false)}>
                  Hủy
                </S.Button>
                <S.Button type="submit" primary>
                  <FaPlus /> Tạo Yêu Cầu
                </S.Button>
              </S.ModalFooter>
            </S.Form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <S.ModalOverlay onClick={() => setShowDetailModal(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <h2>Chi Tiết Yêu Cầu #{selectedRequest.requestId}</h2>
              <S.CloseButton onClick={() => setShowDetailModal(false)}>×</S.CloseButton>
            </S.ModalHeader>

            <S.DetailGrid>
              <S.DetailItem>
                <S.DetailLabel>Trạng thái:</S.DetailLabel>
                <S.StatusBadge color={getStatusBadge(selectedRequest.status).color}>
                  {getStatusBadge(selectedRequest.status).icon} {getStatusBadge(selectedRequest.status).label}
                </S.StatusBadge>
              </S.DetailItem>

              <S.DetailItem>
                <S.DetailLabel>Warranty Claim:</S.DetailLabel>
                <S.DetailValue>#{selectedRequest.warrantyClaimId}</S.DetailValue>
              </S.DetailItem>

              <S.DetailItem>
                <S.DetailLabel>Linh kiện lỗi:</S.DetailLabel>
                <S.DetailValue>{selectedRequest.faultyPartName} ({selectedRequest.faultyPartNumber})</S.DetailValue>
              </S.DetailItem>

              <S.DetailItem>
                <S.DetailLabel>Số lượng:</S.DetailLabel>
                <S.DetailValue>{selectedRequest.quantity}</S.DetailValue>
              </S.DetailItem>

              <S.DetailItem>
                <S.DetailLabel>Service Center:</S.DetailLabel>
                <S.DetailValue>{selectedRequest.serviceCenterName}</S.DetailValue>
              </S.DetailItem>

              <S.DetailItem fullWidth>
                <S.DetailLabel>Địa chỉ giao hàng:</S.DetailLabel>
                <S.DetailValue>{selectedRequest.serviceCenterAddress}</S.DetailValue>
              </S.DetailItem>

              <S.DetailItem fullWidth>
                <S.DetailLabel>Mô tả vấn đề:</S.DetailLabel>
                <S.DetailValue>{selectedRequest.issueDescription}</S.DetailValue>
              </S.DetailItem>

              {selectedRequest.trackingNumber && (
                <S.DetailItem fullWidth>
                  <S.DetailLabel>Mã vận đơn:</S.DetailLabel>
                  <S.DetailValue><strong>{selectedRequest.trackingNumber}</strong></S.DetailValue>
                </S.DetailItem>
              )}

              {selectedRequest.rejectionReason && (
                <S.DetailItem fullWidth>
                  <S.DetailLabel>Lý do từ chối:</S.DetailLabel>
                  <S.DetailValue style={{color: '#dc3545'}}>{selectedRequest.rejectionReason}</S.DetailValue>
                </S.DetailItem>
              )}

              {selectedRequest.notes && (
                <S.DetailItem fullWidth>
                  <S.DetailLabel>Ghi chú từ EVM:</S.DetailLabel>
                  <S.DetailValue>{selectedRequest.notes}</S.DetailValue>
                </S.DetailItem>
              )}

              <S.DetailItem>
                <S.DetailLabel>Ngày tạo:</S.DetailLabel>
                <S.DetailValue>{new Date(selectedRequest.requestDate).toLocaleString('vi-VN')}</S.DetailValue>
              </S.DetailItem>

              {selectedRequest.approvedDate && (
                <S.DetailItem>
                  <S.DetailLabel>Ngày duyệt:</S.DetailLabel>
                  <S.DetailValue>{new Date(selectedRequest.approvedDate).toLocaleString('vi-VN')}</S.DetailValue>
                </S.DetailItem>
              )}

              {selectedRequest.shippedDate && (
                <S.DetailItem>
                  <S.DetailLabel>Ngày gửi hàng:</S.DetailLabel>
                  <S.DetailValue>{new Date(selectedRequest.shippedDate).toLocaleString('vi-VN')}</S.DetailValue>
                </S.DetailItem>
              )}

              {selectedRequest.deliveredDate && (
                <S.DetailItem>
                  <S.DetailLabel>Ngày giao hàng:</S.DetailLabel>
                  <S.DetailValue>{new Date(selectedRequest.deliveredDate).toLocaleString('vi-VN')}</S.DetailValue>
                </S.DetailItem>
              )}
            </S.DetailGrid>

            <S.ModalFooter>
              {selectedRequest.status === 'PENDING' && (
                <S.Button danger onClick={() => handleCancelRequest(selectedRequest.requestId)}>
                  <FaTimes /> Hủy Yêu Cầu
                </S.Button>
              )}
              {selectedRequest.status === 'SHIPPED' && (
                <S.Button primary onClick={() => handleConfirmDelivered(selectedRequest.requestId)}>
                  <FaCheckCircle /> Xác Nhận Đã Nhận
                </S.Button>
              )}
              <S.Button onClick={() => setShowDetailModal(false)}>
                Đóng
              </S.Button>
            </S.ModalFooter>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </S.Container>
  );
};

export default PartRequests;
