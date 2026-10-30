package com.example.hotel.models.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * UC-ROM-005/006: một trang sơ đồ phòng kèm khoảng thời gian thực tế được áp dụng
 * và số phòng theo từng trạng thái hiển thị.
 */
@Getter
@AllArgsConstructor
public class RoomMapResponse {
    private Page<RoomMapItemResponse> rooms;
    /** Khoảng thời gian thực tế đã áp dụng [windowFrom, windowTo) */
    private LocalDateTime windowFrom;
    private LocalDateTime windowTo;
    /**
     * Số phòng theo trạng thái hiển thị (khóa ALL và tên từng trạng thái), tính trên các phòng
     * thỏa mọi điều kiện lọc ngoại trừ lọc theo trạng thái hiển thị.
     */
    private Map<String, Long> statusCounts;
}
