package com.example.hotel.repositorys;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.hotel.models.entities.rooms;
@Repository
public interface RoomRepository extends JpaRepository<rooms, Integer> {
    boolean existsByRoomCode(String room_code);
    boolean existsByRoomTypesRoomTypeId(Integer room_type_id);
}
