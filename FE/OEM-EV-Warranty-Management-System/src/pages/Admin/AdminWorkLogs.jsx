import React, { useState, useEffect } from 'react';
import * as S from './AdminWorkLogs.styles';
import {
  FaClipboardList, FaSearch, FaSpinner, FaInfoCircle, FaCalendar,
  FaClock, FaUser, FaFileAlt, FaFilter, FaExclamationTriangle
} from 'react-icons/fa';
import apiClient from '../../api/apiClient';

const AdminWorkLogs = () => {
  const [workLogs, setWorkLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filter options
  const [filterType, setFilterType] = useState('all'); // 'all', 'claim', 'user'
  const [claimId, setClaimId] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (filterType === 'all') {
      fetchAllWorkLogs();
    }
  }, [page, filterType]);

  const fetchAllWorkLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient(`/api/work-logs?page=${page}&size=10`);
      console.log('📝 All work logs:', response);

      if (response.content) {
        setWorkLogs(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      }
    } catch (err) {
      console.error('❌ Error fetching work logs:', err);
      setError(err.message || 'Không thể tải work logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkLogsByClaim = async (claimIdParam) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient(`/api/work-logs/by-claim/${claimIdParam}?page=0&size=100`);
      console.log('📝 Work logs by claim:', response);

      if (response.content) {
        setWorkLogs(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      }
    } catch (err) {
      console.error('❌ Error fetching work logs by claim:', err);
      setError(err.message || 'Không thể tải work logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkLogsByUser = async (userIdParam) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient(`/api/work-logs/by-user/${userIdParam}?page=0&size=100`);
      console.log('📝 Work logs by user:', response);

      if (response.content) {
        setWorkLogs(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      }
    } catch (err) {
      console.error('❌ Error fetching work logs by user:', err);
      setError(err.message || 'Không thể tải work logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterApply = (e) => {
    e.preventDefault();
    setPage(0);

    if (filterType === 'claim' && claimId.trim()) {
      fetchWorkLogsByClaim(claimId.trim());
    } else if (filterType === 'user' && userId.trim()) {
      fetchWorkLogsByUser(userId.trim());
    } else if (filterType === 'all') {
      fetchAllWorkLogs();
    }
  };

  const handleReset = () => {
    setClaimId('');
    setUserId('');
    setFilterType('all');
    setPage(0);
    fetchAllWorkLogs();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  };

  return (
    <S.PageContainer>
      <S.Header>
        <S.HeaderTitle>
          <FaClipboardList /> Quản lý Work Logs
        </S.HeaderTitle>
        <S.HeaderSubtitle>
          Xem nhật ký công việc của tất cả technician và staff
        </S.HeaderSubtitle>
      </S.Header>

      {/* Important Notice */}
      <S.NoticeBanner>
        <FaExclamationTriangle />
        <div>
          <strong>Lưu ý quan trọng:</strong> Work Log sẽ được tự động tạo khi:
          <ul style={{ margin: '8px 0 0 20px', paddingLeft: '0' }}>
            <li><strong>Technician bắt đầu xử lý claim</strong> (PATCH /api/warranty-claims/{'{id}'}/tech-start) → Ghi startTime</li>
            <li><strong>Technician hoàn thành claim</strong> (PATCH /api/warranty-claims/{'{id}'}/tech-complete) → Ghi endTime</li>
          </ul>
          <em style={{ fontSize: '13px', color: '#92400e' }}>
            ⚠️ Backend cần tích hợp logic tạo Work Log tự động trong WarrantyClaimServiceImpl
          </em>
        </div>
      </S.NoticeBanner>

      {/* Filter Section */}
      <S.FilterCard>
        <S.FilterLabel>
          <FaFilter /> Lọc Work Logs
        </S.FilterLabel>

        <S.FilterOptions>
          <S.RadioLabel $active={filterType === 'all'}>
            <input
              type="radio"
              name="filterType"
              value="all"
              checked={filterType === 'all'}
              onChange={(e) => setFilterType(e.target.value)}
            />
            Tất cả
          </S.RadioLabel>
          <S.RadioLabel $active={filterType === 'claim'}>
            <input
              type="radio"
              name="filterType"
              value="claim"
              checked={filterType === 'claim'}
              onChange={(e) => setFilterType(e.target.value)}
            />
            Theo Claim ID
          </S.RadioLabel>
          <S.RadioLabel $active={filterType === 'user'}>
            <input
              type="radio"
              name="filterType"
              value="user"
              checked={filterType === 'user'}
              onChange={(e) => setFilterType(e.target.value)}
            />
            Theo User ID
          </S.RadioLabel>
        </S.FilterOptions>

        {filterType === 'claim' && (
          <S.FilterInputGroup>
            <S.FilterInput
              type="number"
              value={claimId}
              onChange={(e) => setClaimId(e.target.value)}
              placeholder="Nhập Claim ID"
            />
            <S.ApplyButton onClick={handleFilterApply}>Áp dụng</S.ApplyButton>
          </S.FilterInputGroup>
        )}

        {filterType === 'user' && (
          <S.FilterInputGroup>
            <S.FilterInput
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Nhập User ID"
            />
            <S.ApplyButton onClick={handleFilterApply}>Áp dụng</S.ApplyButton>
          </S.FilterInputGroup>
        )}

        <S.ResetButton onClick={handleReset}>
          Làm mới
        </S.ResetButton>
      </S.FilterCard>

      {/* Stats */}
      <S.StatsCard>
        <S.StatItem>
          <S.StatLabel>Tổng số Work Logs</S.StatLabel>
          <S.StatValue>{totalElements}</S.StatValue>
        </S.StatItem>
        <S.StatItem>
          <S.StatLabel>Trang hiện tại</S.StatLabel>
          <S.StatValue>{page + 1} / {totalPages || 1}</S.StatValue>
        </S.StatItem>
      </S.StatsCard>

      {/* Error Message */}
      {error && (
        <S.ErrorMessage>
          <FaInfoCircle />
          {error}
        </S.ErrorMessage>
      )}

      {/* Loading State */}
      {loading && (
        <S.LoadingContainer>
          <FaSpinner className="spin" style={{ fontSize: '48px' }} />
          <p>Đang tải work logs...</p>
        </S.LoadingContainer>
      )}

      {/* Empty State */}
      {!loading && workLogs.length === 0 && (
        <S.EmptyState>
          <FaClipboardList style={{ fontSize: '64px', opacity: 0.3 }} />
          <h3>Chưa có Work Logs</h3>
          <p>Không tìm thấy work log nào</p>
          <S.HintText>
            💡 Work logs sẽ tự động được tạo khi technician bắt đầu và hoàn thành warranty claim
          </S.HintText>
        </S.EmptyState>
      )}

      {/* Work Logs Grid */}
      {!loading && workLogs.length > 0 && (
        <>
          <S.WorkLogsGrid>
            {workLogs.map((log) => (
              <S.WorkLogCard key={log.workLogId}>
                <S.WorkLogHeader>
                  <S.WorkLogId>
                    <FaClipboardList /> Work Log #{log.workLogId}
                  </S.WorkLogId>
                  <S.ClaimBadge>
                    Claim #{log.warrantyClaimId}
                  </S.ClaimBadge>
                </S.WorkLogHeader>

                <S.WorkLogBody>
                  <S.InfoRow>
                    <S.InfoLabel>
                      <FaUser /> Người thực hiện
                    </S.InfoLabel>
                    <S.InfoValue>
                      <strong>{log.username || 'N/A'}</strong> (ID: {log.userId})
                      {log.userEmail && <S.EmailText><br/>{log.userEmail}</S.EmailText>}
                    </S.InfoValue>
                  </S.InfoRow>

                  <S.InfoRow>
                    <S.InfoLabel>
                      <FaCalendar /> Bắt đầu
                    </S.InfoLabel>
                    <S.InfoValue>{formatDateTime(log.startTime)}</S.InfoValue>
                  </S.InfoRow>

                  <S.InfoRow>
                    <S.InfoLabel>
                      <FaCalendar /> Kết thúc
                    </S.InfoLabel>
                    <S.InfoValue>{formatDateTime(log.endTime)}</S.InfoValue>
                  </S.InfoRow>

                  <S.InfoRow>
                    <S.InfoLabel>
                      <FaClock /> Thời gian làm việc
                    </S.InfoLabel>
                    <S.DurationBadge>
                      {calculateDuration(log.startTime, log.endTime)}
                    </S.DurationBadge>
                  </S.InfoRow>

                  {log.claimDescription && (
                    <S.InfoRow>
                      <S.InfoLabel>
                        <FaFileAlt /> Mô tả Claim
                      </S.InfoLabel>
                      <S.InfoValue>{log.claimDescription}</S.InfoValue>
                    </S.InfoRow>
                  )}

                  <S.DescriptionSection>
                    <S.DescriptionLabel>
                      <FaFileAlt /> Mô tả công việc
                    </S.DescriptionLabel>
                    <S.DescriptionText>
                      {log.description || 'Không có mô tả'}
                    </S.DescriptionText>
                  </S.DescriptionSection>
                </S.WorkLogBody>
              </S.WorkLogCard>
            ))}
          </S.WorkLogsGrid>

          {/* Pagination */}
          {filterType === 'all' && totalPages > 1 && (
            <S.Pagination>
              <S.PaginationButton
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                Trước
              </S.PaginationButton>
              <S.PageInfo>
                Trang {page + 1} / {totalPages}
              </S.PageInfo>
              <S.PaginationButton
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
              >
                Sau
              </S.PaginationButton>
            </S.Pagination>
          )}
        </>
      )}
    </S.PageContainer>
  );
};

export default AdminWorkLogs;
