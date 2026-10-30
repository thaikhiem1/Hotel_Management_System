package com.example.hotel.services;

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

    RentalReceiptResponse getById(Integer rentalReceiptId);

    /** Danh sách phiếu thuê mới nhất trước, có phân trang. */
    Page<RentalReceiptResponse> getAll(int page, int size);
}
