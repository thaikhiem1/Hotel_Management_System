package com.example.hotel.services;

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
import com.example.hotel.services.impl.EmployeeService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.function.BiConsumer;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * Unit test cho EmployeeService.createEmployee() và EmployeeService.updateEmployee().
 * Thiết kế theo Basis Path Testing, bổ sung test case để phủ câu lệnh, nhánh và điều kiện biên;
 * EmployeeRepository, AccountRepository và EmployeeMapper được mock bằng Mockito.
 * Hai phương thức private getDefaultAvatarByGender() và normalizeOptionalText() được kiểm thử gián tiếp.
 *
 * Mỗi test ghi rõ: Input (tham số và dữ liệu giả lập của mock), Return, Message (thông báo exception) và Verify.
 */
@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock EmployeeRepository employeeRepository;
    @Mock AccountRepository accountRepository;
    @Mock EmployeeMapper employeeMapper;

    @InjectMocks EmployeeService employeeService;

    static final String AVATAR_MALE = "/avatars/profileNam.jpg";
    static final String AVATAR_FEMALE = "/avatars/profileNu.jpg";
    static final String SAVE_ERROR = "Không thể lưu thông tin nhân viên. Vui lòng thử lại sau.";
    static final String ADMIN_POSITION_ERROR = "Không thể gán hoặc thay đổi chức vụ quản trị viên";

    // ------------------------------------------------------------------ dữ liệu dùng chung

    /** Yêu cầu thêm nhân viên hợp lệ: Nam, đủ 30 tuổi, có địa chỉ */
    private static EmployeeCreateRequest validCreate() {
        EmployeeCreateRequest r = new EmployeeCreateRequest();
        r.setFullName("Nguyen Van A");
        r.setPosition("RECEPTIONIST");
        r.setSalary(new BigDecimal("5000000"));
        r.setPhone("0912345678");
        r.setCitizenId("079012345678");
        r.setDateOfBirth(LocalDate.now().minusYears(30));
        r.setGender("Nam");
        r.setAddress("12 Le Loi");
        r.setEmail("a@x.vn");
        return r;
    }

    private static EmployeeResponse response() {
        return new EmployeeResponse(1, "Nguyen Van A", "RECEPTIONIST", new BigDecimal("5000000"), "0912345678",
                "079012345678", LocalDate.of(1995, 5, 20), "Nam", "12 Le Loi", "a@x.vn", AVATAR_MALE, true);
    }

    /** Nhân viên hiện có: id 1, RECEPTIONIST, lương 5000000.00, đang làm việc */
    private static employees existing() {
        employees e = new employees();
        e.setEmployeeId(1);
        e.setFullName("Nguyen Van A");
        e.setPosition("RECEPTIONIST");
        e.setSalary(new BigDecimal("5000000.00"));
        e.setPhone("0912345678");
        e.setCitizenId("079012345678");
        e.setDateOfBirth(LocalDate.of(1995, 5, 20));
        e.setGender("Nam");
        e.setAddress("12 Le Loi");
        e.setEmail("a@x.vn");
        e.setAvatar(AVATAR_MALE);
        e.setIsActive(true);
        return e;
    }

    private static accounts linkedAccount(Role role, boolean active) {
        accounts a = new accounts();
        a.setAccountId(7);
        a.setUsername("nva");
        a.setRole(role);
        a.setIsActive(active);
        return a;
    }

    private void stubFound(employees e) {
        when(employeeRepository.findById(1)).thenReturn(Optional.of(e));
    }

    // =====================================================================================
    // createEmployee()   V(G) = 10
    // =====================================================================================

    /**
     * UT-EMP-001 (P1: D2 = Đúng) - ParameterizedTest
     * Input : request hợp lệ nhưng fullName = "" | "   "
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("Họ và tên không được để trống")
     * Verify: không gọi existsByPhone; không gọi save()
     */
    @ParameterizedTest(name = "UT-EMP-001 createEmployee: fullName = [{0}]")
    @ValueSource(strings = {"", "   "})
    void UT_EMP_001_create_blankFullName(String fullName) {
        EmployeeCreateRequest request = validCreate();
        request.setFullName(fullName);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> employeeService.createEmployee(request));

        assertEquals("Họ và tên không được để trống", ex.getMessage());
        verify(employeeRepository, never()).existsByPhone(any());
        verify(employeeRepository, never()).save(any());
    }

    /**
     * UT-EMP-002 (P2: D2 = Sai, D3 = Đúng) - ParameterizedTest
     * Input : request hợp lệ nhưng position = "" | "   "
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("Chức vụ không được để trống")
     * Verify: không gọi save()
     */
    @ParameterizedTest(name = "UT-EMP-002 createEmployee: position = [{0}]")
    @ValueSource(strings = {"", "   "})
    void UT_EMP_002_create_blankPosition(String position) {
        EmployeeCreateRequest request = validCreate();
        request.setPosition(position);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> employeeService.createEmployee(request));

        assertEquals("Chức vụ không được để trống", ex.getMessage());
        verify(employeeRepository, never()).save(any());
    }

    /**
     * UT-EMP-003 (P3: D4 = Đúng)
     * Input : request hợp lệ nhưng dateOfBirth = hôm nay + 1 ngày
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("Ngày sinh không được nằm trong tương lai")
     * Verify: không gọi existsByPhone
     */
    @Test
    @DisplayName("UT-EMP-003 createEmployee: ngày sinh trong tương lai")
    void UT_EMP_003_create_birthDateInFuture() {
        EmployeeCreateRequest request = validCreate();
        request.setDateOfBirth(LocalDate.now().plusDays(1));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> employeeService.createEmployee(request));

        assertEquals("Ngày sinh không được nằm trong tương lai", ex.getMessage());
        verify(employeeRepository, never()).existsByPhone(any());
    }

    /**
     * UT-EMP-004 (P4: D4 = Sai, D5 = Đúng)
     * Input : request hợp lệ nhưng dateOfBirth = hôm nay - 17 năm
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("Nhân viên phải đủ 18 tuổi")
     * Verify: không gọi existsByPhone
     */
    @Test
    @DisplayName("UT-EMP-004 createEmployee: chưa đủ 18 tuổi (17 tuổi)")
    void UT_EMP_004_create_under18() {
        EmployeeCreateRequest request = validCreate();
        request.setDateOfBirth(LocalDate.now().minusYears(17));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> employeeService.createEmployee(request));

        assertEquals("Nhân viên phải đủ 18 tuổi", ex.getMessage());
        verify(employeeRepository, never()).existsByPhone(any());
    }

    /**
     * UT-EMP-005 (P5: D6 = Đúng)
     * Input : request hợp lệ (phone = "0912345678"); existsByPhone("0912345678") = true
     * Return: không có (ném exception)
     * Message: DuplicateResourceException("Số điện thoại đã tồn tại", field = "Số điện thoại", value = "0912345678")
     * Verify: không gọi existsByCitizenId; không gọi save()
     */
    @Test
    @DisplayName("UT-EMP-005 createEmployee: số điện thoại đã tồn tại")
    void UT_EMP_005_create_duplicatePhone() {
        when(employeeRepository.existsByPhone("0912345678")).thenReturn(true);

        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> employeeService.createEmployee(validCreate()));

        assertEquals("Số điện thoại đã tồn tại", ex.getMessage());
        assertEquals("Số điện thoại", ex.getField());
        assertEquals("0912345678", ex.getValue());
        verify(employeeRepository, never()).existsByCitizenId(any());
        verify(employeeRepository, never()).save(any());
    }

    /**
     * UT-EMP-006 (P6: D6 = Sai, D7 = Đúng)
     * Input : request hợp lệ (citizenId = "079012345678"); existsByPhone = false; existsByCitizenId("079012345678") = true
     * Return: không có (ném exception)
     * Message: DuplicateResourceException("Số CCCD đã tồn tại", field = "Số CCCD", value = "079012345678")
     * Verify: không gọi existsByEmail; không gọi save()
     */
    @Test
    @DisplayName("UT-EMP-006 createEmployee: CCCD đã tồn tại")
    void UT_EMP_006_create_duplicateCitizenId() {
        when(employeeRepository.existsByPhone("0912345678")).thenReturn(false);
        when(employeeRepository.existsByCitizenId("079012345678")).thenReturn(true);

        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> employeeService.createEmployee(validCreate()));

        assertEquals("Số CCCD đã tồn tại", ex.getMessage());
        assertEquals("079012345678", ex.getValue());
        verify(employeeRepository, never()).existsByEmail(any());
        verify(employeeRepository, never()).save(any());
    }

    /**
     * UT-EMP-007 (P7: D7 = Sai, D8 = Đúng)
     * Input : request hợp lệ (email = "a@x.vn"); existsByPhone = false; existsByCitizenId = false; existsByEmail("a@x.vn") = true
     * Return: không có (ném exception)
     * Message: DuplicateResourceException("Email đã tồn tại", field = "Email", value = "a@x.vn")
     * Verify: không gọi save()
     */
    @Test
    @DisplayName("UT-EMP-007 createEmployee: email đã tồn tại")
    void UT_EMP_007_create_duplicateEmail() {
        when(employeeRepository.existsByEmail("a@x.vn")).thenReturn(true);

        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> employeeService.createEmployee(validCreate()));

        assertEquals("Email đã tồn tại", ex.getMessage());
        assertEquals("a@x.vn", ex.getValue());
        verify(employeeRepository, never()).save(any());
    }

    /**
     * UT-EMP-008 (P8: D8 = Sai, D9 = Đúng)
     * Input : request hợp lệ; ba kiểm tra trùng = false; save() ném RuntimeException("db down")
     * Return: không có (ném exception)
     * Message: RuntimeException("Không thể lưu thông tin nhân viên. Vui lòng thử lại sau."), getCause() = RuntimeException("db down")
     * Verify: mapper không được gọi
     */
    @Test
    @DisplayName("UT-EMP-008 createEmployee: lỗi khi lưu")
    void UT_EMP_008_create_saveFails() {
        RuntimeException cause = new RuntimeException("db down");
        when(employeeRepository.save(any(employees.class))).thenThrow(cause);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> employeeService.createEmployee(validCreate()));

        assertEquals(SAVE_ERROR, ex.getMessage());
        assertSame(cause, ex.getCause());
        verifyNoInteractions(employeeMapper);
    }

    /**
     * UT-EMP-009 (P9: D1 = Đúng, tạo thành công, có địa chỉ)
     * Input : request(fullName = "  Nguyen Van A  ", position = " RECEPTIONIST ", phone = " 0912345678 ", citizenId = " 079012345678 ",
     *         gender = " Nam ", email = " a@x.vn ", address = "  12 Le Loi  ", salary = 5000000, dateOfBirth = hôm nay - 30 năm)
     * Return: EmployeeResponse do mapper trả về
     * Message: không có
     * Verify: các trường được trim; entity lưu có isActive = true, avatar = "/avatars/profileNam.jpg"; save() gọi một lần
     */
    @Test
    @DisplayName("UT-EMP-009 createEmployee: tạo thành công, có địa chỉ, các trường có khoảng trắng")
    void UT_EMP_009_create_successWithAddress() {
        EmployeeCreateRequest request = validCreate();
        request.setFullName("  Nguyen Van A  ");
        request.setPosition(" RECEPTIONIST ");
        request.setPhone(" 0912345678 ");
        request.setCitizenId(" 079012345678 ");
        request.setGender(" Nam ");
        request.setEmail(" a@x.vn ");
        request.setAddress("  12 Le Loi  ");
        EmployeeResponse expected = response();
        when(employeeRepository.save(any(employees.class))).thenAnswer(inv -> inv.getArgument(0));
        when(employeeMapper.toEmployeeResponse(any(employees.class))).thenReturn(expected);

        EmployeeResponse result = employeeService.createEmployee(request);

        assertSame(expected, result);
        ArgumentCaptor<employees> saved = ArgumentCaptor.forClass(employees.class);
        verify(employeeRepository, times(1)).save(saved.capture());
        employees e = saved.getValue();
        assertEquals("Nguyen Van A", e.getFullName());
        assertEquals("RECEPTIONIST", e.getPosition());
        assertEquals("0912345678", e.getPhone());
        assertEquals("079012345678", e.getCitizenId());
        assertEquals("Nam", e.getGender());
        assertEquals("a@x.vn", e.getEmail());
        assertEquals("12 Le Loi", e.getAddress());
        assertEquals(Boolean.TRUE, e.getIsActive());
        assertEquals(AVATAR_MALE, e.getAvatar());
    }

    /**
     * UT-EMP-010 (P10: D1 = Sai, địa chỉ = null)
     * Input : request hợp lệ, address = null
     * Return: EmployeeResponse do mapper trả về
     * Message: không có (không ném exception)
     * Verify: entity lưu có address = null
     */
    @Test
    @DisplayName("UT-EMP-010 createEmployee: tạo thành công, địa chỉ null")
    void UT_EMP_010_create_successWithoutAddress() {
        EmployeeCreateRequest request = validCreate();
        request.setAddress(null);
        EmployeeResponse expected = response();
        when(employeeRepository.save(any(employees.class))).thenAnswer(inv -> inv.getArgument(0));
        when(employeeMapper.toEmployeeResponse(any(employees.class))).thenReturn(expected);

        EmployeeResponse result = employeeService.createEmployee(request);

        assertSame(expected, result);
        ArgumentCaptor<employees> saved = ArgumentCaptor.forClass(employees.class);
        verify(employeeRepository).save(saved.capture());
        assertNull(saved.getValue().getAddress());
    }

    /** Dùng chung cho UT-EMP-011..013: tạo nhân viên theo giới tính và lấy avatar đã gán */
    private String createWithGenderAndGetAvatar(String gender) {
        EmployeeCreateRequest request = validCreate();
        request.setGender(gender);
        when(employeeRepository.save(any(employees.class))).thenAnswer(inv -> inv.getArgument(0));
        when(employeeMapper.toEmployeeResponse(any(employees.class))).thenReturn(response());
        employeeService.createEmployee(request);
        ArgumentCaptor<employees> saved = ArgumentCaptor.forClass(employees.class);
        verify(employeeRepository).save(saved.capture());
        return saved.getValue().getAvatar();
    }

    /**
     * UT-EMP-011 (getDefaultAvatarByGender: "Nữ")
     * Input : request hợp lệ, gender = "Nữ"
     * Return: EmployeeResponse; entity lưu có avatar = "/avatars/profileNu.jpg"
     */
    @Test
    @DisplayName("UT-EMP-011 createEmployee: giới tính Nữ thì ảnh mặc định profileNu")
    void UT_EMP_011_create_femaleAvatar() {
        assertEquals(AVATAR_FEMALE, createWithGenderAndGetAvatar("Nữ"));
    }

    /**
     * UT-EMP-012 (getDefaultAvatarByGender: "Nam")
     * Input : request hợp lệ, gender = "Nam"
     * Return: EmployeeResponse; entity lưu có avatar = "/avatars/profileNam.jpg"
     */
    @Test
    @DisplayName("UT-EMP-012 createEmployee: giới tính Nam thì ảnh mặc định profileNam")
    void UT_EMP_012_create_maleAvatar() {
        assertEquals(AVATAR_MALE, createWithGenderAndGetAvatar("Nam"));
    }

    /**
     * UT-EMP-013 (getDefaultAvatarByGender: giới tính khác)
     * Input : request hợp lệ, gender = "Khác"
     * Return: EmployeeResponse; entity lưu có avatar mặc định = "/avatars/profileNam.jpg"
     */
    @Test
    @DisplayName("UT-EMP-013 createEmployee: giới tính Khác thì ảnh mặc định profileNam")
    void UT_EMP_013_create_otherGenderAvatar() {
        assertEquals(AVATAR_MALE, createWithGenderAndGetAvatar("Khác"));
    }

    /**
     * UT-EMP-014 (biên D5: đúng 18 tuổi)
     * Input : request hợp lệ, dateOfBirth = hôm nay - 18 năm
     * Return: EmployeeResponse do mapper trả về
     * Message: không có (được chấp nhận, không ném exception)
     * Verify: save() gọi một lần
     */
    @Test
    @DisplayName("UT-EMP-014 createEmployee: đúng 18 tuổi được chấp nhận")
    void UT_EMP_014_create_exactly18() {
        EmployeeCreateRequest request = validCreate();
        request.setDateOfBirth(LocalDate.now().minusYears(18));
        EmployeeResponse expected = response();
        when(employeeRepository.save(any(employees.class))).thenAnswer(inv -> inv.getArgument(0));
        when(employeeMapper.toEmployeeResponse(any(employees.class))).thenReturn(expected);

        assertSame(expected, employeeService.createEmployee(request));
        verify(employeeRepository, times(1)).save(any(employees.class));
    }

    /**
     * UT-EMP-015 (biên D4 và D5: ngày sinh = hôm nay)
     * Input : request hợp lệ, dateOfBirth = hôm nay
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("Nhân viên phải đủ 18 tuổi") - không rơi vào D4 (không phải "tương lai")
     */
    @Test
    @DisplayName("UT-EMP-015 createEmployee: ngày sinh là hôm nay thì chưa đủ 18 tuổi")
    void UT_EMP_015_create_birthDateToday() {
        EmployeeCreateRequest request = validCreate();
        request.setDateOfBirth(LocalDate.now());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> employeeService.createEmployee(request));

        assertEquals("Nhân viên phải đủ 18 tuổi", ex.getMessage());
    }

    /**
     * UT-EMP-016 (biên D5: thiếu 1 ngày mới đủ 18 tuổi)
     * Input : request hợp lệ, dateOfBirth = hôm nay - 18 năm + 1 ngày
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("Nhân viên phải đủ 18 tuổi")
     */
    @Test
    @DisplayName("UT-EMP-016 createEmployee: thiếu 1 ngày mới đủ 18 tuổi")
    void UT_EMP_016_create_oneDayShortOf18() {
        EmployeeCreateRequest request = validCreate();
        request.setDateOfBirth(LocalDate.now().minusYears(18).plusDays(1));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> employeeService.createEmployee(request));

        assertEquals("Nhân viên phải đủ 18 tuổi", ex.getMessage());
    }

    /**
     * UT-EMP-017 (D9: lỗi ánh xạ DTO nằm ngoài try)
     * Input : request hợp lệ; save() thành công; toEmployeeResponse() ném RuntimeException("mapper error")
     * Return: không có (ném exception)
     * Message: chính exception gốc "mapper error", không bị bọc thành "Không thể lưu thông tin nhân viên..."
     */
    @Test
    @DisplayName("UT-EMP-017 createEmployee: lỗi ánh xạ DTO không bị bọc")
    void UT_EMP_017_create_mapperErrorNotWrapped() {
        RuntimeException mapperError = new RuntimeException("mapper error");
        when(employeeRepository.save(any(employees.class))).thenAnswer(inv -> inv.getArgument(0));
        when(employeeMapper.toEmployeeResponse(any(employees.class))).thenThrow(mapperError);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> employeeService.createEmployee(validCreate()));

        assertSame(mapperError, ex);
        assertEquals("mapper error", ex.getMessage());
    }

    // =====================================================================================
    // updateEmployee()   22 đường đi khả thi
    // =====================================================================================

    /**
     * UT-EMP-018 (P1: D1 = Sai)
     * Input : employeeId = 99; findById(99) = Optional.empty()
     * Return: không có (ném exception)
     * Message: ResourceNotFoundException("Không tìm thấy nhân viên với ID: 99")
     * Verify: không gọi save()
     */
    @Test
    @DisplayName("UT-EMP-018 updateEmployee: nhân viên không tồn tại")
    void UT_EMP_018_update_notFound() {
        when(employeeRepository.findById(99)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> employeeService.updateEmployee(99, new EmployeeUpdateRequest()));

        assertEquals("Không tìm thấy nhân viên với ID: 99", ex.getMessage());
        verify(employeeRepository, never()).save(any());
    }

    /**
     * UT-EMP-019 (P2: đường cơ sở - không có thay đổi)
     * Input : employeeId = 1; nhân viên hiện có; request: mọi trường = null
     * Return: EmployeeResponse của thông tin hiện tại (do mapper trả về)
     * Message: không có
     * Verify: không gọi save(); không gọi findByEmployee_EmployeeId
     */
    @Test
    @DisplayName("UT-EMP-019 updateEmployee: request không có trường nào")
    void UT_EMP_019_update_noFields() {
        employees e = existing();
        EmployeeResponse expected = response();
        stubFound(e);
        when(employeeMapper.toEmployeeResponse(e)).thenReturn(expected);

        EmployeeResponse result = employeeService.updateEmployee(1, new EmployeeUpdateRequest());

        assertSame(expected, result);
        verify(employeeRepository, never()).save(any());
        verify(accountRepository, never()).findByEmployee_EmployeeId(any());
    }

    /**
     * UT-EMP-020 (P3: D3 = Đúng, D4 = Đúng)
     * Input : employeeId = 1; request(dateOfBirth = hôm nay + 1 ngày)
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("Ngày sinh không được nằm trong tương lai")
     * Verify: không gọi save()
     */
    @Test
    @DisplayName("UT-EMP-020 updateEmployee: ngày sinh trong tương lai")
    void UT_EMP_020_update_birthDateInFuture() {
        stubFound(existing());
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setDateOfBirth(LocalDate.now().plusDays(1));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> employeeService.updateEmployee(1, request));

        assertEquals("Ngày sinh không được nằm trong tương lai", ex.getMessage());
        verify(employeeRepository, never()).save(any());
    }

    /**
     * UT-EMP-021 (P4: D4 = Sai, D5 = Đúng)
     * Input : employeeId = 1; request(dateOfBirth = hôm nay - 17 năm)
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("Nhân viên phải đủ 18 tuổi")
     * Verify: không gọi save()
     */
    @Test
    @DisplayName("UT-EMP-021 updateEmployee: chưa đủ 18 tuổi")
    void UT_EMP_021_update_under18() {
        stubFound(existing());
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setDateOfBirth(LocalDate.now().minusYears(17));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> employeeService.updateEmployee(1, request));

        assertEquals("Nhân viên phải đủ 18 tuổi", ex.getMessage());
        verify(employeeRepository, never()).save(any());
    }

    /**
     * UT-EMP-022 (P5: D6 = Đúng)
     * Input : employeeId = 1; request(phone = "0999999999") khác hiện tại "0912345678"; existsByPhoneAndEmployeeIdNot("0999999999", 1) = true
     * Return: không có (ném exception)
     * Message: DuplicateResourceException("Số điện thoại đã tồn tại", value = "0999999999")
     * Verify: không gọi save()
     */
    @Test
    @DisplayName("UT-EMP-022 updateEmployee: số điện thoại mới thuộc nhân viên khác")
    void UT_EMP_022_update_duplicatePhone() {
        stubFound(existing());
        when(employeeRepository.existsByPhoneAndEmployeeIdNot("0999999999", 1)).thenReturn(true);
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setPhone("0999999999");

        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> employeeService.updateEmployee(1, request));

        assertEquals("Số điện thoại đã tồn tại", ex.getMessage());
        assertEquals("0999999999", ex.getValue());
        verify(employeeRepository, never()).save(any());
    }

    /**
     * UT-EMP-023 (P6: D7 = Đúng)
     * Input : employeeId = 1; request(citizenId = "079099999999") khác hiện tại; existsByCitizenIdAndEmployeeIdNot("079099999999", 1) = true
     * Return: không có (ném exception)
     * Message: DuplicateResourceException("Số CCCD đã tồn tại", value = "079099999999")
     * Verify: không gọi save()
     */
    @Test
    @DisplayName("UT-EMP-023 updateEmployee: CCCD mới thuộc nhân viên khác")
    void UT_EMP_023_update_duplicateCitizenId() {
        stubFound(existing());
        when(employeeRepository.existsByCitizenIdAndEmployeeIdNot("079099999999", 1)).thenReturn(true);
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setCitizenId("079099999999");

        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> employeeService.updateEmployee(1, request));

        assertEquals("Số CCCD đã tồn tại", ex.getMessage());
        assertEquals("079099999999", ex.getValue());
        verify(employeeRepository, never()).save(any());
    }

    /**
     * UT-EMP-024 (P7: D8 = Đúng)
     * Input : employeeId = 1; request(email = "b@x.vn") khác hiện tại; existsByEmailAndEmployeeIdNot("b@x.vn", 1) = true
     * Return: không có (ném exception)
     * Message: DuplicateResourceException("Email đã tồn tại", value = "b@x.vn")
     * Verify: không gọi save()
     */
    @Test
    @DisplayName("UT-EMP-024 updateEmployee: email mới thuộc nhân viên khác")
    void UT_EMP_024_update_duplicateEmail() {
        stubFound(existing());
        when(employeeRepository.existsByEmailAndEmployeeIdNot("b@x.vn", 1)).thenReturn(true);
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setEmail("b@x.vn");

        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> employeeService.updateEmployee(1, request));

        assertEquals("Email đã tồn tại", ex.getMessage());
        assertEquals("b@x.vn", ex.getValue());
        verify(employeeRepository, never()).save(any());
    }

    /** Chạy updateEmployee với một request, nhân viên hiện có `e`, và trả về kết quả; save() trả lại chính đối số */
    private EmployeeResponse updateAndStubSave(employees e, EmployeeUpdateRequest request) {
        EmployeeResponse expected = response();
        stubFound(e);
        when(employeeRepository.save(e)).thenReturn(e);
        when(employeeMapper.toEmployeeResponse(e)).thenReturn(expected);
        assertSame(expected, employeeService.updateEmployee(1, request));
        return expected;
    }

    /**
     * UT-EMP-025 (P8: chỉ đổi họ tên)
     * Input : employeeId = 1; request(fullName = "  Tran Van B  ")
     * Return: EmployeeResponse do mapper trả về
     * Message: không có
     * Verify: fullName = "Tran Van B" (đã trim); save(employee) một lần; không gọi findByEmployee_EmployeeId
     */
    @Test
    @DisplayName("UT-EMP-025 updateEmployee: đổi họ tên (có khoảng trắng đầu cuối)")
    void UT_EMP_025_update_fullName() {
        employees e = existing();
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setFullName("  Tran Van B  ");

        updateAndStubSave(e, request);

        assertEquals("Tran Van B", e.getFullName());
        verify(employeeRepository, times(1)).save(e);
        verify(accountRepository, never()).findByEmployee_EmployeeId(any());
    }

    /**
     * UT-EMP-026 (P9: chỉ đổi chức vụ)
     * Input : employeeId = 1; request(position = "MANAGER"), chức vụ hiện tại RECEPTIONIST; findByEmployee_EmployeeId(1) = Optional.empty()
     * Return: EmployeeResponse do mapper trả về
     * Message: không có
     * Verify: position = "MANAGER"; save(employee) một lần; không có tài khoản liên kết nên không gọi accountRepository.save()
     */
    @Test
    @DisplayName("UT-EMP-026 updateEmployee: đổi chức vụ (nhân viên chưa có tài khoản)")
    void UT_EMP_026_update_position() {
        employees e = existing();
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setPosition("MANAGER");
        when(accountRepository.findByEmployee_EmployeeId(1)).thenReturn(Optional.empty());

        updateAndStubSave(e, request);

        assertEquals("MANAGER", e.getPosition());
        verify(employeeRepository, times(1)).save(e);
        verify(accountRepository, never()).save(any());
    }

    /**
     * UT-EMP-027 (P10: chỉ đổi lương)
     * Input : employeeId = 1; request(salary = 6000000), lương hiện tại 5000000.00
     * Return: EmployeeResponse do mapper trả về
     * Message: không có
     * Verify: salary = 6000000; save(employee) một lần
     */
    @Test
    @DisplayName("UT-EMP-027 updateEmployee: đổi lương")
    void UT_EMP_027_update_salary() {
        employees e = existing();
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setSalary(new BigDecimal("6000000"));

        updateAndStubSave(e, request);

        assertEquals(0, new BigDecimal("6000000").compareTo(e.getSalary()));
        verify(employeeRepository, times(1)).save(e);
    }

    /**
     * UT-EMP-028 (P11: chỉ đổi số điện thoại)
     * Input : employeeId = 1; request(phone = "0988888888"); existsByPhoneAndEmployeeIdNot("0988888888", 1) = false
     * Return: EmployeeResponse do mapper trả về
     * Message: không có
     * Verify: phone = "0988888888"; save(employee) một lần
     */
    @Test
    @DisplayName("UT-EMP-028 updateEmployee: đổi số điện thoại (không trùng)")
    void UT_EMP_028_update_phone() {
        employees e = existing();
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setPhone("0988888888");

        updateAndStubSave(e, request);

        assertEquals("0988888888", e.getPhone());
        verify(employeeRepository).existsByPhoneAndEmployeeIdNot("0988888888", 1);
        verify(employeeRepository, times(1)).save(e);
    }

    /**
     * UT-EMP-029 (P12: chỉ đổi CCCD)
     * Input : employeeId = 1; request(citizenId = "079088888888"); existsByCitizenIdAndEmployeeIdNot = false
     * Return: EmployeeResponse do mapper trả về
     * Message: không có
     * Verify: citizenId = "079088888888"; save(employee) một lần
     */
    @Test
    @DisplayName("UT-EMP-029 updateEmployee: đổi CCCD (không trùng)")
    void UT_EMP_029_update_citizenId() {
        employees e = existing();
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setCitizenId("079088888888");

        updateAndStubSave(e, request);

        assertEquals("079088888888", e.getCitizenId());
        verify(employeeRepository, times(1)).save(e);
    }

    /**
     * UT-EMP-030 (P13: chỉ đổi ngày sinh hợp lệ)
     * Input : employeeId = 1; request(dateOfBirth = hôm nay - 30 năm) khác hiện tại 1995-05-20
     * Return: EmployeeResponse do mapper trả về
     * Message: không có
     * Verify: dateOfBirth được cập nhật; save(employee) một lần
     */
    @Test
    @DisplayName("UT-EMP-030 updateEmployee: đổi ngày sinh hợp lệ")
    void UT_EMP_030_update_birthDate() {
        employees e = existing();
        LocalDate newDob = LocalDate.now().minusYears(30);
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setDateOfBirth(newDob);

        updateAndStubSave(e, request);

        assertEquals(newDob, e.getDateOfBirth());
        verify(employeeRepository, times(1)).save(e);
    }

    /**
     * UT-EMP-031 (P14: chỉ đổi giới tính)
     * Input : employeeId = 1; request(gender = "Nữ"), giới tính hiện tại "Nam"
     * Return: EmployeeResponse do mapper trả về
     * Message: không có
     * Verify: gender = "Nữ"; save(employee) một lần
     */
    @Test
    @DisplayName("UT-EMP-031 updateEmployee: đổi giới tính")
    void UT_EMP_031_update_gender() {
        employees e = existing();
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setGender("Nữ");

        updateAndStubSave(e, request);

        assertEquals("Nữ", e.getGender());
        verify(employeeRepository, times(1)).save(e);
    }

    /**
     * UT-EMP-032 (P15: chỉ đổi địa chỉ)
     * Input : employeeId = 1; request(address = "  34 Hai Ba Trung  "), địa chỉ hiện tại "12 Le Loi"
     * Return: EmployeeResponse do mapper trả về
     * Message: không có
     * Verify: address = "34 Hai Ba Trung" (đã trim); save(employee) một lần
     */
    @Test
    @DisplayName("UT-EMP-032 updateEmployee: đổi địa chỉ (có khoảng trắng đầu cuối)")
    void UT_EMP_032_update_address() {
        employees e = existing();
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setAddress("  34 Hai Ba Trung  ");

        updateAndStubSave(e, request);

        assertEquals("34 Hai Ba Trung", e.getAddress());
        verify(employeeRepository, times(1)).save(e);
    }

    /**
     * UT-EMP-033 (P16: chỉ đổi email)
     * Input : employeeId = 1; request(email = "b@x.vn"); existsByEmailAndEmployeeIdNot = false
     * Return: EmployeeResponse do mapper trả về
     * Message: không có
     * Verify: email = "b@x.vn"; save(employee) một lần
     */
    @Test
    @DisplayName("UT-EMP-033 updateEmployee: đổi email (không trùng)")
    void UT_EMP_033_update_email() {
        employees e = existing();
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setEmail("b@x.vn");

        updateAndStubSave(e, request);

        assertEquals("b@x.vn", e.getEmail());
        verify(employeeRepository, times(1)).save(e);
    }

    /**
     * UT-EMP-034 (P17: đổi isActive, không có tài khoản liên kết)
     * Input : employeeId = 1; request(isActive = false), trạng thái hiện tại true; findByEmployee_EmployeeId(1) = Optional.empty()
     * Return: EmployeeResponse do mapper trả về
     * Message: không có
     * Verify: isActive = false; save(employee) một lần; không gọi accountRepository.save()
     */
    @Test
    @DisplayName("UT-EMP-034 updateEmployee: cho nghỉ việc, nhân viên chưa có tài khoản")
    void UT_EMP_034_update_deactivateWithoutAccount() {
        employees e = existing();
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setIsActive(false);
        when(accountRepository.findByEmployee_EmployeeId(1)).thenReturn(Optional.empty());

        updateAndStubSave(e, request);

        assertEquals(Boolean.FALSE, e.getIsActive());
        verify(employeeRepository, times(1)).save(e);
        verify(accountRepository, never()).save(any());
    }

    /**
     * UT-EMP-035 (P18: đổi isActive, tài khoản liên kết có trạng thái khác)
     * Input : employeeId = 1; request(isActive = false); tài khoản liên kết đang isActive = true
     * Return: EmployeeResponse do mapper trả về
     * Message: không có
     * Verify: nhân viên và tài khoản đều isActive = false; mỗi save() gọi một lần
     */
    @Test
    @DisplayName("UT-EMP-035 updateEmployee: cho nghỉ việc đồng thời khóa tài khoản liên kết")
    void UT_EMP_035_update_deactivateWithLinkedAccount() {
        employees e = existing();
        accounts account = linkedAccount(Role.RECEPTIONIST, true);
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setIsActive(false);
        when(accountRepository.findByEmployee_EmployeeId(1)).thenReturn(Optional.of(account));

        updateAndStubSave(e, request);

        assertEquals(Boolean.FALSE, e.getIsActive());
        assertEquals(Boolean.FALSE, account.getIsActive());
        verify(employeeRepository, times(1)).save(e);
        verify(accountRepository, times(1)).save(account);
    }

    /**
     * UT-EMP-036 (P19: isActive bằng trạng thái nhân viên, tài khoản liên kết khác trạng thái)
     * Input : employeeId = 1; request(isActive = true), nhân viên đang true; tài khoản liên kết đang isActive = false
     * Return: EmployeeResponse của nhân viên hiện tại (do mapper trả về)
     * Message: không có
     * Verify: chỉ tài khoản được cập nhật (isActive = true); accountRepository.save() một lần; không gọi employeeRepository.save()
     */
    @Test
    @DisplayName("UT-EMP-036 updateEmployee: chỉ đồng bộ trạng thái tài khoản liên kết")
    void UT_EMP_036_update_onlyLinkedAccountChanges() {
        employees e = existing();
        accounts account = linkedAccount(Role.RECEPTIONIST, false);
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setIsActive(true);
        EmployeeResponse expected = response();
        stubFound(e);
        when(accountRepository.findByEmployee_EmployeeId(1)).thenReturn(Optional.of(account));
        when(employeeMapper.toEmployeeResponse(e)).thenReturn(expected);

        EmployeeResponse result = employeeService.updateEmployee(1, request);

        assertSame(expected, result);
        assertEquals(Boolean.TRUE, account.getIsActive());
        verify(accountRepository, times(1)).save(account);
        verify(employeeRepository, never()).save(any());
    }

    /**
     * UT-EMP-037 (P20: isActive bằng trạng thái nhân viên, tài khoản cùng trạng thái)
     * Input : employeeId = 1; request(isActive = true); nhân viên và tài khoản liên kết đều isActive = true
     * Return: EmployeeResponse của thông tin hiện tại
     * Message: không có
     * Verify: không gọi bất kỳ save() nào
     */
    @Test
    @DisplayName("UT-EMP-037 updateEmployee: nhân viên và tài khoản cùng trạng thái, không lưu gì")
    void UT_EMP_037_update_sameStatusEverywhere() {
        employees e = existing();
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setIsActive(true);
        EmployeeResponse expected = response();
        stubFound(e);
        when(accountRepository.findByEmployee_EmployeeId(1)).thenReturn(Optional.of(linkedAccount(Role.RECEPTIONIST, true)));
        when(employeeMapper.toEmployeeResponse(e)).thenReturn(expected);

        assertSame(expected, employeeService.updateEmployee(1, request));

        verify(employeeRepository, never()).save(any());
        verify(accountRepository, never()).save(any());
    }

    /**
     * UT-EMP-038 (P21: địa chỉ giống hiện tại sau khi trim)
     * Input : employeeId = 1; request(address = "  12 Le Loi  "), địa chỉ hiện tại "12 Le Loi"; các trường khác = null
     * Return: EmployeeResponse của thông tin hiện tại
     * Message: không có
     * Verify: không gọi save()
     */
    @Test
    @DisplayName("UT-EMP-038 updateEmployee: địa chỉ giống hiện tại sau trim")
    void UT_EMP_038_update_sameAddress() {
        employees e = existing();
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setAddress("  12 Le Loi  ");
        EmployeeResponse expected = response();
        stubFound(e);
        when(employeeMapper.toEmployeeResponse(e)).thenReturn(expected);

        assertSame(expected, employeeService.updateEmployee(1, request));

        verify(employeeRepository, never()).save(any());
    }

    /**
     * UT-EMP-039 (P22: ngày sinh giống hiện tại, hợp lệ)
     * Input : employeeId = 1; request(dateOfBirth = 1995-05-20), giống hiện tại; các trường khác = null
     * Return: EmployeeResponse của thông tin hiện tại
     * Message: không có
     * Verify: không gọi save()
     */
    @Test
    @DisplayName("UT-EMP-039 updateEmployee: ngày sinh giống hiện tại")
    void UT_EMP_039_update_sameBirthDate() {
        employees e = existing();
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setDateOfBirth(LocalDate.of(1995, 5, 20));
        EmployeeResponse expected = response();
        stubFound(e);
        when(employeeMapper.toEmployeeResponse(e)).thenReturn(expected);

        assertSame(expected, employeeService.updateEmployee(1, request));

        verify(employeeRepository, never()).save(any());
    }

    // ------------------------------------------------------------------ test case bổ sung

    static Stream<Arguments> blankOptionalFields() {
        BiConsumer<EmployeeUpdateRequest, String> fullName = EmployeeUpdateRequest::setFullName;
        BiConsumer<EmployeeUpdateRequest, String> position = EmployeeUpdateRequest::setPosition;
        BiConsumer<EmployeeUpdateRequest, String> phone = EmployeeUpdateRequest::setPhone;
        BiConsumer<EmployeeUpdateRequest, String> citizenId = EmployeeUpdateRequest::setCitizenId;
        BiConsumer<EmployeeUpdateRequest, String> gender = EmployeeUpdateRequest::setGender;
        BiConsumer<EmployeeUpdateRequest, String> email = EmployeeUpdateRequest::setEmail;
        Object[][] fields = {
                {"Họ và tên", fullName}, {"Chức vụ", position}, {"Số điện thoại", phone},
                {"Số CCCD", citizenId}, {"Giới tính", gender}, {"Email", email}};
        return Stream.of(fields).flatMap(f -> Stream.of("", "   ").map(blank -> Arguments.of(f[0], blank, f[1])));
    }

    /**
     * UT-EMP-040 (normalizeOptionalText) - ParameterizedTest
     * Input : employeeId = 1; lần lượt fullName, position, phone, citizenId, gender, email = "" hoặc "   " (các trường khác = null)
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("<tên trường> không được để trống") với tên trường là
     *          Họ và tên | Chức vụ | Số điện thoại | Số CCCD | Giới tính | Email
     * Verify: không gọi save()
     */
    @ParameterizedTest(name = "UT-EMP-040 updateEmployee: {0} = [{1}]")
    @MethodSource("blankOptionalFields")
    void UT_EMP_040_update_blankOptionalField(String label, String blank, BiConsumer<EmployeeUpdateRequest, String> setter) {
        stubFound(existing());
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        setter.accept(request, blank);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> employeeService.updateEmployee(1, request));

        assertEquals(label + " không được để trống", ex.getMessage());
        verify(employeeRepository, never()).save(any());
    }

    /**
     * UT-EMP-041 (biên D11: cùng giá trị khác scale)
     * Input : employeeId = 1; request(salary = 5000000), lương hiện tại 5000000.00; các trường khác = null
     * Return: EmployeeResponse của thông tin hiện tại
     * Message: không có
     * Verify: compareTo = 0 nên không cập nhật; không gọi save()
     */
    @Test
    @DisplayName("UT-EMP-041 updateEmployee: lương cùng giá trị khác scale thì không cập nhật")
    void UT_EMP_041_update_sameSalaryDifferentScale() {
        employees e = existing();
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setSalary(new BigDecimal("5000000"));
        EmployeeResponse expected = response();
        stubFound(e);
        when(employeeMapper.toEmployeeResponse(e)).thenReturn(expected);

        assertSame(expected, employeeService.updateEmployee(1, request));

        verify(employeeRepository, never()).save(any());
    }

    /**
     * UT-EMP-042 (biên D11: lương hiện tại là null)
     * Input : employeeId = 1; nhân viên hiện có salary = null; request(salary = 6000000)
     * Return: EmployeeResponse do mapper trả về
     * Message: không có (không ném NullPointerException)
     * Verify: salary = 6000000; save(employee) một lần
     */
    @Test
    @DisplayName("UT-EMP-042 updateEmployee: lương hiện tại null thì cập nhật")
    void UT_EMP_042_update_currentSalaryNull() {
        employees e = existing();
        e.setSalary(null);
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setSalary(new BigDecimal("6000000"));

        updateAndStubSave(e, request);

        assertEquals(0, new BigDecimal("6000000").compareTo(e.getSalary()));
        verify(employeeRepository, times(1)).save(e);
    }

    /**
     * UT-EMP-043 (biên D6..D17: mọi trường giống hiện tại)
     * Input : employeeId = 1; request: phone, citizenId, email, fullName, position, salary (5000000), dateOfBirth, gender, address
     *         đều giống nhân viên hiện có; isActive = null
     * Return: EmployeeResponse của thông tin hiện tại
     * Message: không có
     * Verify: không gọi existsBy...AndEmployeeIdNot; không gọi save(); không gọi findByEmployee_EmployeeId
     */
    @Test
    @DisplayName("UT-EMP-043 updateEmployee: mọi trường giống hiện tại")
    void UT_EMP_043_update_allFieldsSame() {
        employees e = existing();
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setFullName("Nguyen Van A");
        request.setPosition("RECEPTIONIST");
        request.setSalary(new BigDecimal("5000000"));
        request.setPhone("0912345678");
        request.setCitizenId("079012345678");
        request.setDateOfBirth(LocalDate.of(1995, 5, 20));
        request.setGender("Nam");
        request.setAddress("12 Le Loi");
        request.setEmail("a@x.vn");
        EmployeeResponse expected = response();
        stubFound(e);
        when(employeeMapper.toEmployeeResponse(e)).thenReturn(expected);

        assertSame(expected, employeeService.updateEmployee(1, request));

        verify(employeeRepository, never()).existsByPhoneAndEmployeeIdNot(any(), any());
        verify(employeeRepository, never()).existsByCitizenIdAndEmployeeIdNot(any(), any());
        verify(employeeRepository, never()).existsByEmailAndEmployeeIdNot(any(), any());
        verify(employeeRepository, never()).save(any());
        verify(accountRepository, never()).findByEmployee_EmployeeId(any());
    }

    /**
     * UT-EMP-044 (biên D18 và D20: isActive bằng hiện tại, không có tài khoản liên kết)
     * Input : employeeId = 1; request(isActive = true), nhân viên đang true; findByEmployee_EmployeeId(1) = Optional.empty()
     * Return: EmployeeResponse của thông tin hiện tại
     * Message: không có
     * Verify: không gọi bất kỳ save() nào
     */
    @Test
    @DisplayName("UT-EMP-044 updateEmployee: isActive bằng hiện tại, không có tài khoản")
    void UT_EMP_044_update_sameStatusNoAccount() {
        employees e = existing();
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setIsActive(true);
        EmployeeResponse expected = response();
        stubFound(e);
        when(accountRepository.findByEmployee_EmployeeId(1)).thenReturn(Optional.empty());
        when(employeeMapper.toEmployeeResponse(e)).thenReturn(expected);

        assertSame(expected, employeeService.updateEmployee(1, request));

        verify(employeeRepository, never()).save(any());
        verify(accountRepository, never()).save(any());
    }

    /**
     * UT-EMP-045 (cập nhật đồng thời mọi trường)
     * Input : employeeId = 1; request(fullName = "Tran Van B", position = "MANAGER", salary = 7000000, phone = "0977777777",
     *         citizenId = "079077777777", dateOfBirth = hôm nay - 25 năm, gender = "Nữ", address = "56 Nguyen Hue", email = "b@x.vn",
     *         isActive = false); tài khoản liên kết (RECEPTIONIST, isActive = true)
     * Return: EmployeeResponse do mapper trả về
     * Message: không có
     * Verify: mọi trường của nhân viên được cập nhật; tài khoản isActive = false và role = MANAGER (theo chức vụ mới);
     *         employeeRepository.save() và accountRepository.save() mỗi hàm một lần
     */
    @Test
    @DisplayName("UT-EMP-045 updateEmployee: cập nhật đồng thời tất cả trường")
    void UT_EMP_045_update_allFields() {
        employees e = existing();
        accounts account = linkedAccount(Role.RECEPTIONIST, true);
        LocalDate newDob = LocalDate.now().minusYears(25);
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setFullName("Tran Van B");
        request.setPosition("MANAGER");
        request.setSalary(new BigDecimal("7000000"));
        request.setPhone("0977777777");
        request.setCitizenId("079077777777");
        request.setDateOfBirth(newDob);
        request.setGender("Nữ");
        request.setAddress("56 Nguyen Hue");
        request.setEmail("b@x.vn");
        request.setIsActive(false);
        when(accountRepository.findByEmployee_EmployeeId(1)).thenReturn(Optional.of(account));

        updateAndStubSave(e, request);

        assertEquals("Tran Van B", e.getFullName());
        assertEquals("MANAGER", e.getPosition());
        assertEquals(0, new BigDecimal("7000000").compareTo(e.getSalary()));
        assertEquals("0977777777", e.getPhone());
        assertEquals("079077777777", e.getCitizenId());
        assertEquals(newDob, e.getDateOfBirth());
        assertEquals("Nữ", e.getGender());
        assertEquals("56 Nguyen Hue", e.getAddress());
        assertEquals("b@x.vn", e.getEmail());
        assertEquals(Boolean.FALSE, e.getIsActive());
        assertEquals(Boolean.FALSE, account.getIsActive());
        assertEquals(Role.MANAGER, account.getRole());
        verify(employeeRepository, times(1)).save(e);
        verify(accountRepository, times(1)).save(account);
    }

    // ------------------------------------------------------------------ chức vụ chính là vai trò (bổ sung theo logic hiện tại)

    /**
     * UT-EMP-046 (không gán chức vụ quản trị viên)
     * Input : employeeId = 1; nhân viên chức vụ RECEPTIONIST; request(position = "ADMIN")
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("Không thể gán hoặc thay đổi chức vụ quản trị viên")
     * Verify: không gọi save(); chức vụ nhân viên không đổi
     */
    @Test
    @DisplayName("UT-EMP-046 updateEmployee: không được gán chức vụ ADMIN")
    void UT_EMP_046_update_cannotAssignAdmin() {
        employees e = existing();
        stubFound(e);
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setPosition("ADMIN");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> employeeService.updateEmployee(1, request));

        assertEquals(ADMIN_POSITION_ERROR, ex.getMessage());
        assertEquals("RECEPTIONIST", e.getPosition());
        verify(employeeRepository, never()).save(any());
    }

    /**
     * UT-EMP-047 (không đổi chức vụ của quản trị viên)
     * Input : employeeId = 1; nhân viên chức vụ ADMIN; request(position = "MANAGER")
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("Không thể gán hoặc thay đổi chức vụ quản trị viên")
     * Verify: không gọi save(); chức vụ vẫn là ADMIN
     */
    @Test
    @DisplayName("UT-EMP-047 updateEmployee: không được đổi chức vụ của ADMIN")
    void UT_EMP_047_update_cannotChangeAdminPosition() {
        employees e = existing();
        e.setPosition("ADMIN");
        stubFound(e);
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setPosition("MANAGER");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> employeeService.updateEmployee(1, request));

        assertEquals(ADMIN_POSITION_ERROR, ex.getMessage());
        assertEquals("ADMIN", e.getPosition());
        verify(employeeRepository, never()).save(any());
    }

    /**
     * UT-EMP-048 (đổi chức vụ thì vai trò tài khoản liên kết đổi theo)
     * Input : employeeId = 1; request(position = "MANAGER") (chỉ trường này); tài khoản liên kết role = RECEPTIONIST, isActive = true
     * Return: EmployeeResponse do mapper trả về
     * Message: không có
     * Verify: role tài khoản = MANAGER, isActive không đổi; employeeRepository.save() và accountRepository.save() mỗi hàm một lần
     */
    @Test
    @DisplayName("UT-EMP-048 updateEmployee: đổi chức vụ thì vai trò tài khoản đổi theo")
    void UT_EMP_048_update_positionSyncsAccountRole() {
        employees e = existing();
        accounts account = linkedAccount(Role.RECEPTIONIST, true);
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setPosition("MANAGER");
        when(accountRepository.findByEmployee_EmployeeId(1)).thenReturn(Optional.of(account));

        updateAndStubSave(e, request);

        assertEquals("MANAGER", e.getPosition());
        assertEquals(Role.MANAGER, account.getRole());
        assertEquals(Boolean.TRUE, account.getIsActive());
        verify(employeeRepository, times(1)).save(e);
        verify(accountRepository, times(1)).save(account);
    }

    /**
     * UT-EMP-049 (tài khoản liên kết là ADMIN dù chức vụ cũ chưa chuẩn hóa)
     * Input : employeeId = 1; nhân viên chức vụ cũ "Quan tri he thong"; request(position = "MANAGER");
     *         tài khoản liên kết role = ADMIN
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("Không thể gán hoặc thay đổi chức vụ quản trị viên")
     * Verify: không gọi employeeRepository.save() và accountRepository.save()
     */
    @Test
    @DisplayName("UT-EMP-049 updateEmployee: không đổi chức vụ khi tài khoản liên kết là ADMIN")
    void UT_EMP_049_update_linkedAdminAccountProtected() {
        employees e = existing();
        e.setPosition("Quan tri he thong");
        stubFound(e);
        when(accountRepository.findByEmployee_EmployeeId(1)).thenReturn(Optional.of(linkedAccount(Role.ADMIN, true)));
        EmployeeUpdateRequest request = new EmployeeUpdateRequest();
        request.setPosition("MANAGER");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> employeeService.updateEmployee(1, request));

        assertEquals(ADMIN_POSITION_ERROR, ex.getMessage());
        verify(employeeRepository, never()).save(any());
        verify(accountRepository, never()).save(any());
    }
}
