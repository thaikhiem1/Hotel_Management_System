package com.example.hotel.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hotel.models.dto.request.ServicesRequest;
import com.example.hotel.models.dto.response.ServicesResponse;
import com.example.hotel.services.IServicesService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("api/services")
@RequiredArgsConstructor
public class ServicesController {
    final IServicesService _IServicesService;

    @GetMapping
    public ResponseEntity<List<ServicesResponse>> getAll() {
        return ResponseEntity.ok(_IServicesService.getAll());
    }

    @PostMapping
    public ResponseEntity<ServicesResponse> create(
            @Valid @RequestBody ServicesRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(_IServicesService.create(request));
    }
}
