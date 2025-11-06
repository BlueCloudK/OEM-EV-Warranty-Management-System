import React, { useState, useEffect } from 'react';
import { recallRequestsApi } from '../../api/recallRequests';
import apiClient from '../../api/apiClient';
import * as S from './EVMRecallRequests.styles';
import {
  FaBullhorn,
  FaSpinner,
  FaPlus,
  FaEye,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaUserCheck,
  FaFilter,
  FaSearch,
  FaTrash,
  FaSyncAlt
} from 'react-icons/fa';

const EVMRecallRequests = () => {
  const [recalls, setRecalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecall, setSelectedRecall] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    partId: '',
    reason: ''
  });

  // Lists for selection
  const [parts, setParts] = useState([]);
  const [installedParts, setInstalledParts] = useState([]); // Still fetch to show affected count

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pendingAdmin: 0,
    approved: 0,
    waitingCustomer: 0,
    rejectedAdmin: 0,
    completed: 0
  });

  useEffect(() => {
    fetchRecalls();
    fetchParts();
    fetchInstalledParts();
  }, []);

  const fetchRecalls = async () => {
    try {
      setLoading(true);
      const response = await recallRequestsApi.getAllForAdmin();
      console.log('📋 Recall Campaigns loaded:', response);
      const data = response?.content || response || [];
      setRecalls(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching recalls:', error);
      alert('Không thể tải danh sách recall');
    } finally {
      setLoading(false);
    }
  };

  const fetchParts = async () => {
    try {
      const response = await apiClient('/api/parts?page=0&size=1000');
      console.log('Parts loaded:', response);
      setParts(response.content || []);
    } catch (error) {
      console.error('Error fetching parts:', error);
    }
  };

  const fetchInstalledParts = async () => {
    try {
      const response = await apiClient('/api/installed-parts?page=0&size=1000');
      console.log('Installed parts loaded:', response);
      setInstalledParts(response.content || []);
    } catch (error) {
      console.error('Error fetching installed parts:', error);
    }
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      pendingAdmin: data.filter(r => r.status === 'PENDING_ADMIN_APPROVAL').length,
      approved: data.filter(r => r.status === 'APPROVED_BY_ADMIN').length,
      waitingCustomer: data.filter(r => r.status === 'WAITING_CUSTOMER_CONFIRM').length,
      rejectedAdmin: data.filter(r => r.status === 'REJECTED_BY_ADMIN').length,
      completed: data.filter(r => r.status === 'COMPLETED').length
    });
  };

  const handleCreateRecall = async (e) => {
    e.preventDefault();

    // Validate
    if (!formData.partId || !formData.reason || formData.reason.length < 10) {
      alert('Vui lòng chọn linh kiện và nhập lý do (tối thiểu 10 ký tự)');
      return;
    }

    const targetPartId = parseInt(formData.partId);
    const affectedVehicles = installedParts.filter(ip => ip.partId === targetPartId);

    if (affectedVehicles.length === 0) {
      alert('Không có xe nào lắp linh kiện này!');
      return;
    }

    try {
      await recallRequestsApi.create({
        partId: targetPartId,
        reason: formData.reason
      });

      alert(`✅ Tạo chiến dịch recall thành công!\n\nChiến dịch sẽ được gửi đến Admin để duyệt.\nSau khi duyệt, ${affectedVehicles.length} xe sẽ nhận thông báo recall.`);

      setShowCreateModal(false);
      setFormData({ partId: '', reason: '' });
      fetchRecalls();
    } catch (error) {
      console.error('Error creating recall campaign:', error);
      alert('Không thể tạo chiến dịch recall: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  const handleDeleteRecall = async (recallId) => {
    try {
      await recallRequestsApi.delete(recallId);
      alert('✅ Xóa chiến dịch recall thành công!');
      fetchRecalls();
    } catch (error) {
      console.error('Error deleting recall campaign:', error);
      alert('Không thể xóa chiến dịch recall: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING_ADMIN_APPROVAL: {
        label: 'Chờ Admin duyệt',
        icon: <FaClock />,
        color: '#ffc107'
      },
      APPROVED_BY_ADMIN: {
        label: 'Admin đã duyệt',
        icon: <FaCheckCircle />,
        color: '#28a745'
      },
      REJECTED_BY_ADMIN: {
        label: 'Admin đã từ chối',
        icon: <FaTimesCircle />,
        color: '#dc3545'
      },
      WAITING_CUSTOMER_CONFIRM: {
        label: 'Chờ khách hàng xác nhận',
        icon: <FaUserCheck />,
        color: '#17a2b8'
      },
      COMPLETED: {
        label: 'Đã hoàn thành',
        icon: <FaCheckCircle />,
        color: '#20c997'
      }
    };

    return statusConfig[status] || statusConfig.PENDING_ADMIN_APPROVAL;
  };

  // Filter and search
  const filteredRecalls = recalls.filter(recall => {
    const matchesStatus = filterStatus === 'ALL' || recall.status === filterStatus;
    const matchesSearch = searchKeyword === '' ||
      recall.recallRequestId?.toString().includes(searchKeyword) ||
      recall.part?.partName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      recall.part?.partNumber?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      recall.reason?.toLowerCase().includes(searchKeyword.toLowerCase());

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
          <h1><FaBullhorn /> Quản Lý Recall</h1>
          <p>Tạo và theo dõi yêu cầu recall linh kiện lỗi</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <S.Button onClick={fetchRecalls} disabled={loading} title="Làm mới dữ liệu">
            <FaSyncAlt style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Làm mới
          </S.Button>
          <S.Button primary onClick={() => setShowCreateModal(true)}>
            <FaPlus /> Tạo Recall Mới
          </S.Button>
        </div>
      </S.Header>

      {/* Statistics */}
      <S.StatsGrid>
        <S.StatCard color="#3498db">
          <S.StatIcon><FaBullhorn /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.total}</S.StatNumber>
            <S.StatLabel>Tổng chiến dịch</S.StatLabel>
          </S.StatContent>
        </S.StatCard>
        <S.StatCard color="#ffc107">
          <S.StatIcon><FaClock /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.pendingAdmin}</S.StatNumber>
            <S.StatLabel>Chờ Admin duyệt</S.StatLabel>
          </S.StatContent>
        </S.StatCard>
        <S.StatCard color="#28a745">
          <S.StatIcon><FaCheckCircle /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.approved}</S.StatNumber>
            <S.StatLabel>Admin đã duyệt</S.StatLabel>
          </S.StatContent>
        </S.StatCard>
        <S.StatCard color="#17a2b8">
          <S.StatIcon><FaUserCheck /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.waitingCustomer}</S.StatNumber>
            <S.StatLabel>Chờ khách hàng</S.StatLabel>
          </S.StatContent>
        </S.StatCard>
        <S.StatCard color="#20c997">
          <S.StatIcon><FaCheckCircle /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.completed}</S.StatNumber>
            <S.StatLabel>Đã hoàn thành</S.StatLabel>
          </S.StatContent>
        </S.StatCard>
        <S.StatCard color="#dc3545">
          <S.StatIcon><FaTimesCircle /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.rejectedAdmin}</S.StatNumber>
            <S.StatLabel>Admin từ chối</S.StatLabel>
          </S.StatContent>
        </S.StatCard>
      </S.StatsGrid>

      {/* Filters */}
      <S.FilterBar>
        <S.SearchBox>
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm kiếm theo ID, phụ tùng, lý do..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </S.SearchBox>

        <S.FilterGroup>
          <S.FilterLabel><FaFilter /> Trạng thái:</S.FilterLabel>
          <S.FilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ALL">Tất cả ({recalls.length})</option>
            <option value="PENDING_ADMIN_APPROVAL">Chờ Admin ({stats.pendingAdmin})</option>
            <option value="APPROVED_BY_ADMIN">Admin đã duyệt ({stats.approved})</option>
            <option value="WAITING_CUSTOMER_CONFIRM">Chờ khách hàng ({stats.waitingCustomer})</option>
            <option value="COMPLETED">Đã hoàn thành ({stats.completed})</option>
            <option value="REJECTED_BY_ADMIN">Admin từ chối ({stats.rejectedAdmin})</option>
          </S.FilterSelect>
        </S.FilterGroup>
      </S.FilterBar>

      {/* Results count */}
      <S.ResultsInfo>
        Hiển thị <strong>{filteredRecalls.length}</strong> / {recalls.length} recall
      </S.ResultsInfo>

      {/* Recalls Table */}
      {filteredRecalls.length === 0 ? (
        <S.EmptyState>
          <FaBullhorn size={64} />
          <p>Không tìm thấy recall nào</p>
        </S.EmptyState>
      ) : (
        <S.Table>
          <S.TableHeader>
            <S.TableRow>
              <S.TableHeaderCell>ID</S.TableHeaderCell>
              <S.TableHeaderCell>Phụ tùng bị lỗi</S.TableHeaderCell>
              <S.TableHeaderCell>Lý do Recall</S.TableHeaderCell>
              <S.TableHeaderCell>Ngày tạo</S.TableHeaderCell>
              <S.TableHeaderCell>Trạng thái</S.TableHeaderCell>
              <S.TableHeaderCell>Thao tác</S.TableHeaderCell>
            </S.TableRow>
          </S.TableHeader>
          <S.TableBody>
            {filteredRecalls.map((recall) => {
              const statusBadge = getStatusBadge(recall.status);
              return (
                <S.TableRow key={recall.recallRequestId}>
                  <S.TableCell><strong>#{recall.recallRequestId}</strong></S.TableCell>
                  <S.TableCell>
                    <div>{recall.part?.partName || 'N/A'}</div>
                    <small style={{color: '#7f8c8d'}}>{recall.part?.partNumber || 'N/A'}</small>
                  </S.TableCell>
                  <S.TableCell>
                    <S.ReasonText>{recall.reason?.substring(0, 60)}{recall.reason?.length > 60 ? '...' : ''}</S.ReasonText>
                  </S.TableCell>
                  <S.TableCell>{new Date(recall.createdAt).toLocaleDateString('vi-VN')}</S.TableCell>
                  <S.TableCell>
                    <S.StatusBadge color={statusBadge.color}>
                      {statusBadge.icon} {statusBadge.label}
                    </S.StatusBadge>
                  </S.TableCell>
                  <S.TableCell>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <S.ActionButton
                        onClick={() => {
                          setSelectedRecall(recall);
                          setShowDetailModal(true);
                        }}
                      >
                        <FaEye /> Chi tiết
                      </S.ActionButton>
                      {recall.status === 'PENDING_ADMIN_APPROVAL' && (
                        <S.ActionButton
                          onClick={() => handleDeleteRecall(recall.recallRequestId)}
                          style={{ backgroundColor: '#e74c3c' }}
                        >
                          <FaTrash /> Xóa
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

      {/* Create Modal */}
      {showCreateModal && (
        <S.ModalOverlay onClick={() => setShowCreateModal(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <h2>Tạo Recall Request Mới</h2>
              <S.CloseButton onClick={() => setShowCreateModal(false)}>×</S.CloseButton>
            </S.ModalHeader>

            <S.Form onSubmit={handleCreateRecall}>
              {/* Part Selection */}
              <S.FormGroup>
                <S.Label>Chọn Phụ Tùng Bị Lỗi <span style={{color: 'red'}}>*</span></S.Label>
                <S.Select
                  value={formData.partId}
                  onChange={(e) => setFormData({...formData, partId: e.target.value})}
                >
                  <option value="">-- Chọn Phụ Tùng --</option>
                  {parts.length === 0 ? (
                    <option disabled>Đang tải...</option>
                  ) : (
                    parts.map(part => {
                      const vehicleCount = installedParts.filter(ip => ip.partId === part.partId).length;
                      const uniqueCustomers = new Set(
                        installedParts
                          .filter(ip => ip.partId === part.partId)
                          .map(ip => ip.customerName)
                      ).size;
                      return (
                        <option key={part.partId} value={part.partId}>
                          #{part.partId} - {part.partName} ({part.partNumber}) - {vehicleCount} xe, {uniqueCustomers} khách hàng
                        </option>
                      );
                    })
                  )}
                </S.Select>
                <S.HelpText style={{ color: '#e67e22', fontWeight: '500' }}>
                  ⚠️ Chiến dịch recall sẽ ảnh hưởng đến TẤT CẢ xe có lắp phụ tùng này
                </S.HelpText>
                {formData.partId && (() => {
                  const selectedPartId = parseInt(formData.partId);
                  const affectedVehicles = installedParts.filter(ip => ip.partId === selectedPartId);
                  const uniqueCustomers = new Set(affectedVehicles.map(ip => ip.customerName));

                  return affectedVehicles.length > 0 ? (
                    <S.InfoBox style={{ marginTop: '12px' }}>
                      <FaBullhorn />
                      <div>
                        <strong>Phạm vi ảnh hưởng:</strong>
                        <ul style={{ margin: '8px 0 0 20px', paddingLeft: '0' }}>
                          <li><strong>{affectedVehicles.length} xe</strong> sẽ nhận thông báo recall</li>
                          <li><strong>{uniqueCustomers.size} khách hàng</strong> sẽ được thông báo</li>
                        </ul>
                      </div>
                    </S.InfoBox>
                  ) : (
                    <S.HelpText style={{ color: '#e74c3c', marginTop: '8px' }}>
                      ⚠️ Không có xe nào lắp phụ tùng này!
                    </S.HelpText>
                  );
                })()}
                {parts.length === 0 && (
                  <S.HelpText style={{ color: '#e74c3c' }}>
                    Không có phụ tùng nào trong hệ thống
                  </S.HelpText>
                )}
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>Lý Do Recall <span style={{color: 'red'}}>*</span></S.Label>
                <S.TextArea
                  rows="6"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="Mô tả chi tiết lý do recall linh kiện này (tối thiểu 10 ký tự)..."
                  required
                  minLength="10"
                  maxLength="1000"
                />
                <S.CharCount>{formData.reason.length}/1000 ký tự</S.CharCount>
              </S.FormGroup>

              <S.InfoBox>
                <FaBullhorn />
                <div>
                  <strong>Lưu ý:</strong> Sau khi tạo, chiến dịch recall sẽ được gửi đến Admin để duyệt.
                  <div style={{ marginTop: '8px', color: '#d35400' }}>
                    ⚠️ Khi Admin duyệt, hệ thống sẽ tự động tạo RecallResponse cho tất cả xe bị ảnh hưởng.
                  </div>
                </div>
              </S.InfoBox>

              <S.ModalFooter>
                <S.Button type="button" onClick={() => setShowCreateModal(false)}>
                  Hủy
                </S.Button>
                <S.Button type="submit" primary>
                  <FaPlus /> Tạo Chiến Dịch Recall
                </S.Button>
              </S.ModalFooter>
            </S.Form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRecall && (
        <S.ModalOverlay onClick={() => setShowDetailModal(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()} large>
            <S.ModalHeader>
              <h2>Chi Tiết Recall #{selectedRecall.recallRequestId}</h2>
              <S.CloseButton onClick={() => setShowDetailModal(false)}>×</S.CloseButton>
            </S.ModalHeader>

            <S.DetailGrid>
              <S.DetailSection>
                <S.SectionTitle>Thông Tin Chiến Dịch</S.SectionTitle>
                <S.DetailItem>
                  <S.DetailLabel>Campaign ID:</S.DetailLabel>
                  <S.DetailValue>#{selectedRecall.recallRequestId}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Trạng thái:</S.DetailLabel>
                  <S.StatusBadge color={getStatusBadge(selectedRecall.status).color}>
                    {getStatusBadge(selectedRecall.status).icon} {getStatusBadge(selectedRecall.status).label}
                  </S.StatusBadge>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Ngày tạo:</S.DetailLabel>
                  <S.DetailValue>{new Date(selectedRecall.createdAt).toLocaleString('vi-VN')}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Người tạo:</S.DetailLabel>
                  <S.DetailValue>{selectedRecall.createdBy?.fullName || 'N/A'}</S.DetailValue>
                </S.DetailItem>
              </S.DetailSection>

              <S.DetailSection fullWidth>
                <S.SectionTitle>Phụ Tùng Bị Lỗi</S.SectionTitle>
                <S.DetailItem>
                  <S.DetailLabel>Tên phụ tùng:</S.DetailLabel>
                  <S.DetailValue>{selectedRecall.part?.partName || 'N/A'}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Mã phụ tùng:</S.DetailLabel>
                  <S.DetailValue>{selectedRecall.part?.partNumber || 'N/A'}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Part ID:</S.DetailLabel>
                  <S.DetailValue>#{selectedRecall.part?.partId || 'N/A'}</S.DetailValue>
                </S.DetailItem>
              </S.DetailSection>

              <S.DetailSection fullWidth>
                <S.SectionTitle>Lý Do Recall</S.SectionTitle>
                <S.DetailValue>{selectedRecall.reason || 'N/A'}</S.DetailValue>
              </S.DetailSection>

              {selectedRecall.adminNote && (
                <S.DetailSection fullWidth>
                  <S.SectionTitle>Ghi Chú Admin</S.SectionTitle>
                  <S.DetailValue>{selectedRecall.adminNote}</S.DetailValue>
                </S.DetailSection>
              )}

              {selectedRecall.rejectionReason && (
                <S.DetailSection fullWidth>
                  <S.SectionTitle>Lý Do Từ Chối</S.SectionTitle>
                  <S.DetailValue style={{ color: '#dc3545' }}>
                    {selectedRecall.rejectionReason}
                  </S.DetailValue>
                </S.DetailSection>
              )}

              {selectedRecall.approvedBy && (
                <S.DetailSection>
                  <S.SectionTitle>Thông Tin Duyệt</S.SectionTitle>
                  <S.DetailItem>
                    <S.DetailLabel>Người duyệt:</S.DetailLabel>
                    <S.DetailValue>{selectedRecall.approvedBy.fullName || 'N/A'}</S.DetailValue>
                  </S.DetailItem>
                  {selectedRecall.approvedAt && (
                    <S.DetailItem>
                      <S.DetailLabel>Ngày duyệt:</S.DetailLabel>
                      <S.DetailValue>{new Date(selectedRecall.approvedAt).toLocaleString('vi-VN')}</S.DetailValue>
                    </S.DetailItem>
                  )}
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
};

export default EVMRecallRequests;
