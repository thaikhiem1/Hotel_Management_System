package com.example.hotel.models.entities;

import com.example.hotel.Enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entity accounts - Tài khoản đăng nhập
 */
@Entity
@Table(name = "accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class accounts {
    
    @Id
    @Column(name = "account_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer accountId;
    
    @Column(name = "username", length = 50, nullable = false)
    private String username;
    
    @Column(name = "password_hash", length = 255, nullable = false)
    private String passwordHash;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 30, nullable = false)
    private Role role = Role.RECEPTIONIST;
    
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false, unique = true)
    private employees employee;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
