package com.example.hotel.services.impl;

import com.example.hotel.Enums.BookingStatus;
import com.example.hotel.Enums.PricingMethod;
import com.example.hotel.Enums.ReceiptStatus;
import com.example.hotel.Enums.RoomStatus;
import com.example.hotel.exception.BusinessValidationException;
import com.example.hotel.exception.PriceChangedException;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.exception.RoomUnavailableException;
import com.example.hotel.models.dto.request.CancelBookingDetailRequest;
import com.example.hotel.models.dto.request.RentalDetailRequest;
import com.example.hotel.models.dto.request.RentalEstimateRequest;
import com.example.hotel.models.dto.request.RentalReceiptCreateRequest;
import com.example.hotel.models.dto.response.AvailableRoomResponse;
import com.example.hotel.models.dto.response.BookingDetailResponse;
import com.example.hotel.models.dto.response.CustomerResponse;
import com.example.hotel.models.dto.response.RentalEstimateResponse;
import com.example.hotel.models.dto.response.RentalLineEstimate;
import com.example.hotel.models.dto.response.RentalReceiptResponse;
import com.example.hotel.models.entities.booking_details;
import com.example.hotel.models.entities.customers;
import com.example.hotel.models.entities.employees;
import com.example.hotel.models.entities.rental_receipts;
import com.example.hotel.models.entities.rooms;
import com.example.hotel.repositorys.BookingDetailRepository;
import com.example.hotel.repositorys.CustomerRepository;
import com.example.hotel.repositorys.EmployeeRepository;
import com.example.hotel.repositorys.RentalReceiptRepository;
import com.example.hotel.repositorys.RoomRepository;
import com.example.hotel.security.CustomUserDetails;
import com.example.hotel.security.SecurityUtils;
import com.example.hotel.services.IRentalReceiptService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * UC-REN-001 (tạo phiếu thuê), UC-REN-009 (phòng khả dụng), UC-REN-010 (tính
 * chi phí).
 * Giá và khả năng đặt phòng luôn được tính/kiểm tra lại ở máy chủ, không tin số
 * liệu từ giao diện.
 */
@Service
@RequiredArgsConstructor
public class RentalReceiptService implements IRentalReceiptService {

    /**
     * Trạng thái chi tiết còn giữ chỗ phòng (CANCELLED/CHECKED_OUT không giữ chỗ)
     */
    private static final Set<BookingStatus> BLOCKING = EnumSet.of(BookingStatus.RESERVED, BookingStatus.CHECKED_IN);

    private static final String CANCEL_NOT_FOUND_MESSAGE = "Không tìm thấy phiếu thuê hoặc chi tiết đặt phòng.";
    private static final String RECEIPT_NOT_FOUND_MESSAGE = "Không tìm thấy phiếu thuê.";
    private static final String CANCEL_RECEIPT_INVALID_MESSAGE =
            "Phiếu thuê không hợp lệ, đã được xử lý hoặc đã có phòng nhận. Chỉ hủy được các phòng chưa nhận từng phòng một.";
    private static final String CANCEL_INVALID_MESSAGE = "Chi tiết đặt phòng không hợp lệ hoặc đã được xử lý.";

    private static final String ROOM_UNAVAILABLE_MESSAGE = "Phòng không còn khả dụng trong khoảng thời gian đã chọn. Vui lòng tra cứu lại.";

    private final RoomRepository roomRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final RentalReceiptRepository rentalReceiptRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final Clock clock;

    @PersistenceContext
    private EntityManager entityManager;

    /** Một chi tiết đã qua kiểm tra và đã được máy chủ xác định giá */
    private record PricedDetail(rooms room, RentalDetailRequest request,
            int units, BigDecimal unitPrice, BigDecimal amount) {
    }

    // ------------------------------------------------------------------ UC-REN-009

    @Override
    @Transactional(readOnly = true)
    public List<AvailableRoomResponse> findAvailableRooms(LocalDateTime checkIn, LocalDateTime checkOut) {
        if (checkIn == null || checkOut == null) {
            throw new BusinessValidationException(
                    "Vui lòng nhập thời gian nhận phòng và trả phòng dự kiến.", Map.of());
        }
        if (!checkIn.isBefore(checkOut)) {
            throw new BusinessValidationException(
                    "Thời gian nhận phòng phải trước thời gian trả phòng.", Map.of());
        }
        return roomRepository.findAvailable(RoomStatus.AVAILABLE, BLOCKING, checkIn, checkOut)
                .stream()
                .map(r -> new AvailableRoomResponse(
                        r.getRoomId(),
                        r.getRoomCode(),
                        r.getRoomTypes().getRoomTypeId(),
                        r.getRoomTypes().getRoomTypeName(),
                        r.getRoomTypes().getDailyRate(),
                        r.getRoomTypes().getHourlyRate(),
                        r.getRoomTypes().getMaximumOccupancy(),
                        r.getRoomTypes().getNumberOfBeds(),
                        r.getNote()))
                .toList();
    }

    // ------------------------------------------------------------------ UC-REN-010

    @Override
    @Transactional(readOnly = true)
    public RentalEstimateResponse estimate(RentalEstimateRequest request) {
        Map<Integer, rooms> roomMap = loadRooms(request.getDetails(), false);
        return toEstimate(validateAndPrice(request.getDetails(), roomMap));
    }

    // ------------------------------------------------------------------ UC-REN-001

    @Override
    @Transactional
    public RentalReceiptResponse create(RentalReceiptCreateRequest request) {
        // BR-REN-001-03 / A10: nhân viên lập phiếu lấy từ tài khoản đăng nhập
        employees employee = resolveCurrentEmployee();

        // BR-REN-001-02: khách hàng đại diện phải tồn tại
        customers customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Khách hàng không còn hợp lệ. Vui lòng tìm kiếm và chọn khách hàng khác."));

        // Khóa các phòng liên quan để các giao dịch đặt cùng phòng được xử lý lần lượt
        Map<Integer, rooms> roomMap = loadRooms(request.getDetails(), true);

        // Kiểm tra lại dữ liệu phòng, sức chứa, thời gian và tự tính giá
        // (BR-REN-001-14)
        List<PricedDetail> priced = validateAndPrice(request.getDetails(), roomMap);

        // BR-REN-001-07/08: kiểm tra lịch chồng lấn tại thời điểm xác nhận (A9)
        List<rooms> unavailable = priced.stream()
                .filter(p -> bookingDetailRepository.existsOverlap(
                        p.room().getRoomId(), BLOCKING,
                        p.request().getCheckIn(), p.request().getCheckOut()))
                .map(PricedDetail::room)
                .toList();
        if (!unavailable.isEmpty()) {
            String codes = unavailable.stream().map(rooms::getRoomCode).collect(Collectors.joining(", "));
            throw new RoomUnavailableException(
                    "Phòng " + codes + " không còn khả dụng trong khoảng thời gian đã chọn. "
                            + "Vui lòng tra cứu lại.",
                    unavailable.stream().map(rooms::getRoomId).toList());
        }

        // UC-REN-010 A2/E6: giá đã thay đổi so với số tiền người dùng xác nhận
        RentalEstimateResponse estimate = toEstimate(priced);
        BigDecimal expected = request.getExpectedTotalAmount();
        if (expected != null && expected.compareTo(estimate.getTotalAmount()) != 0) {
            throw new PriceChangedException(
                    "Chi phí đã thay đổi. Vui lòng kiểm tra và xác nhận lại chi phí mới.", estimate);
        }

        // BR-REN-001-11: phiếu DA_XAC_NHAN, chi tiết RESERVED
        rental_receipts receipt = new rental_receipts();
        receipt.setCustomer(customer);
        receipt.setEmployee(employee);
        receipt.setRentalDate(LocalDateTime.now());
        for (PricedDetail p : priced) {
            booking_details detail = new booking_details();
            detail.setRoom(p.room());
            detail.setNumberOfGuests(p.request().getNumberOfGuests());
            detail.setCheckInAt(p.request().getCheckIn());
            detail.setCheckOutAt(p.request().getCheckOut());
            detail.setPricingMethod(p.request().getPricingMethod());
            detail.setUnitPrice(p.unitPrice());
            detail.setEstimatedUnits(p.units());
            detail.setEstimatedAmount(p.amount());
            receipt.addBookingDetail(detail);
        }

        // BR-REN-001-13: lưu nguyên tử phiếu + chi tiết; DB là chốt chặn cuối (A9, A11)
        try {
            rentalReceiptRepository.saveAndFlush(receipt);
        } catch (DataIntegrityViolationException e) {
            throw translate(e);
        }
        // Đọc lại mã phiếu và tổng chi phí do DB sinh/tổng hợp
        entityManager.refresh(receipt);
        return toResponse(receipt);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RentalReceiptResponse> getAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.Direction.DESC, "rentalReceiptId");
        return rentalReceiptRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public RentalReceiptResponse getById(Integer rentalReceiptId) {
        return rentalReceiptRepository.findById(rentalReceiptId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy phiếu thuê với ID: " + rentalReceiptId));
    }

    // ------------------------------------------------------------------ UC-REN-002: hủy chi tiết đặt phòng

    @Override
    @Transactional
    public RentalReceiptResponse cancelDetail(Integer rentalReceiptId, Integer bookingDetailId,
            CancelBookingDetailRequest request) {
        // E3: chi tiết phải tồn tại và thuộc đúng phiếu thuê
        Integer actualReceiptId = bookingDetailRepository.findReceiptIdById(bookingDetailId)
                .orElseThrow(() -> new ResourceNotFoundException(CANCEL_NOT_FOUND_MESSAGE));
        if (!actualReceiptId.equals(rentalReceiptId)) {
            throw new ResourceNotFoundException(CANCEL_NOT_FOUND_MESSAGE);
        }
        Integer roomId = bookingDetailRepository.findRoomIdById(bookingDetailId)
                .orElseThrow(() -> new ResourceNotFoundException(CANCEL_NOT_FOUND_MESSAGE));

        // BR-REN-002-08: khóa phòng rồi phiếu thuê (cùng thứ tự với nhận phòng, trả phòng) trước khi kiểm tra lại trạng thái
        roomRepository.findAllByIdForUpdate(List.of(roomId));
        rental_receipts receipt = rentalReceiptRepository.findByIdForUpdate(rentalReceiptId)
                .orElseThrow(() -> new ResourceNotFoundException(CANCEL_NOT_FOUND_MESSAGE));
        booking_details detail = receipt.getBookingDetails().stream()
                .filter(d -> d.getBookingDetailId().equals(bookingDetailId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(CANCEL_NOT_FOUND_MESSAGE));

        // BR-REN-002-01 / E1: chỉ hủy được chi tiết đang ở trạng thái "Đã đặt"
        if (detail.getBookingStatus() != BookingStatus.RESERVED) {
            throw new BusinessValidationException(CANCEL_INVALID_MESSAGE, Map.of());
        }

        // BR-REN-002-02, 03: lý do bắt buộc; thời điểm và nhân viên hủy do hệ thống xác định
        String reason = request.getReason().trim();
        employees employee = resolveCurrentEmployee();
        LocalDateTime now = LocalDateTime.now(clock).truncatedTo(ChronoUnit.MICROS);
        detail.setBookingStatus(BookingStatus.CANCELLED);
        detail.setCancelledAt(now);
        detail.setCancelledBy(employee);
        detail.setCancelReason(reason);

        try {
            bookingDetailRepository.saveAndFlush(detail);
            // BR-REN-002-05: tổng chi phí dự kiến do DB tính lại khi chi tiết đổi trạng thái; đọc lại và xác định trạng thái phiếu
            entityManager.refresh(receipt);
            applyReceiptStatusAfterCancel(receipt, now, employee, reason);
            rentalReceiptRepository.saveAndFlush(receipt);
        } catch (DataIntegrityViolationException e) {
            throw translate(e);
        }
        return toResponse(receipt);
    }

    // ------------------------------------------------------------------ UC-REN-003: hủy toàn bộ phiếu thuê

    @Override
    @Transactional
    public RentalReceiptResponse cancelReceipt(Integer rentalReceiptId, CancelBookingDetailRequest request) {
        // Khóa mọi phòng của phiếu (theo thứ tự mã phòng) rồi khóa phiếu, cùng thứ tự với các thao tác ghi khác
        List<Integer> roomIds = bookingDetailRepository.findRoomIdsByReceiptId(rentalReceiptId);
        if (roomIds.isEmpty()) {
            throw new ResourceNotFoundException(RECEIPT_NOT_FOUND_MESSAGE);
        }
        roomRepository.findAllByIdForUpdate(roomIds);
        rental_receipts receipt = rentalReceiptRepository.findByIdForUpdate(rentalReceiptId)
                .orElseThrow(() -> new ResourceNotFoundException(RECEIPT_NOT_FOUND_MESSAGE));

        // Phiếu đã hủy, hoặc đã có phòng nhận/trả thì không hủy toàn bộ được (hủy từng phòng chưa nhận ở UC-REN-002)
        boolean started = receipt.getBookingDetails().stream().anyMatch(d ->
                d.getBookingStatus() == BookingStatus.CHECKED_IN || d.getBookingStatus() == BookingStatus.CHECKED_OUT);
        if (receipt.getReceiptStatus() != ReceiptStatus.DA_XAC_NHAN || started) {
            throw new BusinessValidationException(CANCEL_RECEIPT_INVALID_MESSAGE, Map.of());
        }

        String reason = request.getReason().trim();
        employees employee = resolveCurrentEmployee();
        LocalDateTime now = LocalDateTime.now(clock).truncatedTo(ChronoUnit.MICROS);

        // Mọi chi tiết còn "Đã đặt" bị hủy cùng lúc; chi tiết đã hủy trước đó giữ nguyên lịch sử hủy riêng
        for (booking_details d : receipt.getBookingDetails()) {
            if (d.getBookingStatus() == BookingStatus.RESERVED) {
                d.setBookingStatus(BookingStatus.CANCELLED);
                d.setCancelledAt(now);
                d.setCancelledBy(employee);
                d.setCancelReason(reason);
            }
        }
        try {
            bookingDetailRepository.saveAllAndFlush(receipt.getBookingDetails());
            entityManager.refresh(receipt); // tổng chi phí do DB tính lại (về 0)
            receipt.setReceiptStatus(ReceiptStatus.DA_HUY);
            receipt.setCancelledAt(now);
            receipt.setCancelledBy(employee);
            receipt.setCancelReason(reason);
            rentalReceiptRepository.saveAndFlush(receipt);
        } catch (DataIntegrityViolationException e) {
            throw translate(e);
        }
        return toResponse(receipt);
    }

    /**
     * BR-REN-002-06: còn lượt đang lưu trú thì giữ "Đang lưu trú"; còn chi tiết đã đặt thì "Đã xác nhận";
     * chỉ còn chi tiết đã kết thúc thì "Đã trả phòng"; mọi chi tiết đều đã hủy thì phiếu cũng "Đã hủy" kèm lịch sử hủy.
     */
    private void applyReceiptStatusAfterCancel(rental_receipts receipt, LocalDateTime now, employees employee, String reason) {
        Set<BookingStatus> statuses = EnumSet.noneOf(BookingStatus.class);
        receipt.getBookingDetails().forEach(d -> statuses.add(d.getBookingStatus()));
        if (statuses.contains(BookingStatus.CHECKED_IN)) {
            receipt.setReceiptStatus(ReceiptStatus.DANG_LUU_TRU);
        } else if (statuses.contains(BookingStatus.RESERVED)) {
            receipt.setReceiptStatus(ReceiptStatus.DA_XAC_NHAN);
        } else if (statuses.contains(BookingStatus.CHECKED_OUT)) {
            receipt.setReceiptStatus(ReceiptStatus.DA_TRA_PHONG);
        } else {
            receipt.setReceiptStatus(ReceiptStatus.DA_HUY);
            receipt.setCancelledAt(now);
            receipt.setCancelledBy(employee);
            receipt.setCancelReason(reason);
        }
    }

    // ------------------------------------------------------------------ nội bộ

    private employees resolveCurrentEmployee() {
        CustomUserDetails user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new AccessDeniedException(
                        "Không thể xác định nhân viên lập phiếu hợp lệ."));
        return employeeRepository.findById(user.getEmployeeId())
                .filter(e -> Boolean.TRUE.equals(e.getIsActive()))
                .orElseThrow(() -> new AccessDeniedException(
                        "Không thể xác định nhân viên lập phiếu hợp lệ."));
    }

    private Map<Integer, rooms> loadRooms(List<RentalDetailRequest> details, boolean lock) {
        Set<Integer> ids = details.stream()
                .map(RentalDetailRequest::getRoomId)
                .collect(Collectors.toCollection(HashSet::new));
        List<rooms> found = lock ? roomRepository.findAllByIdForUpdate(ids) : roomRepository.findAllById(ids);
        return found.stream().collect(Collectors.toMap(rooms::getRoomId, Function.identity()));
    }

    /**
     * Kiểm tra từng chi tiết và xác định đơn giá, số đơn vị, thành tiền.
     * Gom mọi lỗi theo khóa "details[i].field" rồi trả về một lần (A3-A8,
     * UC-REN-010 E1-E4).
     */
    private List<PricedDetail> validateAndPrice(List<RentalDetailRequest> details, Map<Integer, rooms> roomMap) {
        Map<String, String> errors = new LinkedHashMap<>();
        List<PricedDetail> result = new ArrayList<>();
        Set<Integer> seenRooms = new HashSet<>();

        for (int i = 0; i < details.size(); i++) {
            RentalDetailRequest d = details.get(i);
            String key = "details[" + i + "].";
            rooms room = roomMap.get(d.getRoomId());

            if (room == null) {
                errors.put(key + "roomId", "Phòng không tồn tại");
                continue;
            }
            String code = room.getRoomCode();
            boolean valid = true;

            // BR-REN-001-04 / A4: mỗi phòng một lần trong phiếu
            if (!seenRooms.add(d.getRoomId())) {
                errors.put(key + "roomId", "Phòng " + code + " đã có trong danh sách đặt phòng");
                continue;
            }
            // Validity Check 5 / A5
            if (room.getRoomStatus() == RoomStatus.UNDER_MAINTENANCE) {
                errors.put(key + "roomId", "Phòng " + code + " đang bảo trì");
                valid = false;
            } else if (room.getRoomStatus() == RoomStatus.CLEANING) {
                errors.put(key + "roomId", "Phòng " + code + " đang dọn dẹp");
                valid = false;
            }
            // BR-REN-001-06 / A6
            if (!d.getCheckIn().isBefore(d.getCheckOut())) {
                errors.put(key + "checkOut", "Thời gian nhận phòng phải trước thời gian trả phòng");
                valid = false;
            }
            // BR-REN-001-05 / A7
            Integer max = room.getRoomTypes().getMaximumOccupancy();
            if (d.getNumberOfGuests() > max) {
                errors.put(key + "numberOfGuests",
                        "Phòng " + code + " chỉ cho phép tối đa " + max + " khách");
                valid = false;
            }
            // A8: đơn giá lấy từ loại phòng theo phương thức tính giá (BR-REN-010-11)
            BigDecimal unitPrice = d.getPricingMethod() == PricingMethod.NGAY
                    ? room.getRoomTypes().getDailyRate()
                    : room.getRoomTypes().getHourlyRate();
            if (unitPrice == null || unitPrice.signum() <= 0) {
                errors.put(key + "pricingMethod",
                        "Không xác định được đơn giá hợp lệ cho phòng " + code);
                valid = false;
            }

            if (valid) {
                int units = RentalPricing.billedUnits(d.getPricingMethod(), d.getCheckIn(), d.getCheckOut());
                result.add(new PricedDetail(room, d, units, unitPrice, RentalPricing.amount(unitPrice, units)));
            }
        }

        if (!errors.isEmpty()) {
            throw new BusinessValidationException("Thông tin phiếu thuê không hợp lệ", errors);
        }
        return result;
    }

    private RentalEstimateResponse toEstimate(List<PricedDetail> priced) {
        List<RentalLineEstimate> lines = priced.stream()
                .map(p -> new RentalLineEstimate(
                        p.room().getRoomId(),
                        p.room().getRoomCode(),
                        p.room().getRoomTypes().getRoomTypeName(),
                        p.request().getCheckIn(),
                        p.request().getCheckOut(),
                        p.request().getPricingMethod(),
                        p.unitPrice(),
                        p.units(),
                        p.amount()))
                .toList();
        BigDecimal total = priced.stream().map(PricedDetail::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new RentalEstimateResponse(lines, total);
    }

    private RuntimeException translate(DataIntegrityViolationException e) {
        for (Throwable t = e; t != null; t = t.getCause()) {
            if (t instanceof SQLException sql && sql.getSQLState() != null) {
                switch (sql.getSQLState()) {
                    case "23P01": // exclusion: chồng lấn lịch phòng (giao dịch khác vừa đặt)
                        return new RoomUnavailableException(ROOM_UNAVAILABLE_MESSAGE, List.of());
                    case "23514": // CHECK hoặc trigger nghiệp vụ trong V2
                        return new BusinessValidationException(readableDbMessage(sql), Map.of());
                    default:
                        break;
                }
            }
        }
        return e;
    }

    /**
     * Lấy thông điệp tiếng Việt do trigger đặt; lỗi CHECK kỹ thuật thì dùng thông
     * điệp chung.
     */
    private String readableDbMessage(SQLException sql) {
        String first = sql.getMessage() == null ? "" : sql.getMessage().split("\n", 2)[0];
        if (first.startsWith("ERROR: ")) {
            first = first.substring("ERROR: ".length());
        }
        if (first.isBlank() || first.startsWith("new row for relation")) {
            return "Dữ liệu phiếu thuê không hợp lệ";
        }
        return first;
    }

    private RentalReceiptResponse toResponse(rental_receipts r) {
        customers c = r.getCustomer();
        List<BookingDetailResponse> details = r.getBookingDetails().stream()
                .map(d -> new BookingDetailResponse(
                        d.getBookingDetailId(),
                        d.getRoom().getRoomId(),
                        d.getRoom().getRoomCode(),
                        d.getRoom().getRoomTypes().getRoomTypeName(),
                        d.getNumberOfGuests(),
                        d.getCheckInAt(),
                        d.getCheckOutAt(),
                        d.getPricingMethod(),
                        d.getUnitPrice(),
                        d.getEstimatedUnits(),
                        d.getEstimatedAmount(),
                        d.getBookingStatus(),
                        d.getCancelledAt(),
                        d.getCancelledBy() == null ? null : d.getCancelledBy().getFullName(),
                        d.getCancelReason()))
                .toList();
        return new RentalReceiptResponse(
                r.getRentalReceiptId(),
                r.getReceiptCode(),
                r.getRentalDate(),
                r.getReceiptStatus(),
                new CustomerResponse(c.getCustomerId(), c.getFullName(), c.getPhone(),
                        c.getCitizenId(), c.getNationality(), c.getGender()),
                r.getEmployee().getEmployeeId(),
                r.getEmployee().getFullName(),
                r.getEstimatedTotalAmount(),
                details,
                r.getCancelledAt(),
                r.getCancelReason());
    }
}
