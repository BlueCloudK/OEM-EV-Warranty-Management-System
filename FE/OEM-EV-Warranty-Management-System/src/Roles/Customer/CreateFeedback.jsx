import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSpinner, FaArrowLeft } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

function normalize(resp) {
	if (!resp) return null;
	return {
		feedbackId: resp.feedbackId ?? resp.id ?? null,
		rating: resp.rating ?? 0,
		comment: resp.comment ?? '',
		createdAt: resp.createdAt ?? null,
		warrantyClaimId: resp.warrantyClaimId ?? null,
		claimDescription: resp.claimDescription ?? '' ,
		customerId: resp.customerId ?? null,
		customerName: resp.customerName ?? '',
		customerEmail: resp.customerEmail ?? ''
	};
}

const styles = {
	page: { padding: 24, maxWidth: 840, margin: '0 auto' },
	backBtn: { marginBottom: 12, background: 'transparent', border: 'none', cursor: 'pointer', color: '#374151' },
	card: { background: '#fff', padding: 22, borderRadius: 12, border: '1px solid #e6e9ee', boxShadow: '0 6px 20px rgba(16,24,40,0.04)' },
	header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
	title: { margin: 0, fontSize: 20, color: '#0f172a' },
	subtitle: { margin: 0, color: '#6b7280', fontSize: 13 },
	label: { display: 'block', fontSize: 13, color: '#4b5563', marginBottom: 6 },
	input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6e9ee', fontSize: 14, outline: 'none' },
	textarea: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6e9ee', fontSize: 14, minHeight: 120, outline: 'none' },
	actions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 },
	btn: { padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#374151', cursor: 'pointer' },
	btnPrimary: { padding: '10px 14px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' },
	messageError: { background: '#fff1f2', color: '#b91c1c', padding: 10, borderRadius: 8, border: '1px solid #fee2e2' },
	messageSuccess: { background: '#ecfdf5', color: '#065f46', padding: 10, borderRadius: 8, border: '1px solid #bbf7d0' }
};

const CreateFeedback = () => {
	const navigate = useNavigate();
	const { id } = useParams(); // optional feedback id for edit

	const [warrantyClaimId, setWarrantyClaimId] = useState('');
	const [rating, setRating] = useState(5);
	const [comment, setComment] = useState('');
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);
	const [successMsg, setSuccessMsg] = useState(null);

	useEffect(() => {
		if (id) fetchFeedback(id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	async function getAuthHeaders() {
		const token = localStorage.getItem('token');
		return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
	}

	async function fetchFeedback(fid) {
		try {
			setLoading(true);
			setError(null);
			if (!fid) return;

			const token = localStorage.getItem('token');
			if (!token || !API_BASE) {
				// mock
				const mock = {
					feedbackId: Number(fid) || 1,
					rating: 4,
					comment: 'Dịch vụ tốt, cảm ơn',
					createdAt: new Date().toISOString(),
					warrantyClaimId: 11,
					claimDescription: 'Thay pin',
					customerId: 'C-100',
					customerName: 'Nguyen Van A',
					customerEmail: 'a@example.com'
				};
				const n = normalize(mock);
				setRating(n.rating);
				setComment(n.comment);
				setWarrantyClaimId(n.warrantyClaimId ?? '');
				return;
			}

			const headers = await getAuthHeaders();
			const res = await fetch(`${API_BASE}/api/feedbacks/${encodeURIComponent(fid)}`, { method: 'GET', headers });
			if (!res.ok) {
				const txt = await res.text();
				throw new Error(txt || `HTTP ${res.status}`);
			}
			const data = await res.json();
			const n = normalize(data);
			setRating(n.rating);
			setComment(n.comment);
			setWarrantyClaimId(n.warrantyClaimId ?? '');
		} catch (err) {
			console.error('fetchFeedback error', err);
			setError(err.message || 'Lỗi khi tải feedback');
		} finally {
			setLoading(false);
		}
	}

	async function handleSubmit(e) {
		e.preventDefault();
		setError(null);
		setSuccessMsg(null);

		if (!rating || rating < 1 || rating > 5) {
			setError('Vui lòng chọn rating từ 1-5');
			return;
		}

		const payload = id ? { rating, comment } : { warrantyClaimId: warrantyClaimId || null, rating, comment };

		try {
			setSaving(true);
			const token = localStorage.getItem('token');
			if (!token || !API_BASE) {
				// mock response
				const mockResp = Object.assign({
					feedbackId: id ? Number(id) : Math.floor(Math.random() * 9000) + 100,
					createdAt: new Date().toISOString(),
					warrantyClaimId: payload.warrantyClaimId ?? 0,
					customerId: 'C-MOCK',
					customerName: 'Mock User',
					customerEmail: 'mock@example.com'
				}, payload);
				const norm = normalize(mockResp);
				setSuccessMsg('Feedback đã được lưu (mock).');
				// keep form values
				return;
			}

			const headers = await getAuthHeaders();
			let res;
			if (id) {
				res = await fetch(`${API_BASE}/api/feedbacks/${encodeURIComponent(id)}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
			} else {
				res = await fetch(`${API_BASE}/api/feedbacks`, { method: 'POST', headers, body: JSON.stringify(payload) });
			}

			if (!res.ok) {
				const txt = await res.text();
				throw new Error(txt || `HTTP ${res.status}`);
			}

			const data = await res.json();
			const n = normalize(data);
			setSuccessMsg('Feedback đã được lưu.');
			// optionally redirect to feedback detail or list
			// navigate(`/customer/feedbacks/${n.feedbackId}`);
		} catch (err) {
			console.error('save feedback error', err);
			setError(err.message || 'Lỗi khi lưu feedback');
		} finally {
			setSaving(false);
		}
	}

	return (
		<div style={styles.page}>
			<button onClick={() => navigate(-1)} style={styles.backBtn}><FaArrowLeft /> Quay lại</button>

			<div style={styles.card}>
				<div style={styles.header}>
					<div>
						<h2 style={styles.title}>{id ? 'Chỉnh sửa feedback' : 'Tạo feedback mới'}</h2>
						<p style={styles.subtitle}>Hãy cho chúng tôi biết trải nghiệm dịch vụ của bạn. Đánh giá và phản hồi sẽ giúp chúng tôi cải thiện.</p>
					</div>
				</div>

				{loading ? (
					<div style={{ textAlign: 'center', padding: 30 }}><FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: 20, color: '#2563eb' }} /></div>
				) : (
					<form onSubmit={handleSubmit}>
						<div style={{ display: 'grid', gap: 14 }}>
							{!id && (
								<div>
									<label style={styles.label}>Warranty Claim ID</label>
									<input value={warrantyClaimId} onChange={(e) => setWarrantyClaimId(e.target.value)} placeholder="Số yêu cầu bảo hành (nếu có)" style={styles.input} />
								</div>
							)}

							<div>
								<label style={styles.label}>Rating</label>
								<select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ ...styles.input, width: 160 }}>
									<option value={5}>5 - Xuất sắc</option>
									<option value={4}>4 - Tốt</option>
									<option value={3}>3 - Trung bình</option>
									<option value={2}>2 - Kém</option>
									<option value={1}>1 - Rất kém</option>
								</select>
							</div>

							<div>
								<label style={styles.label}>Comment</label>
								<textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Viết nhận xét của bạn..." rows={6} style={styles.textarea} />
							</div>

							{error && <div style={styles.messageError}>{error}</div>}
							{successMsg && <div style={styles.messageSuccess}>{successMsg}</div>}

							<div style={styles.actions}>
								<button type="button" onClick={() => navigate(-1)} style={styles.btn}>Hủy</button>
								<button type="submit" disabled={saving} style={saving ? { ...styles.btnPrimary, opacity: 0.7, cursor: 'not-allowed' } : styles.btnPrimary}>{saving ? 'Đang lưu...' : id ? 'Cập nhật' : 'Gửi feedback'}</button>
							</div>
						</div>
					</form>
				)}
			</div>

			<style>{`@keyframes spin {0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`}</style>
		</div>
	);
};

export default CreateFeedback;
