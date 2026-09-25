package com.example.hotel.models.entities;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class employees {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employee_id")
    private Integer employeeId;
    
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;
    
    @Column(name = "position", nullable = false, length = 50)
    private String position;
    
    @Column(name = "salary", nullable = false, precision = 18, scale = 2)
    private BigDecimal salary;
    
    @Column(name = "phone",nullable = false, unique = true, length = 15)
    private String phone;
    
    @Column(name = "citizen_id", nullable = false, unique = true, length = 20)
    private String citizenId;
    
    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;
    
    @Column(name = "gender",nullable = false, length = 10)
    private String gender;
    
    @Column(name = "address", length = 255)
    private String address;
    
    @Column(name = "email",unique = true, nullable = false, length = 100)
    private String email;
    
    @Column(name = "avatar", length = 255)
    private String avatar;
}
