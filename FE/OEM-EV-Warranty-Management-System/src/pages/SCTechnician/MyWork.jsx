import React, { useState, useEffect, useCallback } from 'react';
import { dataApi } from '../../api/dataApi';
import * as S from './MyWork.styles';
import { FaClipboardCheck, FaSpinner, FaClock, FaCheckCircle, FaTasks, FaExclamationCircle, FaChartLine, FaCalendarDay, FaEye, FaPlay, FaFilter, FaExclamationTriangle } from 'react-icons/fa';

const ClaimDetailModal = ({ isOpen, onClose, claim, onStartProcessing, onComplete }) => {
  const [completionNote, setCompletionNote] = useState('');
  const [startNote, setStartNote] = useState('');
  const [showStartForm, setShowStartForm] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);

  if (!isOpen || !claim) return null;

  const handleStart = async () => {
    const result = await onStartProcessing(claim.warrantyClaimId, startNote);
    if (result.success) {
      setShowStartForm(false);
      setStartNote('');
      onClose();
    }
  };

  const handleComplete = async () => {
    // Ghi chú hoàn thành không bắt buộc
    const result = await onComplete(claim.warrantyClaimId, completionNote);
    if (result.success) {
      setShowCompleteForm(false);
      setCompletionNote('');
      onClose();
    }
  };

  const canStart = claim.status === 'MANAGER_REVIEW';
  const canComplete = claim.status === 'PROCESSING';

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <h2>Chi tiết #{claim.warrantyClaimId}</h2>
          <S.CloseButton onClick={onClose}>×</S.CloseButton>
        </S.ModalHeader>

        <S.DetailGrid>
          <S.DetailItem>
            <S.DetailLabel>Trạng thái:</S.DetailLabel>
            <S.StatusBadge $status={claim.status}>{claim.status}</S.StatusBadge>
          </S.DetailItem>
          <S.DetailItem>
            <S.DetailLabel>Ngày tạo:</S.DetailLabel>
            <S.DetailValue>{claim.claimDate ? new Date(claim.claimDate).toLocaleDateString('vi-VN') : 'N/A'}</S.DetailValue>
          </S.DetailItem>
          <S.DetailItem>
            <S.DetailLabel>Khách hàng:</S.DetailLabel>
            <S.DetailValue>{claim.customerName || 'N/A'}</S.DetailValue>
          </S.DetailItem>
          <S.DetailItem>
            <S.DetailLabel>Xe (VIN):</S.DetailLabel>
            <S.DetailValue>{claim.vehicleVin || 'N/A'}</S.DetailValue>
          </S.DetailItem>
          <S.DetailItem>
            <S.DetailLabel>Phụ tùng:</S.DetailLabel>
            <S.DetailValue>{claim.installedPartName || claim.installedPartId || 'N/A'}</S.DetailValue>
          </S.DetailItem>
          <S.DetailItem>
            <S.DetailLabel>Loại vấn đề:</S.DetailLabel>
            <S.DetailValue>{claim.issueType || 'N/A'}</S.DetailValue>
          </S.DetailItem>
          <S.DetailItem $fullWidth>
            <S.DetailLabel>Mô tả:</S.DetailLabel>
            <S.DetailValue>{claim.description || 'N/A'}</S.DetailValue>
          </S.DetailItem>
        </S.DetailGrid>

        <S.ModalFooter>
          {!showStartForm && !showCompleteForm && (
            <>
              {canStart && (
                <S.Button primary onClick={() => setShowStartForm(true)}>
                  <FaPlay /> Bắt đầu xử lý
                </S.Button>
              )}
              {canComplete && (
                <S.Button primary onClick={() => setShowCompleteForm(true)}>
                  <FaCheckCircle /> Hoàn thành
                </S.Button>
              )}
              <S.Button onClick={onClose}>Đóng</S.Button>
            </>
          )}

          {showStartForm && (
            <>
              <div style={{ width: '100%', marginBottom: '16px' }}>
                <S.Label>Ghi chú bắt đầu (tùy chọn):</S.Label>
                <S.TextArea
                  value={startNote}
                  onChange={(e) => setStartNote(e.target.value)}
                  placeholder="Nhập ghi chú..."
                  rows={3}
                />
              </div>
              <S.Button primary onClick={handleStart}>
                <FaPlay /> Xác nhận bắt đầu
              </S.Button>
              <S.Button onClick={() => setShowStartForm(false)}>Hủy</S.Button>
            </>
          )}

          {showCompleteForm && (
            <>
              <div style={{ width: '100%', marginBottom: '16px' }}>
                <S.Label>Ghi chú hoàn thành:</S.Label>
                <S.TextArea
                  value={completionNote}
                  onChange={(e) => setCompletionNote(e.target.value)}
                  placeholder="Nhập ghi chú về kết quả..."
                  rows={4}
                />
              </div>
              <S.Button primary onClick={handleComplete}>
                <FaCheckCircle /> Xác nhận hoàn thành
              </S.Button>
              <S.Button onClick={() => setShowCompleteForm(false)}>Hủy</S.Button>
            </>
          )}
        </S.ModalFooter>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

const StatCard = ({ icon, title, value, color, onClick }) => (
  <S.StatCard $color={color} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
    <S.StatIcon $color={color}>{icon}</S.StatIcon>
    <S.StatContent>
      <S.StatTitle>{title}</S.StatTitle>
      <S.StatValue>{value}</S.StatValue>
    </S.StatContent>
  </S.StatCard>
);

const MyWork = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    total: 0,
    todayCompleted: 0,
    weekCompleted: 0
  });
  const [claims, setClaims] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [dailyStats, setDailyStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchDailyStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      console.log("Fetching daily stats...");
      const stats = await dataApi.getMyDailyStats();
      console.log("Daily stats received:", stats);
      setDailyStats(stats);
    } catch (err) {
      console.error("Error fetching daily stats:", err);
      console.error("Error details:", err.response?.data);
      setDailyStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { page: pagination.currentPage, size: pagination.pageSize };

      // Fetch claims by filter
      let response;
      if (filterStatus === 'pending') {
        response = await dataApi.getTechPendingClaims(params);
      } else {
        response = await dataApi.getClaimsByStatus(filterStatus, params);
      }

      if (response && response.content) {
        setClaims(response.content);
        setPagination(prev => ({
          ...prev,
          totalPages: response.totalPages,
          totalElements: response.totalElements
        }));
      }

      // Fetch stats
      const [managerReview, processing, completed, allCompleted] = await Promise.all([
        dataApi.getClaimsByStatus('MANAGER_REVIEW', { page: 0, size: 1 }),
        dataApi.getClaimsByStatus('PROCESSING', { page: 0, size: 1 }),
        dataApi.getClaimsByStatus('COMPLETED', { page: 0, size: 1 }),
        dataApi.getClaimsByStatus('COMPLETED', { page: 0, size: 100 })
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const completedClaims = allCompleted?.content || [];
      const todayCompleted = completedClaims.filter(c => new Date(c.claimDate) >= today).length;
      const weekCompleted = completedClaims.filter(c => new Date(c.claimDate) >= weekAgo).length;

      setStats({
        pending: managerReview?.totalElements || 0,
        processing: processing?.totalElements || 0,
        completed: completed?.totalElements || 0,
        total: (managerReview?.totalElements || 0) + (processing?.totalElements || 0),
        todayCompleted,
        weekCompleted
      });
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Không thể tải dữ liệu.");
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, filterStatus]);

  useEffect(() => {
    fetchDailyStats();
  }, [fetchDailyStats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setPagination(prev => ({ ...prev, currentPage: 0 }));
  };

  const handleStartProcessing = async (claimId, note) => {
    try {
      await dataApi.techStartClaim(claimId, note);
      await fetchData();
      await fetchDailyStats(); // Refresh daily stats
      return { success: true };
    } catch (err) {
      alert(`Lỗi: ${err.response?.data?.message || err.message}`);
      return { success: false };
    }
  };

  const handleComplete = async (claimId, completionNote) => {
    try {
      await dataApi.techCompleteClaim(claimId, completionNote);
      await fetchData();
      return { success: true };
    } catch (err) {
      alert(`Lỗi: ${err.response?.data?.message || err.message}`);
      return { success: false };
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const openDetailModal = (claim) => {
    setSelectedClaim(claim);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <S.PageContainer>
        <S.LoadingState>
          <FaSpinner />
          <p>Đang tải...</p>
        </S.LoadingState>
      </S.PageContainer>
    );
  }

  if (error) {
    return (
      <S.PageContainer>
        <S.EmptyState>
          <FaExclamationCircle style={{ fontSize: '48px', color: '#ef4444' }} />
          <h3>{error}</h3>
        </S.EmptyState>
      </S.PageContainer>
    );
  }

  return (
    <S.PageContainer>
      <S.ContentWrapper>
        <S.Header>
          <S.HeaderTitle>
            <FaClipboardCheck /> Công việc của tôi
          </S.HeaderTitle>
          <S.HeaderSubtitle>
            Quản lý yêu cầu bảo hành
          </S.HeaderSubtitle>
        </S.Header>

        <S.StatsGrid>
          <StatCard
            icon={<FaClock />}
            title="Chờ xử lý"
            value={stats.pending}
            color="#f59e0b"
            onClick={() => handleFilterChange('MANAGER_REVIEW')}
          />
          <StatCard
            icon={<FaTasks />}
            title="Đang xử lý"
            value={stats.processing}
            color="#3b82f6"
            onClick={() => handleFilterChange('PROCESSING')}
          />
          <StatCard
            icon={<FaCheckCircle />}
            title="Hoàn thành"
            value={stats.completed}
            color="#10b981"
            onClick={() => handleFilterChange('COMPLETED')}
          />
          <StatCard
            icon={<FaClipboardCheck />}
            title="Tổng cần làm"
            value={stats.total}
            color="#14b8a6"
            onClick={() => handleFilterChange('pending')}
          />
        </S.StatsGrid>

        <S.PerformanceGrid>
          <S.PerformanceCard>
            <S.PerformanceIcon $color="#8b5cf6">
              <FaCalendarDay />
            </S.PerformanceIcon>
            <S.PerformanceContent>
              <S.PerformanceLabel>Hoàn thành hôm nay</S.PerformanceLabel>
              <S.PerformanceValue>{stats.todayCompleted}</S.PerformanceValue>
            </S.PerformanceContent>
          </S.PerformanceCard>
          <S.PerformanceCard>
            <S.PerformanceIcon $color="#ec4899">
              <FaChartLine />
            </S.PerformanceIcon>
            <S.PerformanceContent>
              <S.PerformanceLabel>Hoàn thành tuần này</S.PerformanceLabel>
              <S.PerformanceValue>{stats.weekCompleted}</S.PerformanceValue>
            </S.PerformanceContent>
          </S.PerformanceCard>
        </S.PerformanceGrid>

        {/* Daily Claim Limit Stats */}
        {statsLoading ? (
          <S.DailyLimitCard>
            <S.DailyLimitHeader>
              <S.DailyLimitTitle>
                <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Đang tải giới hạn hôm nay...
              </S.DailyLimitTitle>
            </S.DailyLimitHeader>
          </S.DailyLimitCard>
        ) : dailyStats ? (
          <S.DailyLimitCard $nearLimit={dailyStats.usagePercentage >= 80} $limitReached={dailyStats.limitReached}>
            <S.DailyLimitHeader>
              <S.DailyLimitTitle>
                <FaChartLine /> Giới hạn xử lý claim hôm nay
              </S.DailyLimitTitle>
              {dailyStats.limitReached && (
                <S.LimitBadge $error>
                  <FaExclamationTriangle /> Đã đạt giới hạn
                </S.LimitBadge>
              )}
            </S.DailyLimitHeader>
            <S.DailyLimitContent>
              <S.DailyLimitNumbers>
                <S.DailyLimitBig>{dailyStats.claimsStartedToday}</S.DailyLimitBig>
                <S.DailyLimitLabel>/ {dailyStats.dailyLimit} yêu cầu</S.DailyLimitLabel>
              </S.DailyLimitNumbers>
              <S.DailyLimitInfo>
                <div>Còn lại: <strong>{dailyStats.remainingClaims}</strong> yêu cầu</div>
                <div>Đã sử dụng: <strong>{dailyStats.usagePercentage.toFixed(1)}%</strong></div>
              </S.DailyLimitInfo>
            </S.DailyLimitContent>
            <S.DailyProgressBar>
              <S.DailyProgressFill
                $percentage={dailyStats.usagePercentage}
                $nearLimit={dailyStats.usagePercentage >= 80}
                $limitReached={dailyStats.limitReached}
              />
            </S.DailyProgressBar>
            {dailyStats.usagePercentage >= 80 && !dailyStats.limitReached && (
              <S.DailyWarningMessage>
                <FaExclamationTriangle /> Bạn đang gần đạt giới hạn xử lý claim trong ngày!
              </S.DailyWarningMessage>
            )}
            {dailyStats.limitReached && (
              <S.DailyWarningMessage $error>
                <FaExclamationTriangle /> Bạn đã đạt giới hạn {dailyStats.dailyLimit} yêu cầu trong ngày. Vui lòng thử lại vào ngày mai.
              </S.DailyWarningMessage>
            )}
          </S.DailyLimitCard>
        ) : null}

        <S.Section>
          <S.SectionHeader>
            <S.SectionTitle>Danh sách yêu cầu</S.SectionTitle>
            <S.FilterContainer>
              <FaFilter />
              <S.FilterButton $active={filterStatus === 'pending'} onClick={() => handleFilterChange('pending')}>
                Cần xử lý
              </S.FilterButton>
              <S.FilterButton $active={filterStatus === 'MANAGER_REVIEW'} onClick={() => handleFilterChange('MANAGER_REVIEW')}>
                Chờ xử lý
              </S.FilterButton>
              <S.FilterButton $active={filterStatus === 'PROCESSING'} onClick={() => handleFilterChange('PROCESSING')}>
                Đang xử lý
              </S.FilterButton>
              <S.FilterButton $active={filterStatus === 'COMPLETED'} onClick={() => handleFilterChange('COMPLETED')}>
                Hoàn thành
              </S.FilterButton>
            </S.FilterContainer>
          </S.SectionHeader>

          {claims.length === 0 ? (
            <S.EmptyState>
              <h3>🎉 Không có yêu cầu nào!</h3>
            </S.EmptyState>
          ) : (
            <>
              <S.TableContainer>
                <S.Table>
                  <thead>
                    <tr>
                      <S.Th>ID</S.Th>
                      <S.Th>Khách hàng</S.Th>
                      <S.Th>Xe (VIN)</S.Th>
                      <S.Th>Phụ tùng</S.Th>
                      <S.Th>Ngày tạo</S.Th>
                      <S.Th>Trạng thái</S.Th>
                      <S.Th>Thao tác</S.Th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map(claim => (
                      <tr key={claim.warrantyClaimId}>
                        <S.Td>{claim.warrantyClaimId}</S.Td>
                        <S.Td>{claim.customerName || 'N/A'}</S.Td>
                        <S.Td>{claim.vehicleVin || 'N/A'}</S.Td>
                        <S.Td>{claim.installedPartName || claim.installedPartId || 'N/A'}</S.Td>
                        <S.Td>{claim.claimDate ? new Date(claim.claimDate).toLocaleDateString('vi-VN') : 'N/A'}</S.Td>
                        <S.Td>
                          <S.StatusBadge $status={claim.status}>
                            {claim.status}
                          </S.StatusBadge>
                        </S.Td>
                        <S.Td>
                          <S.Button small onClick={() => openDetailModal(claim)}>
                            <FaEye /> Chi tiết
                          </S.Button>
                        </S.Td>
                      </tr>
                    ))}
                  </tbody>
                </S.Table>
              </S.TableContainer>
              {pagination.totalPages > 1 && (
                <S.PaginationContainer>
                  <S.Button
                    small
                    disabled={pagination.currentPage === 0}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                  >
                    Trước
                  </S.Button>
                  <S.PageInfo>
                    Trang {pagination.currentPage + 1} / {pagination.totalPages}
                    ({pagination.totalElements} bản ghi)
                  </S.PageInfo>
                  <S.Button
                    small
                    disabled={pagination.currentPage >= pagination.totalPages - 1}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                  >
                    Sau
                  </S.Button>
                </S.PaginationContainer>
              )}
            </>
          )}
        </S.Section>

        <ClaimDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          claim={selectedClaim}
          onStartProcessing={handleStartProcessing}
          onComplete={handleComplete}
        />
      </S.ContentWrapper>
    </S.PageContainer>
  );
};

export default MyWork;
