package com.example.hotel.models.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

/**
 * Entity PhieuThue - Phiếu thuê phòng
 * Mapping 100% theo Database.md
 * 
 * Table PhieuThue {
 *   IdPT int [pk, increment]
 *   NgPT date [not null]
 *   IdKH int [not null]
 *   IdNV int [not null]
 * }
 * 
 * Ref: PhieuThue.IdKH > KhachHang.IdKH
 * Ref: PhieuThue.IdNV > NhanVien.IdNV
 */
@Entity
@Table(name = "PhieuThue")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhieuThue {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdPT")
    private Integer idPT;
    
    @Column(name = "NgPT", nullable = false)
    private LocalDate ngPT;
    
    @Column(name = "IdKH", nullable = false)
    private Integer idKH;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdKH", referencedColumnName = "IdKH", insertable = false, updatable = false)
    private KhachHang khachHang;
    
    @Column(name = "IdNV", nullable = false)
    private Integer idNV;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdNV", referencedColumnName = "IdNV", insertable = false, updatable = false)
    private NhanVien nhanVien;
    
    @OneToMany(mappedBy = "phieuThue", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CTDP> chiTietDatPhong;
}
