package com.example.hotel.services.impl;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.hotel.exception.DuplicateResourceException;
import com.example.hotel.mapper.EmployeeMapper;
import com.example.hotel.models.dto.request.EmployeeCreateRequest;
import com.example.hotel.models.dto.response.EmployeeResponse;
import com.example.hotel.models.entities.employees;
import com.example.hotel.repositorys.EmployeeRepository;
import com.example.hotel.services.IEmployeeService;
import com.example.hotel.specification.EmployeeSpecification;

@Service
public class EmployeeService implements IEmployeeService {
    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;

    public EmployeeService(EmployeeRepository employeeRepository, EmployeeMapper employeeMapper) {
        this.employeeRepository = employeeRepository;
        this.employeeMapper = employeeMapper;
    }

    @Override
    public Page<EmployeeResponse> getEmployees(int page, int size, String search, Boolean isActive, String position) {
        Pageable pageable = PageRequest.of(page, size, Sort.Direction.ASC, "employeeId");
        Specification<employees> specification = Specification.where(EmployeeSpecification.hasWorkingStatus(isActive))
                .and(EmployeeSpecification.fillterPosition(position))
                .and(EmployeeSpecification.search(search));
        Page<employees> employee = employeeRepository.findAll(specification, pageable);
        return employee.map(employeeMapper::toEmployeeResponse);
    }

    @Override
    @Transactional
    public EmployeeResponse createEmployee(EmployeeCreateRequest request) {
        // Chuẩn hóa dữ liệu - loại bỏ khoảng trắng đầu và cuối
        String fullName = request.getFullName().trim();
        String position = request.getPosition().trim();
        String phone = request.getPhone().trim();
        String citizenId = request.getCitizenId().trim();
        String gender = request.getGender().trim();
        String email = request.getEmail().trim();
        String address = request.getAddress() != null ? request.getAddress().trim() : null;
        
        // Kiểm tra sau khi trim - các trường bắt buộc không được rỗng
        if (fullName.isEmpty()) {
            throw new IllegalArgumentException("Họ và tên không được để trống");
        }
        
        if (position.isEmpty()) {
            throw new IllegalArgumentException("Chức vụ không được để trống");
        }
        
        // Kiểm tra ngày sinh - phải đủ 18 tuổi và không nằm trong tương lai
        LocalDate dateOfBirth = request.getDateOfBirth();
        LocalDate today = LocalDate.now();
        
        if (dateOfBirth.isAfter(today)) {
            throw new IllegalArgumentException("Ngày sinh không được nằm trong tương lai");
        }
        
        LocalDate eighteenYearsAgo = today.minusYears(18);
        if (dateOfBirth.isAfter(eighteenYearsAgo)) {
            throw new IllegalArgumentException("Nhân viên phải đủ 18 tuổi");
        }
        
        // Kiểm tra tính duy nhất của số điện thoại
        if (employeeRepository.existsByPhone(phone)) {
            throw new DuplicateResourceException("Số điện thoại", phone);
        }
        
        //  Kiểm tra tính duy nhất của số CCCD
        if (employeeRepository.existsByCitizenId(citizenId)) {
            throw new DuplicateResourceException("Số CCCD", citizenId);
        }
        
        // Kiểm tra tính duy nhất của email
        if (employeeRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email", email);
        }
        
        // Tạo entity với dữ liệu đã chuẩn hóa
        employees employee = new employees();
        employee.setFullName(fullName);
        employee.setPosition(position);
        employee.setSalary(request.getSalary());
        employee.setPhone(phone);
        employee.setCitizenId(citizenId);
        employee.setDateOfBirth(dateOfBirth);
        employee.setGender(gender);
        employee.setAddress(address);
        employee.setEmail(email);
        
        //  Thiết lập ảnh đại diện mặc định theo giới tính và trạng thái Đang hoạt động
        String defaultAvatar = getDefaultAvatarByGender(gender);
        employee.setAvatar(defaultAvatar);
        employee.setIsActive(true);
        
        
        try {
            employees savedEmployee = employeeRepository.save(employee);
            
            return employeeMapper.toEmployeeResponse(savedEmployee);
        } catch (Exception e) {
                    
            throw new RuntimeException("Không thể lưu thông tin nhân viên. Vui lòng thử lại sau.", e);
        }
    }
    
    /**
     * Bước 11: Lấy ảnh đại diện mặc định theo giới tính
     */
    private String getDefaultAvatarByGender(String gender) {
        switch (gender) {
            case "Nam":
                return "/avatars/profileNam.jpg";
            case "Nữ":
                return "/avatars/profileNu.jpg";
            default:
                return "/avatars/profileNam.jpg";
        }
    }
}
