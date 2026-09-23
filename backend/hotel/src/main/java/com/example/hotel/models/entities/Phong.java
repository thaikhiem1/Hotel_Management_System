package com.example.hotel.models.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity Phong - Phòng
 * Mapping 100% theo Database.md
 * 
 * Table Phong {
 *   IdPH int [pk, increment]
 *   MaPH varchar(20) [not null, unique]
 *   TrangThaiPhong int [not null] -- 0: Trống, 1: Đang sửa chữa
 *   IdLPH int [not null]
 *   GhiChu varchar(255)
 * }
 * 
 * Ref: Phong.IdLPH > LoaiPhong.IdLPH
 */
@Entity
@Table(name = "Phong")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Phong {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdPH")
    private Integer idPH;
    
    @Column(name = "MaPH", nullable = false, unique = true, length = 20)
    private String maPH;
    
    /**
     * Trạng thái phòng:
     * 0 = Trống
     * 1 = Đang sửa chữa
     */
    @Column(name = "TrangThaiPhong", nullable = false)
    private Integer trangThaiPhong;
    
    @Column(name = "IdLPH", nullable = false)
    private Integer idLPH;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdLPH", referencedColumnName = "IdLPH", insertable = false, updatable = false)
    private LoaiPhong loaiPhong;
    
    @Column(name = "GhiChu", length = 255)
    private String ghiChu;
}
