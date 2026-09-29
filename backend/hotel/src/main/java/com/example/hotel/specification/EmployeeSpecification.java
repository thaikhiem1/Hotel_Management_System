package com.example.hotel.specification;

import org.springframework.data.jpa.domain.Specification;

import com.example.hotel.models.entities.employees;

public class EmployeeSpecification {
    public EmployeeSpecification() {

    }

    // Phương thức lọc theo trạng thái làm việc
    public static Specification<employees> hasWorkingStatus(Boolean isActive) {
        return (root, query, criteriaBuilder) -> {
            if (isActive == null) {
                return null;
            }
            return criteriaBuilder.equal(root.get("isActive"), isActive);
        };
    }

    // Phương thức lọc theo chức vụ
    public static Specification<employees> fillterPosition(String position) {
        return (root, query, criteriaBuilder) -> {
            if (position == null || position.isBlank()) {
                return null;
            }
            return criteriaBuilder.equal(root.get("position"), position);
        };
    }

    // Phương thức lọc theo tên/email/phone/cccd
    public static Specification<employees> search(String search) {
        return (root, query, criteriaBuilder) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            String keyWord = "%" + search.trim().toLowerCase() + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(root.get("fullName"), keyWord),
                    criteriaBuilder.like(root.get("email"), keyWord),
                    criteriaBuilder.like(root.get("phone"), keyWord),
                    criteriaBuilder.like(root.get("citizenId"), keyWord));
        };
    }
}
