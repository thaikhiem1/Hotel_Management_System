package com.example.hotel.specification;

import org.springframework.data.jpa.domain.Specification;

import com.example.hotel.models.entities.customers;

/**
 * Specification cho Customer để xây dựng query động
 * Hỗ trợ tìm kiếm và lọc theo UC-CUS-003
 */
public class CustomerSpecification {
    
    public CustomerSpecification() {
    }

    /**
     * Tìm kiếm theo từ khóa trong họ tên, số điện thoại, số giấy tờ
     * UC-CUS-003: Bước 7 - Tìm kiếm các hồ sơ khách hàng phù hợp
     * 
     * @param search - Từ khóa tìm kiếm (đã trim)
     * @return Specification<customers>
     */
    public static Specification<customers> search(String search) {
        return (root, query, criteriaBuilder) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            
            // Bước 6: Loại bỏ khoảng trắng đầu và cuối
            String keyword = "%" + search.trim().toLowerCase() + "%";
            
            // Tìm kiếm trong họ tên, số điện thoại, số giấy tờ tùy thân/hộ chiếu
            return criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("fullName")), keyword),
                criteriaBuilder.like(root.get("phone"), keyword),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("citizenId")), keyword)
            );
        };
    }

    /**
     * Lọc theo giới tính
     * 
     * @param gender - Giới tính (Nam, Nữ, Khác)
     * @return Specification<customers>
     */
    public static Specification<customers> hasGender(String gender) {
        return (root, query, criteriaBuilder) -> {
            if (gender == null || gender.isBlank()) {
                return null;
            }
            return criteriaBuilder.equal(root.get("gender"), gender.trim());
        };
    }

    /**
     * Lọc theo quốc tịch
     * 
     * @param nationality - Quốc tịch
     * @return Specification<customers>
     */
    public static Specification<customers> hasNationality(String nationality) {
        return (root, query, criteriaBuilder) -> {
            if (nationality == null || nationality.isBlank()) {
                return null;
            }
            return criteriaBuilder.equal(root.get("nationality"), nationality.trim());
        };
    }
}
