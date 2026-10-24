package com.example.hotel.services.impl;

import com.example.hotel.exception.DuplicateResourceException;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.mapper.ServicesMapper;
import com.example.hotel.models.dto.request.ServicesRequest;
import com.example.hotel.models.dto.response.ServicesResponse;
import com.example.hotel.models.entities.service_categories;
import com.example.hotel.models.entities.services;
import com.example.hotel.repositorys.ServiceCategoriesRepository;
import com.example.hotel.repositorys.ServicesRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServicesServiceTest {

    @Mock
    private ServicesRepository servicesRepository;

    @Mock
    private ServicesMapper servicesMapper;

    @Mock
    private ServiceCategoriesRepository categoriesRepository;

    @InjectMocks
    private ServicesService servicesService;

    @Test
    void create_TrimsTextAndAllowsZeroPriceAndNullStock() {
        ServicesRequest request = request("  Spa  ", 3, "0.00", null, "  lần  ");
        serviceMapperReturnsEntity();
        serviceNameIsAvailable("Spa");
        categoryExists(3);
        ServicesResponse expected = mock(ServicesResponse.class);
        when(servicesRepository.save(any(services.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(servicesMapper.toServicesResponse(any(services.class))).thenReturn(expected);

        ServicesResponse result = servicesService.create(request);

        assertSame(expected, result);
        verify(servicesRepository).existsByServiceName("Spa");
        verify(servicesRepository).save(argThat(saved ->
                saved.getServiceName().equals("Spa")
                        && saved.getUnit().equals("lần")
                        && saved.getUnitPrice().equals(new BigDecimal("0.00"))
                        && saved.getStockQuantity() == null
                        && saved.getCategory().getServiceCategoriesId().equals(3)));
    }

    @Test
    void create_DuplicateName_ThrowsConflictWithoutSaving() {
        ServicesRequest request = request("Spa", 3, "10.00", 2, "lần");
        when(servicesRepository.existsByServiceName("Spa")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> servicesService.create(request));

        verifyNoInteractions(categoriesRepository, servicesMapper);
        verify(servicesRepository, never()).save(any());
    }

    @Test
    void create_CategoryDoesNotExist_ThrowsNotFoundWithoutSaving() {
        ServicesRequest request = request("Spa", 3, "10.00", 2, "lần");
        serviceNameIsAvailable("Spa");
        when(categoriesRepository.findById(3)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> servicesService.create(request));

        verifyNoInteractions(servicesMapper);
        verify(servicesRepository, never()).save(any());
    }

    @Test
    void create_NullRequest_ThrowsBadRequestWithoutRepositoryChanges() {
        assertThrows(IllegalArgumentException.class, () -> servicesService.create(null));
        verifyNoInteractions(servicesRepository, categoriesRepository, servicesMapper);
    }

    @Test
    void update_UsesCurrentIdWhenCheckingDuplicateNameAndSavesChangedFields() {
        services existingService = existingService();
        service_categories category = category(5);
        ServicesRequest request = request("  Spa cao cấp ", 5, "125.50", 0, "  giờ ");
        ServicesResponse expected = mock(ServicesResponse.class);
        when(servicesRepository.findById(8)).thenReturn(Optional.of(existingService));
        when(servicesRepository.existsByServiceNameAndServiceIdNot("Spa cao cấp", 8)).thenReturn(false);
        when(categoriesRepository.findById(5)).thenReturn(Optional.of(category));
        when(servicesRepository.save(existingService)).thenReturn(existingService);
        when(servicesMapper.toServicesResponse(existingService)).thenReturn(expected);

        ServicesResponse result = servicesService.update(8, request);

        assertSame(expected, result);
        assertEquals("Spa cao cấp", existingService.getServiceName());
        assertEquals("125.50", existingService.getUnitPrice().toPlainString());
        assertEquals(0, existingService.getStockQuantity());
        assertEquals("giờ", existingService.getUnit());
        assertSame(category, existingService.getCategory());
        verify(servicesRepository).existsByServiceNameAndServiceIdNot("Spa cao cấp", 8);
        verify(servicesRepository).save(existingService);
    }

    @Test
    void update_DuplicateNameOfAnotherService_ThrowsConflictWithoutSaving() {
        services existingService = existingService();
        when(servicesRepository.findById(8)).thenReturn(Optional.of(existingService));
        when(servicesRepository.existsByServiceNameAndServiceIdNot("Other", 8)).thenReturn(true);

        assertThrows(DuplicateResourceException.class,
                () -> servicesService.update(8, request("Other", 5, "10.00", null, "lần")));

        verifyNoInteractions(categoriesRepository, servicesMapper);
        verify(servicesRepository, never()).save(any());
    }

    @Test
    void update_AllowsExistingNameWhenItBelongsToSameService() {
        services existingService = existingService();
        service_categories category = category(5);
        when(servicesRepository.findById(8)).thenReturn(Optional.of(existingService));
        when(servicesRepository.existsByServiceNameAndServiceIdNot("Existing", 8)).thenReturn(false);
        when(categoriesRepository.findById(5)).thenReturn(Optional.of(category));
        when(servicesRepository.save(existingService)).thenReturn(existingService);
        when(servicesMapper.toServicesResponse(existingService)).thenReturn(mock(ServicesResponse.class));

        servicesService.update(8, request("Existing", 5, "10.00", null, "lần"));

        verify(servicesRepository).existsByServiceNameAndServiceIdNot("Existing", 8);
        verify(servicesRepository).save(existingService);
    }

    @Test
    void update_ServiceDoesNotExist_ThrowsNotFoundWithoutSaving() {
        when(servicesRepository.findById(8)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> servicesService.update(8, request("Spa", 5, "10.00", null, "lần")));

        verify(servicesRepository, never()).save(any());
        verifyNoInteractions(categoriesRepository, servicesMapper);
    }

    @Test
    void update_InvalidCategory_LeavesServiceUnchanged() {
        services existingService = existingService();
        when(servicesRepository.findById(8)).thenReturn(Optional.of(existingService));
        when(servicesRepository.existsByServiceNameAndServiceIdNot("Updated", 8)).thenReturn(false);
        when(categoriesRepository.findById(9)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> servicesService.update(8, request("Updated", 9, "10.00", 1, "lần")));

        assertEquals("Existing", existingService.getServiceName());
        verify(servicesRepository, never()).save(any());
    }

    @Test
    void getAll_MapsAllServices() {
        services service = existingService();
        ServicesResponse expected = mock(ServicesResponse.class);
        when(servicesRepository.findAll()).thenReturn(List.of(service));
        when(servicesMapper.toServicesResponse(service)).thenReturn(expected);

        List<ServicesResponse> result = servicesService.getAll();

        assertEquals(List.of(expected), result);
    }

    @Test
    void getById_RejectsInvalidIdAndReturnsExistingService() {
        assertThrows(IllegalArgumentException.class, () -> servicesService.getById(0));
        verifyNoInteractions(servicesRepository);

        services service = existingService();
        ServicesResponse expected = mock(ServicesResponse.class);
        when(servicesRepository.findById(8)).thenReturn(Optional.of(service));
        when(servicesMapper.toServicesResponse(service)).thenReturn(expected);

        assertSame(expected, servicesService.getById(8));
    }

    @Test
    void delete_RemovesExistingService() {
        services service = existingService();
        when(servicesRepository.findById(8)).thenReturn(Optional.of(service));

        servicesService.delete(8);

        verify(servicesRepository).delete(service);
    }

    @Test
    void delete_RejectsMissingOrInvalidServiceId() {
        assertThrows(IllegalArgumentException.class, () -> servicesService.delete(-1));
        verifyNoInteractions(servicesRepository);

        when(servicesRepository.findById(8)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> servicesService.delete(8));
        verify(servicesRepository, never()).delete(any());
    }

    private void serviceMapperReturnsEntity() {
        when(servicesMapper.toEntities(any(ServicesRequest.class))).thenReturn(new services());
    }

    private void serviceNameIsAvailable(String name) {
        when(servicesRepository.existsByServiceName(name)).thenReturn(false);
    }

    private void categoryExists(Integer id) {
        when(categoriesRepository.findById(id)).thenReturn(Optional.of(category(id)));
    }

    private ServicesRequest request(String name, Integer categoryId, String price, Integer stock, String unit) {
        return new ServicesRequest(
                name,
                categoryId,
                price == null ? null : new BigDecimal(price),
                stock,
                unit);
    }

    private services existingService() {
        services service = new services();
        service.setServiceId(8);
        service.setServiceName("Existing");
        service.setUnitPrice(new BigDecimal("10.00"));
        service.setStockQuantity(4);
        service.setUnit("lần");
        service.setCategory(category(5));
        return service;
    }

    private service_categories category(Integer id) {
        service_categories category = new service_categories();
        category.setServiceCategoriesId(id);
        category.setServiceCategoriesName("Spa");
        return category;
    }
}
