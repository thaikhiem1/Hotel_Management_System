package com.example.hotel.models.entities;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
@Entity
@Table(name = "CTDP")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CTDP {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdCTDP")
    private Integer idCTDP;
    @Column(name = "IdPT", nullable = false)
    private Integer idPT;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdPT", referencedColumnName = "IdPT", insertable = false, updatable = false)
    private PhieuThue phieuThue;
    @Column(name = "IdPH", nullable = false)
    private Integer idPH;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdPH", referencedColumnName = "IdPH", insertable = false, updatable = false)
    private Phong phong;
    @Column(name = "SoNguoi", nullable = false)
    private Integer soNguoi;
    @Column(name = "NgayCheckIn", nullable = false)
    private LocalDate ngayCheckIn;
    @Column(name = "NgayCheckOut", nullable = false)
    private LocalDate ngayCheckOut;
    @Column(name = "TrangThaiDatPhong", nullable = false)
    private Integer trangThaiDatPhong;
    @Column(name = "DonGia", nullable = false, precision = 18, scale = 2)
    private BigDecimal donGia;
    @Column(name = "ThanhTien", nullable = false, precision = 18, scale = 2)
    private BigDecimal thanhTien;
}
