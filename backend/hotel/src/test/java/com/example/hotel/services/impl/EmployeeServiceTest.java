package com.example.hotel.services.impl;

import com.example.hotel.Enums.Role;
import com.example.hotel.exception.DuplicateResourceException;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.mapper.EmployeeMapper;
import com.example.hotel.models.dto.request.EmployeeUpdateRequest;
import com.example.hotel.models.dto.response.EmployeeResponse;
import com.example.hotel.models.entities.accounts;
import com.example.hotel.models.entities.employees;
import com.example.hotel.repositorys.AccountRepository;
import com.example.hotel.repositorys.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private EmployeeMapper employeeMapper;

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private EmployeeService employeeService;

    @Test
    void updateEmployee_UpdatesFieldsAndLinkedAccountStatusInTransaction() {
        employees employee = existingEmployee();
        accounts linkedAccount = new accounts();
        linkedAccount.setRole(Role.RECEPTIONIST);
        linkedAccount.setIsActive(true);
        EmployeeResponse response = mock(EmployeeResponse.class);
        when(employeeRepository.findById(7)).thenReturn(Optional.of(employee));
        when(employeeRepository.save(employee)).thenReturn(employee);
        when(accountRepository.findByEmployee_EmployeeId(7)).thenReturn(Optional.of(linkedAccount));
        when(accountRepository.save(linkedAccount)).thenReturn(linkedAccount);
        when(employeeMapper.toEmployeeResponse(employee)).thenReturn(response);

        EmployeeResponse result = employeeService.updateEmployee(7,
                new EmployeeUpdateRequest("Nguyen Van A", null, null, null,
                        null, null, null, null, null, false));

        assertSame(response, result);
        assertEquals("Nguyen Van A", employee.getFullName());
        assertEquals(false, employee.getIsActive());
        assertEquals(false, linkedAccount.getIsActive());
        verify(employeeRepository).save(employee);
        verify(accountRepository).save(linkedAccount);
    }

    @Test
    void updateEmployee_DuplicatePhone_ThrowsConflictWithoutSaving() {
        employees employee = existingEmployee();
        when(employeeRepository.findById(7)).thenReturn(Optional.of(employee));
        when(employeeRepository.existsByPhoneAndEmployeeIdNot("0912345678", 7)).thenReturn(true);

        assertThrows(DuplicateResourceException.class,
                () -> employeeService.updateEmployee(7,
                        new EmployeeUpdateRequest(null, null, null, "0912345678",
                                null, null, null, null, null, null)));

        verify(employeeRepository, never()).save(any());
        verifyNoInteractions(accountRepository, employeeMapper);
    }

    @Test
    void updateEmployee_EmployeeDoesNotExist_ThrowsNotFound() {
        when(employeeRepository.findById(7)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> employeeService.updateEmployee(7, new EmployeeUpdateRequest()));

        verify(employeeRepository, never()).save(any());
        verifyNoInteractions(accountRepository, employeeMapper);
    }

    @Test
    void updateEmployee_NoFieldsChanged_DoesNotSave() {
        employees employee = existingEmployee();
        EmployeeResponse response = mock(EmployeeResponse.class);
        when(employeeRepository.findById(7)).thenReturn(Optional.of(employee));
        when(employeeMapper.toEmployeeResponse(employee)).thenReturn(response);

        EmployeeResponse result = employeeService.updateEmployee(7, new EmployeeUpdateRequest());

        assertSame(response, result);
        verify(employeeRepository, never()).save(any());
        verifyNoInteractions(accountRepository);
    }

    @Test
    void updateEmployee_RequestedStatusMatchesEmployee_StillSynchronizesLinkedAccount() {
        employees employee = existingEmployee();
        employee.setIsActive(false);
        accounts linkedAccount = new accounts();
        linkedAccount.setIsActive(true);
        EmployeeResponse response = mock(EmployeeResponse.class);
        when(employeeRepository.findById(7)).thenReturn(Optional.of(employee));
        when(accountRepository.findByEmployee_EmployeeId(7)).thenReturn(Optional.of(linkedAccount));
        when(accountRepository.save(linkedAccount)).thenReturn(linkedAccount);
        when(employeeMapper.toEmployeeResponse(employee)).thenReturn(response);

        EmployeeResponse result = employeeService.updateEmployee(7,
                new EmployeeUpdateRequest(null, null, null, null,
                        null, null, null, null, null, false));

        assertSame(response, result);
        assertEquals(false, linkedAccount.getIsActive());
        verify(employeeRepository, never()).save(any());
        verify(accountRepository).save(linkedAccount);
    }

    @Test
    void updateEmployee_UnderageDateOfBirth_ThrowsBadRequest() {
        employees employee = existingEmployee();
        when(employeeRepository.findById(7)).thenReturn(Optional.of(employee));
        LocalDate underageDate = LocalDate.now().minusYears(17);

        assertThrows(IllegalArgumentException.class,
                () -> employeeService.updateEmployee(7,
                        new EmployeeUpdateRequest(null, null, null, null,
                                null, underageDate, null, null, null, null)));

        verify(employeeRepository, never()).save(any());
        verifyNoInteractions(accountRepository, employeeMapper);
    }

    private employees existingEmployee() {
        employees employee = new employees();
        employee.setEmployeeId(7);
        employee.setFullName("Employee Current");
        employee.setPosition("Receptionist");
        employee.setSalary(new BigDecimal("15000000.00"));
        employee.setPhone("0900000000");
        employee.setCitizenId("012345678901");
        employee.setDateOfBirth(LocalDate.of(1990, 1, 1));
        employee.setGender("Nam");
        employee.setAddress("Old address");
        employee.setEmail("current@example.com");
        employee.setAvatar("/avatars/profileNam.jpg");
        employee.setIsActive(true);
        return employee;
    }
}
