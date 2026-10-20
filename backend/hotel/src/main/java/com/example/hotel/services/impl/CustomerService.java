package com.example.hotel.services.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.hotel.exception.DuplicateResourceException;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.mapper.CustomerMapper;
import com.example.hotel.models.dto.request.CustomerRequest;
import com.example.hotel.models.dto.response.CustomerResponse;
import com.example.hotel.models.entities.customers;
import com.example.hotel.repositorys.CustomerRepository;
import com.example.hotel.services.ICustomerService;
import com.example.hotel.specification.CustomerSpecification;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerService implements ICustomerService {
    @Autowired
    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    /**
     * UC-CUS-003: Tra cứu thông tin khách hàng với phân trang và bộ lọc
     * Hỗ trợ tìm kiếm theo họ tên, SĐT, CCCD/Passport
     * Lọc theo giới tính và quốc tịch
     */
    @Override
    public Page<CustomerResponse> GetAllWithPagination(
            int page, 
            int size, 
            String search, 
            String gender, 
            String nationality) {
        
        // Bước 6: Kiểm tra và chuẩn hóa tiêu chí tìm kiếm
        if (search != null) {
            search = search.trim();
            // A2: Từ khóa chỉ chứa khoảng trắng
            if (search.isEmpty()) {
                search = null;
            }
        }
        
        if (gender != null) {
            gender = gender.trim();
            if (gender.isEmpty()) {
                gender = null;
            }
        }
        
        if (nationality != null) {
            nationality = nationality.trim();
            if (nationality.isEmpty()) {
                nationality = null;
            }
        }
        
        // Bước 7: Xây dựng specification để tìm kiếm và lọc
        Specification<customers> spec = Specification.where(null);
        
        if (search != null && !search.isEmpty()) {
            spec = spec.and(CustomerSpecification.search(search));
        }
        
        if (gender != null && !gender.isEmpty()) {
            spec = spec.and(CustomerSpecification.hasGender(gender));
        }
        
        if (nationality != null && !nationality.isEmpty()) {
            spec = spec.and(CustomerSpecification.hasNationality(nationality));
        }
        
        // Bước 8: Sắp xếp theo customerId giảm dần (khách hàng mới nhất trước)
        // và áp dụng phân trang (16 bản ghi/trang)
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "customerId"));
        
        try {
            // Bước 9: Thực hiện truy vấn và trả về kết quả phân trang
            Page<customers> customerPage = customerRepository.findAll(spec, pageable);
            
            // Map entities sang response DTOs
            return customerPage.map(customerMapper::toCustomerResponse);
        } catch (Exception e) {
            // E3: Lỗi truy vấn dữ liệu
            throw new RuntimeException("Không thể thực hiện tra cứu khách hàng. Vui lòng thử lại sau.", e);
        }
    }

    @Override
    @Transactional
    public CustomerResponse CreateCustomer(CustomerRequest request) {
        // Bước 10: Chuẩn hóa dữ liệu - loại bỏ khoảng trắng đầu và cuối
        String fullName = request.getFullName().trim();
        String phone = request.getPhone().trim();
        String citizenId = request.getCitizenId().trim();
        String nationality = request.getNationality().trim();
        String gender = request.getGender().trim();
        
        // Kiểm tra lại sau khi trim - họ tên không được rỗng
        if (fullName.isEmpty()) {
            throw new IllegalArgumentException("Họ và tên không được để trống");
        }
        
        // Kiểm tra lại sau khi trim - số giấy tờ không được rỗng
        if (citizenId.isEmpty()) {
            throw new IllegalArgumentException("Số giấy tờ tùy thân/hộ chiếu không được để trống");
        }
        
        // Bước 9: Kiểm tra tính duy nhất của số điện thoại
        if (customerRepository.existsByPhone(phone)) {
            throw new DuplicateResourceException("Số điện thoại", phone);
        }
        
        // Bước 9: Kiểm tra tính duy nhất của số giấy tờ tùy thân/hộ chiếu
        if (customerRepository.existsByCitizenId(citizenId)) {
            throw new DuplicateResourceException("Số giấy tờ tùy thân/hộ chiếu", citizenId);
        }
        
        // Tạo entity với dữ liệu đã chuẩn hóa
        customers customer = new customers();
        customer.setFullName(fullName);
        customer.setPhone(phone);
        customer.setCitizenId(citizenId);
        customer.setNationality(nationality);
        customer.setGender(gender);
        
        // Bước 11: Lưu vào cơ sở dữ liệu (mã khách hàng tự sinh bởi @GeneratedValue)
        try {
            customers savedCustomer = customerRepository.save(customer);
            // Bước 12: Trả về response thành công
            return customerMapper.toCustomerResponse(savedCustomer);
        } catch (Exception e) {
            // E2: Lỗi lưu dữ liệu - trả về 500 Internal Server Error
            throw new RuntimeException("Không thể lưu thông tin khách hàng. Vui lòng thử lại sau.", e);
        }
    }

    @Override
    @Transactional
    public CustomerResponse UpdateCustomer(Integer customerId, CustomerRequest request) {
        if (customerId == null) {
            throw new IllegalArgumentException("Mã khách hàng không được để trống");
        }
        
        // Tìm khách hàng theo ID
        customers existingCustomer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", "customerId", customerId));
        
        // Chuẩn hóa dữ liệu
        String fullName = request.getFullName().trim();
        String phone = request.getPhone().trim();
        String citizenId = request.getCitizenId().trim();
        String nationality = request.getNationality().trim();
        String gender = request.getGender().trim();
        
        // Kiểm tra họ tên không rỗng sau khi trim
        if (fullName.isEmpty()) {
            throw new IllegalArgumentException("Họ và tên không được để trống");
        }
        
        // Kiểm tra số giấy tờ không rỗng sau khi trim
        if (citizenId.isEmpty()) {
            throw new IllegalArgumentException("Số giấy tờ tùy thân/hộ chiếu không được để trống");
        }
        
        // Kiểm tra số điện thoại có bị trùng với khách hàng khác không
        if (!existingCustomer.getPhone().equals(phone) && customerRepository.existsByPhone(phone)) {
            throw new DuplicateResourceException("Số điện thoại", phone);
        }
        
        // Kiểm tra số giấy tờ có bị trùng với khách hàng khác không
        if (!existingCustomer.getCitizenId().equals(citizenId) && customerRepository.existsByCitizenId(citizenId)) {
            throw new DuplicateResourceException("Số giấy tờ tùy thân/hộ chiếu", citizenId);
        }
        
        // Cập nhật thông tin
        existingCustomer.setFullName(fullName);
        existingCustomer.setPhone(phone);
        existingCustomer.setCitizenId(citizenId);
        existingCustomer.setNationality(nationality);
        existingCustomer.setGender(gender);
        
        try {
            customers savedCustomer = customerRepository.save(existingCustomer);
            return customerMapper.toCustomerResponse(savedCustomer);
        } catch (Exception e) {
            throw new RuntimeException("Không thể cập nhật thông tin khách hàng. Vui lòng thử lại sau.", e);
        }
    }

    @Override
    @Transactional
    public void DeleteCustomerData(Integer customerId) {
        if (customerId == null) {
            throw new IllegalArgumentException("Mã khách hàng không được để trống");
        }
        
        customers customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", "customerId", customerId));
        
        try {
            customerRepository.delete(customer);
        } catch (Exception e) {
            throw new RuntimeException("Không thể xóa khách hàng. Vui lòng thử lại sau.", e);
        }
    }
}
