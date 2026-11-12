package com.example.hotel.services.impl;

import com.example.hotel.Enums.BookingStatus;
import com.example.hotel.exception.BusinessValidationException;
import com.example.hotel.exception.ConcurrentUpdateException;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.exception.ServiceUsagePriceChangedException;
import com.example.hotel.models.dto.request.ServiceUsageLineRequest;
import com.example.hotel.models.dto.request.ServiceUsageRequest;
import com.example.hotel.models.dto.response.ServiceUsageEstimateResponse;
import com.example.hotel.models.dto.response.ServiceUsageItemResponse;
import com.example.hotel.models.dto.response.ServiceUsageLineEstimate;
import com.example.hotel.models.dto.response.ServiceUsageListResponse;
import com.example.hotel.models.entities.booking_details;
import com.example.hotel.models.entities.employees;
import com.example.hotel.models.entities.service_usages;
import com.example.hotel.models.entities.services;
import com.example.hotel.repositorys.BookingDetailRepository;
import com.example.hotel.repositorys.EmployeeRepository;
import com.example.hotel.repositorys.RoomRepository;
import com.example.hotel.repositorys.ServiceUsageRepository;
import com.example.hotel.repositorys.ServicesRepository;
import com.example.hotel.security.CustomUserDetails;
import com.example.hotel.security.SecurityUtils;
import com.example.hotel.services.IServiceUsageService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.SQLException;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * UC-SVC-005: ghi nhận dịch vụ khách sử dụng trong lượt lưu trú.
 * Đơn giá, thành tiền và tồn kho luôn được máy chủ tính/kiểm tra lại, không tin số liệu từ giao diện.
 * Khi ghi nhận, khóa phòng của lượt lưu trú (cùng thứ tự khóa với nhận phòng và trả phòng) rồi khóa các dịch vụ
 * để thao tác ghi và trả phòng, hoặc hai lần ghi trên cùng dịch vụ, được xử lý lần lượt (E6).
 */
@Service
@RequiredArgsConstructor
public class ServiceUsageService implements IServiceUsageService {

    private static final String MSG_STAY_INVALID = "Không thể ghi nhận dịch vụ cho lượt lưu trú này.";
    private static final String MSG_VALIDATION = "Thông tin dịch vụ không hợp lệ";
    private static final String MSG_PRICE_CHANGED = "Chi phí đã thay đổi. Vui lòng kiểm tra và xác nhận lại chi phí mới.";
    private static final String MSG_CONFLICT =
            "Số lượng tồn kho vừa thay đổi do thao tác khác. Vui lòng kiểm tra lại và thực hiện lại.";

    private final BookingDetailRepository bookingDetailRepository;
    private final RoomRepository roomRepository;
    private final ServicesRepository servicesRepository;
    private final ServiceUsageRepository serviceUsageRepository;
    private final EmployeeRepository employeeRepository;
    private final Clock clock;

    /** Một dịch vụ đã qua kiểm tra và được máy chủ xác định đơn giá, thành tiền */
    private record PricedLine(services service, int quantity, BigDecimal unitPrice, BigDecimal amount) {
    }

    // ------------------------------------------------------------------ xem danh sách

    @Override
    @Transactional(readOnly = true)
    public ServiceUsageListResponse getUsages(Integer bookingDetailId) {
        booking_details detail = loadDetail(bookingDetailId);
        return toList(detail, serviceUsageRepository.findDetailedByBookingDetailId(bookingDetailId));
    }

    // ------------------------------------------------------------------ bước 6-11: kiểm tra và tính chi phí

    @Override
    @Transactional(readOnly = true)
    public ServiceUsageEstimateResponse estimate(Integer bookingDetailId, ServiceUsageRequest request) {
        ensureInStay(loadDetail(bookingDetailId));
        Map<Integer, Integer> quantities = aggregate(request.getLines());
        Map<Integer, services> serviceMap = servicesRepository.findAllById(quantities.keySet()).stream()
                .collect(Collectors.toMap(services::getServiceId, Function.identity()));
        return toEstimate(validateAndPrice(quantities, serviceMap));
    }

    // ------------------------------------------------------------------ bước 12-15: xác nhận ghi nhận

    @Override
    @Transactional
    public ServiceUsageListResponse record(Integer bookingDetailId, ServiceUsageRequest request) {
        employees employee = resolveCurrentEmployee();

        // Khóa phòng rồi đọc lại trạng thái lượt lưu trú: thao tác trả phòng đồng thời phải chờ nhau
        Integer roomId = bookingDetailRepository.findRoomIdById(bookingDetailId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_STAY_INVALID));
        roomRepository.findAllByIdForUpdate(List.of(roomId));
        booking_details detail = loadDetail(bookingDetailId);
        ensureInStay(detail);

        // Khóa các dịch vụ (theo thứ tự id) rồi kiểm tra lại dịch vụ, số lượng, tồn kho và giá (E6)
        Map<Integer, Integer> quantities = aggregate(request.getLines());
        Map<Integer, services> serviceMap = servicesRepository.findAllByIdForUpdate(quantities.keySet()).stream()
                .collect(Collectors.toMap(services::getServiceId, Function.identity()));
        List<PricedLine> priced = validateAndPrice(quantities, serviceMap);
        ServiceUsageEstimateResponse estimate = toEstimate(priced);

        BigDecimal expected = request.getExpectedTotalAmount();
        if (expected != null && expected.compareTo(estimate.getTotalAmount()) != 0) {
            throw new ServiceUsagePriceChangedException(MSG_PRICE_CHANGED, estimate);
        }

        // Bước 13-14: lưu thông tin sử dụng (đơn giá áp dụng được lưu cùng bản ghi) và trừ tồn kho cùng transaction
        LocalDateTime now = LocalDateTime.now(clock);
        List<service_usages> usages = new ArrayList<>();
        for (PricedLine p : priced) {
            service_usages usage = new service_usages();
            usage.setBookingDetail(detail);
            usage.setService(p.service());
            usage.setQuantity(p.quantity());
            usage.setUnitPrice(p.unitPrice());
            usage.setAmount(p.amount());
            usage.setUsedAt(now);
            usage.setRecordedBy(employee);
            usages.add(usage);
            if (p.service().getStockQuantity() != null) {
                p.service().setStockQuantity(p.service().getStockQuantity() - p.quantity());
            }
        }
        try {
            serviceUsageRepository.saveAllAndFlush(usages);
            servicesRepository.saveAllAndFlush(priced.stream().map(PricedLine::service)
                    .filter(s -> s.getStockQuantity() != null).toList());
        } catch (DataIntegrityViolationException e) {
            throw translate(e);
        }
        return toList(detail, usages);
    }

    // ------------------------------------------------------------------ nội bộ

    private booking_details loadDetail(Integer bookingDetailId) {
        return bookingDetailRepository.findWithStayInfo(bookingDetailId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_STAY_INVALID));
    }

    /** A1: chỉ ghi nhận dịch vụ cho lượt lưu trú đang diễn ra */
    private void ensureInStay(booking_details detail) {
        if (detail.getBookingStatus() != BookingStatus.CHECKED_IN) {
            throw new BusinessValidationException(MSG_STAY_INVALID, Map.of());
        }
    }

    /** Gộp các dòng cùng dịch vụ (cộng số lượng), giữ thứ tự xuất hiện đầu tiên */
    private Map<Integer, Integer> aggregate(List<ServiceUsageLineRequest> lines) {
        Map<Integer, Integer> quantities = new LinkedHashMap<>();
        for (ServiceUsageLineRequest line : lines) {
            quantities.merge(line.getServiceId(), line.getQuantity(), Integer::sum);
        }
        return quantities;
    }

    /**
     * Kiểm tra từng dịch vụ và xác định đơn giá, thành tiền; gom mọi lỗi theo khóa "lines[i].field" rồi trả về một lần.
     * A2: dịch vụ không tồn tại hoặc đã ngừng cung cấp; E3: không xác định được đơn giá; A4: tồn kho không đủ.
     */
    private List<PricedLine> validateAndPrice(Map<Integer, Integer> quantities, Map<Integer, services> serviceMap) {
        Map<String, String> errors = new LinkedHashMap<>();
        List<PricedLine> result = new ArrayList<>();
        int index = 0;
        for (Map.Entry<Integer, Integer> entry : quantities.entrySet()) {
            String key = "lines[" + index++ + "].";
            services service = serviceMap.get(entry.getKey());
            int quantity = entry.getValue();

            if (service == null) {
                errors.put(key + "serviceId", "Dịch vụ không tồn tại hoặc không khả dụng");
                continue;
            }
            if (!Boolean.TRUE.equals(service.getIsActive())) {
                errors.put(key + "serviceId", "Dịch vụ '" + service.getServiceName() + "' đã ngừng cung cấp");
                continue;
            }
            BigDecimal unitPrice = service.getUnitPrice();
            if (unitPrice == null || unitPrice.signum() < 0) {
                errors.put(key + "serviceId",
                        "Không thể xác định chi phí của dịch vụ '" + service.getServiceName() + "'");
                continue;
            }
            Integer stock = service.getStockQuantity();
            if (stock != null && quantity > stock) {
                errors.put(key + "quantity", "Dịch vụ '" + service.getServiceName() + "' không đủ tồn kho, chỉ còn "
                        + stock + " " + service.getUnit());
                continue;
            }
            BigDecimal amount = unitPrice.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);
            result.add(new PricedLine(service, quantity, unitPrice, amount));
        }
        if (!errors.isEmpty()) {
            throw new BusinessValidationException(MSG_VALIDATION, errors);
        }
        return result;
    }

    private ServiceUsageEstimateResponse toEstimate(List<PricedLine> priced) {
        List<ServiceUsageLineEstimate> lines = priced.stream()
                .map(p -> new ServiceUsageLineEstimate(
                        p.service().getServiceId(),
                        p.service().getServiceName(),
                        p.service().getUnit(),
                        p.unitPrice(),
                        p.quantity(),
                        p.amount(),
                        p.service().getStockQuantity()))
                .toList();
        BigDecimal total = priced.stream().map(PricedLine::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new ServiceUsageEstimateResponse(lines, total);
    }

    private ServiceUsageListResponse toList(booking_details detail, List<service_usages> usages) {
        List<ServiceUsageItemResponse> items = usages.stream()
                .map(u -> new ServiceUsageItemResponse(
                        u.getServiceUsageId(),
                        u.getService().getServiceId(),
                        u.getService().getServiceName(),
                        u.getService().getUnit(),
                        u.getQuantity(),
                        u.getUnitPrice(),
                        u.getAmount(),
                        u.getUsedAt(),
                        u.getRecordedBy().getFullName()))
                .toList();
        BigDecimal total = usages.stream().map(service_usages::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new ServiceUsageListResponse(
                detail.getBookingDetailId(), detail.getRoom().getRoomCode(), items, total);
    }

    /** Nhân viên ghi nhận lấy từ tài khoản đăng nhập, không nhận từ giao diện */
    private employees resolveCurrentEmployee() {
        CustomUserDetails user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new AccessDeniedException("Không thể xác định nhân viên ghi nhận hợp lệ."));
        return employeeRepository.findById(user.getEmployeeId())
                .filter(e -> Boolean.TRUE.equals(e.getIsActive()))
                .orElseThrow(() -> new AccessDeniedException("Không thể xác định nhân viên ghi nhận hợp lệ."));
    }

    /** E4, E5: lỗi lưu thì cả giao dịch bị hoàn tác; tồn kho thành số âm là dấu hiệu thao tác khác đã trừ trước (E6) */
    private RuntimeException translate(DataIntegrityViolationException e) {
        for (Throwable t = e; t != null; t = t.getCause()) {
            if (t instanceof SQLException sql && "23514".equals(sql.getSQLState())) {
                String message = sql.getMessage() == null ? "" : sql.getMessage();
                if (message.contains("chk_service_stock")) {
                    return new ConcurrentUpdateException(MSG_CONFLICT);
                }
                String first = message.split("\n", 2)[0];
                if (first.startsWith("ERROR: ")) {
                    first = first.substring("ERROR: ".length());
                }
                return new BusinessValidationException(
                        first.isBlank() || first.startsWith("new row for relation") ? MSG_STAY_INVALID : first, Map.of());
            }
        }
        return e;
    }
}
