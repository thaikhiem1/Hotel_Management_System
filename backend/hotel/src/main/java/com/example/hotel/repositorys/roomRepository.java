package com.example.hotel.repositorys;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.example.hotel.models.entities.Phong;
import java.util.List;

@Repository
public interface roomRepository extends JpaRepository<Phong, Integer> {
    boolean existsByMaPH(String maPH);

    @Query("SELECT p FROM Phong p LEFT JOIN FETCH p.loaiPhong ORDER BY p.idPH ASC")
    List<Phong> findAllWithLoaiPhong();
}
