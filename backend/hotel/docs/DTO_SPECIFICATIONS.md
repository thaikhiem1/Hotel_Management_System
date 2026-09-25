# DTO Specifications - Request & Response Objects

> Tài liệu này định nghĩa chi tiết các DTO (Data Transfer Objects) cho Request và Response

---

## 📦 Naming Conventions

### Request DTOs
- Create: `{Entity}CreateRequest`
- Update: `{Entity}UpdateRequest`
- Filter: `{Entity}FilterRequest`
- Search: `{Entity}SearchRequest`

### Response DTOs
- Simple: `{Entity}Response`
- Detailed: `{Entity}DetailResponse`
- List: `{Entity}ListResponse`
- Summary: `{Entity}SummaryResponse`

---

## 1. Room Types DTOs

### RoomTypeRequest (Create/Update)
```java
public class RoomTypeRequest {
    @NotBlank(message = "Tên loại phòng không được để trống")
    private String roomTypeName;
    
    @NotNull
    @Min(value = 1, message = "Số giường phải lớn hơn 0")
    private Integer numberOfBeds;
    
    @NotNull
    @Min(value = 1, message = "Số người tối đa phải lớn hơn 0")
    private Integer maximumOccupancy;
    
    @NotNull
    @DecimalMin(value = "0.0", message = "Giá ngày phải >= 0")
    private BigDecimal dailyRate;
    
    @DecimalMin(value = "0.0", message = "Giá giờ phải >= 0")
    private BigDecimal hourlyRate;
}
```

### RoomTypeResponse
```java
public class RoomTypeResponse {
    private Integer roomTypeId;
    private String roomTypeName;
    private Integer numberOfBeds;
    private Integer maximumOccupancy;
    private BigDecimal dailyRate;
    private BigDecimal hourlyRate;
}
```

### RoomTypeDetailResponse
```java
public class RoomTypeDetailResponse {
    private Integer roomTypeId;
    private String roomTypeName;
    private Integer numberOfBeds;
    private Integer maximumOccupancy;
    private BigDecimal dailyRate;
    private BigDecimal hourlyRate;
    private Integer roomCount; // Số phòng thuộc loại này
}
```

---

## 2. Rooms DTOs

### RoomCreateRequest
```java
public class RoomCreateRequest {
    @NotBlank(message = "Mã phòng không được để trống")
    private String roomCode;
    
    @NotNull(message = "Loại phòng không được để trống")
    private Integer roomTypeId;
    
    @NotNull
    @Pattern(regexp = "AVAILABLE|UNDER_MAINTENANCE")
    private String roomStatus;
    
    private String note;
}
```

### RoomUpdateRequest
```java
public class RoomUpdateRequest {
    @NotBlank
    private String roomCode;
    
    @NotNull
    private Integer roomTypeId;
    
    @NotNull
    @Pattern(regexp = "AVAILABLE|UNDER_MAINTENANCE")
    private String roomStatus;
    
    private String note;
}
```

### RoomStatusUpdateRequest
```java
public class RoomStatusUpdateRequest {
    @NotNull
    @Pattern(regexp = "AVAILABLE|UNDER_MAINTENANCE")
    private String roomStatus;
}
```

### RoomResponse
```java
public class RoomResponse {
    private Integer roomId;
    private String roomCode;
    private String roomStatus;
    private Integer roomTypeId;
    private String roomTypeName;
    private BigDecimal dailyRate;
    private BigDecimal hourlyRate;
    private String note;
}
```

### RoomDetailResponse
```java
public class RoomDetailResponse {
    private Integer roomId;
    private String roomCode;
    private String roomStatus;
    private RoomTypeResponse roomType;
    private String note;
    private BookingDetailResponse currentBooking; // null nếu phòng trống
}
```

### RoomDashboardStatsResponse
```java
public class RoomDashboardStatsResponse {
    private Integer totalRooms;
    private Integer availableRooms;
    private Integer checkedInRooms;
    private Integer cleaningRooms;
    private Integer maintenanceRooms;
    private List<RoomTypeStatsDTO> roomsByType;
}

class RoomTypeStatsDTO {
    private String roomTypeName;
    private Integer total;
    private Integer available;
}
```

---

## 3. Customers DTOs

### CustomerCreateRequest
```java
public class CustomerCreateRequest {
    @NotBlank(message = "Tên khách hàng không được để trống")
    private String fullName;
    
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Số điện thoại không hợp lệ")
    private String phone;
    
    private String citizenIdPassport;
    private String nationality;
    
    @Pattern(regexp = "male|female|other")
    private String gender;
}
```

### CustomerUpdateRequest
```java
public class CustomerUpdateRequest {
    @NotBlank
    private String fullName;
    
    @Pattern(regexp = "^[0-9]{10,11}$")
    private String phone;
    
    private String citizenIdPassport;
    private String nationality;
    
    @Pattern(regexp = "male|female|other")
    private String gender;
}
```

### CustomerResponse
```java
public class CustomerResponse {
    private Integer customerId;
    private String fullName;
    private String phone;
    private String citizenIdPassport;
    private String nationality;
    private String gender;
}
```

### CustomerDetailResponse
```java
public class CustomerDetailResponse {
    private Integer customerId;
    private String fullName;
    private String phone;
    private String citizenIdPassport;
    private String nationality;
    private String gender;
    private List<RentalHistoryDTO> rentalHistory;
    private Integer totalBookings;
    private BigDecimal totalSpent;
}

class RentalHistoryDTO {
    private Integer rentalReceiptId;
    private LocalDate rentalDate;
    private BigDecimal totalAmount;
    private String status;
}
```

### CustomerSearchResponse
```java
public class CustomerSearchResponse {
    private Integer customerId;
    private String fullName;
    private String phone;
    private String citizenIdPassport;
}
```

---

## 4. Employees DTOs

### EmployeeCreateRequest
```java
public class EmployeeCreateRequest {
    @NotBlank
    private String fullName;
    
    private String position;
    
    @DecimalMin(value = "0.0")
    private BigDecimal salary;
    
    @Pattern(regexp = "^[0-9]{10,11}$")
    private String phone;
    
    private String citizenId;
    
    @Past
    private LocalDate dateOfBirth;
    
    @Pattern(regexp = "male|female|other")
    private String gender;
    
    private String address;
    
    @Email
    private String email;
    
    private String avatar;
}
```

### EmployeeUpdateRequest
```java
// Same as EmployeeCreateRequest
```

### EmployeeStatusUpdateRequest
```java
public class EmployeeStatusUpdateRequest {
    @NotNull
    private Boolean isActive;
}
```

### EmployeeResponse
```java
public class EmployeeResponse {
    private Integer employeeId;
    private String fullName;
    private String position;
    private BigDecimal salary;
    private String phone;
    private String citizenId;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String email;
    private String avatar;
    private Boolean isActive;
    private Boolean hasAccount;
}
```

### EmployeeDetailResponse
```java
public class EmployeeDetailResponse {
    private Integer employeeId;
    private String fullName;
    private String position;
    private BigDecimal salary;
    private String phone;
    private String citizenId;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String email;
    private String avatar;
    private Boolean isActive;
    private AccountResponse account; // null nếu chưa có
    private WorkStatisticsDTO workStatistics;
}

class WorkStatisticsDTO {
    private Integer totalRentalReceipts;
    private Integer totalInvoices;
}
```

### SalaryByPositionResponse
```java
public class SalaryByPositionResponse {
    private String position;
    private BigDecimal totalSalary;
    private Integer employeeCount;
    private BigDecimal avgSalary;
}
```

---

## 5. Accounts DTOs

### AccountCreateRequest
```java
public class AccountCreateRequest {
    @NotBlank
    @Size(min = 4, max = 50)
    private String username;
    
    @NotBlank
    @Size(min = 6)
    private String password;
    
    @NotNull
    @Min(0)
    @Max(2)
    private Integer role; // 0: Admin, 1: Receptionist, 2: Manager
    
    @NotNull
    private Integer employeeId;
}
```

### PasswordChangeRequest
```java
public class PasswordChangeRequest {
    @NotBlank
    private String oldPassword;
    
    @NotBlank
    @Size(min = 6)
    private String newPassword;
}
```

### AccountStatusUpdateRequest
```java
public class AccountStatusUpdateRequest {
    @NotNull
    private Boolean isActive;
}
```

### AccountResponse
```java
public class AccountResponse {
    private String username;
    private Integer role;
    private String roleName; // "Admin", "Receptionist", "Manager"
    private Boolean isActive;
    private EmployeeSummaryDTO employee;
}

class EmployeeSummaryDTO {
    private Integer employeeId;
    private String fullName;
}
```

---

## 6. Services DTOs

### ServiceCategoryRequest
```java
public class ServiceCategoryRequest {
    @NotBlank
    private String categoryName;
}
```

### ServiceCategoryResponse
```java
public class ServiceCategoryResponse {
    private Integer serviceCategoryId;
    private String categoryName;
    private Integer serviceCount;
}
```

### ServiceCreateRequest
```java
public class ServiceCreateRequest {
    @NotBlank
    private String serviceName;
    
    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal unitPrice;
    
    @Min(value = 0)
    private Integer stockQuantity; // null nếu không quản lý tồn kho
    
    @NotBlank
    private String unit;
    
    @NotNull
    private Integer serviceCategoryId;
}
```

### ServiceUpdateRequest
```java
// Same as ServiceCreateRequest
```

### ServiceResponse
```java
public class ServiceResponse {
    private Integer serviceId;
    private String serviceName;
    private BigDecimal unitPrice;
    private Integer stockQuantity;
    private String unit;
    private Integer serviceCategoryId;
    private String categoryName;
}
```

---

## 7. Rental Receipts DTOs

### RentalReceiptCreateRequest
```java
public class RentalReceiptCreateRequest {
    @NotNull
    private Integer customerId;
    
    @NotNull
    private Integer employeeId;
    
    @NotEmpty
    @Valid
    private List<BookingDetailCreateDTO> bookingDetails;
}

class BookingDetailCreateDTO {
    @NotNull
    private Integer roomId;
    
    @NotNull
    @Min(1)
    private Integer numberOfGuests;
    
    @NotNull
    @FutureOrPresent
    private LocalDate checkInDate;
    
    @NotNull
    @Future
    private LocalDate checkOutDate;
    
    @NotNull
    @Pattern(regexp = "RESERVED|CHECKED_IN")
    private String bookingStatus;
    
    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal unitPrice;
    
    @Valid
    private List<BookingServiceDTO> services;
}

class BookingServiceDTO {
    @NotNull
    private Integer serviceId;
    
    @NotNull
    @Min(1)
    private Integer quantity;
}
```

### RentalReceiptResponse
```java
public class RentalReceiptResponse {
    private Integer rentalReceiptId;
    private LocalDate rentalDate;
    private CustomerSummaryDTO customer;
    private EmployeeSummaryDTO employee;
    private Integer bookingCount;
    private BigDecimal totalAmount;
    private Boolean hasInvoice;
}

class CustomerSummaryDTO {
    private Integer customerId;
    private String fullName;
    private String phone;
}
```

### RentalReceiptDetailResponse
```java
public class RentalReceiptDetailResponse {
    private Integer rentalReceiptId;
    private LocalDate rentalDate;
    private CustomerResponse customer;
    private EmployeeResponse employee;
    private List<BookingDetailResponse> bookingDetails;
    private BigDecimal grandTotal;
    private InvoiceSummaryDTO invoice; // null nếu chưa có
}
```

---

## 8. Booking Details DTOs

### BookingDetailResponse
```java
public class BookingDetailResponse {
    private Integer bookingDetailId;
    private RoomSummaryDTO room;
    private Integer numberOfGuests;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private String bookingStatus;
    private BigDecimal unitPrice;
    private BigDecimal totalAmount;
    private List<BookingServiceResponse> services;
}

class RoomSummaryDTO {
    private Integer roomId;
    private String roomCode;
    private String roomTypeName;
}

class BookingServiceResponse {
    private Integer serviceId;
    private String serviceName;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal totalAmount;
}
```

### BookingStatusUpdateRequest
```java
public class BookingStatusUpdateRequest {
    @NotNull
    @Pattern(regexp = "RESERVED|CHECKED_IN|CLEANING")
    private String bookingStatus;
}
```

### BookingServiceAddRequest
```java
public class BookingServiceAddRequest {
    @NotNull
    private Integer serviceId;
    
    @NotNull
    @Min(1)
    private Integer quantity;
}
```

### BookingServiceUpdateRequest
```java
public class BookingServiceUpdateRequest {
    @NotNull
    @Min(1)
    private Integer quantity;
}
```

---

## 9. Invoices DTOs

### InvoiceCreateRequest
```java
public class InvoiceCreateRequest {
    @NotNull
    private Integer rentalReceiptId;
    
    @NotNull
    private Integer employeeId;
    
    @NotNull
    @Pattern(regexp = "PAID|UNPAID")
    private String paymentStatus;
}
```

### InvoicePaymentStatusUpdateRequest
```java
public class InvoicePaymentStatusUpdateRequest {
    @NotNull
    @Pattern(regexp = "PAID|UNPAID")
    private String paymentStatus;
}
```

### InvoiceResponse
```java
public class InvoiceResponse {
    private Integer invoiceId;
    private LocalDate invoiceDate;
    private BigDecimal totalAmount;
    private String paymentStatus;
    private CustomerSummaryDTO customer;
    private EmployeeSummaryDTO employee;
    private Integer rentalReceiptId;
}
```

### InvoiceDetailResponse
```java
public class InvoiceDetailResponse {
    private Integer invoiceId;
    private LocalDate invoiceDate;
    private BigDecimal totalAmount;
    private String paymentStatus;
    private CustomerResponse customer;
    private EmployeeResponse employee;
    private RentalReceiptForInvoiceDTO rentalReceipt;
}

class RentalReceiptForInvoiceDTO {
    private Integer rentalReceiptId;
    private LocalDate rentalDate;
    private List<BookingForInvoiceDTO> bookingDetails;
}

class BookingForInvoiceDTO {
    private String roomCode;
    private String roomTypeName;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer nights;
    private BigDecimal unitPrice;
    private BigDecimal totalAmount;
    private List<ServiceForInvoiceDTO> services;
}

class ServiceForInvoiceDTO {
    private String serviceName;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal totalAmount;
}
```

### InvoiceStatsResponse
```java
public class InvoiceStatsResponse {
    private TodayStatsDTO today;
    private MonthStatsDTO thisMonth;
}

class TodayStatsDTO {
    private Integer totalInvoices;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal unpaidAmount;
}

class MonthStatsDTO {
    private Integer totalInvoices;
    private BigDecimal totalAmount;
}
```

---

## 10. Reports DTOs

### RevenueStatisticsRequest
```java
public class RevenueStatisticsRequest {
    @NotNull
    @Pattern(regexp = "month|year")
    private String type;
    
    @NotNull
    @Min(2020)
    private Integer year;
    
    @Min(1)
    @Max(12)
    private Integer month; // Required if type = "month"
}
```

### MonthlyRevenueStatisticsResponse
```java
public class MonthlyRevenueStatisticsResponse {
    private Integer statisticId;
    private Integer year;
    private Integer month;
    private BigDecimal totalRevenue;
    private Integer invoiceCount;
    private LocalDateTime lastUpdatedAt;
}
```

### MonthRevenueDetailResponse
```java
public class MonthRevenueDetailResponse {
    private Integer year;
    private Integer month;
    private BigDecimal totalRevenue;
    private Integer invoiceCount;
    private List<DailyRevenueDTO> dailyBreakdown;
}

class DailyRevenueDTO {
    private Integer day;
    private BigDecimal revenue;
    private Integer invoiceCount;
}
```

### ReportOverviewResponse
```java
public class ReportOverviewResponse {
    private RevenueOverviewDTO revenue;
    private BookingOverviewDTO bookings;
    private RoomOverviewDTO rooms;
    private CustomerOverviewDTO customers;
    private List<TopServiceDTO> topServices;
}

class RevenueOverviewDTO {
    private BigDecimal total;
    private Double growthPercentage;
}

class BookingOverviewDTO {
    private Integer total;
    private Integer checkedIn;
    private Integer reserved;
    private Integer cleaning;
}

class RoomOverviewDTO {
    private Integer total;
    private Integer available;
    private Double occupancyRate;
}

class CustomerOverviewDTO {
    private Integer total;
    private Integer newThisMonth;
}

class TopServiceDTO {
    private String serviceName;
    private Integer totalQuantity;
    private BigDecimal totalRevenue;
}
```

### ReportExportRequest
```java
public class ReportExportRequest {
    @NotNull
    @Pattern(regexp = "revenue|salary|overview")
    private String reportType;
    
    @NotNull
    @Pattern(regexp = "pdf|excel")
    private String format;
    
    @NotNull
    private Integer year;
    
    @Min(1)
    @Max(12)
    private Integer month;
}
```

### ReportExportResponse
```java
public class ReportExportResponse {
    private String fileUrl;
    private String fileName;
}
```

---

## 11. Authentication DTOs

### LoginRequest
```java
public class LoginRequest {
    @NotBlank
    private String username;
    
    @NotBlank
    private String password;
}
```

### LoginResponse
```java
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType; // "Bearer"
    private Long expiresIn; // seconds
    private UserDTO user;
}

class UserDTO {
    private String username;
    private Integer role;
    private String roleName;
    private EmployeeSummaryDTO employee;
}
```

### RefreshTokenRequest
```java
public class RefreshTokenRequest {
    @NotBlank
    private String refreshToken;
}
```

### RefreshTokenResponse
```java
public class RefreshTokenResponse {
    private String accessToken;
    private String tokenType;
    private Long expiresIn;
}
```

### LogoutRequest
```java
public class LogoutRequest {
    @NotBlank
    private String refreshToken;
}
```

---

## 12. Common DTOs

### PageResponse<T>
```java
public class PageResponse<T> {
    private List<T> content;
    private PageInfo page;
}

class PageInfo {
    private Integer size;
    private Integer number;
    private Long totalElements;
    private Integer totalPages;
}
```

### ApiErrorResponse
```java
public class ApiErrorResponse {
    private LocalDateTime timestamp;
    private Integer status;
    private String error;
    private String message;
    private List<ValidationError> details;
    private String path;
}

class ValidationError {
    private String field;
    private String message;
}
```

### ApiSuccessResponse
```java
public class ApiSuccessResponse {
    private LocalDateTime timestamp;
    private Integer status;
    private String message;
    private Object data;
}
```

---

## 📝 Validation Annotations Reference

### Common Validations
- `@NotNull` - Không được null
- `@NotBlank` - Không được null/empty/whitespace
- `@NotEmpty` - Không được null/empty
- `@Size(min, max)` - Độ dài chuỗi/collection
- `@Min(value)` - Giá trị tối thiểu
- `@Max(value)` - Giá trị tối đa
- `@DecimalMin(value)` - Giá trị decimal tối thiểu
- `@DecimalMax(value)` - Giá trị decimal tối đa
- `@Pattern(regexp)` - Regex pattern
- `@Email` - Email format
- `@Past` - Ngày trong quá khứ
- `@Future` - Ngày trong tương lai
- `@FutureOrPresent` - Ngày hiện tại hoặc tương lai
- `@Valid` - Validate nested object

---

**Last Updated:** 2024-01-20  
**Version:** 1.0
