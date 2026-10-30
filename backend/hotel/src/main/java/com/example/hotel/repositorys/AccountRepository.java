package com.example.hotel.repositorys;

import com.example.hotel.models.entities.accounts;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho tài khoản
 */
@Repository
public interface AccountRepository extends JpaRepository<accounts, Integer>, JpaSpecificationExecutor<accounts> {
    
    /**
     * Kiểm tra tên đăng nhập đã tồn tại chưa
     */
    boolean existsByUsername(String username);
    
    /**
     * Kiểm tra tên đăng nhập đã tồn tại chưa, ngoại trừ tài khoản hiện tại
     */
    boolean existsByUsernameAndAccountIdNot(String username, Integer accountId);
    
    /**
     * Kiểm tra hệ thống đã có tài khoản với vai trò này chưa
     */
    boolean existsByRole(com.example.hotel.Enums.Role role);

    /**
     * Kiểm tra employee đã có tài khoản chưa
     */
    boolean existsByEmployee_EmployeeId(Integer employeeId);
    
    /**
     * Tìm tài khoản theo employee ID
     */
    Optional<accounts> findByEmployee_EmployeeId(Integer employeeId);
    
    /**
     * Tìm tài khoản theo username
     */
    Optional<accounts> findByUsername(String username);
    
    /**
     * Lấy danh sách ID nhân viên đã có tài khoản
     */
    @Query("SELECT a.employee.employeeId FROM accounts a")
    List<Integer> findAllEmployeeIdsWithAccount();
    
    /**
     * Lấy danh sách tài khoản có phân trang
     */
    @Override
    Page<accounts> findAll(Pageable pageable);
}
