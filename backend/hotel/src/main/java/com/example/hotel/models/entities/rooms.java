package com.example.hotel.models.entities;
import com.example.hotel.Enums.RoomStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Getter;

@Entity
@Table(name = "rooms")
@Getter 
@Setter 
@NoArgsConstructor
@AllArgsConstructor
public class rooms {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Integer roomId;
    
    @Column(name = "room_code", nullable = false, unique = true, length = 20)
    private String roomCode;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "room_status", nullable = false)
    private RoomStatus roomStatus = RoomStatus.AVAILABLE;
    
    @ManyToOne
    @JoinColumn(name = "room_type_id", nullable = false)
    private room_types roomTypes;
    
    @Column(name = "note", length = 255)
    private String note;
}
