package com.example.hotel.services;

import com.example.hotel.exception.DuplicateResourceException;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.mapper.RoomTypeMapper;
import com.example.hotel.models.dto.request.RoomTypeRequest;
import com.example.hotel.models.dto.response.RoomTypeResponse;
import com.example.hotel.models.entities.room_types;
import com.example.hotel.repositorys.RoomRepository;
import com.example.hotel.repositorys.RoomTypeRepository;
import com.example.hotel.services.impl.RoomTypesService;
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

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * Unit test cho RoomTypesService: createRoomType(), updateRoomType(), deleteRoomType().
 * Thiết kế theo Basis Path Testing; RoomTypeRepository, RoomRepository và RoomTypeMapper được mock bằng Mockito.
 *
 * Lưu ý về chuẩn hóa tên: service chỉ trim tên (giữ nguyên chữ hoa/thường) và việc kiểm tra trùng không phân biệt
 * hoa thường do repository thực hiện (existsByRoomTypeNameIgnoreCase...), nên service không tự chuyển tên sang chữ thường.
 *
 * Mỗi test ghi rõ: Input (tham số và dữ liệu giả lập của mock), Return, Message (thông báo exception) và Verify.
 */
@ExtendWith(MockitoExtension.class)
class RoomTypesServiceTest {

    @Mock RoomTypeRepository roomTypeRepository;
    @Mock RoomRepository roomRepository;
    @Mock RoomTypeMapper roomTypeMapper;

    @InjectMocks RoomTypesService roomTypesService;

    // ------------------------------------------------------------------ dữ liệu dùng chung

    private static RoomTypeRequest request(String name, String daily, String hourly) {
        RoomTypeRequest r = new RoomTypeRequest();
        r.setRoomTypeName(name);
        r.setNumberOfBeds(2);
        r.setMaximumOccupancy(4);
        r.setDailyRate(new BigDecimal(daily));
        r.setHourlyRate(new BigDecimal(hourly));
        return r;
    }

    private static RoomTypeResponse response() {
        return new RoomTypeResponse(1, "Deluxe Room", 2, 4, new BigDecimal("1000000"), new BigDecimal("150000"));
    }

    /** Loại phòng hiện có: id 1, "Standard", 1 giường, tối đa 2 người, 500000 / 80000 */
    private static room_types existing() {
        room_types t = new room_types();
        t.setRoomTypeId(1);
        t.setRoomTypeName("Standard");
        t.setNumberOfBeds(1);
        t.setMaximumOccupancy(2);
        t.setDailyRate(new BigDecimal("500000"));
        t.setHourlyRate(new BigDecimal("80000"));
        return t;
    }

    // =====================================================================================
    // createRoomType()   V(G) = 3   (D1: giá ngày < giá giờ, D2: tên đã tồn tại)
    // =====================================================================================

    /**
     * UT-RT-001 (P1: D1 = Đúng)
     * Input : request(roomTypeName = "Deluxe Room", dailyRate = 100000, hourlyRate = 200000)
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("Giá thuê theo ngày (100000) không được nhỏ hơn giá thuê theo giờ (200000)")
     * Verify: không gọi existsByRoomTypeNameIgnoreCase; không gọi save()
     */
    @Test
    @DisplayName("UT-RT-001 createRoomType: giá ngày nhỏ hơn giá giờ")
    void UT_RT_001_create_dailyRateBelowHourlyRate() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> roomTypesService.createRoomType(request("Deluxe Room", "100000", "200000")));

        assertEquals("Giá thuê theo ngày (100000) không được nhỏ hơn giá thuê theo giờ (200000)", ex.getMessage());
        verify(roomTypeRepository, never()).existsByRoomTypeNameIgnoreCase(any());
        verify(roomTypeRepository, never()).save(any());
    }

    /**
     * UT-RT-002 (P2: D1 = Sai, D2 = Đúng)
     * Input : request(roomTypeName = "Deluxe Room", dailyRate = 1000000, hourlyRate = 150000); existsByRoomTypeNameIgnoreCase("Deluxe Room") = true
     * Return: không có (ném exception)
     * Message: DuplicateResourceException("Tên loại phòng 'Deluxe Room' đã tồn tại trong hệ thống (không phân biệt hoa thường)",
     *          field = "roomTypeName", value = "Deluxe Room")
     * Verify: không gọi toEntities; không gọi save()
     */
    @Test
    @DisplayName("UT-RT-002 createRoomType: tên đã tồn tại")
    void UT_RT_002_create_duplicateName() {
        when(roomTypeRepository.existsByRoomTypeNameIgnoreCase("Deluxe Room")).thenReturn(true);

        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> roomTypesService.createRoomType(request("Deluxe Room", "1000000", "150000")));

        assertEquals("Tên loại phòng 'Deluxe Room' đã tồn tại trong hệ thống (không phân biệt hoa thường)", ex.getMessage());
        assertEquals("roomTypeName", ex.getField());
        assertEquals("Deluxe Room", ex.getValue());
        verify(roomTypeMapper, never()).toEntities(any());
        verify(roomTypeRepository, never()).save(any());
    }

    /**
     * UT-RT-003 (P3: D1 = Sai, D2 = Sai) - thành công
     * Input : request(roomTypeName = "  Deluxe Room  ", numberOfBeds = 2, maximumOccupancy = 4, dailyRate = 1000000, hourlyRate = 150000);
     *         existsByRoomTypeNameIgnoreCase("Deluxe Room") = false; toEntities(request) trả về entity
     * Return: RoomTypeResponse do mapper trả về
     * Message: không có
     * Verify: kiểm tra trùng nhận tên đã trim "Deluxe Room"; save() gọi một lần với entity mang tên đã trim (giữ nguyên chữ hoa/thường)
     */
    @Test
    @DisplayName("UT-RT-003 createRoomType: tạo thành công (tên có khoảng trắng đầu cuối)")
    void UT_RT_003_create_success() {
        RoomTypeRequest request = request("  Deluxe Room  ", "1000000", "150000");
        room_types entity = new room_types();
        RoomTypeResponse expected = response();
        when(roomTypeRepository.existsByRoomTypeNameIgnoreCase("Deluxe Room")).thenReturn(false);
        when(roomTypeMapper.toEntities(request)).thenReturn(entity);
        when(roomTypeRepository.save(entity)).thenReturn(entity);
        when(roomTypeMapper.toRoomTypeResponse(entity)).thenReturn(expected);

        RoomTypeResponse result = roomTypesService.createRoomType(request);

        assertSame(expected, result);
        ArgumentCaptor<room_types> saved = ArgumentCaptor.forClass(room_types.class);
        verify(roomTypeRepository, times(1)).save(saved.capture());
        assertEquals("Deluxe Room", saved.getValue().getRoomTypeName());
        verify(roomTypeRepository).existsByRoomTypeNameIgnoreCase("Deluxe Room");
    }

    /**
     * UT-RT-004 (biên D1: dailyRate = hourlyRate)
     * Input : request(roomTypeName = "Standard Room", dailyRate = 150000, hourlyRate = 150000); existsByRoomTypeNameIgnoreCase = false
     * Return: RoomTypeResponse do mapper trả về
     * Message: không có (không ném exception, đi tiếp theo đường P3)
     * Verify: save() gọi một lần
     */
    @Test
    @DisplayName("UT-RT-004 createRoomType: giá ngày bằng giá giờ được chấp nhận")
    void UT_RT_004_create_equalRates() {
        RoomTypeRequest request = request("Standard Room", "150000", "150000");
        room_types entity = new room_types();
        RoomTypeResponse expected = response();
        when(roomTypeRepository.existsByRoomTypeNameIgnoreCase("Standard Room")).thenReturn(false);
        when(roomTypeMapper.toEntities(request)).thenReturn(entity);
        when(roomTypeRepository.save(entity)).thenReturn(entity);
        when(roomTypeMapper.toRoomTypeResponse(entity)).thenReturn(expected);

        RoomTypeResponse result = assertDoesNotThrow(() -> roomTypesService.createRoomType(request));

        assertSame(expected, result);
        verify(roomTypeRepository, times(1)).save(entity);
    }

    // =====================================================================================
    // updateRoomType()   V(G) = 5   (D1: id, D2: tìm thấy, D3: giá ngày < giá giờ, D4: tên trùng loại phòng khác)
    // =====================================================================================

    /**
     * UT-RT-005 (P1: D1 = Đúng) - ParameterizedTest
     * Input : id = null | 0 | -1 | -100; request hợp lệ
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("ID loại phòng không hợp lệ: " + id)
     * Verify: không gọi findById; không gọi save()
     */
    @ParameterizedTest(name = "UT-RT-005 updateRoomType: id = {0}")
    @NullSource
    @ValueSource(ints = {0, -1, -100})
    void UT_RT_005_update_invalidId(Integer id) {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> roomTypesService.updateRoomType(id, request("Deluxe Room", "1000000", "150000")));

        assertEquals("ID loại phòng không hợp lệ: " + id, ex.getMessage());
        verifyNoInteractions(roomTypeRepository);
    }

    /**
     * UT-RT-006 (P2: D1 = Sai, D2 = Sai)
     * Input : id = 99; request hợp lệ; findById(99) = Optional.empty()
     * Return: không có (ném exception)
     * Message: ResourceNotFoundException("Không tìm thấy loại phòng với ID: 99")
     * Verify: không gọi save()
     */
    @Test
    @DisplayName("UT-RT-006 updateRoomType: loại phòng không tồn tại")
    void UT_RT_006_update_notFound() {
        when(roomTypeRepository.findById(99)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> roomTypesService.updateRoomType(99, request("Deluxe Room", "1000000", "150000")));

        assertEquals("Không tìm thấy loại phòng với ID: 99", ex.getMessage());
        verify(roomTypeRepository, never()).save(any());
    }

    /**
     * UT-RT-007 (P3: D2 = Đúng, D3 = Đúng)
     * Input : id = 1; request(dailyRate = 100000, hourlyRate = 200000); findById(1) = loại phòng "Standard"
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("Giá thuê theo ngày (100000) không được nhỏ hơn giá thuê theo giờ (200000)")
     * Verify: không gọi existsByRoomTypeNameIgnoreCaseAndRoomTypeIdNot; không gọi save(); loại phòng hiện có không bị thay đổi
     */
    @Test
    @DisplayName("UT-RT-007 updateRoomType: giá ngày nhỏ hơn giá giờ")
    void UT_RT_007_update_dailyRateBelowHourlyRate() {
        room_types e = existing();
        when(roomTypeRepository.findById(1)).thenReturn(Optional.of(e));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> roomTypesService.updateRoomType(1, request("Deluxe Room", "100000", "200000")));

        assertEquals("Giá thuê theo ngày (100000) không được nhỏ hơn giá thuê theo giờ (200000)", ex.getMessage());
        verify(roomTypeRepository, never()).existsByRoomTypeNameIgnoreCaseAndRoomTypeIdNot(any(), any());
        verify(roomTypeRepository, never()).save(any());
        assertEquals("Standard", e.getRoomTypeName());
    }

    /**
     * UT-RT-008 (P4: D3 = Sai, D4 = Đúng)
     * Input : id = 1; request(roomTypeName = "Deluxe Room", dailyRate = 1000000, hourlyRate = 150000);
     *         existsByRoomTypeNameIgnoreCaseAndRoomTypeIdNot("Deluxe Room", 1) = true
     * Return: không có (ném exception)
     * Message: DuplicateResourceException("Tên loại phòng 'Deluxe Room' đã được sử dụng bởi loại phòng khác (không phân biệt hoa thường)",
     *          field = "roomTypeName", value = "Deluxe Room")
     * Verify: không gọi save(); loại phòng hiện có không bị thay đổi
     */
    @Test
    @DisplayName("UT-RT-008 updateRoomType: tên trùng loại phòng khác")
    void UT_RT_008_update_duplicateName() {
        room_types e = existing();
        when(roomTypeRepository.findById(1)).thenReturn(Optional.of(e));
        when(roomTypeRepository.existsByRoomTypeNameIgnoreCaseAndRoomTypeIdNot("Deluxe Room", 1)).thenReturn(true);

        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> roomTypesService.updateRoomType(1, request("Deluxe Room", "1000000", "150000")));

        assertEquals("Tên loại phòng 'Deluxe Room' đã được sử dụng bởi loại phòng khác (không phân biệt hoa thường)", ex.getMessage());
        assertEquals("roomTypeName", ex.getField());
        assertEquals("Deluxe Room", ex.getValue());
        verify(roomTypeRepository, never()).save(any());
        assertEquals("Standard", e.getRoomTypeName());
    }

    /**
     * UT-RT-009 (P5: D4 = Sai) - thành công
     * Input : id = 1; request(roomTypeName = "  Deluxe Room  ", numberOfBeds = 2, maximumOccupancy = 4, dailyRate = 1000000, hourlyRate = 150000);
     *         existsByRoomTypeNameIgnoreCaseAndRoomTypeIdNot("Deluxe Room", 1) = false
     * Return: RoomTypeResponse do mapper trả về
     * Message: không có
     * Verify: kiểm tra trùng được gọi với tên đã trim và đúng id; 5 trường (tên, số giường, sức chứa, giá ngày, giá giờ) được cập nhật;
     *         save() gọi một lần
     */
    @Test
    @DisplayName("UT-RT-009 updateRoomType: cập nhật thành công 5 trường")
    void UT_RT_009_update_success() {
        room_types e = existing();
        RoomTypeResponse expected = response();
        when(roomTypeRepository.findById(1)).thenReturn(Optional.of(e));
        when(roomTypeRepository.existsByRoomTypeNameIgnoreCaseAndRoomTypeIdNot("Deluxe Room", 1)).thenReturn(false);
        when(roomTypeRepository.save(e)).thenReturn(e);
        when(roomTypeMapper.toRoomTypeResponse(e)).thenReturn(expected);

        RoomTypeResponse result = roomTypesService.updateRoomType(1, request("  Deluxe Room  ", "1000000", "150000"));

        assertSame(expected, result);
        verify(roomTypeRepository).existsByRoomTypeNameIgnoreCaseAndRoomTypeIdNot("Deluxe Room", 1);
        assertEquals("Deluxe Room", e.getRoomTypeName());
        assertEquals(2, e.getNumberOfBeds());
        assertEquals(4, e.getMaximumOccupancy());
        assertEquals(0, new BigDecimal("1000000").compareTo(e.getDailyRate()));
        assertEquals(0, new BigDecimal("150000").compareTo(e.getHourlyRate()));
        verify(roomTypeRepository, times(1)).save(e);
    }

    /**
     * UT-RT-010 (biên D3: dailyRate = hourlyRate)
     * Input : id = 1; request(roomTypeName = "Deluxe Room", dailyRate = 150000, hourlyRate = 150000); tên không trùng
     * Return: RoomTypeResponse do mapper trả về
     * Message: không có (không ném exception, đi tiếp theo đường P5)
     * Verify: save() gọi một lần
     */
    @Test
    @DisplayName("UT-RT-010 updateRoomType: giá ngày bằng giá giờ được chấp nhận")
    void UT_RT_010_update_equalRates() {
        room_types e = existing();
        RoomTypeResponse expected = response();
        when(roomTypeRepository.findById(1)).thenReturn(Optional.of(e));
        when(roomTypeRepository.existsByRoomTypeNameIgnoreCaseAndRoomTypeIdNot("Deluxe Room", 1)).thenReturn(false);
        when(roomTypeRepository.save(e)).thenReturn(e);
        when(roomTypeMapper.toRoomTypeResponse(e)).thenReturn(expected);

        RoomTypeResponse result = assertDoesNotThrow(
                () -> roomTypesService.updateRoomType(1, request("Deluxe Room", "150000", "150000")));

        assertSame(expected, result);
        verify(roomTypeRepository, times(1)).save(e);
    }

    // =====================================================================================
    // deleteRoomType()   V(G) = 4   (D1: id, D2: tìm thấy, D3: còn phòng sử dụng)
    // =====================================================================================

    /**
     * UT-RT-011 (P1: D1 = Đúng) - ParameterizedTest
     * Input : id = null | 0 | -1 | -100
     * Return: không có (ném exception)
     * Message: IllegalArgumentException("ID loại phòng không hợp lệ: " + id)
     * Verify: không gọi findById; không gọi delete()
     */
    @ParameterizedTest(name = "UT-RT-011 deleteRoomType: id = {0}")
    @NullSource
    @ValueSource(ints = {0, -1, -100})
    void UT_RT_011_delete_invalidId(Integer id) {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> roomTypesService.deleteRoomType(id));

        assertEquals("ID loại phòng không hợp lệ: " + id, ex.getMessage());
        verifyNoInteractions(roomTypeRepository);
        verifyNoInteractions(roomRepository);
    }

    /**
     * UT-RT-012 (P2: D1 = Sai, D2 = Sai)
     * Input : id = 99; findById(99) = Optional.empty()
     * Return: không có (ném exception)
     * Message: ResourceNotFoundException("Không tìm thấy loại phòng với ID: 99")
     * Verify: không gọi existsByRoomTypesRoomTypeId; không gọi delete()
     */
    @Test
    @DisplayName("UT-RT-012 deleteRoomType: loại phòng không tồn tại")
    void UT_RT_012_delete_notFound() {
        when(roomTypeRepository.findById(99)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> roomTypesService.deleteRoomType(99));

        assertEquals("Không tìm thấy loại phòng với ID: 99", ex.getMessage());
        verify(roomRepository, never()).existsByRoomTypesRoomTypeId(any());
        verify(roomTypeRepository, never()).delete(any());
    }

    /**
     * UT-RT-013 (P3: D2 = Đúng, D3 = Đúng)
     * Input : id = 1; findById(1) = loại phòng "Standard"; existsByRoomTypesRoomTypeId(1) = true
     * Return: không có (ném exception)
     * Message: IllegalStateException("Không thể xóa loại phòng 'Standard' vì đang có phòng sử dụng loại phòng này")
     * Verify: không gọi delete()
     */
    @Test
    @DisplayName("UT-RT-013 deleteRoomType: còn phòng đang sử dụng loại phòng")
    void UT_RT_013_delete_inUse() {
        when(roomTypeRepository.findById(1)).thenReturn(Optional.of(existing()));
        when(roomRepository.existsByRoomTypesRoomTypeId(1)).thenReturn(true);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> roomTypesService.deleteRoomType(1));

        assertEquals("Không thể xóa loại phòng 'Standard' vì đang có phòng sử dụng loại phòng này", ex.getMessage());
        verify(roomTypeRepository, never()).delete(any());
    }

    /**
     * UT-RT-014 (P4: D3 = Sai) - xóa thành công
     * Input : id = 1; findById(1) = loại phòng "Standard"; existsByRoomTypesRoomTypeId(1) = false
     * Return: không có (phương thức void)
     * Message: không có (không ném exception)
     * Verify: delete(roomType) gọi một lần
     */
    @Test
    @DisplayName("UT-RT-014 deleteRoomType: xóa thành công")
    void UT_RT_014_delete_success() {
        room_types e = existing();
        when(roomTypeRepository.findById(1)).thenReturn(Optional.of(e));
        when(roomRepository.existsByRoomTypesRoomTypeId(1)).thenReturn(false);

        assertDoesNotThrow(() -> roomTypesService.deleteRoomType(1));

        verify(roomTypeRepository, times(1)).delete(e);
    }
}
