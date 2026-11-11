package com.example.hotel.services;

import com.example.hotel.exception.DuplicateResourceException;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.mapper.CustomerMapper;
import com.example.hotel.models.dto.request.CustomerRequest;
import com.example.hotel.models.dto.response.CustomerResponse;
import com.example.hotel.models.entities.customers;
import com.example.hotel.repositorys.CustomerRepository;
import com.example.hotel.services.impl.CustomerService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.function.BiConsumer;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * Unit test cho CustomerService.CreateCustomer() và CustomerService.UpdateCustomer().
 * Thiết kế theo Basis Path Testing, bổ sung test case để phủ nhánh và điều kiện;
 * CustomerRepository và CustomerMapper được mock bằng Mockito.
 * Phương thức private normalizeRequiredText() được kiểm thử gián tiếp qua hai phương thức này.
 *
 * Mỗi test ghi rõ: Input (tham số và dữ liệu giả lập của mock), Return, Message (thông báo exception) và Verify.
 */
@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock CustomerRepository customerRepository;
    @Mock CustomerMapper customerMapper;

    @InjectMocks CustomerService customerService;

    static final String SAVE_ERROR = "Không thể lưu thông tin khách hàng. Vui lòng thử lại sau.";
    static final String UPDATE_ERROR = "Không thể cập nhật thông tin khách hàng. Vui lòng thử lại sau.";

    // ------------------------------------------------------------------ dữ liệu dùng chung

    /** Yêu cầu hợp lệ: 5 trường bắt buộc đều có giá trị */
    private static CustomerRequest validRequest() {
        CustomerRequest r = new CustomerRequest();
        r.setFullName("Nguyen Van A");
        r.setPhone("0912345678");
        r.setCitizenId("079012345678");
        r.setNationality("Viet Nam");
        r.setGender("Nam");
        return r;
    }

    private static CustomerResponse response() {
        return new CustomerResponse(1, "Nguyen Van A", "0912345678", "079012345678", "Viet Nam", "Nam");
    }

    /** Khách hàng hiện có: id 1, các trường khác nhau để dễ kiểm tra việc cập nhật */
    private static customers existing() {
        customers c = new customers();
        c.setCustomerId(1);
        c.setFullName("Tran Van B");
        c.setPhone("0988888888");
        c.setCitizenId("079088888888");
        c.setNationality("Han Quoc");
        c.setGender("Nữ");
        return c;
    }

    /** (tên trường hiển thị, hàm gán giá trị vào request) theo đúng thứ tự chuẩn hóa trong service */
    static Stream<Arguments> requiredFields() {
        BiConsumer<CustomerRequest, String> fullName = CustomerRequest::setFullName;
        BiConsumer<CustomerRequest, String> phone = CustomerRequest::setPhone;
        BiConsumer<CustomerRequest, String> citizenId = CustomerRequest::setCitizenId;
        BiConsumer<CustomerRequest, String> nationality = CustomerRequest::setNationality;
        BiConsumer<CustomerRequest, String> gender = CustomerRequest::setGender;
        return Stream.of(
                Arguments.of("Họ và tên", fullName),
                Arguments.of("Số điện thoại", phone),
                Arguments.of("Số giấy tờ tùy thân/hộ chiếu", citizenId),
                Arguments.of("Quốc tịch", nationality),
                Arguments.of("Giới tính", gender));
    }

    static Stream<Arguments> requiredFieldsWithBlankValues() {
        return requiredFields().flatMap(a -> Stream.of("", "   ").map(blank -> Arguments.of(a.get()[0], a.get()[1], blank)));
    }

    // =====================================================================================
    // CreateCustomer()   V(G) = 4   (D1: SĐT trùng, D2: số giấy tờ trùng, D3: lỗi khi lưu)
    // =====================================================================================

    /**
     * UT-CUS-001 (P1: D1 = Đúng)
     * Input : request hợp lệ (phone = "0912345678"); existsByPhone("0912345678") = true
     * Return: không có (ném exception)
     * Message: DuplicateResourceException("Số điện thoại đã tồn tại", field = "Số điện thoại", value = "0912345678")
     * Verify: không gọi existsByCitizenId; không gọi save()
     */
    @Test
    @DisplayName("UT-CUS-001 CreateCustomer: số điện thoại đã tồn tại")
    void UT_CUS_001_create_duplicatePhone() {
        when(customerRepository.existsByPhone("0912345678")).thenReturn(true);

        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> customerService.CreateCustomer(validRequest()));

        assertEquals("Số điện thoại đã tồn tại", ex.getMessage());
        assertEquals("Số điện thoại", ex.getField());
        assertEquals("0912345678", ex.getValue());
        verify(customerRepository, never()).existsByCitizenId(any());
        verify(customerRepository, never()).save(any());
    }

    /**
     * UT-CUS-002 (P2: D1 = Sai, D2 = Đúng)
     * Input : request hợp lệ (citizenId = "079012345678"); existsByPhone = false; existsByCitizenId("079012345678") = true
     * Return: không có (ném exception)
     * Message: DuplicateResourceException("Số giấy tờ tùy thân/hộ chiếu đã tồn tại", value = "079012345678")
     * Verify: không gọi save()
     */
    @Test
    @DisplayName("UT-CUS-002 CreateCustomer: số giấy tờ đã tồn tại")
    void UT_CUS_002_create_duplicateCitizenId() {
        when(customerRepository.existsByPhone("0912345678")).thenReturn(false);
        when(customerRepository.existsByCitizenId("079012345678")).thenReturn(true);

        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> customerService.CreateCustomer(validRequest()));

        assertEquals("Số giấy tờ tùy thân/hộ chiếu đã tồn tại", ex.getMessage());
        assertEquals("079012345678", ex.getValue());
        verify(customerRepository, never()).save(any());
    }

    /**
     * UT-CUS-003 (P3: D3 = Đúng)
     * Input : request hợp lệ; existsByPhone = false; existsByCitizenId = false; save() ném RuntimeException("db down")
     * Return: không có (ném exception)
     * Message: RuntimeException("Không thể lưu thông tin khách hàng. Vui lòng thử lại sau."), getCause() = RuntimeException("db down")
     * Verify: mapper không được gọi
     */
    @Test
    @DisplayName("UT-CUS-003 CreateCustomer: lỗi khi lưu")
    void UT_CUS_003_create_saveFails() {
        RuntimeException cause = new RuntimeException("db down");
        when(customerRepository.save(any(customers.class))).thenThrow(cause);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> customerService.CreateCustomer(validRequest()));

        assertEquals(SAVE_ERROR, ex.getMessage());
        assertSame(cause, ex.getCause());
        verifyNoInteractions(customerMapper);
    }

    /**
     * UT-CUS-004 (P4: D1 = Sai, D2 = Sai, D3 = Sai) - thành công
     * Input : request(fullName = "  Nguyen Van A  ", phone = " 0912345678 ", citizenId = " 079012345678 ",
     *         nationality = " Viet Nam ", gender = " Nam "); existsByPhone("0912345678") = false; existsByCitizenId("079012345678") = false
     * Return: CustomerResponse do mapper trả về
     * Message: không có
     * Verify: existsBy... nhận giá trị đã trim; entity lưu mang đúng 5 giá trị đã trim; save() gọi một lần
     */
    @Test
    @DisplayName("UT-CUS-004 CreateCustomer: tạo thành công, 5 trường có khoảng trắng đầu cuối")
    void UT_CUS_004_create_success() {
        CustomerRequest request = new CustomerRequest();
        request.setFullName("  Nguyen Van A  ");
        request.setPhone(" 0912345678 ");
        request.setCitizenId(" 079012345678 ");
        request.setNationality(" Viet Nam ");
        request.setGender(" Nam ");
        CustomerResponse expected = response();
        when(customerRepository.save(any(customers.class))).thenAnswer(inv -> inv.getArgument(0));
        when(customerMapper.toCustomerResponse(any(customers.class))).thenReturn(expected);

        CustomerResponse result = customerService.CreateCustomer(request);

        assertSame(expected, result);
        verify(customerRepository).existsByPhone("0912345678");
        verify(customerRepository).existsByCitizenId("079012345678");
        ArgumentCaptor<customers> saved = ArgumentCaptor.forClass(customers.class);
        verify(customerRepository, times(1)).save(saved.capture());
        assertEquals("Nguyen Van A", saved.getValue().getFullName());
        assertEquals("0912345678", saved.getValue().getPhone());
        assertEquals("079012345678", saved.getValue().getCitizenId());
        assertEquals("Viet Nam", saved.getValue().getNationality());
        assertEquals("Nam", saved.getValue().getGender());
    }

    /**
     * UT-CUS-005 (biên D3: lỗi ánh xạ DTO nằm ngoài try)
     * Input : request hợp lệ; save() thành công; toCustomerResponse() ném RuntimeException("mapper error")
     * Return: không có (ném exception)
     * Message: chính exception gốc "mapper error", không bị bọc thành "Không thể lưu thông tin khách hàng..."
     * Verify: save() gọi một lần
     */
    @Test
    @DisplayName("UT-CUS-005 CreateCustomer: lỗi ánh xạ DTO không bị bọc")
    void UT_CUS_005_create_mapperErrorNotWrapped() {
        RuntimeException mapperError = new RuntimeException("mapper error");
        when(customerRepository.save(any(customers.class))).thenAnswer(inv -> inv.getArgument(0));
        when(customerMapper.toCustomerResponse(any(customers.class))).thenThrow(mapperError);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> customerService.CreateCustomer(validRequest()));

        assertSame(mapperError, ex);
        verify(customerRepository, times(1)).save(any(customers.class));
    }

    /**
     * UT-CUS-006 (chuẩn hóa: trường bắt buộc là null) - ParameterizedTest
     * Input : request hợp lệ, lần lượt fullName | phone | citizenId | nationality | gender = null
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("<tên trường> không được để trống") với tên trường là
     *          Họ và tên | Số điện thoại | Số giấy tờ tùy thân/hộ chiếu | Quốc tịch | Giới tính
     * Verify: không gọi existsByPhone; không gọi save()
     */
    @ParameterizedTest(name = "UT-CUS-006 CreateCustomer: {0} = null")
    @MethodSource("requiredFields")
    void UT_CUS_006_create_nullRequiredField(String label, BiConsumer<CustomerRequest, String> setter) {
        CustomerRequest request = validRequest();
        setter.accept(request, null);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> customerService.CreateCustomer(request));

        assertEquals(label + " không được để trống", ex.getMessage());
        verify(customerRepository, never()).existsByPhone(any());
        verify(customerRepository, never()).save(any());
    }

    /**
     * UT-CUS-007 (chuẩn hóa: trường bắt buộc rỗng hoặc chỉ gồm khoảng trắng) - ParameterizedTest
     * Input : request hợp lệ, lần lượt fullName | phone | citizenId | nationality | gender = "" hoặc "   "
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("<tên trường> không được để trống")
     * Verify: không gọi existsByPhone; không gọi save()
     */
    @ParameterizedTest(name = "UT-CUS-007 CreateCustomer: {0} = [{2}]")
    @MethodSource("requiredFieldsWithBlankValues")
    void UT_CUS_007_create_blankRequiredField(String label, BiConsumer<CustomerRequest, String> setter, String blank) {
        CustomerRequest request = validRequest();
        setter.accept(request, blank);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> customerService.CreateCustomer(request));

        assertEquals(label + " không được để trống", ex.getMessage());
        verify(customerRepository, never()).existsByPhone(any());
        verify(customerRepository, never()).save(any());
    }

    // =====================================================================================
    // UpdateCustomer()   V(G) = 6   (D1: id, D2: tìm thấy, D3: SĐT trùng, D4: số giấy tờ trùng, D5: lỗi khi lưu)
    // =====================================================================================

    /**
     * UT-CUS-008 (P1: D1 = Đúng) - ParameterizedTest
     * Input : customerId = null | 0 | -1 | -100; request hợp lệ
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("Mã khách hàng không hợp lệ: " + customerId)
     * Verify: không gọi findById; không gọi save()
     */
    @ParameterizedTest(name = "UT-CUS-008 UpdateCustomer: customerId = {0}")
    @NullSource
    @ValueSource(ints = {0, -1, -100})
    void UT_CUS_008_update_invalidId(Integer customerId) {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> customerService.UpdateCustomer(customerId, validRequest()));

        assertEquals("Mã khách hàng không hợp lệ: " + customerId, ex.getMessage());
        verifyNoInteractions(customerRepository);
    }

    /**
     * UT-CUS-009 (P2: D1 = Sai, D2 = Sai)
     * Input : customerId = 99; request hợp lệ; findById(99) = Optional.empty()
     * Return: không có (ném exception)
     * Message: ResourceNotFoundException("Khách hàng không tồn tại với customerId: 99")
     * Verify: không gọi existsByPhone; không gọi save()
     */
    @Test
    @DisplayName("UT-CUS-009 UpdateCustomer: khách hàng không tồn tại")
    void UT_CUS_009_update_notFound() {
        when(customerRepository.findById(99)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> customerService.UpdateCustomer(99, validRequest()));

        assertEquals("Khách hàng không tồn tại với customerId: 99", ex.getMessage());
        verify(customerRepository, never()).existsByPhone(any());
        verify(customerRepository, never()).save(any());
    }

    /**
     * UT-CUS-010 (P3: D2 = Đúng, D3 = Đúng)
     * Input : customerId = 1; request(phone = "0912345678") khác SĐT hiện tại "0988888888"; existsByPhone("0912345678") = true
     * Return: không có (ném exception)
     * Message: DuplicateResourceException("Số điện thoại đã tồn tại", value = "0912345678")
     * Verify: không gọi existsByCitizenId; không gọi save(); entity hiện có không bị thay đổi
     */
    @Test
    @DisplayName("UT-CUS-010 UpdateCustomer: số điện thoại mới đã tồn tại")
    void UT_CUS_010_update_duplicatePhone() {
        customers e = existing();
        when(customerRepository.findById(1)).thenReturn(Optional.of(e));
        when(customerRepository.existsByPhone("0912345678")).thenReturn(true);

        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> customerService.UpdateCustomer(1, validRequest()));

        assertEquals("Số điện thoại đã tồn tại", ex.getMessage());
        assertEquals("0912345678", ex.getValue());
        verify(customerRepository, never()).existsByCitizenId(any());
        verify(customerRepository, never()).save(any());
        assertEquals("Tran Van B", e.getFullName());
        assertEquals("0988888888", e.getPhone());
    }

    /**
     * UT-CUS-011 (P4: D3 = Sai, D4 = Đúng)
     * Input : customerId = 1; request hợp lệ (phone, citizenId khác hiện tại); existsByPhone = false; existsByCitizenId("079012345678") = true
     * Return: không có (ném exception)
     * Message: DuplicateResourceException("Số giấy tờ tùy thân/hộ chiếu đã tồn tại", value = "079012345678")
     * Verify: không gọi save(); entity hiện có không bị thay đổi
     */
    @Test
    @DisplayName("UT-CUS-011 UpdateCustomer: số giấy tờ mới đã tồn tại")
    void UT_CUS_011_update_duplicateCitizenId() {
        customers e = existing();
        when(customerRepository.findById(1)).thenReturn(Optional.of(e));
        when(customerRepository.existsByPhone("0912345678")).thenReturn(false);
        when(customerRepository.existsByCitizenId("079012345678")).thenReturn(true);

        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> customerService.UpdateCustomer(1, validRequest()));

        assertEquals("Số giấy tờ tùy thân/hộ chiếu đã tồn tại", ex.getMessage());
        assertEquals("079012345678", ex.getValue());
        verify(customerRepository, never()).save(any());
        assertEquals("079088888888", e.getCitizenId());
        assertEquals("0988888888", e.getPhone());
    }

    /**
     * UT-CUS-012 (P5: D4 = Sai, D5 = Đúng)
     * Input : customerId = 1; request hợp lệ; existsByPhone = false; existsByCitizenId = false; save() ném RuntimeException("db down")
     * Return: không có (ném exception)
     * Message: RuntimeException("Không thể cập nhật thông tin khách hàng. Vui lòng thử lại sau."), getCause() = RuntimeException("db down")
     * Verify: mapper không được gọi
     */
    @Test
    @DisplayName("UT-CUS-012 UpdateCustomer: lỗi khi lưu")
    void UT_CUS_012_update_saveFails() {
        customers e = existing();
        RuntimeException cause = new RuntimeException("db down");
        when(customerRepository.findById(1)).thenReturn(Optional.of(e));
        when(customerRepository.save(e)).thenThrow(cause);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> customerService.UpdateCustomer(1, validRequest()));

        assertEquals(UPDATE_ERROR, ex.getMessage());
        assertSame(cause, ex.getCause());
        verifyNoInteractions(customerMapper);
    }

    /**
     * UT-CUS-013 (P6: D4 = Sai, D5 = Sai) - thành công
     * Input : customerId = 1; request(fullName = "  Nguyen Van A  ", phone = " 0912345678 ", citizenId = " 079012345678 ",
     *         nationality = " Viet Nam ", gender = " Nam "); existsByPhone = false; existsByCitizenId = false
     * Return: CustomerResponse do mapper trả về
     * Message: không có
     * Verify: 5 trường được trim và gán vào entity hiện có; existsBy... nhận giá trị đã trim; save() gọi một lần
     */
    @Test
    @DisplayName("UT-CUS-013 UpdateCustomer: cập nhật thành công, đổi cả SĐT và số giấy tờ (có khoảng trắng)")
    void UT_CUS_013_update_success() {
        customers e = existing();
        CustomerRequest request = new CustomerRequest();
        request.setFullName("  Nguyen Van A  ");
        request.setPhone(" 0912345678 ");
        request.setCitizenId(" 079012345678 ");
        request.setNationality(" Viet Nam ");
        request.setGender(" Nam ");
        CustomerResponse expected = response();
        when(customerRepository.findById(1)).thenReturn(Optional.of(e));
        when(customerRepository.save(e)).thenReturn(e);
        when(customerMapper.toCustomerResponse(e)).thenReturn(expected);

        CustomerResponse result = customerService.UpdateCustomer(1, request);

        assertSame(expected, result);
        assertEquals("Nguyen Van A", e.getFullName());
        assertEquals("0912345678", e.getPhone());
        assertEquals("079012345678", e.getCitizenId());
        assertEquals("Viet Nam", e.getNationality());
        assertEquals("Nam", e.getGender());
        verify(customerRepository).existsByPhone("0912345678");
        verify(customerRepository).existsByCitizenId("079012345678");
        verify(customerRepository, times(1)).save(e);
    }

    /**
     * UT-CUS-014 (biên D5: lỗi ánh xạ DTO nằm ngoài try)
     * Input : customerId = 1; request hợp lệ; save() thành công; toCustomerResponse() ném RuntimeException("mapper error")
     * Return: không có (ném exception)
     * Message: chính exception gốc "mapper error", không bị bọc thành "Không thể cập nhật thông tin khách hàng..."
     */
    @Test
    @DisplayName("UT-CUS-014 UpdateCustomer: lỗi ánh xạ DTO không bị bọc")
    void UT_CUS_014_update_mapperErrorNotWrapped() {
        customers e = existing();
        RuntimeException mapperError = new RuntimeException("mapper error");
        when(customerRepository.findById(1)).thenReturn(Optional.of(e));
        when(customerRepository.save(e)).thenReturn(e);
        when(customerMapper.toCustomerResponse(e)).thenThrow(mapperError);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> customerService.UpdateCustomer(1, validRequest()));

        assertSame(mapperError, ex);
    }

    /**
     * UT-CUS-015 (biên D3 và D4: SĐT và số giấy tờ giống hiện tại sau trim)
     * Input : customerId = 1; request(phone = " 0988888888 ", citizenId = " 079088888888 ") giống entity hiện có;
     *         fullName = "Nguyen Van A", nationality = "Viet Nam", gender = "Nam" (đổi so với hiện tại)
     * Return: CustomerResponse do mapper trả về
     * Message: không có
     * Verify: không gọi existsByPhone; không gọi existsByCitizenId; họ tên, quốc tịch, giới tính được cập nhật; save() một lần
     */
    @Test
    @DisplayName("UT-CUS-015 UpdateCustomer: SĐT và số giấy tờ không đổi thì không kiểm tra trùng")
    void UT_CUS_015_update_unchangedPhoneAndCitizenId() {
        customers e = existing();
        CustomerRequest request = validRequest();
        request.setPhone(" 0988888888 ");
        request.setCitizenId(" 079088888888 ");
        CustomerResponse expected = response();
        when(customerRepository.findById(1)).thenReturn(Optional.of(e));
        when(customerRepository.save(e)).thenReturn(e);
        when(customerMapper.toCustomerResponse(e)).thenReturn(expected);

        assertSame(expected, customerService.UpdateCustomer(1, request));

        verify(customerRepository, never()).existsByPhone(any());
        verify(customerRepository, never()).existsByCitizenId(any());
        assertEquals("Nguyen Van A", e.getFullName());
        assertEquals("Viet Nam", e.getNationality());
        assertEquals("Nam", e.getGender());
        assertEquals("0988888888", e.getPhone());
        assertEquals("079088888888", e.getCitizenId());
        verify(customerRepository, times(1)).save(e);
    }

    /**
     * UT-CUS-016 (dữ liệu cũ: phone và citizenId hiện tại là null)
     * Input : customerId = 1; entity hiện có phone = null, citizenId = null; request hợp lệ; existsByPhone = false; existsByCitizenId = false
     * Return: CustomerResponse do mapper trả về
     * Message: không có (không ném NullPointerException)
     * Verify: existsByPhone và existsByCitizenId được gọi; phone, citizenId được cập nhật; save() một lần
     */
    @Test
    @DisplayName("UT-CUS-016 UpdateCustomer: dữ liệu cũ phone, citizenId là null")
    void UT_CUS_016_update_legacyNullPhoneAndCitizenId() {
        customers e = existing();
        e.setPhone(null);
        e.setCitizenId(null);
        CustomerResponse expected = response();
        when(customerRepository.findById(1)).thenReturn(Optional.of(e));
        when(customerRepository.save(e)).thenReturn(e);
        when(customerMapper.toCustomerResponse(e)).thenReturn(expected);

        assertSame(expected, customerService.UpdateCustomer(1, validRequest()));

        verify(customerRepository).existsByPhone("0912345678");
        verify(customerRepository).existsByCitizenId("079012345678");
        assertEquals("0912345678", e.getPhone());
        assertEquals("079012345678", e.getCitizenId());
        verify(customerRepository, times(1)).save(e);
    }

    /**
     * UT-CUS-017 (chuẩn hóa: trường bắt buộc là null) - ParameterizedTest
     * Input : customerId = 1; findById trả về entity; lần lượt fullName | phone | citizenId | nationality | gender = null
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("<tên trường> không được để trống")
     * Verify: không gọi existsByPhone, existsByCitizenId; không gọi save()
     */
    @ParameterizedTest(name = "UT-CUS-017 UpdateCustomer: {0} = null")
    @MethodSource("requiredFields")
    void UT_CUS_017_update_nullRequiredField(String label, BiConsumer<CustomerRequest, String> setter) {
        when(customerRepository.findById(1)).thenReturn(Optional.of(existing()));
        CustomerRequest request = validRequest();
        setter.accept(request, null);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> customerService.UpdateCustomer(1, request));

        assertEquals(label + " không được để trống", ex.getMessage());
        verify(customerRepository, never()).existsByPhone(any());
        verify(customerRepository, never()).existsByCitizenId(any());
        verify(customerRepository, never()).save(any());
    }

    /**
     * UT-CUS-018 (chuẩn hóa: trường bắt buộc rỗng hoặc chỉ gồm khoảng trắng) - ParameterizedTest
     * Input : customerId = 1; findById trả về entity; lần lượt fullName | phone | citizenId | nationality | gender = "" hoặc "   "
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("<tên trường> không được để trống")
     * Verify: không gọi existsByPhone, existsByCitizenId; không gọi save()
     */
    @ParameterizedTest(name = "UT-CUS-018 UpdateCustomer: {0} = [{2}]")
    @MethodSource("requiredFieldsWithBlankValues")
    void UT_CUS_018_update_blankRequiredField(String label, BiConsumer<CustomerRequest, String> setter, String blank) {
        when(customerRepository.findById(1)).thenReturn(Optional.of(existing()));
        CustomerRequest request = validRequest();
        setter.accept(request, blank);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> customerService.UpdateCustomer(1, request));

        assertEquals(label + " không được để trống", ex.getMessage());
        verify(customerRepository, never()).existsByPhone(any());
        verify(customerRepository, never()).existsByCitizenId(any());
        verify(customerRepository, never()).save(any());
    }
}
