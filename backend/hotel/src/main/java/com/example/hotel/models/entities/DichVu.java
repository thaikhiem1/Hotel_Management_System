package com.example.hotel.models.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * Entity DichVu - Dịch vụ
 * Mapping 100% theo Database.md
 * 
 * Table DichVu {
 *   IdDV int [pk, increment]
 *   TenDV varchar(100) [not null]
 *   DonGia decimal(18,2) [not null]
 *   SLTon int
 *   IdLDV int [not null]
 * }
 * 
 * Ref: DichVu.IdLDV > LoaiDichVu.IdLDV
 */
@Entity
@Table(name = "DichVu")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DichVu {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdDV")
    private Integer idDV;
    
    @Column(name = "TenDV", nullable = false, length = 100)
    private String tenDV;
    
    @Column(name = "DonGia", nullable = false, precision = 18, scale = 2)
    private BigDecimal donGia;
    
    @Column(name = "SLTon")
    private Integer slTon;
    
    @Column(name = "IdLDV", nullable = false)
    private Integer idLDV;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdLDV", referencedColumnName = "IdLDV", insertable = false, updatable = false)
    private LoaiDichVu loaiDichVu;
}
