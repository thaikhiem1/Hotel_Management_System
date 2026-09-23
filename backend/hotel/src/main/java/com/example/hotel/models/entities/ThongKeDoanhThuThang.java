package com.example.hotel.models.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity ThongKeDoanhThuThang - Thống kê doanh thu tháng
 * Mapping 100% theo Database.md
 * 
 * Table ThongKeDoanhThuThang {
 *   IdTK int [pk, increment]
 *   Nam int [not null]
 *   Thang int [not null]
 *   TongDoanhThu decimal(18,2) [not null]
 *   SoHoaDon int [not null]
 *   NgayCapNhat timestamp [not null]
 *   indexes {
 *     (Nam, Thang) [unique]
 *   }
 * }
 */
@Entity
@Table(name = "ThongKeDoanhThuThang", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"Nam", "Thang"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ThongKeDoanhThuThang {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdTK")
    private Integer idTK;
    
    @Column(name = "Nam", nullable = false)
    private Integer nam;
    
    @Column(name = "Thang", nullable = false)
    private Integer thang;
    
    @Column(name = "TongDoanhThu", nullable = false, precision = 18, scale = 2)
    private BigDecimal tongDoanhThu;
    
    @Column(name = "SoHoaDon", nullable = false)
    private Integer soHoaDon;
    
    @Column(name = "NgayCapNhat", nullable = false)
    private LocalDateTime ngayCapNhat;
}
