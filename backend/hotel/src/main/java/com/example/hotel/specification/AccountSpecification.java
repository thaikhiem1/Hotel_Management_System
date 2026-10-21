package com.example.hotel.specification;

import com.example.hotel.models.entities.accounts;
import org.springframework.data.jpa.domain.Specification;

/**
 * Specification cho Account - REQ-ACC-004
 * Xây dựng các điều kiện lọc động cho truy vấn tài khoản
 */
public class AccountSpecification {

    /**
     * Lọc theo trạng thái hoạt động
     * @param isActive true = Đang hoạt động, false = Đã khóa, null = không lọc
     * @return Specification<accounts>
     */
    public static Specification<accounts> hasActiveStatus(Boolean isActive) {
        return (root, query, criteriaBuilder) -> {
            if (isActive == null) {
                return criteriaBuilder.conjunction(); // Không lọc
            }
            return criteriaBuilder.equal(root.get("isActive"), isActive);
        };
    }

    /**
     * Kết hợp tất cả điều kiện lọc
     * @param isActive Trạng thái hoạt động
     * @return Specification<accounts>
     */
    public static Specification<accounts> withFilters(Boolean isActive) {
        return Specification.where(hasActiveStatus(isActive));
    }
}
