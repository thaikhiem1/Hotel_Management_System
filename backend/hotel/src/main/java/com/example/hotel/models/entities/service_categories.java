package com.example.hotel.models.entities;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Getter;

@Entity
@Table(name = "service_categories")
@Getter 
@Setter 
@NoArgsConstructor
@AllArgsConstructor
public class service_categories {
        @Id 
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column (name = "service_category_id")
        private Integer serviceCategoriesId;

        @Column (name = "category_name", length = 100, nullable = false)
        private String serviceCategoriesName;
}