import React, { useState, useEffect } from 'react';
import { dataApi } from '../../api/dataApi';
import * as S from './InstallPart.styles';
import { FaTools, FaExclamationTriangle, FaCheckCircle, FaBan } from 'react-icons/fa';

import useAutoRefresh from '../../hooks/useAutoRefresh';

const InstallPart = () => {
    const [vehicles, setVehicles] = useState([]);
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [selectedPartId, setSelectedPartId] = useState('');
    const [installDate, setInstallDate] = useState(new Date().toISOString().split('T')[0]);
    const [mileageAtInstallation, setMileageAtInstallation] = useState('');
    const [technicianNotes, setTechnicianNotes] = useState('');

    const [categoryStatus, setCategoryStatus] = useState({
        checking: false,
        count: 0,
        max: 0,
        categoryName: '',
        isLimitReached: false,
        isNearLimit: false
    });

    // Refactored fetch function for auto-refresh
    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [vehiclesRes, partsRes] = await Promise.all([
                dataApi.getAllVehicles({ size: 100 }), // Get first 100 vehicles for now
                dataApi.getAllParts({ size: 100 })
            ]);
            setVehicles(vehiclesRes.content || []);
            setParts(partsRes.content || []);
        } catch (error) {
            console.error("Error loading data:", error);
            if (!silent) alert("Không thể tải danh sách xe và phụ tùng. Vui lòng thử lại.");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // Auto-refresh logic (Visibility only)
    const { lastUpdated, isRefreshing } = useAutoRefresh({
        fetchData: fetchData,
        shouldPoll: false
    });

    // Check category limit when vehicle or part changes
    useEffect(() => {
        const checkLimit = async () => {
            if (!selectedVehicleId || !selectedPartId) {
                setCategoryStatus(prev => ({ ...prev, checking: false, isLimitReached: false, isNearLimit: false }));
                return;
            }

            const part = parts.find(p => p.partId === parseInt(selectedPartId));
            if (!part || !part.categoryId) {
                // Part has no category -> No limit
                setCategoryStatus({
                    checking: false,
                    count: 0,
                    max: 0,
                    categoryName: '',
                    isLimitReached: false,
                    isNearLimit: false
                });
                return;
            }

            setCategoryStatus(prev => ({ ...prev, checking: true }));

            try {
                // Fetch installed parts for this vehicle
                const installedPartsRes = await dataApi.getInstalledPartsByVehicle(selectedVehicleId, { size: 100 });
                const installedParts = installedPartsRes.content || [];

                // Count parts in the same category
                const sameCategoryParts = installedParts.filter(ip => ip.categoryId === part.categoryId);
                const count = sameCategoryParts.length;
                const max = part.maxQuantityPerVehicle;

                setCategoryStatus({
                    checking: false,
                    count,
                    max,
                    categoryName: part.categoryName,
                    isLimitReached: count >= max,
                    isNearLimit: count === max - 1
                });

            } catch (error) {
                console.error("Error checking category limit:", error);
                // On error, assume no limit to avoid blocking, but log it
                setCategoryStatus(prev => ({ ...prev, checking: false }));
            }
        };

        checkLimit();
    }, [selectedVehicleId, selectedPartId, parts]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (categoryStatus.isLimitReached) {
            alert(`Không thể lắp đặt! Xe đã đạt giới hạn số lượng ${categoryStatus.categoryName}.`);
            return;
        }

        setSubmitting(true);
        try {
            await dataApi.createInstalledPart({
                vehicleId: parseInt(selectedVehicleId),
                partId: parseInt(selectedPartId),
                installDate: installDate,
                mileageAtInstallation: parseInt(mileageAtInstallation),
                technicianNotes: technicianNotes
            });

            alert("Lắp đặt phụ tùng thành công!");

            // Reset form
            setSelectedPartId('');
            setMileageAtInstallation('');
            setTechnicianNotes('');
            setCategoryStatus(prev => ({ ...prev, isLimitReached: false, isNearLimit: false }));

            // Refresh data to update counts if needed (though checkLimit handles it, refreshing parts/vehicles is good practice)
            fetchData(true);

        } catch (error) {
            console.error("Error installing part:", error);
            alert(error.message || "Có lỗi xảy ra khi lắp đặt phụ tùng.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <S.LoadingOverlay>Đang tải dữ liệu...</S.LoadingOverlay>;

    return (
        <S.PageContainer>
            <S.ContentWrapper>
                <S.Header>
                    <S.Title>
                        <FaTools /> Lắp Đặt Phụ Tùng Mới
                        {lastUpdated && (
                            <small style={{ color: '#7f8c8d', fontSize: '12px', marginLeft: '12px', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {isRefreshing && <FaSpinner className="spinner" />}
                                Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
                            </small>
                        )}
                    </S.Title>
                </S.Header>

                <S.Form onSubmit={handleSubmit}>
                    {/* Vehicle Selection */}
                    <S.FormGroup>
                        <S.Label>Chọn Xe *</S.Label>
                        <S.Select
                            value={selectedVehicleId}
                            onChange={e => setSelectedVehicleId(e.target.value)}
                            required
                        >
                            <option value="">-- Chọn xe --</option>
                            {vehicles.map(v => (
                                <option key={v.vehicleId} value={v.vehicleId}>
                                    {v.vehicleVin} - {v.vehicleName} ({v.licensePlate})
                                </option>
                            ))}
                        </S.Select>
                    </S.FormGroup>

                    {/* Part Selection */}
                    <S.FormGroup>
                        <S.Label>Chọn Phụ Tùng *</S.Label>
                        <S.Select
                            value={selectedPartId}
                            onChange={e => setSelectedPartId(e.target.value)}
                            required
                        >
                            <option value="">-- Chọn phụ tùng --</option>
                            {parts.map(p => (
                                <option key={p.partId} value={p.partId}>
                                    {p.partName} - {p.partNumber}
                                    {p.categoryName ? ` [${p.categoryName}]` : ''}
                                </option>
                            ))}
                        </S.Select>
                        {selectedPartId && (
                            <S.PartInfo>
                                {(() => {
                                    const p = parts.find(part => part.partId === parseInt(selectedPartId));
                                    return p ? (
                                        <>
                                            <div><strong>Nhà sản xuất:</strong> {p.manufacturer}</div>
                                            <div><strong>Giá:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</div>
                                            <div><strong>Bảo hành:</strong> {p.hasExtendedWarranty ? `${p.defaultWarrantyMonths} tháng / ${p.defaultWarrantyMileage} km` : 'Theo xe'}</div>
                                        </>
                                    ) : null;
                                })()}
                            </S.PartInfo>
                        )}
                    </S.FormGroup>

                    {/* Category Limit Warning */}
                    {categoryStatus.categoryName && (
                        <>
                            {categoryStatus.isLimitReached ? (
                                <S.Alert variant="error">
                                    <FaBan />
                                    <div>
                                        <strong>KHÔNG THỂ LẮP ĐẶT!</strong><br />
                                        Xe đã có <strong>{categoryStatus.count}/{categoryStatus.max}</strong> phụ tùng thuộc loại <strong>{categoryStatus.categoryName}</strong>.
                                    </div>
                                </S.Alert>
                            ) : categoryStatus.isNearLimit ? (
                                <S.Alert variant="warning">
                                    <FaExclamationTriangle />
                                    <div>
                                        <strong>CẢNH BÁO:</strong> Xe đã có <strong>{categoryStatus.count}/{categoryStatus.max}</strong> phụ tùng thuộc loại này.
                                        Đây sẽ là phụ tùng cuối cùng có thể lắp.
                                    </div>
                                </S.Alert>
                            ) : (
                                <S.Alert variant="success">
                                    <FaCheckCircle />
                                    <div>
                                        Category <strong>{categoryStatus.categoryName}</strong>:
                                        Đã lắp <strong>{categoryStatus.count}/{categoryStatus.max}</strong> (Còn lại: {categoryStatus.max - categoryStatus.count})
                                    </div>
                                </S.Alert>
                            )}
                        </>
                    )}

                    {/* Install Details */}
                    <S.FormGroup>
                        <S.Label>Ngày lắp đặt *</S.Label>
                        <S.Input
                            type="date"
                            value={installDate}
                            onChange={e => setInstallDate(e.target.value)}
                            required
                        />
                    </S.FormGroup>

                    <S.FormGroup>
                        <S.Label>Số km hiện tại (Mileage) *</S.Label>
                        <S.Input
                            type="number"
                            min="0"
                            value={mileageAtInstallation}
                            onChange={e => setMileageAtInstallation(e.target.value)}
                            placeholder="VD: 5000"
                            required
                        />
                    </S.FormGroup>

                    <S.FormGroup>
                        <S.Label>Ghi chú kỹ thuật viên</S.Label>
                        <S.Input
                            as="textarea"
                            rows="3"
                            value={technicianNotes}
                            onChange={e => setTechnicianNotes(e.target.value)}
                            placeholder="Ghi chú về quá trình lắp đặt..."
                            style={{ fontFamily: 'inherit' }}
                        />
                    </S.FormGroup>

                    <S.Button type="submit" disabled={submitting || categoryStatus.isLimitReached}>
                        {submitting ? 'Đang xử lý...' : 'Xác nhận Lắp đặt'}
                    </S.Button>

                </S.Form>
            </S.ContentWrapper>
        </S.PageContainer>
    );
};

export default InstallPart;
