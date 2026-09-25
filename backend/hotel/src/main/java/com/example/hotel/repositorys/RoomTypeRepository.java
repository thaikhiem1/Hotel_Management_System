package com.example.hotel.repositorys;
import org.springframework.stereotype.Repository;
import com.example.hotel.models.entities.room_types;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface RoomTypeRepository extends JpaRepository<room_types, Integer> {
        boolean existsByRoomTypeName(String roomTypeName);

        List<room_types> findAllByOrderByRoomTypeIdAsc();
}
