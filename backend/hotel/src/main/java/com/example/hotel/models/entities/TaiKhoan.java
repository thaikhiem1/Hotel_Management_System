package com.example.hotel.models.entities;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Entity
@Table(name = "TaiKhoan")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaiKhoan {
    
    @Id
    @Column(name = "TenTK", length = 50)
    private String tenTK;
    
    @Column(name = "Password_hash", nullable = false, length = 255)
    private String passwordHash;
    
    /**
     * Role (Vai trò):
     * 0 = Admin (Quản trị viên)
     * 1 = Nhân viên lễ tân
     * 2 = Quản lý
     */
    @Column(name = "Role", nullable = false)
    private Integer role;
    
    @Column(name = "IdNV", nullable = false, unique = true)
    private Integer idNV;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdNV", referencedColumnName = "IdNV", insertable = false, updatable = false)
    private NhanVien nhanVien;
}
