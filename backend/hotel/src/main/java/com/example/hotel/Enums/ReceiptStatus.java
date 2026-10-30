package com.example.hotel.Enums;

/**
 * Trạng thái phiếu thuê
 */
public enum ReceiptStatus {
    DA_XAC_NHAN,    // Đã xác nhận (mới tạo)
    DANG_LUU_TRU,   // Có ít nhất một chi tiết đang lưu trú
    DA_TRA_PHONG,   // Mọi chi tiết đã kết thúc
    DA_HUY          // Đã hủy
}
