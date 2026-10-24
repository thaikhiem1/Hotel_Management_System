package com.example.hotel.services.impl;

import com.example.hotel.Enums.Role;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.mapper.AccountMapper;
import com.example.hotel.mapper.EmployeeMapper;
import com.example.hotel.models.dto.request.AccountUpdateRequest;
import com.example.hotel.models.dto.response.AccountResponse;
import com.example.hotel.models.entities.accounts;
import com.example.hotel.repositorys.AccountRepository;
import com.example.hotel.repositorys.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {
    private static final String USERNAME = "receptionist01";

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private AccountMapper accountMapper;

    @Mock
    private EmployeeMapper employeeMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AccountService accountService;

    private final accounts account = existingAccount();
    private final AccountResponse expectedResponse = mock(AccountResponse.class);

    // UT-ACC-005: Không tìm thấy tài khoản
    @Test
    void updateAccount_AccountNotFound_ThrowsException() {
        when(accountRepository.findById(USERNAME))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> accountService.updateAccount(USERNAME, new AccountUpdateRequest()));

        verify(accountRepository, never()).save(any());
        verifyNoInteractions(accountMapper);
    }

    // UT-ACC-006: Không có thông tin cập nhật
    @Test
    void updateAccount_NoChanges_DoesNotSave() {
        givenAccountExists();

        AccountResponse result = accountService.updateAccount(USERNAME, new AccountUpdateRequest());

        assertSame(expectedResponse, result);
        verify(accountRepository, never()).save(any());
        verify(accountMapper).toAccountResponse(account);
    }

    // UT-ACC-007: Cập nhật mật khẩu
    @Test
    void updateAccount_NewPassword_UpdatesPasswordAndSaves() {
        givenAccountExists();
        when(accountRepository.save(account)).thenReturn(account);
        when(passwordEncoder.encode("Secret123"))
                .thenReturn("hashedPassword");

        AccountResponse result = accountService.updateAccount(
                USERNAME, new AccountUpdateRequest(null, "Secret123", null, null));

        verify(passwordEncoder).encode("Secret123");
        assertEquals("hashedPassword", account.getPasswordHash());
        verify(accountRepository).save(account);

        assertSame(expectedResponse, result);
    }

    // UT-ACC-008: Thay đổi vai trò hợp lệ
    @Test
    void updateAccount_DifferentValidRole_UpdatesRoleAndSaves() {
        givenAccountExists();
        when(accountRepository.save(account)).thenReturn(account);

        AccountResponse result = accountService.updateAccount(
                USERNAME, new AccountUpdateRequest(null, null, Role.MANAGER, null));

        assertEquals(Role.MANAGER, account.getRole());
        verify(accountRepository).save(account);

        assertSame(expectedResponse, result);
    }

    // UT-ACC-009: Không cho phép gán vai trò ADMIN
    @Test
    void updateAccount_AdminRole_ThrowsException() {
        when(accountRepository.findById(USERNAME)).thenReturn(Optional.of(account));

        assertThrows(
                IllegalArgumentException.class,
                () -> accountService.updateAccount(
                        USERNAME, new AccountUpdateRequest(null, null, Role.ADMIN, null)));

        verify(accountRepository, never()).save(any());
        verify(accountMapper, never()).toAccountResponse(any());
    }

    // UT-ACC-010: Vai trò mới giống vai trò hiện tại
    @Test
    void updateAccount_SameRole_DoesNotSave() {
        givenAccountExists();

        AccountResponse result = accountService.updateAccount(
                USERNAME, new AccountUpdateRequest(null, null, Role.RECEPTIONIST, true));

        verify(accountRepository, never()).save(any());

        assertSame(expectedResponse, result);
    }

    // UT-ACC-011: Thay đổi trạng thái tài khoản
    @Test
    void updateAccount_ChangedStatus_UpdatesStatusAndSaves() {
        givenAccountExists();
        when(accountRepository.save(account)).thenReturn(account);

        AccountResponse result = accountService.updateAccount(
                USERNAME, new AccountUpdateRequest(null, null, null, false));

        assertEquals(false, account.getIsActive());
        verify(accountRepository).save(account);

        assertSame(expectedResponse, result);
    }

    // UT-ACC-012: Vai trò và trạng thái đều không thay đổi
    @Test
    void updateAccount_UnchangedRoleAndStatus_DoesNotSave() {
        givenAccountExists();

        AccountResponse result = accountService.updateAccount(
                USERNAME, new AccountUpdateRequest(null, "", Role.RECEPTIONIST, true));

        verifyNoInteractions(passwordEncoder);
        verify(accountRepository, never()).save(any());

        assertSame(expectedResponse, result);
    }

    private void givenAccountExists() {
        when(accountRepository.findById(USERNAME)).thenReturn(Optional.of(account));
        when(accountMapper.toAccountResponse(account)).thenReturn(expectedResponse);
    }

    private static accounts existingAccount() {
        accounts account = new accounts();
        account.setUsername(USERNAME);
        account.setPasswordHash("old-hash");
        account.setRole(Role.RECEPTIONIST);
        account.setIsActive(true);
        return account;
    }
}
