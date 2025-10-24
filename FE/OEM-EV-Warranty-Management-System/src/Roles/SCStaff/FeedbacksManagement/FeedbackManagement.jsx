import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaComments, FaSearch, FaChevronLeft, FaChevronRight, FaArrowLeft } from 'react-icons/fa';

const mockFeedbacks = [
	{
		feedbackId: 1,
		rating: 5,
		comment: 'Dịch vụ tốt, nhân viên nhiệt tình',
		createdAt: '2025-10-20T08:12:00.000Z',
		warrantyClaimId: 101,
		claimDescription: 'Pin sụt nhanh',
		customerId: 'cst-001',
		customerName: 'Nguyen Van A',
		customerEmail: 'a@example.com'
	},
	{
		feedbackId: 2,
		rating: 3,
		comment: 'Chờ lâu nhưng kết quả ok',
		createdAt: '2025-10-22T10:30:00.000Z',
		warrantyClaimId: 102,
		claimDescription: 'Linh kiện lỗi',
		customerId: 'cst-002',
		customerName: 'Tran Thi B',
		customerEmail: 'b@example.com'
	}
];

const FeedbackManagement = () => {
	const navigate = useNavigate();
	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
	const [token] = useState(() => localStorage.getItem('token'));

	const [loading, setLoading] = useState(false);
	const [feedbacks, setFeedbacks] = useState([]);
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);
	const [totalPages, setTotalPages] = useState(1);
	const [totalElements, setTotalElements] = useState(0);
	const [search, setSearch] = useState('');
	const [ratingFilter, setRatingFilter] = useState('');
	const [claimIdLookup, setClaimIdLookup] = useState('');
	const [idLookup, setIdLookup] = useState('');
	const [selectedFeedback, setSelectedFeedback] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		loadFeedbacks();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, size, search, ratingFilter]);

	const buildPagedResult = (arr) => {
		const start = page * size;
		const slice = arr.slice(start, start + size);
		return {
			content: slice,
			page,
			size,
			totalElements: arr.length,
			totalPages: Math.max(1, Math.ceil(arr.length / size)),
			first: page === 0,
			last: start + slice.length >= arr.length
		};
	};

	const loadFeedbacks = async () => {
		setLoading(true);
		setError(null);

		try {
			if (!API_BASE_URL || !token) {
				// fallback to mock and apply search/rating client-side
				let results = mockFeedbacks.slice();
				if (search) {
					const s = search.toLowerCase();
					results = results.filter(r => (r.comment || '').toLowerCase().includes(s) || (r.customerName || '').toLowerCase().includes(s));
				}
				if (ratingFilter) results = results.filter(r => String(r.rating) === String(ratingFilter));

				const paged = buildPagedResult(results);
				setFeedbacks(paged.content);
				setTotalElements(paged.totalElements);
				setTotalPages(paged.totalPages);
				setLoading(false);
				return;
			}

			// choose endpoint: by-rating has its own endpoint
			let url = '';
			if (ratingFilter) {
				url = `${API_BASE_URL}/api/feedbacks/by-rating/${encodeURIComponent(ratingFilter)}?page=${page}&size=${size}`;
			} else {
				url = `${API_BASE_URL}/api/feedbacks?page=${page}&size=${size}`;
				if (search && search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
			}

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
			});

			if (!res.ok) {
				throw new Error(`Status ${res.status}`);
			}

			const data = await res.json();
			// If API returns paged shape use it, else try to adapt
			if (data && data.content) {
				setFeedbacks(data.content);
				setTotalElements(data.totalElements || 0);
				setTotalPages(data.totalPages || 1);
			} else if (Array.isArray(data)) {
				const paged = buildPagedResult(data);
				setFeedbacks(paged.content);
				setTotalElements(paged.totalElements);
				setTotalPages(paged.totalPages);
			} else {
				setFeedbacks([]);
				setTotalElements(0);
				setTotalPages(1);
			}
		} catch (err) {
			console.error('Error loading feedbacks', err);
			setError(err.message || 'Error');
			// fallback to mock in case of failure
			const paged = buildPagedResult(mockFeedbacks);
			setFeedbacks(paged.content);
			setTotalElements(paged.totalElements);
			setTotalPages(paged.totalPages);
		} finally {
			setLoading(false);
		}
	};

	const fetchById = async (id) => {
		if (!id) return;
		setLoading(true);
		setSelectedFeedback(null);
		try {
			if (!API_BASE_URL || !token) {
				const found = mockFeedbacks.find(m => String(m.feedbackId) === String(id));
				setSelectedFeedback(found || null);
				return;
			}

			const res = await fetch(`${API_BASE_URL}/api/feedbacks/${encodeURIComponent(id)}`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			if (!res.ok) throw new Error(`Status ${res.status}`);
			const data = await res.json();
			setSelectedFeedback(data);
		} catch (err) {
			console.error('Error fetching by id', err);
			setError(err.message || 'Error');
		} finally {
			setLoading(false);
		}
	};

	const fetchByClaim = async (claimId) => {
		if (!claimId) return;
		setLoading(true);
		setError(null);
		try {
			if (!API_BASE_URL || !token) {
				const results = mockFeedbacks.filter(m => String(m.warrantyClaimId) === String(claimId));
				const paged = buildPagedResult(results);
				setFeedbacks(paged.content);
				setTotalElements(paged.totalElements);
				setTotalPages(paged.totalPages);
				return;
			}

			const res = await fetch(`${API_BASE_URL}/api/feedbacks/by-claim/${encodeURIComponent(claimId)}`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			if (!res.ok) throw new Error(`Status ${res.status}`);
			const data = await res.json();
			// assume server returns array or paged object
			if (data.content) {
				setFeedbacks(data.content);
				setTotalElements(data.totalElements || 0);
				setTotalPages(data.totalPages || 1);
			} else if (Array.isArray(data)) {
				const paged = buildPagedResult(data);
				setFeedbacks(paged.content);
				setTotalElements(paged.totalElements);
				setTotalPages(paged.totalPages);
			} else {
				setFeedbacks([]);
				setTotalElements(0);
				setTotalPages(1);
			}
		} catch (err) {
			console.error('Error fetching by claim', err);
			setError(err.message || 'Error');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ padding: 20 }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
					<button onClick={() => navigate('/scstaff')} style={{ background: '#f3f4f6', color: '#374151', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
						<FaArrowLeft /> Quay lại
					</button>
					<h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}><FaComments /> Quản lý Feedbacks</h1>
				</div>
				<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
					<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm..." style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
					<select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8 }}>
						<option value="">-- Lọc theo rating --</option>
						<option value="5">5</option>
						<option value="4">4</option>
						<option value="3">3</option>
						<option value="2">2</option>
						<option value="1">1</option>
					</select>
					<button onClick={() => { setPage(0); loadFeedbacks(); }} style={{ padding: '8px 12px', borderRadius: 8, background: '#3b82f6', color: '#fff', border: 'none', display: 'flex', gap: 8, alignItems: 'center' }}><FaSearch /> Tìm</button>
				</div>
			</div>

			<div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
				<div style={{ display: 'flex', gap: 8 }}>
					<input placeholder="Tìm theo Claim ID" value={claimIdLookup} onChange={e => setClaimIdLookup(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
					<button onClick={() => fetchByClaim(claimIdLookup)} style={{ padding: '8px 12px', borderRadius: 8, background: '#06b6d4', color: '#fff', border: 'none' }}>By Claim</button>
				</div>

				<div style={{ display: 'flex', gap: 8 }}>
					<input placeholder="Tìm theo Feedback ID" value={idLookup} onChange={e => setIdLookup(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
					<button onClick={() => fetchById(idLookup)} style={{ padding: '8px 12px', borderRadius: 8, background: '#8b5cf6', color: '#fff', border: 'none' }}>By ID</button>
				</div>
			</div>

			{error && <div style={{ color: '#ef4444', marginBottom: 8 }}>{error}</div>}

			<div style={{ background: '#fff', padding: 12, borderRadius: 12, border: '1px solid #e5e7eb' }}>
				{loading ? (
					<div>Đang tải...</div>
				) : selectedFeedback ? (
					<div>
						<h3>Chi tiết Feedback #{selectedFeedback.feedbackId}</h3>
						<pre style={{ background: '#f8fafc', padding: 12 }}>{JSON.stringify(selectedFeedback, null, 2)}</pre>
						<button onClick={() => setSelectedFeedback(null)} style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8 }}>Đóng</button>
					</div>
				) : (
					<>
						<table style={{ width: '100%', borderCollapse: 'collapse' }}>
							<thead>
								<tr style={{ textAlign: 'left', borderBottom: '1px solid #f3f4f6' }}>
									<th style={{ padding: 12 }}>ID</th>
									<th style={{ padding: 12 }}>Rating</th>
									<th style={{ padding: 12 }}>Comment</th>
									<th style={{ padding: 12 }}>Created At</th>
									<th style={{ padding: 12 }}>Claim ID</th>
									<th style={{ padding: 12 }}>Customer</th>
								</tr>
							</thead>
							<tbody>
								{feedbacks.map(f => (
									<tr key={f.feedbackId} style={{ borderBottom: '1px solid #f8fafc' }}>
										<td style={{ padding: 12 }}>{f.feedbackId}</td>
										<td style={{ padding: 12 }}>{f.rating}</td>
										<td style={{ padding: 12 }}>{f.comment || f.comment}</td>
										<td style={{ padding: 12 }}>{f.createdAt}</td>
										<td style={{ padding: 12 }}>{f.warrantyClaimId}</td>
										<td style={{ padding: 12 }}>{f.customerName} <div style={{ color: '#6b7280', fontSize: 12 }}>{f.customerEmail}</div></td>
									</tr>
								))}
								{feedbacks.length === 0 && (
									<tr>
										<td colSpan={6} style={{ padding: 12, textAlign: 'center', color: '#6b7280' }}>Không có feedback nào</td>
									</tr>
								)}
							</tbody>
						</table>

						{/* Pagination */}
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
							<div style={{ color: '#6b7280' }}>Hiển thị {feedbacks.length} / {totalElements} feedbacks</div>
							<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
								<button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: '8px 10px', borderRadius: 8 }}><FaChevronLeft /></button>
								<div>Trang {page + 1} / {totalPages}</div>
								<button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ padding: '8px 10px', borderRadius: 8 }}><FaChevronRight /></button>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default FeedbackManagement;
