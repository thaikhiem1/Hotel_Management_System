package com.example.hotel.services.impl;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.hotel.Enums.Role;
import com.example.hotel.exception.DuplicateResourceException;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.mapper.EmployeeMapper;
import com.example.hotel.models.dto.request.EmployeeCreateRequest;
import com.example.hotel.models.dto.request.EmployeeUpdateRequest;
import com.example.hotel.models.dto.response.EmployeeResponse;
import com.example.hotel.models.entities.accounts;
import com.example.hotel.models.entities.employees;
import com.example.hotel.repositorys.AccountRepository;
import com.example.hotel.repositorys.EmployeeRepository;
import com.example.hotel.services.IEmployeeService;
import com.example.hotel.specification.EmployeeSpecification;

@Service
public class EmployeeService implements IEmployeeService {
    private static final String AVATAR_MALE = "/avatars/profileNam.jpg";
    private static final String AVATAR_FEMALE = "/avatars/profileNu.jpg";

    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;
    private final AccountRepository accountRepository;

    public EmployeeService(
            EmployeeRepository employeeRepository,
            EmployeeMapper employeeMapper,
            AccountRepository accountRepository) {
        this.employeeRepository = employeeRepository;
        this.employeeMapper = employeeMapper;
        this.accountRepository = accountRepository;
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

        // Kiểm tra ngày sinh - không nằm trong tương lai và phải đủ 18 tuổi
        LocalDate dateOfBirth = request.getDateOfBirth();
        LocalDate today = LocalDate.now();

        if (dateOfBirth.isAfter(today)) {
            throw new IllegalArgumentException("Ngày sinh không được nằm trong tương lai");
        }

        if (dateOfBirth.isAfter(today.minusYears(18))) {
            throw new IllegalArgumentException("Nhân viên phải đủ 18 tuổi");
        }

        // Kiểm tra tính duy nhất của số điện thoại
        if (employeeRepository.existsByPhone(phone)) {
            throw new DuplicateResourceException("Số điện thoại", phone);
        }

        // Kiểm tra tính duy nhất của số CCCD
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

        // Thiết lập ảnh đại diện mặc định theo giới tính và trạng thái đang hoạt động
        employee.setAvatar(getDefaultAvatarByGender(gender));
        employee.setIsActive(true);

        // Chỉ bọc lỗi phát sinh khi lưu, lỗi ánh xạ DTO không bị che
        employees savedEmployee;
        try {
            savedEmployee = employeeRepository.save(employee);
        } catch (Exception e) {
            throw new RuntimeException("Không thể lưu thông tin nhân viên. Vui lòng thử lại sau.", e);
        }

        return employeeMapper.toEmployeeResponse(savedEmployee);
    }

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(Integer employeeId, EmployeeUpdateRequest request) {
        employees employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy nhân viên với ID: " + employeeId));

        String fullName = normalizeOptionalText(request.getFullName(), "Họ và tên");
        String position = normalizeOptionalText(request.getPosition(), "Chức vụ");
        String phone = normalizeOptionalText(request.getPhone(), "Số điện thoại");
        String citizenId = normalizeOptionalText(request.getCitizenId(), "Số CCCD");
        String gender = normalizeOptionalText(request.getGender(), "Giới tính");
        String email = normalizeOptionalText(request.getEmail(), "Email");
        String address = request.getAddress() == null ? null : request.getAddress().trim();
        LocalDate dateOfBirth = request.getDateOfBirth();

        if (dateOfBirth != null) {
            LocalDate today = LocalDate.now();
            if (dateOfBirth.isAfter(today)) {
                throw new IllegalArgumentException("Ngày sinh không được nằm trong tương lai");
            }
            if (dateOfBirth.isAfter(today.minusYears(18))) {
                throw new IllegalArgumentException("Nhân viên phải đủ 18 tuổi");
            }
        }

        if (phone != null
                && !phone.equals(employee.getPhone())
                && employeeRepository.existsByPhoneAndEmployeeIdNot(phone, employeeId)) {
            throw new DuplicateResourceException("Số điện thoại", phone);
        }
        if (citizenId != null
                && !citizenId.equals(employee.getCitizenId())
                && employeeRepository.existsByCitizenIdAndEmployeeIdNot(citizenId, employeeId)) {
            throw new DuplicateResourceException("Số CCCD", citizenId);
        }
        if (email != null
                && !email.equals(employee.getEmail())
                && employeeRepository.existsByEmailAndEmployeeIdNot(email, employeeId)) {
            throw new DuplicateResourceException("Email", email);
        }

        // Chức vụ chính là vai trò của tài khoản: không gán và không đổi chức vụ quản trị viên
        boolean positionChanged = position != null && !position.equals(employee.getPosition());
        if (positionChanged
                && (Role.ADMIN.name().equals(position) || Role.ADMIN.name().equals(employee.getPosition()))) {
            throw new IllegalArgumentException("Không thể gán hoặc thay đổi chức vụ quản trị viên");
        }

        boolean isUpdated = false;
        if (fullName != null && !fullName.equals(employee.getFullName())) {
            employee.setFullName(fullName);
            isUpdated = true;
        }
        if (positionChanged) {
            employee.setPosition(position);
            isUpdated = true;
        }
        // So sánh bằng compareTo để bỏ qua khác biệt scale; an toàn khi lương hiện tại
        // là null
        if (request.getSalary() != null
                && (employee.getSalary() == null || request.getSalary().compareTo(employee.getSalary()) != 0)) {
            employee.setSalary(request.getSalary());
            isUpdated = true;
        }
        if (phone != null && !phone.equals(employee.getPhone())) {
            employee.setPhone(phone);
            isUpdated = true;
        }
        if (citizenId != null && !citizenId.equals(employee.getCitizenId())) {
            employee.setCitizenId(citizenId);
            isUpdated = true;
        }
        if (dateOfBirth != null && !dateOfBirth.equals(employee.getDateOfBirth())) {
            employee.setDateOfBirth(dateOfBirth);
            isUpdated = true;
        }
        if (gender != null && !gender.equals(employee.getGender())) {
            employee.setGender(gender);
            isUpdated = true;
        }
        if (address != null && !address.equals(employee.getAddress())) {
            employee.setAddress(address);
            isUpdated = true;
        }
        if (email != null && !email.equals(employee.getEmail())) {
            employee.setEmail(email);
            isUpdated = true;
        }

        Boolean isActive = request.getIsActive();
        boolean activeStatusChanged = isActive != null && !isActive.equals(employee.getIsActive());
        if (activeStatusChanged) {
            employee.setIsActive(isActive);
            isUpdated = true;
        }

        // Chỉ tìm tài khoản liên kết khi đổi trạng thái hoạt động hoặc đổi chức vụ
        Optional<accounts> linkedAccount = (isActive == null && !positionChanged)
                ? Optional.empty()
                : accountRepository.findByEmployee_EmployeeId(employeeId);
        boolean linkedAccountStatusChanged = isActive != null && linkedAccount
                .map(account -> !isActive.equals(account.getIsActive()))
                .orElse(false);
        // Đổi chức vụ thì vai trò của tài khoản liên kết đổi theo
        boolean linkedAccountRoleChanged = positionChanged && linkedAccount
                .map(account -> account.getRole() != Role.valueOf(position))
                .orElse(false);
        if (linkedAccountRoleChanged && linkedAccount.orElseThrow().getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Không thể gán hoặc thay đổi chức vụ quản trị viên");
        }

        if (!isUpdated && !linkedAccountStatusChanged && !linkedAccountRoleChanged) {
            return employeeMapper.toEmployeeResponse(employee);
        }

        employees savedEmployee = isUpdated ? employeeRepository.save(employee) : employee;
        if (linkedAccountStatusChanged || linkedAccountRoleChanged) {
            accounts account = linkedAccount.orElseThrow();
            if (linkedAccountStatusChanged) {
                account.setIsActive(isActive);
            }
            if (linkedAccountRoleChanged) {
                account.setRole(Role.valueOf(position));
            }
            accountRepository.save(account);
        }

        return employeeMapper.toEmployeeResponse(savedEmployee);
    }

    private String normalizeOptionalText(String value, String fieldName) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException(fieldName + " không được để trống");
        }
        return normalized;
    }

    /**
     * Lấy ảnh đại diện mặc định theo giới tính
     */
    private String getDefaultAvatarByGender(String gender) {
        if ("Nữ".equals(gender)) {
            return AVATAR_FEMALE;
        }
        return AVATAR_MALE;
    }
}