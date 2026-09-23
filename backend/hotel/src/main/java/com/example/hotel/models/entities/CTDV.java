package com.example.hotel.models.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Entity CTDV - Chi tiết dịch vụ
 * Mapping 100% theo Database.md
 * 
 * Table CTDV {
 *   IdCTDP int [not null]
 *   IdDV int [not null]
 *   DonGia decimal(18,2) [not null]
 *   SoLuongDung int [not null]
 *   ThanhTien decimal(18,2) [not null]
 *   indexes {
 *     (IdCTDP, IdDV) [pk]
 *   }
 * }
 * 
 * Ref: CTDV.IdCTDP > CTDP.IdCTDP
 * Ref: CTDV.IdDV > DichVu.IdDV
 */
@Entity
@Table(name = "CTDV")
@IdClass(CTDV.CTDVId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CTDV {
    
    @Id
    @Column(name = "IdCTDP")
    private Integer idCTDP;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdCTDP", referencedColumnName = "IdCTDP", insertable = false, updatable = false)
    private CTDP chiTietDatPhong;
    
    @Id
    @Column(name = "IdDV")
    private Integer idDV;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdDV", referencedColumnName = "IdDV", insertable = false, updatable = false)
    private DichVu dichVu;
    
    @Column(name = "DonGia", nullable = false, precision = 18, scale = 2)
    private BigDecimal donGia;
    
    @Column(name = "SoLuongDung", nullable = false)
    private Integer soLuongDung;
    
    @Column(name = "ThanhTien", nullable = false, precision = 18, scale = 2)
    private BigDecimal thanhTien;
    
    /**
     * Composite Primary Key class
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CTDVId implements Serializable {
        private Integer idCTDP;
        private Integer idDV;
    }
}
