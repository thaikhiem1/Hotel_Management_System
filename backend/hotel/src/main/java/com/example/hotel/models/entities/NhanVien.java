package com.example.hotel.models.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Entity NhanVien - Nhân viên
 * Mapping 100% theo Database.md
 * 
 * Table NhanVien {
 *   IdNV int [pk, increment]
 *   TenNV varchar(100) [not null]
 *   ChucVu varchar(50)
 *   Luong decimal(18,2)
 *   SDT varchar(15)
 *   CCCD varchar(20) [unique]
 *   NgaySinh date
 *   GioiTinh varchar(10)
 *   DiaChi varchar(255)
 *   Email varchar(100)
 *   Avatar varchar(255)
 * }
 */
@Entity
@Table(name = "NhanVien")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NhanVien {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdNV")
    private Integer idNV;
    
    @Column(name = "TenNV", nullable = false, length = 100)
    private String tenNV;
    
    @Column(name = "ChucVu", length = 50)
    private String chucVu;
    
    @Column(name = "Luong", precision = 18, scale = 2)
    private BigDecimal luong;
    
    @Column(name = "SDT", length = 15)
    private String sdt;
    
    @Column(name = "CCCD", unique = true, length = 20)
    private String cccd;
    
    @Column(name = "NgaySinh")
    private LocalDate ngaySinh;
    
    @Column(name = "GioiTinh", length = 10)
    private String gioiTinh;
    
    @Column(name = "DiaChi", length = 255)
    private String diaChi;
    
    @Column(name = "Email", length = 100)
    private String email;
    
    @Column(name = "Avatar", length = 255)
    private String avatar;
}
