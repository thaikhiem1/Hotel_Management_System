package com.example.hotel.services.impl;

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
        // và áp dụng phân trang
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
        // Chuẩn hóa dữ liệu: trim và kiểm tra không rỗng cho mọi trường bắt buộc
        String fullName = normalizeRequiredText(request.getFullName(), "Họ và tên");
        String phone = normalizeRequiredText(request.getPhone(), "Số điện thoại");
        String citizenId = normalizeRequiredText(request.getCitizenId(), "Số giấy tờ tùy thân/hộ chiếu");
        String nationality = normalizeRequiredText(request.getNationality(), "Quốc tịch");
        String gender = normalizeRequiredText(request.getGender(), "Giới tính");

        // Kiểm tra tính duy nhất của số điện thoại
        if (customerRepository.existsByPhone(phone)) {
            throw new DuplicateResourceException("Số điện thoại", phone);
        }

        // Kiểm tra tính duy nhất của số giấy tờ tùy thân/hộ chiếu
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

        // Lưu vào cơ sở dữ liệu (mã khách hàng tự sinh bởi @GeneratedValue)
        // Chỉ bọc lỗi phát sinh khi lưu, lỗi ánh xạ DTO không bị che
        customers savedCustomer;
        try {
            savedCustomer = customerRepository.save(customer);
        } catch (Exception e) {
            throw new RuntimeException("Không thể lưu thông tin khách hàng. Vui lòng thử lại sau.", e);
        }

        return customerMapper.toCustomerResponse(savedCustomer);
    }

    @Override
    @Transactional
    public CustomerResponse UpdateCustomer(Integer customerId, CustomerRequest request) {
        if (customerId == null || customerId <= 0) {
            throw new IllegalArgumentException("Mã khách hàng không hợp lệ: " + customerId);
        }

        // Tìm khách hàng theo ID
        customers existingCustomer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", "customerId", customerId));

        // Chuẩn hóa dữ liệu: trim và kiểm tra không rỗng cho mọi trường bắt buộc
        String fullName = normalizeRequiredText(request.getFullName(), "Họ và tên");
        String phone = normalizeRequiredText(request.getPhone(), "Số điện thoại");
        String citizenId = normalizeRequiredText(request.getCitizenId(), "Số giấy tờ tùy thân/hộ chiếu");
        String nationality = normalizeRequiredText(request.getNationality(), "Quốc tịch");
        String gender = normalizeRequiredText(request.getGender(), "Giới tính");

        // Kiểm tra số điện thoại có bị trùng với khách hàng khác không
        if (!phone.equals(existingCustomer.getPhone()) && customerRepository.existsByPhone(phone)) {
            throw new DuplicateResourceException("Số điện thoại", phone);
        }

        // Kiểm tra số giấy tờ có bị trùng với khách hàng khác không
        if (!citizenId.equals(existingCustomer.getCitizenId()) && customerRepository.existsByCitizenId(citizenId)) {
            throw new DuplicateResourceException("Số giấy tờ tùy thân/hộ chiếu", citizenId);
        }

        // Cập nhật thông tin
        existingCustomer.setFullName(fullName);
        existingCustomer.setPhone(phone);
        existingCustomer.setCitizenId(citizenId);
        existingCustomer.setNationality(nationality);
        existingCustomer.setGender(gender);

        // Chỉ bọc lỗi phát sinh khi lưu, lỗi ánh xạ DTO không bị che
        customers savedCustomer;
        try {
            savedCustomer = customerRepository.save(existingCustomer);
        } catch (Exception e) {
            throw new RuntimeException("Không thể cập nhật thông tin khách hàng. Vui lòng thử lại sau.", e);
        }

        return customerMapper.toCustomerResponse(savedCustomer);
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

    /**
     * Trim và kiểm tra trường bắt buộc không null, không rỗng
     */
    private String normalizeRequiredText(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " không được để trống");
        }
        return value.trim();
    }
}