package com.example.hotel.services.impl;

import com.example.hotel.Enums.InvoiceStatus;
import com.example.hotel.exception.ConcurrentUpdateException;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.models.dto.request.PayInvoiceRequest;
import com.example.hotel.models.dto.response.InvoiceDetailResponse;
import com.example.hotel.models.dto.response.InvoiceStatsResponse;
import com.example.hotel.models.dto.response.InvoiceSummaryResponse;
import com.example.hotel.models.dto.response.ServiceUsageItemResponse;
import com.example.hotel.models.entities.booking_details;
import com.example.hotel.models.entities.customers;
import com.example.hotel.models.entities.employees;
import com.example.hotel.models.entities.invoices;
import com.example.hotel.repositorys.EmployeeRepository;
import com.example.hotel.repositorys.InvoiceRepository;
import com.example.hotel.repositorys.ServiceUsageRepository;
import com.example.hotel.security.CustomUserDetails;
import com.example.hotel.security.SecurityUtils;
import com.example.hotel.services.IInvoiceService;
import com.example.hotel.specification.InvoiceSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Hóa đơn trả phòng. Thanh toán khóa dòng hóa đơn trước khi kiểm tra trạng thái nên hai lần thanh toán đồng thời
 * được xử lý lần lượt (lần sau nhận 409); thời điểm thanh toán và nhân viên thu tiền do máy chủ xác định.
 */
@Service
@RequiredArgsConstructor
public class InvoiceService implements IInvoiceService {

    private static final String MSG_NOT_FOUND = "Không tìm thấy hóa đơn.";
    private static final String MSG_ALREADY_PAID = "Hóa đơn đã được thanh toán trước đó.";
    private static final int MAX_PAGE_SIZE = 100;

    private final InvoiceRepository invoiceRepository;
    private final ServiceUsageRepository serviceUsageRepository;
    private final EmployeeRepository employeeRepository;
    private final Clock clock;

    @Override
    @Transactional(readOnly = true)
    public Page<InvoiceSummaryResponse> getInvoices(int page, int size, InvoiceStatus status, String keyword,
            LocalDate fromDate, LocalDate toDate) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
                Sort.by(Sort.Direction.DESC, "issuedAt").and(Sort.by(Sort.Direction.DESC, "invoiceId")));
        Specification<invoices> specification = Specification.where(InvoiceSpecification.hasStatus(status))
                .and(InvoiceSpecification.search(keyword))
                .and(InvoiceSpecification.issuedFrom(fromDate == null ? null : fromDate.atStartOfDay()))
                .and(InvoiceSpecification.issuedBefore(toDate == null ? null : toDate.plusDays(1).atStartOfDay()));
        return invoiceRepository.findAll(specification, pageable).map(this::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceStatsResponse getStats() {
        long paid = invoiceRepository.countByInvoiceStatus(InvoiceStatus.PAID);
        long unpaid = invoiceRepository.countByInvoiceStatus(InvoiceStatus.UNPAID);
        LocalDateTime startOfToday = LocalDate.now(clock).atStartOfDay();
        LocalDateTime startOfTomorrow = startOfToday.plusDays(1);
        return new InvoiceStatsResponse(
                paid + unpaid,
                paid,
                unpaid,
                invoiceRepository.sumTotalByStatus(InvoiceStatus.PAID),
                invoiceRepository.sumTotalByStatus(InvoiceStatus.UNPAID),
                invoiceRepository.sumPaidBetween(startOfToday, startOfTomorrow),
                invoiceRepository.countPaidBetween(startOfToday, startOfTomorrow));
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceDetailResponse getInvoice(Integer invoiceId) {
        return toDetail(loadDetailed(invoiceId));
    }

    @Override
    @Transactional
    public InvoiceDetailResponse pay(Integer invoiceId, PayInvoiceRequest request) {
        invoices invoice = invoiceRepository.findByIdForUpdate(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_NOT_FOUND));
        if (invoice.getInvoiceStatus() == InvoiceStatus.PAID) {
            throw new ConcurrentUpdateException(MSG_ALREADY_PAID);
        }

        invoice.setInvoiceStatus(InvoiceStatus.PAID);
        invoice.setPaymentMethod(request.getPaymentMethod());
        invoice.setPaidBy(resolveCurrentEmployee());
        invoice.setPaidAt(LocalDateTime.now(clock).truncatedTo(ChronoUnit.MICROS));
        invoiceRepository.saveAndFlush(invoice);

        return toDetail(loadDetailed(invoiceId));
    }

    // ------------------------------------------------------------------ nội bộ

    private invoices loadDetailed(Integer invoiceId) {
        return invoiceRepository.findDetailedById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_NOT_FOUND));
    }

    /** Nhân viên thu tiền lấy từ tài khoản đăng nhập, không nhận từ giao diện */
    private employees resolveCurrentEmployee() {
        CustomUserDetails user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new AccessDeniedException("Không thể xác định nhân viên thu tiền hợp lệ."));
        return employeeRepository.findById(user.getEmployeeId())
                .filter(e -> Boolean.TRUE.equals(e.getIsActive()))
                .orElseThrow(() -> new AccessDeniedException("Không thể xác định nhân viên thu tiền hợp lệ."));
    }

    private InvoiceSummaryResponse toSummary(invoices i) {
        customers customer = i.getRentalReceipt().getCustomer();
        return new InvoiceSummaryResponse(
                i.getInvoiceId(),
                i.getInvoiceCode(),
                i.getInvoiceStatus(),
                i.getTotalAmount(),
                i.getIssuedAt(),
                i.getPaidAt(),
                i.getRentalReceipt().getReceiptCode(),
                customer.getFullName(),
                customer.getPhone(),
                i.getBookingDetail().getRoom().getRoomCode(),
                i.getEmployee().getFullName());
    }

    private InvoiceDetailResponse toDetail(invoices i) {
        customers customer = i.getRentalReceipt().getCustomer();
        booking_details detail = i.getBookingDetail();
        List<ServiceUsageItemResponse> services = serviceUsageRepository
                .findDetailedByBookingDetailId(detail.getBookingDetailId()).stream()
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
        return new InvoiceDetailResponse(
                i.getInvoiceId(),
                i.getInvoiceCode(),
                i.getInvoiceStatus(),
                i.getIssuedAt(),
                i.getPaidAt(),
                i.getPaymentMethod(),
                i.getEmployee().getFullName(),
                i.getPaidBy() == null ? null : i.getPaidBy().getFullName(),
                i.getRentalReceipt().getRentalReceiptId(),
                i.getRentalReceipt().getReceiptCode(),
                customer.getFullName(),
                customer.getPhone(),
                customer.getCitizenId(),
                customer.getNationality(),
                detail.getBookingDetailId(),
                detail.getRoom().getRoomCode(),
                detail.getRoom().getRoomTypes().getRoomTypeName(),
                detail.getActualNumberOfGuests(),
                detail.getActualCheckInAt(),
                detail.getActualCheckOutAt(),
                i.getPricingMethod(),
                i.getUnitPrice(),
                i.getBilledUnits(),
                i.getRoomAmount(),
                services,
                i.getServiceAmount(),
                i.getTotalAmount());
    }
}
