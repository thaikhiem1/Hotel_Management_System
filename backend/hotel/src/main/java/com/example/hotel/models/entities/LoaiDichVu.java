package com.example.hotel.models.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity LoaiDichVu - Loại dịch vụ
 * Mapping 100% theo Database.md
 * 
 * Table LoaiDichVu {
 *   IdLDV int [pk, increment]
 *   TenLDV varchar(100) [not null]
 * }
 */
@Entity
@Table(name = "LoaiDichVu")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoaiDichVu {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdLDV")
    private Integer idLDV;
    
    @Column(name = "TenLDV", nullable = false, length = 100)
    private String tenLDV;
}
