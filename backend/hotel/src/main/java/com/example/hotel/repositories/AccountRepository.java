package com.example.hotel.repositories;

import com.example.hotel.models.entities.accounts;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository cho tài khoản
 */
@Repository
public interface AccountRepository extends JpaRepository<accounts, String>, JpaSpecificationExecutor<accounts> {
    
    /**
     * Kiểm tra tên đăng nhập đã tồn tại chưa
     */
    boolean existsByUsername(String username);
    
    /**
     * Kiểm tra employee đã có tài khoản chưa
     */
    boolean existsByEmployee_EmployeeId(Integer employeeId);
    
    /**
     * Tìm tài khoản theo employee ID
     */
    Optional<accounts> findByEmployee_EmployeeId(Integer employeeId);
    
    /**
     * Lấy danh sách tài khoản có phân trang
     */
    @Override
    Page<accounts> findAll(Pageable pageable);
}
