package com.example.hotel.models.entities;
import com.example.hotel.Enums.RoomStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

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
    
    @Enumerated(EnumType.STRING)
    @Column(name = "TrangThaiPhong", nullable = false)
    private RoomStatus trangThaiPhong = RoomStatus.TRONG;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdLPH", nullable = false)
    private LoaiPhong loaiPhong;
    
    @Column(name = "GhiChu", length = 255)
    private String ghiChu;
}
