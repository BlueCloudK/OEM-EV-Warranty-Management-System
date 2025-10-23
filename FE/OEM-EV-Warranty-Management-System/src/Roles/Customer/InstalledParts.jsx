import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSpinner, FaArrowLeft } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

function normalize(raw) {
	if (!raw) return null;
	return {
		installedPartId: raw.installedPartId ?? raw.id ?? '',
		installationDate: raw.installationDate ?? raw.installedAt ?? null,
		warrantyExpirationDate: raw.warrantyExpirationDate ?? raw.warrantyExpires ?? null,
		partId: raw.partId ?? raw.part?.partId ?? '',
		partName: raw.partName ?? raw.part?.name ?? '',
		partNumber: raw.partNumber ?? raw.part?.number ?? '',
		manufacturer: raw.manufacturer ?? raw.part?.manufacturer ?? '',
		price: raw.price ?? raw.part?.price ?? 0,
		vehicleId: raw.vehicleId ?? raw.vehicle?.vehicleId ?? null,
		vehicleName: raw.vehicleName ?? raw.vehicle?.name ?? '',
		vehicleVin: raw.vehicleVin ?? raw.vehicle?.vin ?? ''
	};
}

const styles = {
	page: { padding: 24, maxWidth: 980, margin: '0 auto' },
	backBtn: { marginBottom: 12, background: 'transparent', border: 'none', cursor: 'pointer', color: '#374151' },
	card: { background: '#fff', padding: 22, borderRadius: 12, border: '1px solid #e6e9ee', boxShadow: '0 6px 20px rgba(16,24,40,0.04)' },
	rowLabel: { fontSize: 13, color: '#6b7280' },
	rowValue: { fontSize: 15, fontWeight: 700, color: '#0f172a' },
	grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }
};

const InstalledParts = () => {
	const { installedPartId } = useParams();
	const navigate = useNavigate();
	const [part, setPart] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (installedPartId) fetchPart(installedPartId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [installedPartId]);

	async function getAuthHeaders() {
		const token = localStorage.getItem('token');
		return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
	}

	async function fetchPart(id) {
		try {
			setLoading(true);
			setError(null);
			if (!id) return;

			const token = localStorage.getItem('token');
			if (!token || !API_BASE) {
				// mock
				const mock = {
					installedPartId: id,
					installationDate: '2025-10-23',
					warrantyExpirationDate: '2026-10-23',
					partId: 'P-777',
					partName: 'Battery Module',
					partNumber: 'BM-2025',
					manufacturer: 'Acme Parts',
					price: 1234.5,
					vehicleId: 101,
					vehicleName: 'OEM EV Model X',
					vehicleVin: 'VIN-EXAMPLE-101'
				};
				setPart(normalize(mock));
				return;
			}

			const headers = await getAuthHeaders();
			const res = await fetch(`${API_BASE}/api/installed-parts/${encodeURIComponent(id)}`, { method: 'GET', headers });
			if (!res.ok) {
				const txt = await res.text();
				throw new Error(txt || `HTTP ${res.status}`);
			}
			const data = await res.json();
			setPart(normalize(data));
		} catch (err) {
			console.error('fetchPart error', err);
			setError(err.message || 'Lỗi khi tải thông tin bộ phận');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div style={styles.page}>
			<button onClick={() => navigate(-1)} style={styles.backBtn}><FaArrowLeft /> Quay lại</button>
			<div style={styles.card}>
				<h2 style={{ margin: 0, fontSize: 20 }}>Thông tin bộ phận đã lắp</h2>
				<p style={{ margin: '6px 0 16px 0', color: '#6b7280' }}>Thông tin chi tiết về bộ phận được lắp cho phương tiện của bạn.</p>

				{loading ? (
					<div style={{ textAlign: 'center', padding: 30 }}><FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: 20, color: '#2563eb' }} /></div>
				) : error ? (
					<div style={{ color: 'red' }}>Lỗi: {error}</div>
				) : !part ? (
					<div>Không tìm thấy thông tin bộ phận.</div>
				) : (
					<div style={styles.grid}>
						<div>
							<div style={styles.rowLabel}>Mã bộ phận</div>
							<div style={styles.rowValue}>{part.partId}</div>

							<div style={{ marginTop: 12, ...styles.rowLabel }}>Tên bộ phận</div>
							<div style={styles.rowValue}>{part.partName}</div>

							<div style={{ marginTop: 12, ...styles.rowLabel }}>Số hiệu</div>
							<div style={styles.rowValue}>{part.partNumber}</div>

							<div style={{ marginTop: 12, ...styles.rowLabel }}>Nhà sản xuất</div>
							<div style={styles.rowValue}>{part.manufacturer}</div>
						</div>

						<div>
							<div style={styles.rowLabel}>Giá</div>
							<div style={styles.rowValue}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(part.price || 0)}</div>

							<div style={{ marginTop: 12, ...styles.rowLabel }}>Ngày lắp</div>
							<div style={styles.rowValue}>{part.installationDate}</div>

							<div style={{ marginTop: 12, ...styles.rowLabel }}>Hết hạn bảo hành</div>
							<div style={styles.rowValue}>{part.warrantyExpirationDate}</div>

							<div style={{ marginTop: 12, ...styles.rowLabel }}>Xe</div>
							<div style={styles.rowValue}>{part.vehicleName} <span style={{ fontFamily: 'monospace', color: '#6b7280', fontWeight: 500 }}> {part.vehicleVin}</span></div>
						</div>
					</div>
				)}
			</div>

			<style>{`@keyframes spin {0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`}</style>
		</div>
	);
};

export default InstalledParts;
