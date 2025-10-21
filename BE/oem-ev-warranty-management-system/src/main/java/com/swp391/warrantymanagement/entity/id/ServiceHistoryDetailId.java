package com.swp391.warrantymanagement.entity.id;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
//Đây là annotation của JPA/Hibernate.
//Đánh dấu class này là có thể nhúng vào một entity khác.
//Trong ngữ cảnh này class ServiceHistoryDetailId là một Composite Key gồm 2 trường: partId và serviceHistoryId.
//Class này sẽ được nhúng vào entity ServiceHistoryDetail thông qua @EmbeddedId.
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceHistoryDetailId implements Serializable {
    private Long partId;
    private Long serviceHistoryId;

    @Override
    public boolean equals(Object obj) {
        // Nếu hai object trỏ cùng một vùng nhớ → chắc chắn bằng nhau
        if (this == obj) return true;
        // Nếu object truyền vào là null hoặc khác class → không bằng
        if (obj == null || getClass() != obj.getClass()) return false;
        // Ép kiểu object truyền vào thành ServiceHistoryDetailId để so sánh
        ServiceHistoryDetailId that = (ServiceHistoryDetailId) obj;
        // So sánh từng trường partId và serviceHistoryId
        // Dùng Objects.equals để tránh lỗi NullPointerException
        return Objects.equals(partId, that.partId) &&
                Objects.equals(serviceHistoryId, that.serviceHistoryId);
    }
    //

    @Override
    public int hashCode() {
        // Tạo mã băm (hash code) dựa trên giá trị của partId và serviceHistoryId
        // Dùng Objects.hash để đảm bảo xử lý null an toàn và tạo mã băm nhất quán
        return Objects.hash(partId, serviceHistoryId);
    }
}
