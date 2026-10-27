package com.example.hotel.repositorys;
import org.springframework.stereotype.Repository;
import com.example.hotel.models.entities.room_types;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface RoomTypeRepository extends JpaRepository<room_types, Integer> {
        boolean existsByRoomTypeNameIgnoreCase(String roomTypeName);

        boolean existsByRoomTypeNameIgnoreCaseAndRoomTypeIdNot(
        String roomTypeName,
        Integer roomTypeId
        );

        List<room_types> findAllByOrderByRoomTypeIdAsc();
}
