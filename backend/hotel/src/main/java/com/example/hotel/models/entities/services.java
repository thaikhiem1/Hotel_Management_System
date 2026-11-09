package com.example.hotel.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import jakarta.persistence.JoinColumn;

@Entity
@Table(name = "services")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class services {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_id")
    private Integer serviceId;
    @Column(name = "service_name", nullable = false, length = 100)
    private String serviceName;
    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;
    @Column(name = "stock_quantity")
    private Integer stockQuantity;
    @Column(name = "unit", nullable = false, length = 20)
    private String unit;
    @ManyToOne
    @JoinColumn(name = "service_category_id", nullable = false)
    private service_categories category;
}
