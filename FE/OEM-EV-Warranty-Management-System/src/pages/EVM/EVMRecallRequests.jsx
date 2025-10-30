import React, { useState, useEffect } from 'react';
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
  const [recallType, setRecallType] = useState('by-part'); // 'by-part' or 'by-installed-part'
  const [formData, setFormData] = useState({
    partId: '',
    installedPartId: '',
    reason: ''
  });

  // Lists for selection
  const [parts, setParts] = useState([]);
  const [installedParts, setInstalledParts] = useState([]);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pendingAdmin: 0,
    waitingCustomer: 0,
    acceptedCustomer: 0,
    rejectedAdmin: 0,
    rejectedCustomer: 0,
    claimCreated: 0
  });

  useEffect(() => {
    fetchRecalls();
    fetchParts();
    fetchInstalledParts();
  }, []);

  const fetchRecalls = async () => {
    try {
      setLoading(true);
      const response = await apiClient('/api/recall-requests/admin');
      setRecalls(response || []);
      calculateStats(response || []);
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
      waitingCustomer: data.filter(r => r.status === 'WAITING_CUSTOMER_CONFIRM').length,
      acceptedCustomer: data.filter(r => r.status === 'ACCEPTED_BY_CUSTOMER').length,
      rejectedAdmin: data.filter(r => r.status === 'REJECTED_BY_ADMIN').length,
      rejectedCustomer: data.filter(r => r.status === 'REJECTED_BY_CUSTOMER').length,
      claimCreated: data.filter(r => r.status === 'CLAIM_CREATED').length
    });
  };

  const handleCreateRecall = async (e) => {
    e.preventDefault();

    // Validate based on recall type
    if (recallType === 'by-part') {
      if (!formData.partId || !formData.reason || formData.reason.length < 10) {
        alert('Vui lòng chọn linh kiện và nhập lý do (tối thiểu 10 ký tự)');
        return;
      }
    } else {
      if (!formData.installedPartId || !formData.reason || formData.reason.length < 10) {
        alert('Vui lòng chọn installed part và nhập lý do (tối thiểu 10 ký tự)');
        return;
      }
    }

    try {
      if (recallType === 'by-part') {
        // Recall by Part ID - loop through all installed parts with this partId
        const targetPartId = parseInt(formData.partId);
        const targetInstalledParts = installedParts.filter(ip => ip.partId === targetPartId);

        if (targetInstalledParts.length === 0) {
          alert('Không có xe nào lắp linh kiện này!');
          return;
        }

        // Confirm before creating multiple recalls
        if (!confirm(`Bạn có chắc muốn tạo recall cho ${targetInstalledParts.length} xe có lắp linh kiện này không?`)) {
          return;
        }

        let successCount = 0;
        let failCount = 0;

        // Loop and create recall for each installed part
        for (const ip of targetInstalledParts) {
          try {
            await apiClient('/api/recall-requests', {
              method: 'POST',
              body: JSON.stringify({
                installedPartId: ip.installedPartId.toString(),
                reason: formData.reason
              })
            });
            successCount++;
          } catch (error) {
            console.error(`Failed to create recall for installed part ${ip.installedPartId}:`, error);
            failCount++;
          }
        }

        alert(`Đã tạo recall:\n✅ Thành công: ${successCount}\n❌ Thất bại: ${failCount}`);

      } else {
        // Recall by Installed Part - single vehicle recall
        await apiClient('/api/recall-requests', {
          method: 'POST',
          body: JSON.stringify({
            installedPartId: formData.installedPartId.toString(),
            reason: formData.reason
          })
        });

        alert('Tạo recall request thành công!');
      }

      setShowCreateModal(false);
      setFormData({ partId: '', installedPartId: '', reason: '' });
      setRecallType('by-part');
      fetchRecalls();
    } catch (error) {
      console.error('Error creating recall:', error);
      alert('Không thể tạo recall: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  const handleDeleteRecall = async (recallId) => {
    if (!confirm('Bạn có chắc muốn xóa recall này không?\n(Chỉ được xóa recall đang chờ duyệt)')) {
      return;
    }

    try {
      await apiClient(`/api/recall-requests/${recallId}`, {
        method: 'DELETE'
      });

      alert('Xóa recall thành công!');
      fetchRecalls();
    } catch (error) {
      console.error('Error deleting recall:', error);
      alert('Không thể xóa recall: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING_ADMIN_APPROVAL: {
        label: 'Chờ Admin duyệt',
        icon: <FaClock />,
        color: '#ffc107'
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
      REJECTED_BY_CUSTOMER: {
        label: 'Khách hàng từ chối',
        icon: <FaExclamationTriangle />,
        color: '#ff6b6b'
      },
      ACCEPTED_BY_CUSTOMER: {
        label: 'Khách hàng chấp nhận',
        icon: <FaCheckCircle />,
        color: '#28a745'
      },
      CLAIM_CREATED: {
        label: 'Đã tạo yêu cầu bảo hành',
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
      recall.partName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      recall.vehicleName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      recall.customerName?.toLowerCase().includes(searchKeyword.toLowerCase());

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
            <S.StatLabel>Tổng số Recall</S.StatLabel>
          </S.StatContent>
        </S.StatCard>
        <S.StatCard color="#ffc107">
          <S.StatIcon><FaClock /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.pendingAdmin}</S.StatNumber>
            <S.StatLabel>Chờ Admin duyệt</S.StatLabel>
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
            <S.StatNumber>{stats.claimCreated}</S.StatNumber>
            <S.StatLabel>Đã tạo claim</S.StatLabel>
          </S.StatContent>
        </S.StatCard>
        <S.StatCard color="#dc3545">
          <S.StatIcon><FaTimesCircle /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.rejectedAdmin}</S.StatNumber>
            <S.StatLabel>Admin từ chối</S.StatLabel>
          </S.StatContent>
        </S.StatCard>
        <S.StatCard color="#ff6b6b">
          <S.StatIcon><FaExclamationTriangle /></S.StatIcon>
          <S.StatContent>
            <S.StatNumber>{stats.rejectedCustomer}</S.StatNumber>
            <S.StatLabel>Khách từ chối</S.StatLabel>
          </S.StatContent>
        </S.StatCard>
      </S.StatsGrid>

      {/* Filters */}
      <S.FilterBar>
        <S.SearchBox>
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm kiếm theo ID, linh kiện, xe, khách hàng..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </S.SearchBox>

        <S.FilterGroup>
          <S.FilterLabel><FaFilter /> Trạng thái:</S.FilterLabel>
          <S.FilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ALL">Tất cả ({recalls.length})</option>
            <option value="PENDING_ADMIN_APPROVAL">Chờ Admin ({stats.pendingAdmin})</option>
            <option value="WAITING_CUSTOMER_CONFIRM">Chờ khách hàng ({stats.waitingCustomer})</option>
            <option value="CLAIM_CREATED">Đã tạo claim ({stats.claimCreated})</option>
            <option value="REJECTED_BY_ADMIN">Admin từ chối ({stats.rejectedAdmin})</option>
            <option value="REJECTED_BY_CUSTOMER">Khách từ chối ({stats.rejectedCustomer})</option>
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
              <S.TableHeaderCell>Linh kiện</S.TableHeaderCell>
              <S.TableHeaderCell>Xe</S.TableHeaderCell>
              <S.TableHeaderCell>Khách hàng</S.TableHeaderCell>
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
                    <div>{recall.partName}</div>
                    <small style={{color: '#7f8c8d'}}>ID: {recall.partId}</small>
                  </S.TableCell>
                  <S.TableCell>
                    <div>{recall.vehicleName}</div>
                    <small style={{color: '#7f8c8d'}}>VIN: {recall.vehicleId}</small>
                  </S.TableCell>
                  <S.TableCell>{recall.customerName}</S.TableCell>
                  <S.TableCell>
                    <S.ReasonText>{recall.reason?.substring(0, 50)}{recall.reason?.length > 50 ? '...' : ''}</S.ReasonText>
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
              {/* Recall Type Selection */}
              <S.FormGroup>
                <S.Label>Loại Recall <span style={{color: 'red'}}>*</span></S.Label>
                <S.RadioGroup>
                  <S.RadioOption>
                    <input
                      type="radio"
                      name="recallType"
                      value="by-part"
                      checked={recallType === 'by-part'}
                      onChange={(e) => setRecallType(e.target.value)}
                    />
                    <div>
                      <strong>Recall theo Linh Kiện (Toàn bộ xe)</strong>
                      <S.HelpText>Tạo recall cho TẤT CẢ xe có lắp linh kiện này</S.HelpText>
                    </div>
                  </S.RadioOption>
                  <S.RadioOption>
                    <input
                      type="radio"
                      name="recallType"
                      value="by-installed-part"
                      checked={recallType === 'by-installed-part'}
                      onChange={(e) => setRecallType(e.target.value)}
                    />
                    <div>
                      <strong>Recall theo Xe Cụ Thể</strong>
                      <S.HelpText>Tạo recall cho 1 xe cụ thể</S.HelpText>
                    </div>
                  </S.RadioOption>
                </S.RadioGroup>
              </S.FormGroup>

              {/* Part Selection (for by-part recall) */}
              {recallType === 'by-part' && (
                <S.FormGroup>
                  <S.Label>Chọn Linh Kiện <span style={{color: 'red'}}>*</span></S.Label>
                  <S.Select
                    value={formData.partId}
                    onChange={(e) => setFormData({...formData, partId: e.target.value, installedPartId: ''})}
                  >
                    <option value="">-- Chọn Linh Kiện --</option>
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
                    ⚠️ Recall sẽ được tạo cho TẤT CẢ xe có lắp linh kiện này
                  </S.HelpText>
                  {formData.partId && (() => {
                    const selectedPartId = parseInt(formData.partId);
                    const affectedVehicles = installedParts.filter(ip => ip.partId === selectedPartId);
                    const uniqueCustomers = new Set(affectedVehicles.map(ip => ip.customerName));

                    return affectedVehicles.length > 0 ? (
                      <S.InfoBox style={{ marginTop: '12px' }}>
                        <FaBullhorn />
                        <div>
                          <strong>Thông tin chi tiết:</strong>
                          <ul style={{ margin: '8px 0 0 20px', paddingLeft: '0' }}>
                            <li><strong>{affectedVehicles.length} xe</strong> sẽ nhận recall</li>
                            <li><strong>{uniqueCustomers.size} khách hàng</strong> sẽ được thông báo</li>
                          </ul>
                        </div>
                      </S.InfoBox>
                    ) : (
                      <S.HelpText style={{ color: '#e74c3c', marginTop: '8px' }}>
                        ⚠️ Không có xe nào lắp linh kiện này!
                      </S.HelpText>
                    );
                  })()}
                  {parts.length === 0 && (
                    <S.HelpText style={{ color: '#e74c3c' }}>
                      Không có linh kiện nào trong hệ thống
                    </S.HelpText>
                  )}
                </S.FormGroup>
              )}

              {/* Installed Part Selection (for single vehicle recall) */}
              {recallType === 'by-installed-part' && (
                <S.FormGroup>
                  <S.Label>Installed Part (Linh kiện đã lắp) <span style={{color: 'red'}}>*</span></S.Label>
                  <S.Select
                    value={formData.installedPartId}
                    onChange={(e) => setFormData({...formData, installedPartId: e.target.value, partId: ''})}
                  >
                    <option value="">-- Chọn Installed Part --</option>
                    {installedParts.length === 0 ? (
                      <option disabled>Đang tải...</option>
                    ) : (
                      installedParts.map(ip => (
                        <option key={ip.installedPartId} value={ip.installedPartId}>
                          {ip.partName} - Xe: {ip.vehicleVin} - Khách: {ip.customerName}
                        </option>
                      ))
                    )}
                  </S.Select>
                  <S.HelpText>Chọn linh kiện đã lắp trên xe của khách hàng cần recall</S.HelpText>
                  {installedParts.length === 0 && (
                    <S.HelpText style={{ color: '#e74c3c' }}>
                      Không có linh kiện đã lắp nào trong hệ thống
                    </S.HelpText>
                  )}
                </S.FormGroup>
              )}

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
                  <strong>Lưu ý:</strong> Sau khi tạo, recall sẽ được gửi đến Admin/SC Staff để duyệt.
                  {recallType === 'by-part' && (
                    <div style={{ marginTop: '8px', color: '#d35400' }}>
                      ⚠️ <strong>Recall theo linh kiện</strong> sẽ tự động tạo yêu cầu cho tất cả xe có lắp linh kiện này.
                    </div>
                  )}
                </div>
              </S.InfoBox>

              <S.ModalFooter>
                <S.Button type="button" onClick={() => setShowCreateModal(false)}>
                  Hủy
                </S.Button>
                <S.Button type="submit" primary>
                  <FaPlus /> {recallType === 'by-part' ? 'Tạo Recall Toàn Bộ' : 'Tạo Recall'}
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
                <S.SectionTitle>Thông Tin Recall</S.SectionTitle>
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
                {selectedRecall.updatedAt && (
                  <S.DetailItem>
                    <S.DetailLabel>Cập nhật lần cuối:</S.DetailLabel>
                    <S.DetailValue>{new Date(selectedRecall.updatedAt).toLocaleString('vi-VN')}</S.DetailValue>
                  </S.DetailItem>
                )}
              </S.DetailSection>

              <S.DetailSection>
                <S.SectionTitle>Linh Kiện & Xe</S.SectionTitle>
                <S.DetailItem>
                  <S.DetailLabel>Tên linh kiện:</S.DetailLabel>
                  <S.DetailValue>{selectedRecall.partName}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Part ID:</S.DetailLabel>
                  <S.DetailValue>{selectedRecall.partId}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Xe:</S.DetailLabel>
                  <S.DetailValue>{selectedRecall.vehicleName}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>VIN:</S.DetailLabel>
                  <S.DetailValue>{selectedRecall.vehicleId}</S.DetailValue>
                </S.DetailItem>
              </S.DetailSection>

              <S.DetailSection fullWidth>
                <S.SectionTitle>Khách Hàng</S.SectionTitle>
                <S.DetailItem>
                  <S.DetailLabel>Tên khách hàng:</S.DetailLabel>
                  <S.DetailValue>{selectedRecall.customerName}</S.DetailValue>
                </S.DetailItem>
                <S.DetailItem>
                  <S.DetailLabel>Customer ID:</S.DetailLabel>
                  <S.DetailValue>{selectedRecall.customerId}</S.DetailValue>
                </S.DetailItem>
              </S.DetailSection>

              <S.DetailSection fullWidth>
                <S.SectionTitle>Lý Do Recall</S.SectionTitle>
                <S.DetailValue>{selectedRecall.reason}</S.DetailValue>
              </S.DetailSection>

              {selectedRecall.adminNote && (
                <S.DetailSection fullWidth>
                  <S.SectionTitle>Ghi Chú Admin</S.SectionTitle>
                  <S.DetailValue>{selectedRecall.adminNote}</S.DetailValue>
                </S.DetailSection>
              )}

              {selectedRecall.customerNote && (
                <S.DetailSection fullWidth>
                  <S.SectionTitle>Phản Hồi Khách Hàng</S.SectionTitle>
                  <S.DetailValue
                    style={{
                      color: selectedRecall.status === 'REJECTED_BY_CUSTOMER' ? '#dc3545' : '#28a745'
                    }}
                  >
                    {selectedRecall.customerNote}
                  </S.DetailValue>
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
