import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import * as S from './EVMPartRequests.styles';
import {
  FaTools,
  FaSpinner,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaTruck,
  FaClock,
  FaBoxOpen,
  FaFilter,
  FaSearch,
  FaChartBar
} from 'react-icons/fa';

const EVMPartRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Form states
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    shipped: 0,
    delivered: 0,
    rejected: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient('/api/part-requests?page=0&size=500&sortBy=requestDate&sortDir=DESC');
      setRequests(response.content || []);
      calculateStats(response.content || []);
    } catch (error) {
      console.error('Error fetching part requests:', error);
      alert('Không thể tải danh sách yêu cầu linh kiện');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient('/api/part-requests/pending?page=0&size=500');
      setRequests(response.content || []);
      setFilterStatus('PENDING');
      calculateStats(response.content || []);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      alert('Không thể tải danh sách yêu cầu chờ duyệt');
    } finally {
      setLoading(false);
    }
  };

  const fetchInTransitRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient('/api/part-requests/in-transit?page=0&size=500');
      setRequests(response.content || []);
      setFilterStatus('SHIPPED');
      calculateStats(response.content || []);
    } catch (error) {
      console.error('Error fetching in-transit requests:', error);
      alert('Không thể tải danh sách đang vận chuyển');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const newStats = {
      total: data.length,
      pending: data.filter(r => r.status === 'PENDING').length,
      approved: data.filter(r => r.status === 'APPROVED').length,
      shipped: data.filter(r => r.status === 'SHIPPED').length,
      delivered: data.filter(r => r.status === 'DELIVERED').length,
      rejected: data.filter(r => r.status === 'REJECTED').length,
      cancelled: data.filter(r => r.status === 'CANCELLED').length
    };
    setStats(newStats);
  };

  const handleApprove = async (e) => {
    e.preventDefault();

    try {
      await apiClient(`/api/part-requests/${selectedRequest.requestId}/approve?note=${encodeURIComponent(approveNotes || '')}`, {
        method: 'PATCH'
      });

      alert('Đã duyệt yêu cầu thành công!');
      setShowApproveModal(false);
      setShowDetailModal(false);
      setApproveNotes('');
      fetchAllRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Không thể duyệt yêu cầu: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();

    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      await apiClient(`/api/part-requests/${selectedRequest.requestId}/reject?note=${encodeURIComponent(rejectReason)}`, {
        method: 'PATCH'
      });

      alert('Đã từ chối yêu cầu!');
      setShowRejectModal(false);
      setShowDetailModal(false);
      setRejectReason('');
      fetchAllRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Không thể từ chối yêu cầu: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  const handleShip = async (e) => {
    e.preventDefault();

    try {
      await apiClient(`/api/part-requests/${selectedRequest.requestId}/ship?trackingNumber=${encodeURIComponent(trackingNumber || '')}`, {
        method: 'PATCH'
      });

      alert('Đã cập nhật trạng thái gửi hàng!');
      setShowShipModal(false);
      setShowDetailModal(false);
      setTrackingNumber('');
      fetchAllRequests();
    } catch (error) {
      console.error('Error shipping request:', error);
      alert('Không thể cập nhật: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: 'Chờ duyệt', icon: <FaClock />, color: '#ffc107' },
      APPROVED: { label: 'Đã duyệt', icon: <FaCheckCircle />, color: '#28a745' },
      SHIPPED: { label: 'Đang vận chuyển', icon: <FaTruck />, color: '#17a2b8' },
      DELIVERED: { label: 'Đã giao', icon: <FaBoxOpen />, color: '#6c757d' },
      REJECTED: { label: 'Từ chối', icon: <FaTimesCircle />, color: '#dc3545' },
      CANCELLED: { label: 'Đã hủy', icon: <FaTimesCircle />, color: '#6c757d' }
    };

    return statusConfig[status] || statusConfig.PENDING;
  };

  // Filter and search
  const filteredRequests = requests.filter(request => {
    const matchesStatus = filterStatus === 'ALL' || request.status === filterStatus;
    const matchesSearch = searchKeyword === '' ||
      request.requestId.toString().includes(searchKeyword) ||
      request.faultyPartName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      request.serviceCenterName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      request.requestedByFullName?.toLowerCase().includes(searchKeyword.toLowerCase());

    return matchesStatus && matchesSearch;
  });

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
          <h1><FaTools /> Quản Lý Yêu Cầu Linh Kiện</h1>
          <p>Duyệt và quản lý yêu cầu linh kiện từ technicians</p>
        </div>
      </S.Header>

      {/* Statistics */}
      <S.StatsGrid>
        <S.StatCard color="#3498db" onClick={fetchAllRequests} style={{cursor: 'pointer'}}>
          <S.StatIcon><FaChartBar /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.total}</S.StatNumber>
            <S.StatLabel>Tổng số</S.StatLabel>
          </S.StatContent>
        </S.StatCard>
        <S.StatCard color="#ffc107" onClick={fetchPendingRequests} style={{cursor: 'pointer'}}>
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
        <S.StatCard color="#17a2b8" onClick={fetchInTransitRequests} style={{cursor: 'pointer'}}>
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
        <S.StatCard color="#dc3545">
          <S.StatIcon><FaTimesCircle /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.rejected}</S.StatNumber>
            <S.StatLabel>Từ chối</S.StatLabel>
          </S.StatContent>
        </S.StatCard>
      </S.StatsGrid>

      {/* Filters */}
      <S.FilterBar>
        <S.SearchBox>
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm kiếm theo ID, linh kiện, service center, technician..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </S.SearchBox>

        <S.FilterGroup>
          <S.FilterLabel><FaFilter /> Trạng thái:</S.FilterLabel>
          <S.FilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ALL">Tất cả ({requests.length})</option>
            <option value="PENDING">Chờ duyệt ({stats.pending})</option>
            <option value="APPROVED">Đã duyệt ({stats.approved})</option>
            <option value="SHIPPED">Đang vận chuyển ({stats.shipped})</option>
            <option value="DELIVERED">Đã giao ({stats.delivered})</option>
            <option value="REJECTED">Từ chối ({stats.rejected})</option>
            <option value="CANCELLED">Đã hủy ({stats.cancelled})</option>
          </S.FilterSelect>
        </S.FilterGroup>
      </S.FilterBar>

      {/* Results count */}
      <S.ResultsInfo>
        Hiển thị <strong>{filteredRequests.length}</strong> / {requests.length} yêu cầu
      </S.ResultsInfo>

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <S.EmptyState>
          <FaTools size={64} />
          <p>Không tìm thấy yêu cầu nào</p>
        </S.EmptyState>
      ) : (
        <S.Table>
          <S.TableHeader>
            <S.TableRow>
              <S.TableHeaderCell>ID</S.TableHeaderCell>
              <S.TableHeaderCell>Claim ID</S.TableHeaderCell>
              <S.TableHeaderCell>Linh kiện lỗi</S.TableHeaderCell>
              <S.TableHeaderCell>Số lượng</S.TableHeaderCell>
              <S.TableHeaderCell>Technician</S.TableHeaderCell>
              <S.TableHeaderCell>Service Center</S.TableHeaderCell>
              <S.TableHeaderCell>Ngày tạo</S.TableHeaderCell>
              <S.TableHeaderCell>Trạng thái</S.TableHeaderCell>
              <S.TableHeaderCell>Thao tác</S.TableHeaderCell>
            </S.TableRow>
          </S.TableHeader>
          <S.TableBody>
            {filteredRequests.map((request) => {
              const statusBadge = getStatusBadge(request.status);
              return (
                <S.TableRow key={request.requestId}>
                  <S.TableCell><strong>#{request.requestId}</strong></S.TableCell>
                  <S.TableCell>#{request.warrantyClaimId}</S.TableCell>
                  <S.TableCell>
                    <div>{request.faultyPartName}</div>
                    <small style={{color: '#7f8c8d'}}>{request.faultyPartNumber}</small>
                  </S.TableCell>
                  <S.TableCell>{request.quantity}</S.TableCell>
                  <S.TableCell>{request.requestedByFullName}</S.TableCell>
                  <S.TableCell>{request.serviceCenterName}</S.TableCell>
                  <S.TableCell>{new Date(request.requestDate).toLocaleDateString('vi-VN')}</S.TableCell>
                  <S.TableCell>
                    <S.StatusBadge color={statusBadge.color}>
                      {statusBadge.icon} {statusBadge.label}
                    </S.StatusBadge>
                  </S.TableCell>
                  <S.TableCell>
                    <S.ActionButton
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetailModal(true);
                      }}
                    >
                      <FaEye /> Chi tiết
                    </S.ActionButton>
                  </S.TableCell>
                </S.TableRow>
              );
            })}
          </S.TableBody>
        </S.Table>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <S.ModalOverlay onClick={() => setShowDetailModal(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()} large>
            <S.ModalHeader>
              <h2>Chi Tiết Yêu Cầu #{selectedRequest.requestId}</h2>
              <S.CloseButton onClick={() => setShowDetailModal(false)}>×</S.CloseButton>
            </S.ModalHeader>

            <S.DetailGrid>
              <S.DetailSection>
                <S.SectionTitle>Thông Tin Yêu Cầu</S.SectionTitle>
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
                  <S.DetailLabel>Số lượng:</S.DetailLabel>
                  <S.DetailValue>{selectedRequest.quantity}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Ngày tạo:</S.DetailLabel>
                  <S.DetailValue>{new Date(selectedRequest.requestDate).toLocaleString('vi-VN')}</S.DetailValue>
                </S.DetailItem>
              </S.DetailSection>

              <S.DetailSection>
                <S.SectionTitle>Linh Kiện & Địa Điểm</S.SectionTitle>
                <S.DetailItem>
                  <S.DetailLabel>Linh kiện lỗi:</S.DetailLabel>
                  <S.DetailValue>{selectedRequest.faultyPartName}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Part Number:</S.DetailLabel>
                  <S.DetailValue>{selectedRequest.faultyPartNumber}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Service Center:</S.DetailLabel>
                  <S.DetailValue>{selectedRequest.serviceCenterName}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Địa chỉ giao hàng:</S.DetailLabel>
                  <S.DetailValue>{selectedRequest.serviceCenterAddress}</S.DetailValue>
                </S.DetailItem>
              </S.DetailSection>

              <S.DetailSection fullWidth>
                <S.SectionTitle>Người Yêu Cầu</S.SectionTitle>
                <S.DetailItem>
                  <S.DetailLabel>Technician:</S.DetailLabel>
                  <S.DetailValue>{selectedRequest.requestedByFullName} ({selectedRequest.requestedByUsername})</S.DetailValue>
                </S.DetailItem>
              </S.DetailSection>

              <S.DetailSection fullWidth>
                <S.SectionTitle>Mô Tả Vấn Đề</S.SectionTitle>
                <S.DetailValue>{selectedRequest.issueDescription}</S.DetailValue>
              </S.DetailSection>

              {selectedRequest.trackingNumber && (
                <S.DetailSection fullWidth>
                  <S.SectionTitle>Vận Chuyển</S.SectionTitle>
                  <S.DetailItem>
                    <S.DetailLabel>Mã vận đơn:</S.DetailLabel>
                    <S.DetailValue><strong>{selectedRequest.trackingNumber}</strong></S.DetailValue>
                  </S.DetailItem>
                  {selectedRequest.shippedDate && (
                    <S.DetailItem>
                      <S.DetailLabel>Ngày gửi:</S.DetailLabel>
                      <S.DetailValue>{new Date(selectedRequest.shippedDate).toLocaleString('vi-VN')}</S.DetailValue>
                    </S.DetailItem>
                  )}
                </S.DetailSection>
              )}

              {(selectedRequest.notes || selectedRequest.rejectionReason) && (
                <S.DetailSection fullWidth>
                  <S.SectionTitle>Ghi Chú</S.SectionTitle>
                  {selectedRequest.notes && (
                    <S.DetailItem>
                      <S.DetailLabel>Ghi chú EVM:</S.DetailLabel>
                      <S.DetailValue>{selectedRequest.notes}</S.DetailValue>
                    </S.DetailItem>
                  )}
                  {selectedRequest.rejectionReason && (
                    <S.DetailItem>
                      <S.DetailLabel>Lý do từ chối:</S.DetailLabel>
                      <S.DetailValue style={{color: '#dc3545'}}>{selectedRequest.rejectionReason}</S.DetailValue>
                    </S.DetailItem>
                  )}
                </S.DetailSection>
              )}

              {selectedRequest.approvedByFullName && (
                <S.DetailSection fullWidth>
                  <S.SectionTitle>Thông Tin Duyệt</S.SectionTitle>
                  <S.DetailItem>
                    <S.DetailLabel>Người duyệt:</S.DetailLabel>
                    <S.DetailValue>{selectedRequest.approvedByFullName}</S.DetailValue>
                  </S.DetailItem>
                  {selectedRequest.approvedDate && (
                    <S.DetailItem>
                      <S.DetailLabel>Ngày duyệt:</S.DetailLabel>
                      <S.DetailValue>{new Date(selectedRequest.approvedDate).toLocaleString('vi-VN')}</S.DetailValue>
                    </S.DetailItem>
                  )}
                </S.DetailSection>
              )}
            </S.DetailGrid>

            <S.ModalFooter>
              {selectedRequest.status === 'PENDING' && (
                <>
                  <S.Button primary onClick={() => { setShowDetailModal(false); setShowApproveModal(true); }}>
                    <FaCheckCircle /> Duyệt
                  </S.Button>
                  <S.Button danger onClick={() => { setShowDetailModal(false); setShowRejectModal(true); }}>
                    <FaTimesCircle /> Từ chối
                  </S.Button>
                </>
              )}
              {selectedRequest.status === 'APPROVED' && (
                <S.Button primary onClick={() => { setShowDetailModal(false); setShowShipModal(true); }}>
                  <FaTruck /> Gửi hàng
                </S.Button>
              )}
              <S.Button onClick={() => setShowDetailModal(false)}>Đóng</S.Button>
            </S.ModalFooter>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <S.ModalOverlay onClick={() => setShowApproveModal(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <h2>Duyệt Yêu Cầu #{selectedRequest.requestId}</h2>
              <S.CloseButton onClick={() => setShowApproveModal(false)}>×</S.CloseButton>
            </S.ModalHeader>

            <S.Form onSubmit={handleApprove}>
              <S.FormGroup>
                <S.Label>Ghi chú (tùy chọn):</S.Label>
                <S.TextArea
                  rows="4"
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  placeholder="Thêm ghi chú cho yêu cầu này..."
                  maxLength="1000"
                />
              </S.FormGroup>

              <S.ModalFooter>
                <S.Button type="button" onClick={() => setShowApproveModal(false)}>Hủy</S.Button>
                <S.Button type="submit" primary>
                  <FaCheckCircle /> Xác Nhận Duyệt
                </S.Button>
              </S.ModalFooter>
            </S.Form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <S.ModalOverlay onClick={() => setShowRejectModal(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <h2>Từ Chối Yêu Cầu #{selectedRequest.requestId}</h2>
              <S.CloseButton onClick={() => setShowRejectModal(false)}>×</S.CloseButton>
            </S.ModalHeader>

            <S.Form onSubmit={handleReject}>
              <S.FormGroup>
                <S.Label>Lý do từ chối <span style={{color: 'red'}}>*</span>:</S.Label>
                <S.TextArea
                  rows="4"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối yêu cầu này..."
                  required
                  maxLength="1000"
                />
              </S.FormGroup>

              <S.ModalFooter>
                <S.Button type="button" onClick={() => setShowRejectModal(false)}>Hủy</S.Button>
                <S.Button type="submit" danger>
                  <FaTimesCircle /> Xác Nhận Từ Chối
                </S.Button>
              </S.ModalFooter>
            </S.Form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {/* Ship Modal */}
      {showShipModal && selectedRequest && (
        <S.ModalOverlay onClick={() => setShowShipModal(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <h2><FaTruck /> Xác Nhận Gửi Hàng</h2>
              <S.CloseButton onClick={() => setShowShipModal(false)}>×</S.CloseButton>
            </S.ModalHeader>

            <S.Form onSubmit={handleShip}>
              {/* Thông tin yêu cầu */}
              <S.DetailSection style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <S.SectionTitle>📦 Thông Tin Gửi Hàng</S.SectionTitle>
                <S.DetailItem>
                  <S.DetailLabel>Yêu cầu:</S.DetailLabel>
                  <S.DetailValue><strong>#{selectedRequest.requestId}</strong></S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Linh kiện:</S.DetailLabel>
                  <S.DetailValue>{selectedRequest.faultyPartName} ({selectedRequest.faultyPartNumber})</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Số lượng:</S.DetailLabel>
                  <S.DetailValue><strong>{selectedRequest.quantity}</strong> chiếc</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Gửi đến:</S.DetailLabel>
                  <S.DetailValue>
                    <div><strong>{selectedRequest.serviceCenterName}</strong></div>
                    <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>{selectedRequest.serviceCenterAddress}</div>
                  </S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Người nhận:</S.DetailLabel>
                  <S.DetailValue>{selectedRequest.requestedByFullName}</S.DetailValue>
                </S.DetailItem>
              </S.DetailSection>

              {/* Tracking number */}
              <S.FormGroup>
                <S.Label>📍 Mã vận đơn (Tracking Number):</S.Label>
                <S.Input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="VD: VNP123456789, GHTK987654321..."
                  maxLength="100"
                />
                <small style={{ color: '#6c757d', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                  Nhập mã vận đơn để technician có thể theo dõi. Có thể bỏ trống nếu chưa có.
                </small>
              </S.FormGroup>

              {/* Warning */}
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
                  <strong>Xác nhận gửi hàng:</strong> Sau khi xác nhận, trạng thái sẽ chuyển sang
                  <strong> "ĐANG VẬN CHUYỂN"</strong> và technician sẽ được thông báo.
                </div>
              </div>

              <S.ModalFooter>
                <S.Button type="button" onClick={() => setShowShipModal(false)}>Hủy</S.Button>
                <S.Button type="submit" primary>
                  <FaTruck /> Xác Nhận Đã Gửi Hàng
                </S.Button>
              </S.ModalFooter>
            </S.Form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </S.Container>
  );
};

export default EVMPartRequests;
