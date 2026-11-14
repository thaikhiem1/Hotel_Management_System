package com.example.hotel.repositorys;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.hotel.models.dto.response.SalaryByEmployeeResponse;
import com.example.hotel.models.entities.employees;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<employees, Integer>, JpaSpecificationExecutor<employees> {
    /** Lương hằng tháng của từng nhân viên đang làm việc, lương cao xếp trước */
    @Query("select new com.example.hotel.models.dto.response.SalaryByEmployeeResponse(" +
            "e.employeeId, e.fullName, e.position, e.salary) from employees e " +
            "where e.isActive = true order by e.salary desc, e.fullName, e.employeeId")
    List<SalaryByEmployeeResponse> salaryByEmployee();

    Boolean existsByPhone(String phone);

    Boolean existsByCitizenId(String citizenId);

    Boolean existsByEmail(String email);

    boolean existsByPhoneAndEmployeeIdNot(String phone, Integer employeeId);

    boolean existsByCitizenIdAndEmployeeIdNot(String citizenId, Integer employeeId);

    boolean existsByEmailAndEmployeeIdNot(String email, Integer employeeId);
}
