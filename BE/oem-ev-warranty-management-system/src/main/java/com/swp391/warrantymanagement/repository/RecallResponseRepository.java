package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.RecallResponse;
import com.swp391.warrantymanagement.enums.RecallResponseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface cho RecallResponse entity.
 * <p>
 * <strong>Mục đích:</strong>
 * <ul>
 *   <li>Quản lý CRUD operations cho RecallResponse (phản hồi triệu hồi của từng xe).</li>
 *   <li>Cung cấp các query methods để tìm kiếm responses theo campaign, vehicle, customer, status.</li>
 * </ul>
 */
@Repository
public interface RecallResponseRepository extends JpaRepository<RecallResponse, Long> {

    /**
     * Tìm tất cả RecallResponse của một chiến dịch triệu hồi cụ thể.
     * <p>
     * <strong>Use case:</strong> Admin xem danh sách tất cả xe bị ảnh hưởng và trạng thái phản hồi của từng xe.
     *
     * @param recallRequestId ID của chiến dịch triệu hồi
     * @return Danh sách RecallResponse thuộc chiến dịch đó
     */
    List<RecallResponse> findByRecallRequest_RecallRequestId(Long recallRequestId);

    /**
     * Tìm tất cả RecallResponse của một xe cụ thể.
     * <p>
     * <strong>Use case:</strong> Customer xem lịch sử các đợt triệu hồi liên quan đến xe của mình.
     *
     * @param vehicleId ID của xe
     * @return Danh sách RecallResponse của xe đó
     */
    List<RecallResponse> findByVehicle_VehicleId(UUID vehicleId);

    /**
     * Tìm tất cả RecallResponse của một khách hàng (thông qua vehicle).
     * <p>
     * <strong>Use case:</strong> Customer xem tất cả recall responses của tất cả xe họ sở hữu.
     *
     * @param customerId ID của customer
     * @return Danh sách RecallResponse của customer đó
     */
    @Query("SELECT rr FROM RecallResponse rr WHERE rr.vehicle.customer.customerId = :customerId")
    List<RecallResponse> findByCustomerId(@Param("customerId") UUID customerId);

    /**
     * Tìm tất cả RecallResponse theo trạng thái.
     * <p>
     * <strong>Use case:</strong> Admin lọc danh sách responses đang PENDING để theo dõi.
     *
     * @param status Trạng thái cần tìm
     * @return Danh sách RecallResponse có trạng thái đó
     */
    List<RecallResponse> findByStatus(RecallResponseStatus status);

    /**
     * Tìm RecallResponse của một xe trong một chiến dịch cụ thể.
     * <p>
     * <strong>Use case:</strong> Kiểm tra xem xe này đã có response cho campaign này chưa (tránh duplicate).
     *
     * @param recallRequestId ID của chiến dịch
     * @param vehicleId ID của xe
     * @return Optional RecallResponse
     */
    Optional<RecallResponse> findByRecallRequest_RecallRequestIdAndVehicle_VehicleId(
            Long recallRequestId, Long vehicleId);

    /**
     * Đếm số lượng RecallResponse theo trạng thái trong một chiến dịch.
     * <p>
     * <strong>Use case:</strong> Dashboard hiển thị thống kê: "50/100 xe đã chấp nhận recall".
     *
     * @param recallRequestId ID của chiến dịch
     * @param status Trạng thái cần đếm
     * @return Số lượng responses có trạng thái đó
     */
    @Query("SELECT COUNT(rr) FROM RecallResponse rr WHERE rr.recallRequest.recallRequestId = :recallRequestId AND rr.status = :status")
    long countByRecallRequestIdAndStatus(
            @Param("recallRequestId") Long recallRequestId,
            @Param("status") RecallResponseStatus status);
}
