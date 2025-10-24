import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBoxOpen, FaArrowLeft } from 'react-icons/fa';

const mockParts = [
	{ partId: 'P-001', partName: 'Battery Pack', partNumber: 'BP-1000', manufacturer: 'PowerCo', price: 1200 },
	{ partId: 'P-002', partName: 'Brake Pad', partNumber: 'BR-200', manufacturer: 'BrakeCorp', price: 45 }
];

const ViewParts = () => {
	const navigate = useNavigate();
	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
	const token = localStorage.getItem('token');

	const [loading, setLoading] = useState(false);
	const [parts, setParts] = useState([]);
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);
	const [totalPages, setTotalPages] = useState(1);
	const [totalElements, setTotalElements] = useState(0);
	const [selected, setSelected] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => { loadParts(); /* eslint-disable-next-line */ }, [page, size]);

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

	const loadParts = async () => {
		setLoading(true);
		setError(null);
		try {
			if (!API_BASE_URL || !token) {
				// fallback mock + search
				let items = mockParts.slice();
				if (search) {
					const s = search.toLowerCase();
					items = items.filter(p => p.partName.toLowerCase().includes(s) || p.partNumber.toLowerCase().includes(s) || p.partId.toLowerCase().includes(s));
				}
				const paged = buildPagedResult(items);
				setParts(paged.content);
				setTotalElements(paged.totalElements);
				setTotalPages(paged.totalPages);
				return;
			}

			let url = `${API_BASE_URL}/api/parts?page=${page}&size=${size}`;
			if (search && search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

			const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
			if (!res.ok) throw new Error(`Status ${res.status}`);
			const data = await res.json();
			if (data && data.content) {
				setParts(data.content);
				setTotalElements(data.totalElements || 0);
				setTotalPages(data.totalPages || 1);
			} else if (Array.isArray(data)) {
				const paged = buildPagedResult(data);
				setParts(paged.content);
				setTotalElements(paged.totalElements);
				setTotalPages(paged.totalPages);
			} else {
				setParts([]);
				setTotalElements(0);
				setTotalPages(1);
			}
		} catch (err) {
			console.error('Error loading parts', err);
			setError(err.message || 'Error');
			const paged = buildPagedResult(mockParts);
			setParts(paged.content);
			setTotalElements(paged.totalElements);
			setTotalPages(paged.totalPages);
		} finally {
			setLoading(false);
		}
	};

	const fetchPartById = async (id) => {
		if (!id) return;
		setLoading(true);
		setError(null);
		try {
			if (!API_BASE_URL || !token) {
				const found = mockParts.find(p => String(p.partId) === String(id));
				setSelected(found || null);
				return;
			}
			const res = await fetch(`${API_BASE_URL}/api/parts/${encodeURIComponent(id)}`, { headers: { 'Authorization': `Bearer ${token}` } });
			if (!res.ok) throw new Error(`Status ${res.status}`);
			const data = await res.json();
			setSelected(data);
		} catch (err) {
			console.error('Error fetching part by id', err);
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
					<h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}><FaBoxOpen /> Xem phụ tùng</h1>
				</div>
				<div style={{ display: 'flex', gap: 8 }}>
					<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm part name/number..." style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
					<button onClick={() => { setPage(0); loadParts(); }} style={{ padding: '8px 12px', borderRadius: 8, background: '#3b82f6', color: '#fff', border: 'none' }}><FaSearch /> Tìm</button>
				</div>
			</div>

			<div style={{ background: '#fff', padding: 12, borderRadius: 12, border: '1px solid #e5e7eb' }}>
				{loading ? <div>Đang tải...</div> : (
					selected ? (
						<div>
							<h3>Chi tiết phụ tùng: {selected.partName}</h3>
							<pre style={{ background: '#f8fafc', padding: 12 }}>{JSON.stringify(selected, null, 2)}</pre>
							<button onClick={() => setSelected(null)} style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8 }}>Đóng</button>
						</div>
					) : (
						<>
							<table style={{ width: '100%', borderCollapse: 'collapse' }}>
								<thead>
									<tr style={{ textAlign: 'left', borderBottom: '1px solid #f3f4f6' }}>
										<th style={{ padding: 12 }}>Part ID</th>
										<th style={{ padding: 12 }}>Name</th>
										<th style={{ padding: 12 }}>Part Number</th>
										<th style={{ padding: 12 }}>Manufacturer</th>
										<th style={{ padding: 12 }}>Price</th>
										<th style={{ padding: 12 }}>Thao tác</th>
									</tr>
								</thead>
								<tbody>
									{parts.map(p => (
										<tr key={p.partId} style={{ borderBottom: '1px solid #f8fafc' }}>
											<td style={{ padding: 12 }}>{p.partId}</td>
											<td style={{ padding: 12 }}>{p.partName}</td>
											<td style={{ padding: 12 }}>{p.partNumber}</td>
											<td style={{ padding: 12 }}>{p.manufacturer}</td>
											<td style={{ padding: 12 }}>{p.price}</td>
											<td style={{ padding: 12 }}><button onClick={() => fetchPartById(p.partId)} style={{ padding: '6px 10px', borderRadius: 6 }}>Xem</button></td>
										</tr>
									))}
									{parts.length === 0 && (
										<tr><td colSpan={6} style={{ padding: 12, textAlign: 'center', color: '#6b7280' }}>Không có phụ tùng</td></tr>
									)}
								</tbody>
							</table>

							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
								<div style={{ color: '#6b7280' }}>Hiển thị {parts.length} / {totalElements} phụ tùng</div>
								<div style={{ display: 'flex', gap: 8 }}>
									<button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: '8px 10px', borderRadius: 8 }}>Trước</button>
									<div>Trang {page + 1} / {totalPages}</div>
									<button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ padding: '8px 10px', borderRadius: 8 }}>Sau</button>
								</div>
							</div>
						</>
					)
				)}
			</div>
			{error && <div style={{ color: '#ef4444', marginTop: 8 }}>{error}</div>}
		</div>
	);
};

export default ViewParts;
