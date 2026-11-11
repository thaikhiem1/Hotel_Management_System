package com.example.hotel.services;

import com.example.hotel.Enums.Role;
import com.example.hotel.exception.DuplicateResourceException;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.mapper.AccountMapper;
import com.example.hotel.mapper.EmployeeMapper;
import com.example.hotel.models.dto.request.AccountCreateRequest;
import com.example.hotel.models.dto.request.AccountUpdateRequest;
import com.example.hotel.models.dto.response.AccountResponse;
import com.example.hotel.models.entities.accounts;
import com.example.hotel.models.entities.employees;
import com.example.hotel.repositorys.AccountRepository;
import com.example.hotel.repositorys.EmployeeRepository;
import com.example.hotel.services.impl.AccountService;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * Unit test cho AccountService (UC-ACC-001, UC-ACC-002, UC-ACC-003, UC-ACC-004).
 * Thiết kế theo Basis Path Testing; Repository, Mapper và PasswordEncoder được mock bằng Mockito.
 *
 * Mỗi test ghi rõ: Input (tham số đầu vào và dữ liệu giả lập của mock), Return (giá trị trả về / trạng thái đối tượng)
 * và Message (thông báo của exception) theo đúng bảng Unit Test Design và file Excel kèm theo.
 */
@ExtendWith(MockitoExtension.class)
@SuppressWarnings({"unchecked", "rawtypes"})
class AccountServiceTest {

    @Mock AccountRepository accountRepository;
    @Mock EmployeeRepository employeeRepository;
    @Mock AccountMapper accountMapper;
    @Mock EmployeeMapper employeeMapper;
    @Mock PasswordEncoder passwordEncoder;

    @InjectMocks AccountService accountService;

    // ------------------------------------------------------------------ dữ liệu dùng chung

    private static employees employee(Integer id, String fullName, String position) {
        employees e = new employees();
        e.setEmployeeId(id);
        e.setFullName(fullName);
        e.setPosition(position);
        return e;
    }

    private static accounts account(Integer id, String username, Role role, boolean active, employees employee) {
        accounts a = new accounts();
        a.setAccountId(id);
        a.setUsername(username);
        a.setPasswordHash("OLD_HASH");
        a.setRole(role);
        a.setIsActive(active);
        a.setEmployee(employee);
        return a;
    }

    private static AccountResponse response(Integer id, String username) {
        return new AccountResponse(id, username, Role.RECEPTIONIST, 1, "Nguyen Van A", "RECEPTIONIST", "a@x.vn", true);
    }

    private static AccountUpdateRequest update(String username, String newPassword, Role role, Boolean isActive) {
        return new AccountUpdateRequest(username, newPassword, role, isActive);
    }

    /** Tài khoản hiện có id = 1, username "oldname", RECEPTIONIST, đang hoạt động */
    private accounts existingAccount() {
        return account(1, "oldname", Role.RECEPTIONIST, true, employee(1, "Nguyen Van A", "RECEPTIONIST"));
    }

    // =====================================================================================
    // createAccount()   V(G) = 4   (D1: username trùng, D2: nhân viên tồn tại, D3: nhân viên đã có tài khoản)
    // =====================================================================================

    /**
     * UT-ACC-001 (P1: D1 = Đúng)
     * Input : request(username = "admin", password = "Pass@123", employeeId = 1);
     *         existsByUsername("admin") = true
     * Return: không có (ném exception)
     * Message: DuplicateResourceException("Tên đăng nhập 'admin' đã tồn tại trong hệ thống", field = username, value = admin)
     * Verify: không gọi findById; không gọi save()
     */
    @Test
    @DisplayName("UT-ACC-001 createAccount: username đã tồn tại")
    void UT_ACC_001_createAccount_duplicateUsername() {
        when(accountRepository.existsByUsername("admin")).thenReturn(true);

        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> accountService.createAccount(new AccountCreateRequest("admin", "Pass@123", 1)));

        assertEquals("Tên đăng nhập 'admin' đã tồn tại trong hệ thống", ex.getMessage());
        assertEquals("username", ex.getField());
        assertEquals("admin", ex.getValue());
        verify(employeeRepository, never()).findById(any());
        verify(accountRepository, never()).save(any());
    }

    /**
     * UT-ACC-002 (P2: D1 = Sai, D2 = Sai)
     * Input : request(username = "newuser", password = "Pass@123", employeeId = 99);
     *         existsByUsername("newuser") = false; employeeRepository.findById(99) = Optional.empty()
     * Return: không có (ném exception)
     * Message: ResourceNotFoundException("Không tìm thấy nhân viên với ID: 99")
     * Verify: không gọi existsByEmployee_EmployeeId; không gọi save()
     */
    @Test
    @DisplayName("UT-ACC-002 createAccount: nhân viên không tồn tại")
    void UT_ACC_002_createAccount_employeeNotFound() {
        when(accountRepository.existsByUsername("newuser")).thenReturn(false);
        when(employeeRepository.findById(99)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> accountService.createAccount(new AccountCreateRequest("newuser", "Pass@123", 99)));

        assertEquals("Không tìm thấy nhân viên với ID: 99", ex.getMessage());
        verify(accountRepository, never()).existsByEmployee_EmployeeId(any());
        verify(accountRepository, never()).save(any());
    }

    /**
     * UT-ACC-003 (P3: D1 = Sai, D2 = Đúng, D3 = Đúng)
     * Input : request(username = "newuser", password = "Pass@123", employeeId = 1);
     *         existsByUsername = false; findById(1) = nhân viên "Nguyen Van A"; existsByEmployee_EmployeeId(1) = true
     * Return: không có (ném exception)
     * Message: DuplicateResourceException("Nhân viên 'Nguyen Van A' đã có tài khoản trong hệ thống", field = employeeId, value = 1)
     * Verify: không gọi encode(); không gọi save()
     */
    @Test
    @DisplayName("UT-ACC-003 createAccount: nhân viên đã có tài khoản")
    void UT_ACC_003_createAccount_employeeAlreadyHasAccount() {
        when(accountRepository.existsByUsername("newuser")).thenReturn(false);
        when(employeeRepository.findById(1)).thenReturn(Optional.of(employee(1, "Nguyen Van A", "RECEPTIONIST")));
        when(accountRepository.existsByEmployee_EmployeeId(1)).thenReturn(true);

        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> accountService.createAccount(new AccountCreateRequest("newuser", "Pass@123", 1)));

        assertEquals("Nhân viên 'Nguyen Van A' đã có tài khoản trong hệ thống", ex.getMessage());
        assertEquals("employeeId", ex.getField());
        assertEquals("1", ex.getValue());
        verifyNoInteractions(passwordEncoder);
        verify(accountRepository, never()).save(any());
    }

    /**
     * UT-ACC-004 (P4: D1 = Sai, D2 = Đúng, D3 = Sai) - thành công
     * Input : request(username = "  newuser  ", password = "  Pass@123  ", employeeId = 1);
     *         existsByUsername("newuser") = false; findById(1) = nhân viên "Nguyen Van A" chức vụ RECEPTIONIST;
     *         existsByEmployee_EmployeeId(1) = false; encode("Pass@123") = "HASHED"
     * Return: AccountResponse do mapper trả về
     * Message: không có
     * Verify: encode() nhận mật khẩu đã trim; save() một lần với username "newuser", passwordHash "HASHED",
     *         role RECEPTIONIST, isActive = true, gắn đúng nhân viên
     */
    @Test
    @DisplayName("UT-ACC-004 createAccount: tạo thành công (username và mật khẩu có khoảng trắng)")
    void UT_ACC_004_createAccount_success() {
        employees employee = employee(1, "Nguyen Van A", "RECEPTIONIST");
        AccountResponse expected = response(10, "newuser");
        when(accountRepository.existsByUsername("newuser")).thenReturn(false);
        when(employeeRepository.findById(1)).thenReturn(Optional.of(employee));
        when(accountRepository.existsByEmployee_EmployeeId(1)).thenReturn(false);
        when(passwordEncoder.encode("Pass@123")).thenReturn("HASHED");
        when(accountRepository.save(any(accounts.class))).thenAnswer(inv -> inv.getArgument(0));
        when(accountMapper.toAccountResponse(any(accounts.class))).thenReturn(expected);

        AccountResponse result = accountService.createAccount(new AccountCreateRequest("  newuser  ", "  Pass@123  ", 1));

        assertSame(expected, result);
        ArgumentCaptor<accounts> saved = ArgumentCaptor.forClass(accounts.class);
        verify(accountRepository, times(1)).save(saved.capture());
        assertEquals("newuser", saved.getValue().getUsername());
        assertEquals("HASHED", saved.getValue().getPasswordHash());
        assertEquals(Role.RECEPTIONIST, saved.getValue().getRole());
        assertEquals(Boolean.TRUE, saved.getValue().getIsActive());
        assertSame(employee, saved.getValue().getEmployee());
        verify(passwordEncoder).encode("Pass@123");
    }

    /**
     * UT-ACC-024 (bổ sung cho P4: vai trò theo chức vụ nhân viên)
     * Input : request(username = "manager01", password = "Pass@123", employeeId = 2); nhân viên có chức vụ MANAGER
     * Return: AccountResponse do mapper trả về
     * Message: không có
     * Verify: tài khoản được lưu với role MANAGER
     */
    @Test
    @DisplayName("UT-ACC-024 createAccount: nhân viên chức vụ MANAGER thì tài khoản có vai trò MANAGER")
    void UT_ACC_024_createAccount_managerPositionGetsManagerRole() {
        when(accountRepository.existsByUsername("manager01")).thenReturn(false);
        when(employeeRepository.findById(2)).thenReturn(Optional.of(employee(2, "Tran Van B", "MANAGER")));
        when(accountRepository.existsByEmployee_EmployeeId(2)).thenReturn(false);
        when(passwordEncoder.encode("Pass@123")).thenReturn("HASHED");
        when(accountRepository.save(any(accounts.class))).thenAnswer(inv -> inv.getArgument(0));
        when(accountMapper.toAccountResponse(any(accounts.class))).thenReturn(response(11, "manager01"));

        accountService.createAccount(new AccountCreateRequest("manager01", "Pass@123", 2));

        ArgumentCaptor<accounts> saved = ArgumentCaptor.forClass(accounts.class);
        verify(accountRepository).save(saved.capture());
        assertEquals(Role.MANAGER, saved.getValue().getRole());
    }

    // =====================================================================================
    // updateAccount()   V(G) = 12
    // =====================================================================================

    /**
     * UT-ACC-005 (P1: D1 = Đúng) - ParameterizedTest
     * Input : accountId = null | 0 | -1 | -100; request(các trường = null)
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("ID tài khoản không hợp lệ: " + accountId)
     * Verify: không gọi findById; không gọi save()
     */
    @ParameterizedTest(name = "UT-ACC-005 updateAccount: accountId = {0}")
    @NullSource
    @ValueSource(ints = {0, -1, -100})
    void UT_ACC_005_updateAccount_invalidId(Integer accountId) {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> accountService.updateAccount(accountId, update(null, null, null, null)));

        assertEquals("ID tài khoản không hợp lệ: " + accountId, ex.getMessage());
        verifyNoInteractions(accountRepository);
    }

    /**
     * UT-ACC-006 (P2: D1 = Sai, D2 = Sai)
     * Input : accountId = 5; request(các trường = null); findById(5) = Optional.empty()
     * Return: không có (ném exception)
     * Message: ResourceNotFoundException("Không tìm thấy tài khoản với ID: 5")
     * Verify: không gọi save()
     */
    @Test
    @DisplayName("UT-ACC-006 updateAccount: tài khoản không tồn tại")
    void UT_ACC_006_updateAccount_accountNotFound() {
        when(accountRepository.findById(5)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> accountService.updateAccount(5, update(null, null, null, null)));

        assertEquals("Không tìm thấy tài khoản với ID: 5", ex.getMessage());
        verify(accountRepository, never()).save(any());
    }

    /**
     * UT-ACC-007 (P3: không có yêu cầu thay đổi)
     * Input : accountId = 1; request(username = null, newPassword = null, role = null, isActive = null);
     *         tài khoản hiện có "oldname", RECEPTIONIST, isActive = true
     * Return: AccountResponse của thông tin hiện tại (do mapper trả về)
     * Message: không có
     * Verify: không gọi encode(); không gọi save()
     */
    @Test
    @DisplayName("UT-ACC-007 updateAccount: không có trường nào thay đổi")
    void UT_ACC_007_updateAccount_noChange() {
        accounts current = existingAccount();
        AccountResponse expected = response(1, "oldname");
        when(accountRepository.findById(1)).thenReturn(Optional.of(current));
        when(accountMapper.toAccountResponse(current)).thenReturn(expected);

        AccountResponse result = accountService.updateAccount(1, update(null, null, null, null));

        assertSame(expected, result);
        verifyNoInteractions(passwordEncoder);
        verify(accountRepository, never()).save(any());
    }

    /**
     * UT-ACC-008 (P4: D3 = Đúng, D4 = Sai)
     * Input : accountId = 1; request(username = "  oldname  ", các trường khác = null); username hiện tại "oldname"
     * Return: AccountResponse của thông tin hiện tại
     * Message: không có
     * Verify: không gọi existsByUsernameAndAccountIdNot; không gọi save()
     */
    @Test
    @DisplayName("UT-ACC-008 updateAccount: username mới (sau trim) giống username hiện tại")
    void UT_ACC_008_updateAccount_sameUsername() {
        accounts current = existingAccount();
        AccountResponse expected = response(1, "oldname");
        when(accountRepository.findById(1)).thenReturn(Optional.of(current));
        when(accountMapper.toAccountResponse(current)).thenReturn(expected);

        AccountResponse result = accountService.updateAccount(1, update("  oldname  ", null, null, null));

        assertSame(expected, result);
        verify(accountRepository, never()).existsByUsernameAndAccountIdNot(any(), any());
        verify(accountRepository, never()).save(any());
    }

    /**
     * UT-ACC-009 (P5: D4 = Đúng, D5 = Đúng)
     * Input : accountId = 1; request(username = "taken", các trường khác = null);
     *         existsByUsernameAndAccountIdNot("taken", 1) = true
     * Return: không có (ném exception)
     * Message: DuplicateResourceException("Tên đăng nhập 'taken' đã tồn tại trong hệ thống", field = username, value = taken)
     * Verify: username tài khoản vẫn là "oldname"; không gọi save()
     */
    @Test
    @DisplayName("UT-ACC-009 updateAccount: username đã bị tài khoản khác dùng")
    void UT_ACC_009_updateAccount_usernameTaken() {
        accounts current = existingAccount();
        when(accountRepository.findById(1)).thenReturn(Optional.of(current));
        when(accountRepository.existsByUsernameAndAccountIdNot("taken", 1)).thenReturn(true);

        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> accountService.updateAccount(1, update("taken", null, null, null)));

        assertEquals("Tên đăng nhập 'taken' đã tồn tại trong hệ thống", ex.getMessage());
        assertEquals("username", ex.getField());
        assertEquals("taken", ex.getValue());
        assertEquals("oldname", current.getUsername());
        verify(accountRepository, never()).save(any());
    }

    /**
     * UT-ACC-010 (P6: cập nhật username)
     * Input : accountId = 1; request(username = "  newname  ", các trường khác = null);
     *         existsByUsernameAndAccountIdNot("newname", 1) = false
     * Return: AccountResponse do mapper trả về (tài khoản đã lưu)
     * Message: không có
     * Verify: username = "newname"; save() được gọi một lần
     */
    @Test
    @DisplayName("UT-ACC-010 updateAccount: đổi username (có khoảng trắng đầu cuối)")
    void UT_ACC_010_updateAccount_changeUsername() {
        accounts current = existingAccount();
        AccountResponse expected = response(1, "newname");
        when(accountRepository.findById(1)).thenReturn(Optional.of(current));
        when(accountRepository.existsByUsernameAndAccountIdNot("newname", 1)).thenReturn(false);
        when(accountRepository.save(current)).thenReturn(current);
        when(accountMapper.toAccountResponse(current)).thenReturn(expected);

        AccountResponse result = accountService.updateAccount(1, update("  newname  ", null, null, null));

        assertSame(expected, result);
        assertEquals("newname", current.getUsername());
        verify(accountRepository, times(1)).save(current);
    }

    /**
     * UT-ACC-011 (P7: cập nhật mật khẩu)
     * Input : accountId = 1; request(newPassword = "  NewPass@1  ", các trường khác = null); encode("NewPass@1") = "NEW_HASH"
     * Return: AccountResponse do mapper trả về
     * Message: không có
     * Verify: encode() nhận mật khẩu đã trim; passwordHash = "NEW_HASH"; save() một lần
     */
    @Test
    @DisplayName("UT-ACC-011 updateAccount: đổi mật khẩu (có khoảng trắng đầu cuối)")
    void UT_ACC_011_updateAccount_changePassword() {
        accounts current = existingAccount();
        AccountResponse expected = response(1, "oldname");
        when(accountRepository.findById(1)).thenReturn(Optional.of(current));
        when(passwordEncoder.encode("NewPass@1")).thenReturn("NEW_HASH");
        when(accountRepository.save(current)).thenReturn(current);
        when(accountMapper.toAccountResponse(current)).thenReturn(expected);

        AccountResponse result = accountService.updateAccount(1, update(null, "  NewPass@1  ", null, null));

        assertSame(expected, result);
        assertEquals("NEW_HASH", current.getPasswordHash());
        verify(passwordEncoder).encode("NewPass@1");
        verify(accountRepository, times(1)).save(current);
    }

    /**
     * UT-ACC-012 (P8: D7 = Đúng, D8 = Đúng)
     * Input : accountId = 1; request(role = ADMIN, các trường khác = null)
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("Role không được phép gán: ADMIN")
     * Verify: role tài khoản vẫn RECEPTIONIST; không gọi save()
     */
    @Test
    @DisplayName("UT-ACC-012 updateAccount: role ADMIN không được phép gán")
    void UT_ACC_012_updateAccount_adminRoleRejected() {
        accounts current = existingAccount();
        when(accountRepository.findById(1)).thenReturn(Optional.of(current));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> accountService.updateAccount(1, update(null, null, Role.ADMIN, null)));

        assertEquals("Role không được phép gán: ADMIN", ex.getMessage());
        assertEquals(Role.RECEPTIONIST, current.getRole());
        verify(accountRepository, never()).save(any());
    }

    /**
     * UT-ACC-013 (P9: D8 = Sai, D9 = Sai)
     * Input : accountId = 1; request(role = RECEPTIONIST, các trường khác = null); role hiện tại RECEPTIONIST
     * Return: AccountResponse của thông tin hiện tại
     * Message: không có (không ném exception)
     * Verify: không gọi save(); chức vụ nhân viên không đổi
     */
    @Test
    @DisplayName("UT-ACC-013 updateAccount: role mới giống role hiện tại")
    void UT_ACC_013_updateAccount_sameRole() {
        accounts current = existingAccount();
        AccountResponse expected = response(1, "oldname");
        when(accountRepository.findById(1)).thenReturn(Optional.of(current));
        when(accountMapper.toAccountResponse(current)).thenReturn(expected);

        AccountResponse result = accountService.updateAccount(1, update(null, null, Role.RECEPTIONIST, null));

        assertSame(expected, result);
        assertEquals("RECEPTIONIST", current.getEmployee().getPosition());
        verify(accountRepository, never()).save(any());
    }

    /**
     * UT-ACC-014 (P10: D9 = Đúng) - đổi role
     * Input : accountId = 1; request(role = MANAGER, các trường khác = null); role hiện tại RECEPTIONIST
     * Return: AccountResponse do mapper trả về
     * Message: không có
     * Verify: role = MANAGER; chức vụ nhân viên đổi theo thành "MANAGER"; save() một lần
     */
    @Test
    @DisplayName("UT-ACC-014 updateAccount: đổi role từ RECEPTIONIST sang MANAGER")
    void UT_ACC_014_updateAccount_changeRole() {
        accounts current = existingAccount();
        AccountResponse expected = response(1, "oldname");
        when(accountRepository.findById(1)).thenReturn(Optional.of(current));
        when(accountRepository.save(current)).thenReturn(current);
        when(accountMapper.toAccountResponse(current)).thenReturn(expected);

        AccountResponse result = accountService.updateAccount(1, update(null, null, Role.MANAGER, null));

        assertSame(expected, result);
        assertEquals(Role.MANAGER, current.getRole());
        assertEquals("MANAGER", current.getEmployee().getPosition());
        verify(accountRepository, times(1)).save(current);
    }

    /**
     * UT-ACC-015 (P11: D10 = Đúng) - đổi trạng thái
     * Input : accountId = 1; request(isActive = false, các trường khác = null); trạng thái hiện tại true
     * Return: AccountResponse do mapper trả về
     * Message: không có
     * Verify: isActive = false; save() một lần
     */
    @Test
    @DisplayName("UT-ACC-015 updateAccount: khóa tài khoản (isActive true -> false)")
    void UT_ACC_015_updateAccount_changeStatus() {
        accounts current = existingAccount();
        AccountResponse expected = response(1, "oldname");
        when(accountRepository.findById(1)).thenReturn(Optional.of(current));
        when(accountRepository.save(current)).thenReturn(current);
        when(accountMapper.toAccountResponse(current)).thenReturn(expected);

        AccountResponse result = accountService.updateAccount(1, update(null, null, null, false));

        assertSame(expected, result);
        assertEquals(Boolean.FALSE, current.getIsActive());
        verify(accountRepository, times(1)).save(current);
    }

    /**
     * UT-ACC-016 (P12: cập nhật đồng thời cả bốn trường)
     * Input : accountId = 1; request(username = "  newname  ", newPassword = "  NewPass@1  ", role = MANAGER, isActive = false);
     *         existsByUsernameAndAccountIdNot("newname", 1) = false; encode("NewPass@1") = "NEW_HASH"
     * Return: AccountResponse do mapper trả về
     * Message: không có
     * Verify: username = "newname", passwordHash = "NEW_HASH", role = MANAGER, isActive = false; save() đúng một lần
     */
    @Test
    @DisplayName("UT-ACC-016 updateAccount: đổi đồng thời username, mật khẩu, role, trạng thái")
    void UT_ACC_016_updateAccount_changeAllFields() {
        accounts current = existingAccount();
        AccountResponse expected = response(1, "newname");
        when(accountRepository.findById(1)).thenReturn(Optional.of(current));
        when(accountRepository.existsByUsernameAndAccountIdNot("newname", 1)).thenReturn(false);
        when(passwordEncoder.encode("NewPass@1")).thenReturn("NEW_HASH");
        when(accountRepository.save(current)).thenReturn(current);
        when(accountMapper.toAccountResponse(current)).thenReturn(expected);

        AccountResponse result = accountService.updateAccount(1,
                update("  newname  ", "  NewPass@1  ", Role.MANAGER, false));

        assertSame(expected, result);
        assertEquals("newname", current.getUsername());
        assertEquals("NEW_HASH", current.getPasswordHash());
        assertEquals(Role.MANAGER, current.getRole());
        assertEquals(Boolean.FALSE, current.getIsActive());
        verify(accountRepository, times(1)).save(current);
    }

    /**
     * UT-ACC-017 (biên D3: username chỉ gồm khoảng trắng)
     * Input : accountId = 1; request(username = "   ", các trường khác = null)
     * Return: AccountResponse của thông tin hiện tại
     * Message: không có
     * Verify: không gọi existsByUsernameAndAccountIdNot; không gọi save(); username vẫn là "oldname"
     */
    @Test
    @DisplayName("UT-ACC-017 updateAccount: username chỉ gồm khoảng trắng thì bỏ qua")
    void UT_ACC_017_updateAccount_blankUsernameIgnored() {
        accounts current = existingAccount();
        AccountResponse expected = response(1, "oldname");
        when(accountRepository.findById(1)).thenReturn(Optional.of(current));
        when(accountMapper.toAccountResponse(current)).thenReturn(expected);

        AccountResponse result = accountService.updateAccount(1, update("   ", null, null, null));

        assertSame(expected, result);
        assertEquals("oldname", current.getUsername());
        verify(accountRepository, never()).existsByUsernameAndAccountIdNot(any(), any());
        verify(accountRepository, never()).save(any());
    }

    /**
     * UT-ACC-018 (biên D6: mật khẩu rỗng hoặc chỉ gồm khoảng trắng) - ParameterizedTest
     * Input : accountId = 1; request(newPassword = "" | "   " | "\t", các trường khác = null)
     * Return: AccountResponse của thông tin hiện tại
     * Message: không có
     * Verify: không gọi encode(); passwordHash giữ nguyên "OLD_HASH"; không gọi save()
     */
    @ParameterizedTest(name = "UT-ACC-018 updateAccount: newPassword = [{0}]")
    @ValueSource(strings = {"", "   ", "\t"})
    void UT_ACC_018_updateAccount_blankPasswordIgnored(String newPassword) {
        accounts current = existingAccount();
        AccountResponse expected = response(1, "oldname");
        when(accountRepository.findById(1)).thenReturn(Optional.of(current));
        when(accountMapper.toAccountResponse(current)).thenReturn(expected);

        AccountResponse result = accountService.updateAccount(1, update(null, newPassword, null, null));

        assertSame(expected, result);
        assertEquals("OLD_HASH", current.getPasswordHash());
        verifyNoInteractions(passwordEncoder);
        verify(accountRepository, never()).save(any());
    }

    /**
     * UT-ACC-019 (biên D10: trạng thái mới bằng trạng thái hiện tại)
     * Input : accountId = 1; request(isActive = true, các trường khác = null); trạng thái hiện tại true
     * Return: AccountResponse của thông tin hiện tại
     * Message: không có
     * Verify: không gọi save()
     */
    @Test
    @DisplayName("UT-ACC-019 updateAccount: trạng thái mới bằng trạng thái hiện tại")
    void UT_ACC_019_updateAccount_sameStatus() {
        accounts current = existingAccount();
        AccountResponse expected = response(1, "oldname");
        when(accountRepository.findById(1)).thenReturn(Optional.of(current));
        when(accountMapper.toAccountResponse(current)).thenReturn(expected);

        AccountResponse result = accountService.updateAccount(1, update(null, null, null, true));

        assertSame(expected, result);
        assertEquals(Boolean.TRUE, current.getIsActive());
        verify(accountRepository, never()).save(any());
    }

    // =====================================================================================
    // getAllAccounts()   V(G) = 1
    // =====================================================================================

    private static final Pageable PAGEABLE = PageRequest.of(0, 16);

    /** Chạy Specification mà service đã truyền vào Repository trên Root/CriteriaBuilder giả lập */
    private Specification<accounts> capturedSpecification() {
        ArgumentCaptor<Specification<accounts>> captor = ArgumentCaptor.forClass(Specification.class);
        verify(accountRepository).findAll(captor.capture(), eq(PAGEABLE));
        return captor.getValue();
    }

    /**
     * UT-ACC-020 (P1: isActive = true)
     * Input : pageable = PageRequest(page 0, size 16); isActive = true;
     *         findAll(spec, pageable) = Page gồm 2 tài khoản (tổng 2)
     * Return: Page<AccountResponse> gồm 2 AccountResponse đã ánh xạ, totalElements = 2
     * Message: không có
     * Verify: findAll nhận đúng pageable; Specification lọc "isActive = true"
     */
    @Test
    @DisplayName("UT-ACC-020 getAllAccounts: lọc isActive = true")
    void UT_ACC_020_getAllAccounts_activeOnly() {
        accounts a1 = account(1, "u1", Role.RECEPTIONIST, true, employee(1, "A", "RECEPTIONIST"));
        accounts a2 = account(2, "u2", Role.MANAGER, true, employee(2, "B", "MANAGER"));
        AccountResponse r1 = response(1, "u1");
        AccountResponse r2 = response(2, "u2");
        when(accountRepository.findAll(any(Specification.class), eq(PAGEABLE)))
                .thenReturn(new PageImpl<>(List.of(a1, a2), PAGEABLE, 2));
        when(accountMapper.toAccountResponse(a1)).thenReturn(r1);
        when(accountMapper.toAccountResponse(a2)).thenReturn(r2);

        Page<AccountResponse> result = accountService.getAllAccounts(PAGEABLE, true);

        assertEquals(List.of(r1, r2), result.getContent());
        assertEquals(2, result.getTotalElements());

        Root<accounts> root = mock(Root.class);
        Path<Object> isActivePath = mock(Path.class);
        CriteriaBuilder cb = mock(CriteriaBuilder.class);
        Predicate predicate = mock(Predicate.class);
        when(root.get("isActive")).thenReturn(isActivePath);
        when(cb.equal(isActivePath, true)).thenReturn(predicate);
        assertSame(predicate, capturedSpecification().toPredicate(root, mock(CriteriaQuery.class), cb));
    }

    /**
     * UT-ACC-021 (isActive = false)
     * Input : pageable = PageRequest(page 0, size 16); isActive = false; findAll trả về Page gồm 1 tài khoản bị khóa
     * Return: Page<AccountResponse> gồm 1 AccountResponse
     * Message: không có
     * Verify: Specification lọc "isActive = false" và được truyền vào Repository
     */
    @Test
    @DisplayName("UT-ACC-021 getAllAccounts: lọc isActive = false")
    void UT_ACC_021_getAllAccounts_inactiveOnly() {
        accounts locked = account(3, "u3", Role.RECEPTIONIST, false, employee(3, "C", "RECEPTIONIST"));
        AccountResponse r3 = response(3, "u3");
        when(accountRepository.findAll(any(Specification.class), eq(PAGEABLE)))
                .thenReturn(new PageImpl<>(List.of(locked), PAGEABLE, 1));
        when(accountMapper.toAccountResponse(locked)).thenReturn(r3);

        Page<AccountResponse> result = accountService.getAllAccounts(PAGEABLE, false);

        assertEquals(List.of(r3), result.getContent());

        Root<accounts> root = mock(Root.class);
        Path<Object> isActivePath = mock(Path.class);
        CriteriaBuilder cb = mock(CriteriaBuilder.class);
        Predicate predicate = mock(Predicate.class);
        when(root.get("isActive")).thenReturn(isActivePath);
        when(cb.equal(isActivePath, false)).thenReturn(predicate);
        assertSame(predicate, capturedSpecification().toPredicate(root, mock(CriteriaQuery.class), cb));
    }

    /**
     * UT-ACC-022 (isActive = null, không lọc)
     * Input : pageable = PageRequest(page 0, size 16); isActive = null; findAll trả về Page gồm 1 tài khoản
     * Return: Page<AccountResponse> gồm 1 AccountResponse
     * Message: không có
     * Verify: Specification không có điều kiện lọc (conjunction), không so sánh isActive
     */
    @Test
    @DisplayName("UT-ACC-022 getAllAccounts: isActive = null (không lọc)")
    void UT_ACC_022_getAllAccounts_noFilter() {
        accounts a1 = account(1, "u1", Role.RECEPTIONIST, true, employee(1, "A", "RECEPTIONIST"));
        AccountResponse r1 = response(1, "u1");
        when(accountRepository.findAll(any(Specification.class), eq(PAGEABLE)))
                .thenReturn(new PageImpl<>(List.of(a1), PAGEABLE, 1));
        when(accountMapper.toAccountResponse(a1)).thenReturn(r1);

        Page<AccountResponse> result = accountService.getAllAccounts(PAGEABLE, null);

        assertEquals(List.of(r1), result.getContent());

        Root<accounts> root = mock(Root.class);
        CriteriaBuilder cb = mock(CriteriaBuilder.class);
        Predicate noFilter = mock(Predicate.class);
        when(cb.conjunction()).thenReturn(noFilter);
        assertSame(noFilter, capturedSpecification().toPredicate(root, mock(CriteriaQuery.class), cb));
        verify(cb, never()).equal(any(), any(Object.class));
    }

    /**
     * UT-ACC-023 (Repository trả về trang rỗng)
     * Input : pageable = PageRequest(page 0, size 16); isActive = true; findAll trả về Page rỗng
     * Return: Page<AccountResponse> rỗng (content = [], totalElements = 0)
     * Message: không có (không ném exception)
     * Verify: mapper không được gọi
     */
    @Test
    @DisplayName("UT-ACC-023 getAllAccounts: Repository trả về trang rỗng")
    void UT_ACC_023_getAllAccounts_emptyPage() {
        when(accountRepository.findAll(any(Specification.class), eq(PAGEABLE)))
                .thenReturn(Page.empty(PAGEABLE));

        Page<AccountResponse> result = accountService.getAllAccounts(PAGEABLE, true);

        assertTrue(result.getContent().isEmpty());
        assertEquals(0, result.getTotalElements());
        assertFalse(result.hasContent());
        verifyNoInteractions(accountMapper);
    }
}
