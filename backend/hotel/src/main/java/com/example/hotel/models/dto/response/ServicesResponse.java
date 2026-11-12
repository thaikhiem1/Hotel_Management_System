package com.example.hotel.models.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ServicesResponse {
    @JsonProperty("serviceId")
    private Integer serviceId;

    @JsonProperty("serviceCateroriesId")
    private Integer serviceCateroriesId;

    @JsonProperty("serviceName")
    private String serviceName;

    @JsonProperty("serviceCategoryName")
    private String serviceCategoryName;

    @JsonProperty("unitPrice")
    private BigDecimal unitPrice;

    @JsonProperty("unit")
    private String unit;

    @JsonProperty("stockQuality")
    private Integer stockQuality;

    @JsonProperty("isActive")
    private Boolean isActive;
}
