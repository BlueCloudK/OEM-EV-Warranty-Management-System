package com.swp391.warrantymanagement.util;

import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;

import java.util.Collections;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Trình tiện ích xác thực các bước chuyển trạng thái của yêu cầu bảo hành.
 *
 * <p>Sử dụng {@link WarrantyClaimStatus} (enum) để đảm bảo an toàn kiểu dữ liệu,
 * tránh lỗi chính tả và giới hạn trạng thái trong một tập hữu hạn rõ ràng.
 * Bảng chuyển trạng thái được lưu bằng {@link EnumMap} và được bất biến để an toàn khi truy cập đồng thời.</p>
 */
public final class WarrantyClaimStatusValidator {

    /**
     * Bảng chuyển trạng thái hợp lệ.
     *<p>
     * <p>Key: trạng thái hiện tại. Value: danh sách trạng thái có thể chuyển tới.
     * Map này là bất biến (unmodifiable) sau khi khởi tạo.</p>
     */
    private static final Map<WarrantyClaimStatus, List<WarrantyClaimStatus>> VALID_TRANSITIONS;

    private WarrantyClaimStatusValidator() {
        // Utility class: ngăn tạo instance
    }

    static {
        Map<WarrantyClaimStatus, List<WarrantyClaimStatus>> map = new EnumMap<>(WarrantyClaimStatus.class);

        // SUBMITTED -> MANAGER_REVIEW | REJECTED
        map.put(WarrantyClaimStatus.SUBMITTED,
                List.of(WarrantyClaimStatus.MANAGER_REVIEW, WarrantyClaimStatus.REJECTED));

        // MANAGER_REVIEW -> PROCESSING | REJECTED
        map.put(WarrantyClaimStatus.MANAGER_REVIEW,
                List.of(WarrantyClaimStatus.PROCESSING, WarrantyClaimStatus.REJECTED));

        // PROCESSING -> COMPLETED | REJECTED
        map.put(WarrantyClaimStatus.PROCESSING,
                List.of(WarrantyClaimStatus.COMPLETED, WarrantyClaimStatus.REJECTED));

        // COMPLETED, REJECTED -> (final)
        map.put(WarrantyClaimStatus.COMPLETED, List.of());
        map.put(WarrantyClaimStatus.REJECTED, List.of());

        VALID_TRANSITIONS = Collections.unmodifiableMap(map);
    }

    /**
     * Kiểm tra một bước chuyển trạng thái có hợp lệ hay không.
     *
     * @param fromStatus trạng thái hiện tại
     * @param toStatus   trạng thái đích
     * @return true nếu hợp lệ, ngược lại false
     */
    public static boolean isValidTransition(WarrantyClaimStatus fromStatus, WarrantyClaimStatus toStatus) {
        if (fromStatus == null || toStatus == null) {
            return false;
        }

        // Cho phép giữ nguyên trạng thái
        if (fromStatus.equals(toStatus)) {
            return true;
        }

        List<WarrantyClaimStatus> allowedTransitions = VALID_TRANSITIONS.get(fromStatus);
        return allowedTransitions != null && allowedTransitions.contains(toStatus);
    }

    /**
     * Lấy danh sách trạng thái hợp lệ tiếp theo từ một trạng thái hiện tại.
     *
     * @param currentStatus trạng thái hiện tại
     * @return danh sách trạng thái có thể chuyển tới (có thể rỗng, không null)
     */
    public static List<WarrantyClaimStatus> getAllowedNextStatuses(WarrantyClaimStatus currentStatus) {
        return VALID_TRANSITIONS.getOrDefault(currentStatus, List.of());
    }

    /**
     * Xác thực bước chuyển và ném {@link IllegalStateException} nếu không hợp lệ.
     *
     * @param fromStatus trạng thái hiện tại
     * @param toStatus   trạng thái đích
     * @throws IllegalStateException nếu bước chuyển không hợp lệ
     */
    public static void validateTransitionOrThrow(WarrantyClaimStatus fromStatus, WarrantyClaimStatus toStatus) {
        if (!isValidTransition(fromStatus, toStatus)) {
            throw new IllegalStateException(
                String.format("Invalid status transition from '%s' to '%s'. Allowed transitions: %s",
                    fromStatus, toStatus, getAllowedNextStatuses(fromStatus))
            );
        }
    }

    /**
     * Kiểm tra một trạng thái có phải trạng thái cuối (không thể chuyển tiếp) hay không.
     *
     * @param status trạng thái cần kiểm tra
     * @return true nếu là trạng thái cuối, ngược lại false
     */
    public static boolean isFinalStatus(WarrantyClaimStatus status) {
        List<WarrantyClaimStatus> allowedTransitions = VALID_TRANSITIONS.get(status);
        return allowedTransitions != null && allowedTransitions.isEmpty();
    }
}
