package com.example.hotel.models.entities;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
@Entity
@Table(name = "LoaiPhong")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoaiPhong {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdLPH")
    private Integer idLPH;
    
    @Column(name = "TenLPH", nullable = false, length = 100)
    private String tenLPH;
    
    @Column(name = "SoGiuong", nullable = false)
    private Integer soGiuong;
    
    @Column(name = "SoNguoiToiDa", nullable = false)
    private Integer soNguoiToiDa;
    
    @Column(name = "GiaNgay", nullable = false, precision = 18, scale = 2)
    private BigDecimal giaNgay;
    
    @Column(name = "GiaGio", precision = 18, scale = 2)
    private BigDecimal giaGio;
}
