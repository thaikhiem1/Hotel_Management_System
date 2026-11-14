package com.example.hotel.models.dto.response;

import java.math.BigDecimal;

/**
 * Lương hằng tháng của một nhân viên đang làm việc (chức vụ là ADMIN, MANAGER hoặc RECEPTIONIST).
 */
public record SalaryByEmployeeResponse(Integer employeeId, String fullName, String position, BigDecimal salary) {
}
