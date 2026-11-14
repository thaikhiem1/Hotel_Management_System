package com.example.hotel.services;

import com.example.hotel.models.dto.request.CancelBookingDetailRequest;
import com.example.hotel.models.dto.request.RentalEstimateRequest;
import com.example.hotel.models.dto.request.RentalReceiptCreateRequest;
import com.example.hotel.models.dto.response.AvailableRoomResponse;
import com.example.hotel.models.dto.response.RentalEstimateResponse;
import com.example.hotel.models.dto.response.RentalReceiptResponse;

import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

public interface IRentalReceiptService {

    /** UC-REN-009: tra cứu phòng khả dụng theo khoảng thời gian nhận/trả dự kiến. */
    List<AvailableRoomResponse> findAvailableRooms(LocalDateTime checkIn, LocalDateTime checkOut);

    /** UC-REN-010: tính chi phí dự kiến từng chi tiết và toàn phiếu (không lưu dữ liệu). */
    RentalEstimateResponse estimate(RentalEstimateRequest request);

    /** UC-REN-001: tạo phiếu thuê cùng các chi tiết đặt phòng trong một transaction. */
    RentalReceiptResponse create(RentalReceiptCreateRequest request);

    /**
     * UC-REN-002: hủy một chi tiết đặt phòng chưa nhận phòng, tính lại chi phí và trạng thái phiếu thuê.
     * Mọi chi tiết đều đã hủy thì phiếu thuê cũng chuyển sang đã hủy.
     */
    RentalReceiptResponse cancelDetail(Integer rentalReceiptId, Integer bookingDetailId, CancelBookingDetailRequest request);

    /**
     * UC-REN-003: hủy toàn bộ phiếu thuê. Chỉ hủy được khi chưa có phòng nào nhận hoặc đã trả; mọi chi tiết còn "Đã đặt"
     * được hủy cùng lúc với cùng lý do, phiếu chuyển sang đã hủy.
     */
    RentalReceiptResponse cancelReceipt(Integer rentalReceiptId, CancelBookingDetailRequest request);

    RentalReceiptResponse getById(Integer rentalReceiptId);

    /** Danh sách phiếu thuê mới nhất trước, có phân trang. */
    Page<RentalReceiptResponse> getAll(int page, int size);
}
