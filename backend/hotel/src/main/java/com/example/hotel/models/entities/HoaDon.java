package com.example.hotel.models.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Entity HoaDon - Hóa đơn
 * Mapping 100% theo Database.md
 * 
 * Table HoaDon {
 *   IdHD int [pk, increment]
 *   NgHD date [not null]
 *   TriGia decimal(18,2) [not null]
 *   IdNV int [not null]
 *   IdPT int [not null, unique]
 *   TrangThaiThanhToan int [not null] -- 0: Chưa thanh toán, 1: Đã thanh toán
 * }
 * 
 * Ref: HoaDon.IdNV > NhanVien.IdNV
 * Ref: HoaDon.IdPT - PhieuThue.IdPT (one-to-one)
 */
@Entity
@Table(name = "HoaDon")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HoaDon {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdHD")
    private Integer idHD;
    
    @Column(name = "NgHD", nullable = false)
    private LocalDate ngHD;
    
    @Column(name = "TriGia", nullable = false, precision = 18, scale = 2)
    private BigDecimal triGia;
    
    @Column(name = "IdNV", nullable = false)
    private Integer idNV;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdNV", referencedColumnName = "IdNV", insertable = false, updatable = false)
    private NhanVien nhanVien;
    
    @Column(name = "IdPT", nullable = false, unique = true)
    private Integer idPT;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdPT", referencedColumnName = "IdPT", insertable = false, updatable = false)
    private PhieuThue phieuThue;
    
    /**
     * Trạng thái thanh toán:
     * 0 = Chưa thanh toán
     * 1 = Đã thanh toán
     */
    @Column(name = "TrangThaiThanhToan", nullable = false)
    private Integer trangThaiThanhToan;
}
