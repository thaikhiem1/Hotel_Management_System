package com.example.hotel.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.hotel.models.dto.request.ServiceCategoriesRequest;
import com.example.hotel.models.dto.response.ServiceCategoriesResponse;
import com.example.hotel.services.IServiceCategoriesService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController 
@RequestMapping ("api/service-categories")
@RequiredArgsConstructor 
public class ServiceCategoriesController {
    final IServiceCategoriesService _CategoriesService;
    @PostMapping 
    public ResponseEntity<ServiceCategoriesResponse> create(
        @Valid  @RequestBody ServiceCategoriesRequest request
    ){
        return  ResponseEntity.status(HttpStatus.CREATED).body(_CategoriesService.create(request));
    }
    @GetMapping 
    public ResponseEntity<List<ServiceCategoriesResponse>> getAll(){
        return ResponseEntity.ok(_CategoriesService.getAll());
    }
    @PatchMapping 
    public  ResponseEntity<ServiceCategoriesResponse> update(
        @PathVariable Integer id, @Valid @RequestBody  ServiceCategoriesRequest request
    ){
        return ResponseEntity.ok(_CategoriesService.update(id, request));
    }
    
}
