package com.example.hotel.services.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.hotel.mapper.CustomerMapper;
import com.example.hotel.models.dto.request.CustomerRequest;
import com.example.hotel.models.dto.response.CustomerResponse;
import com.example.hotel.models.entities.customers;
import com.example.hotel.repositorys.CustomerRepository;
import com.example.hotel.services.ICustomerService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerService implements ICustomerService {
    @Autowired
    private final CustomerRepository _CustomerRepository;
    private final CustomerMapper _CustomerMapper;

    @Override
    public List<CustomerResponse> GetAll() {
        return _CustomerRepository.findAll().stream().map(_CustomerMapper::toCustomerResponse).toList();
    }

    @Override
    public CustomerResponse CreateCustomer(CustomerRequest request) {
        if (_CustomerRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("Số điện thoại này đã tồn tại");
        }
        if (_CustomerRepository.existsByCitizenId(request.getCitizenId())) {
            throw new IllegalArgumentException("Mã định danh này đã tồn tại");
        }
        customers Customer = _CustomerMapper.toEntities(request);
        if(Customer == null){
            return null;
        }
        customers SaveCustomer = _CustomerRepository.save(Customer);
        return _CustomerMapper.toCustomerResponse(SaveCustomer);
    }

    @Override
    public CustomerResponse UpdateCustomer(Integer customerId, CustomerRequest request) {
        if(customerId == null){
            return null;
        }
        customers existsCustomers = _CustomerRepository.findById(customerId).orElseThrow(() -> {
            throw new IllegalArgumentException("Khách hàng này chưa tồn tại");
        });
        if (!existsCustomers.getPhone().equals(request.getPhone())
                && _CustomerRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("Số điện thoại này đã tồn tại");
        }
        if (!existsCustomers.getCitizenId().equals(request.getCitizenId())
                && _CustomerRepository.existsByCitizenId(request.getCitizenId())) {
            throw new IllegalArgumentException("Mã định danh này đã tồn tại");
        }
        existsCustomers.setFullName(request.getFullName());
        existsCustomers.setPhone(request.getPhone());
        existsCustomers.setCitizenId(request.getCitizenId());
        existsCustomers.setNationality(request.getNationality());
        existsCustomers.setGender(request.getGender());
        customers SaveCustomer = _CustomerRepository.save(existsCustomers);
        return _CustomerMapper.toCustomerResponse(SaveCustomer);
    }

    @Override
    public void DeleteCustomData(Integer customerId) {
        if(customerId == null){
            return;
        }
        customers updatedCustomers = _CustomerRepository.findById(customerId).orElseThrow(() -> {
            throw new RuntimeException("Khách hàng này chưa tồn");
        });
        if(updatedCustomers == null){
            return ;
        }
        _CustomerRepository.delete(updatedCustomers);
    }
}
