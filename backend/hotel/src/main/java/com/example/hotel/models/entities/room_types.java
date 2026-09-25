package com.example.hotel.models.entities;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
@Entity
@Table(name = "room_types")
@Getter 
@Setter 
@NoArgsConstructor
@AllArgsConstructor
public class room_types {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_type_id")
    private Integer roomTypeId;
    
    @Column(name = "room_type_name", nullable = false, length = 100)
    private String roomTypeName;
    
    @Column(name = "number_of_beds", nullable = false)
    private Integer numberOfBeds;
    
    @Column(name = "maximum_occupancy", nullable = false)
    private Integer maximumOccupancy;
    
    @Column(name = "daily_rate", nullable = false, precision = 18, scale = 2)
    private BigDecimal dailyRate;
    
    @Column(name = "hourly_rate", precision = 18, scale = 2)
    private BigDecimal hourlyRate;
}
