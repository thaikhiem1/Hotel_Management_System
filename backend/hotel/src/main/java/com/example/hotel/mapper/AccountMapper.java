package com.example.hotel.mapper;

import com.example.hotel.models.dto.response.AccountResponse;
import com.example.hotel.models.entities.accounts;
import com.example.hotel.models.entities.employees;
import org.springframework.stereotype.Component;

/**
 * Mapper chuyển đổi giữa Entity và DTO cho Account
 */
@Component
public class AccountMapper {
    
    /**
     * Chuyển đổi từ Entity sang Response DTO
     */
    public AccountResponse toAccountResponse(accounts account) {
        if (account == null) {
            throw new IllegalArgumentException("Account entity is null");
        }
        
        employees employee = account.getEmployee();
        
        return new AccountResponse(
            account.getAccountId(),
            account.getUsername(),
            account.getRole(),
            employee.getEmployeeId(),
            employee.getFullName(),
            employee.getPosition(),
            employee.getEmail(),
            account.getIsActive()
        );
    }
}
