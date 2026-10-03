package com.example.hotel.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hotel.models.dto.request.CustomerRequest;
import com.example.hotel.models.dto.response.CustomerResponse;
import com.example.hotel.services.ICustomerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("api/customers")
@RequiredArgsConstructor
public class CustomerController {
    @Autowired
    private final ICustomerService customerService;

    @GetMapping
    public ResponseEntity<List<CustomerResponse>> GetAll() {
        return ResponseEntity.ok(customerService.GetAll());
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> CreateCustomer(
            @RequestBody CustomerRequest request) {

        CustomerResponse response = customerService.CreateCustomer(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{idkh}")
    public ResponseEntity<CustomerResponse> UpdateCustomer(
            @PathVariable Integer idkh,
            @RequestBody CustomerRequest request) {

        CustomerResponse response = customerService.UpdateCustomer(idkh, request);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{idkh}")
    public ResponseEntity<Void> DeleteCustomer(
            @PathVariable Integer idkh) {

        customerService.DeleteCustomData(idkh);
        return ResponseEntity.noContent().build();
    }
}
