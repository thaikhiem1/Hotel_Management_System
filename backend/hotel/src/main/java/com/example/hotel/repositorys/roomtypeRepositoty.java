package com.example.hotel.repositorys;

import org.springframework.stereotype.Repository;

import com.example.hotel.models.dto.response.RoomTypeResponse;
import com.example.hotel.models.entities.LoaiPhong;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface roomtypeRepositoty extends JpaRepository<LoaiPhong, Integer> {
        boolean existsByTenLPH(String tenLPH);

        List<LoaiPhong> findAllByOrderByIdLPHAsc();
}
