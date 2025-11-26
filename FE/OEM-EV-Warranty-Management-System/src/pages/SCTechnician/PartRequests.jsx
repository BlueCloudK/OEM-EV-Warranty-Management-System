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
  FaSyncAlt,
  FaTrash
} from 'react-icons/fa';

const PartRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmDeliveredModal, setShowConfirmDeliveredModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Custom confirm modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ message: '', onConfirm: null, type: '' });

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
      // Filter out CANCELLED claims - cannot create part requests for cancelled claims
      const activeClaims = (response.content || []).filter(claim => claim.status !== 'CANCELLED');
      setClaims(activeClaims);
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

  const handleCancelRequest = (requestId) => {
    setConfirmConfig({
      message: 'Bạn có chắc muốn hủy yêu cầu này không?',
      type: 'cancel',
      onConfirm: async () => {
        setShowConfirmModal(false);
        setIsProcessing(true);
        try {
          await apiClient(`/api/part-requests/${requestId}/cancel`, {
            method: 'PATCH'
          });
          fetchMyRequests();
          setShowDetailModal(false);
        } catch (error) {
          console.error('Error cancelling request:', error);
          alert('Không thể hủy yêu cầu: ' + (error.message || 'Lỗi không xác định'));
        } finally {
          setIsProcessing(false);
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleDeleteRequest = (requestId) => {
    setConfirmConfig({
      message: 'Bạn có chắc muốn xóa yêu cầu này không? Hành động này không thể hoàn tác.',
      type: 'delete',
      onConfirm: async () => {
        setShowConfirmModal(false);
        setIsProcessing(true);
        try {
          await apiClient(`/api/part-requests/${requestId}`, {
            method: 'DELETE'
          });
          fetchMyRequests();
          setShowDetailModal(false);
        } catch (error) {
          console.error('Error deleting request:', error);
          alert('Không thể xóa yêu cầu: ' + (error.message || 'Lỗi không xác định'));
        } finally {
          setIsProcessing(false);
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleConfirmDelivered = async (e) => {
    e.preventDefault();

    try {
      await apiClient(`/api/part-requests/${selectedRequest.requestId}/deliver`, {
        method: 'PATCH'
      });

      alert('Xác nhận đã nhận hàng thành công!');
      setShowConfirmDeliveredModal(false);
      setShowDetailModal(false);
      setDeliveryNotes('');
      fetchMyRequests();
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
        <S.TableContainer>
          <S.Table>
            <S.Thead>
              <S.Tr>
                <S.Th>ID</S.Th>
                <S.Th>Claim ID</S.Th>
                <S.Th>Linh kiện</S.Th>
                <S.Th>Số lượng</S.Th>
                <S.Th>Service Center</S.Th>
                <S.Th>Ngày tạo</S.Th>
                <S.Th>Trạng thái</S.Th>
                <S.Th>Hành động</S.Th>
              </S.Tr>
            </S.Thead>
            <S.Tbody>
              {filteredRequests.map((request) => {
                const statusBadge = getStatusBadge(request.status);
                return (
                  <S.Tr key={request.requestId}>
                    <S.Td>#{request.requestId}</S.Td>
                    <S.Td>#{request.warrantyClaimId}</S.Td>
                    <S.Td>
                      <div style={{ fontWeight: 500 }}>{request.faultyPartName || request.faultyPartId}</div>
                      {request.trackingNumber && (
                        <div style={{ fontSize: '12px', color: '#17a2b8', marginTop: '4px' }}>
                          <FaTruck size={10} /> {request.trackingNumber}
                        </div>
                      )}
                    </S.Td>
                    <S.Td>{request.quantity}</S.Td>
                    <S.Td title={request.serviceCenterAddress}>
                      {request.serviceCenterName}
                    </S.Td>
                    <S.Td>{new Date(request.requestDate).toLocaleDateString('vi-VN')}</S.Td>
                    <S.Td>
                      <S.StatusBadge color={statusBadge.color}>
                        {statusBadge.icon} {statusBadge.label}
                      </S.StatusBadge>
                    </S.Td>
                    <S.Td>
                      <S.ActionButtons>
                        <S.Button
                          onClick={() => { setSelectedRequest(request); setShowDetailModal(true); }}
                          title="Xem chi tiết"
                          style={{ padding: '6px 10px' }}
                        >
                          <FaEye />
                        </S.Button>
                        {request.status === 'PENDING' && (
                          <S.Button
                            danger
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelRequest(request.requestId);
                            }}
                            title="Hủy yêu cầu"
                            style={{ padding: '6px 10px' }}
                          >
                            <FaTimes />
                          </S.Button>
                        )}
                        {request.status === 'CANCELLED' && (
                          <S.Button
                            danger
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRequest(request.requestId);
                            }}
                            title="Xóa yêu cầu"
                            style={{ padding: '6px 10px' }}
                          >
                            <FaTrash />
                          </S.Button>
                        )}
                        {request.status === 'SHIPPED' && (
                          <S.Button
                            primary
                            onClick={() => { setSelectedRequest(request); setShowConfirmDeliveredModal(true); }}
                            title="Xác nhận đã nhận"
                            style={{ padding: '6px 10px' }}
                          >
                            <FaCheckCircle />
                          </S.Button>
                        )}
                      </S.ActionButtons>
                    </S.Td>
                  </S.Tr>
                );
              })}
            </S.Tbody>
          </S.Table>
        </S.TableContainer>
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
                <S.Label>Warranty Claim <span style={{ color: 'red' }}>*</span></S.Label>
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
                <S.Label>Linh Kiện Lỗi <span style={{ color: 'red' }}>*</span></S.Label>
                <S.Select
                  value={formData.faultyPartId}
                  onChange={(e) => setFormData({ ...formData, faultyPartId: e.target.value })}
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
                <S.Label>Service Center <span style={{ color: 'red' }}>*</span></S.Label>
                <S.Select
                  value={formData.serviceCenterId}
                  onChange={(e) => setFormData({ ...formData, serviceCenterId: e.target.value })}
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
                <S.Label>Số Lượng <span style={{ color: 'red' }}>*</span></S.Label>
                <S.Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  required
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>Mô Tả Vấn Đề <span style={{ color: 'red' }}>*</span></S.Label>
                <S.TextArea
                  rows="4"
                  value={formData.issueDescription}
                  onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
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
                  <S.DetailValue style={{ color: '#dc3545' }}>{selectedRequest.rejectionReason}</S.DetailValue>
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
                <S.Button primary onClick={() => { setShowDetailModal(false); setShowConfirmDeliveredModal(true); }}>
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

      {/* Confirm Delivered Modal */}
      {showConfirmDeliveredModal && selectedRequest && (
        <S.ModalOverlay onClick={() => setShowConfirmDeliveredModal(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <h2><FaBoxOpen /> Xác Nhận Đã Nhận Hàng</h2>
              <S.CloseButton onClick={() => setShowConfirmDeliveredModal(false)}>×</S.CloseButton>
            </S.ModalHeader>

            <S.Form onSubmit={handleConfirmDelivered}>
              {/* Thông tin đơn hàng */}
              <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#495057' }}>
                  📦 Thông Tin Đơn Hàng
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6c757d' }}>Yêu cầu:</span>
                    <strong>#{selectedRequest.requestId}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6c757d' }}>Linh kiện:</span>
                    <span>{selectedRequest.faultyPartName || selectedRequest.faultyPartId}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6c757d' }}>Số lượng:</span>
                    <strong>{selectedRequest.quantity} chiếc</strong>
                  </div>
                  {selectedRequest.trackingNumber && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6c757d' }}>Mã vận đơn:</span>
                      <strong style={{ color: '#17a2b8' }}>{selectedRequest.trackingNumber}</strong>
                    </div>
                  )}
                  {selectedRequest.shippedDate && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6c757d' }}>Ngày gửi:</span>
                      <span>{new Date(selectedRequest.shippedDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ghi chú */}
              <S.FormGroup>
                <S.Label>📝 Ghi chú khi nhận hàng (tùy chọn):</S.Label>
                <S.TextArea
                  rows="3"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="VD: Đã kiểm tra hàng, tình trạng tốt, đầy đủ số lượng..."
                  maxLength="500"
                />
                <S.CharCount>{deliveryNotes.length}/500</S.CharCount>
              </S.FormGroup>

              {/* Checklist */}
              <div style={{
                background: '#d1ecf1',
                border: '1px solid #bee5eb',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#0c5460' }}>
                  <strong>✅ Vui lòng kiểm tra trước khi xác nhận:</strong>
                  <ul style={{ marginTop: '8px', marginBottom: '0', paddingLeft: '20px' }}>
                    <li>Số lượng linh kiện đúng với yêu cầu</li>
                    <li>Linh kiện còn nguyên tem, seal, không bị hư hỏng</li>
                    <li>Đúng loại linh kiện đã đặt</li>
                    <li>Mã vận đơn (nếu có) khớp với đơn hàng</li>
                  </ul>
                </div>
              </div>

              {/* Confirmation warning */}
              <div style={{
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                <div style={{ fontSize: '0.9rem', color: '#856404' }}>
                  <strong>Xác nhận nhận hàng:</strong> Sau khi xác nhận, trạng thái sẽ chuyển sang
                  <strong> "ĐÃ GIAO"</strong> và bạn có thể tiến hành thay thế linh kiện.
                </div>
              </div>

              <S.ModalFooter>
                <S.Button type="button" onClick={() => setShowConfirmDeliveredModal(false)}>
                  Hủy
                </S.Button>
                <S.Button type="submit" primary>
                  <FaCheckCircle /> Xác Nhận Đã Nhận Đầy Đủ
                </S.Button>
              </S.ModalFooter>
            </S.Form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {/* Custom Confirm Modal */}
      {showConfirmModal && (
        <S.ModalOverlay onClick={() => setShowConfirmModal(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <S.ModalHeader>
              <h2>
                {confirmConfig.type === 'delete' ? '🗑️ Xác nhận xóa' : '⚠️ Xác nhận hủy'}
              </h2>
              <S.CloseButton onClick={() => setShowConfirmModal(false)}>×</S.CloseButton>
            </S.ModalHeader>

            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                {confirmConfig.message}
              </p>
            </div>

            <S.ModalFooter>
              <S.Button onClick={() => setShowConfirmModal(false)}>
                Không
              </S.Button>
              <S.Button
                danger
                onClick={() => {
                  if (confirmConfig.onConfirm) {
                    confirmConfig.onConfirm();
                  }
                }}
                disabled={isProcessing}
              >
                {confirmConfig.type === 'delete' ? 'Xóa' : 'Hủy yêu cầu'}
              </S.Button>
            </S.ModalFooter>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </S.Container>
  );
};

export default PartRequests;
