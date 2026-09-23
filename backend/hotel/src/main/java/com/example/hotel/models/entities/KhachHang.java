package com.example.hotel.models.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity KhachHang - Khách hàng
 * Mapping 100% theo Database.md
 * 
 * Table KhachHang {
 *   IdKH int [pk, increment]
 *   TenKH varchar(100) [not null]
 *   SDT varchar(15)
 *   CCCD_Passport varchar(30)
 *   QuocTich varchar(50)
 *   GioiTinh varchar(10)
 * }
 */
@Entity
@Table(name = "KhachHang")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KhachHang {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdKH")
    private Integer idKH;
    
    @Column(name = "TenKH", nullable = false, length = 100)
    private String tenKH;
    
    @Column(name = "SDT", length = 15)
    private String sdt;
    
    @Column(name = "CCCD_Passport", length = 30)
    private String cccdPassport;
    
    @Column(name = "QuocTich", length = 50)
    private String quocTich;
    
    @Column(name = "GioiTinh", length = 10)
    private String gioiTinh;
}
