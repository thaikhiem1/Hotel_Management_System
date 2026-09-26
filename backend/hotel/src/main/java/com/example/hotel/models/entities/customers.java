package com.example.hotel.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class customers {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "customer_id")
    private Integer customerId;
    @Column(name = "full_name", nullable = false)
    private String fullName;
    @Column(name = "phone", unique = true, nullable = false, length = 15)
    private String phone;
    @Column(name = "citizen_id_passport", nullable = false, unique = true, length = 30)
    private String citizenId;
    @Column(name = "nationality", nullable = false, length = 50)
    private String nationality;
    @Column(name = "gender", nullable = false, length = 10)
    private String gender;
}
