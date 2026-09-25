# Cache Strategy - Hotel Management System

> Chiến lược cache để tối ưu performance và giảm tải database

---

## 📌 Nguyên tắc chung

### Khi nào NÊN cache:
1. ✅ Dữ liệu được query **nhiều lần** bởi nhiều users
2. ✅ Query **phức tạp**, tốn nhiều resources (joins, aggregations)
3. ✅ Dữ liệu **ít thay đổi** hoặc có thể tolerate "stale data"
4. ✅ Có thể định nghĩa **TTL (Time To Live)** hợp lý

### Khi nào KHÔNG NÊN cache:
1. ❌ Dữ liệu **thay đổi liên tục** (real-time)
2. ❌ Dữ liệu **nhạy cảm về tài chính** (invoices, payments)
3. ❌ Query **đơn giản**, không tốn resources
4. ❌ Dữ liệu **cá nhân hóa** cho từng user

---

## 🎯 Cache Configuration

### Redis Setup (Spring Boot)

**pom.xml:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
```

**application.properties:**
```properties
# Redis Configuration
spring.redis.host=localhost
spring.redis.port=6379
spring.redis.password=
spring.redis.database=0
spring.redis.timeout=60000

# Cache Configuration
spring.cache.type=redis
spring.cache.redis.time-to-live=600000
spring.cache.redis.cache-null-values=false
spring.cache.redis.use-key-prefix=true
spring.cache.redis.key-prefix=hotel:
```

**CacheConfig.java:**
```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheConfiguration cacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .disableCachingNullValues()
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new GenericJackson2JsonRedisSerializer()
                )
            );
    }

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();

        // Dashboard stats - 5 minutes
        cacheConfigurations.put("dashboard:stats", 
            RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(5)));

        // Revenue reports - 1 hour
        cacheConfigurations.put("reports:revenue", 
            RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(1)));

        // Room types - 30 minutes
        cacheConfigurations.put("room-types", 
            RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30)));

        // Service categories - 30 minutes
        cacheConfigurations.put("service-categories", 
            RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30)));

        // Employees - 15 minutes
        cacheConfigurations.put("employees:active", 
            RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(15)));

        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(cacheConfiguration())
            .withInitialCacheConfigurations(cacheConfigurations)
            .build();
    }
}
```

---

## 📊 Cache Implementation by Module

### 1. Dashboard APIs

#### GET /api/dashboard/stats
**Cache:** ✅ YES (5 minutes)
```java
@Cacheable(value = "dashboard:stats", key = "'overview'")
public DashboardStatsResponse getDashboardStats() {
    // Query phức tạp:
    // - Count rooms by status
    // - Today's revenue from invoices
    // - Active employees count
    // - Occupancy rate calculation
    return dashboardStats;
}
```

**Invalidation:**
- Manual refresh button → `@CacheEvict`
- Hoặc tự động expire sau 5 phút

---

### 2. Room Types APIs

#### GET /api/room-types
**Cache:** ✅ YES (30 minutes)
```java
@Cacheable(value = "room-types")
public List<RoomTypeResponse> getAllRoomTypes() {
    return roomTypeRepository.findAll()
        .stream()
        .map(roomTypeMapper::toResponse)
        .collect(Collectors.toList());
}
```

#### POST /api/room-types
**Cache Invalidation:** ✅ Clear cache
```java
@CacheEvict(value = "room-types", allEntries = true)
public RoomTypeResponse createRoomType(RoomTypeRequest request) {
    // Create new room type
    return savedRoomType;
}
```

#### PUT /api/room-types/{id}
**Cache Invalidation:** ✅ Clear cache
```java
@CacheEvict(value = "room-types", allEntries = true)
public RoomTypeResponse updateRoomType(Integer id, RoomTypeRequest request) {
    // Update room type
    return updatedRoomType;
}
```

---

### 3. Rooms APIs

#### GET /api/rooms
**Cache:** ❌ NO (trạng thái thay đổi liên tục)
```java
public List<RoomResponse> getRooms(String status, Integer roomTypeId) {
    // No cache - real-time room status
    return roomRepository.findByFilters(status, roomTypeId);
}
```

**Lý do:** Trạng thái phòng (available, occupied, cleaning) thay đổi thường xuyên

---

### 4. Service Categories & Services APIs

#### GET /api/service-categories
**Cache:** ✅ YES (30 minutes)
```java
@Cacheable(value = "service-categories")
public List<ServiceCategoryResponse> getAllServiceCategories() {
    return serviceCategoryRepository.findAll();
}
```

#### GET /api/services
**Cache:** ⚠️ CONDITIONAL (15 minutes, có filter thì không cache)
```java
@Cacheable(value = "services", 
           key = "#categoryId != null ? 'category:' + #categoryId : 'all'",
           condition = "#search == null")
public List<ServiceResponse> getServices(Integer categoryId, String search) {
    // Cache nếu không có search query
    // Có search thì không cache (query khác nhau)
    return serviceRepository.findByFilters(categoryId, search);
}
```

**Cache Invalidation khi CRUD:**
```java
@CacheEvict(value = {"services", "service-categories"}, allEntries = true)
public ServiceResponse createService(ServiceRequest request) {
    // Clear both caches
    return savedService;
}
```

---

### 5. Customers APIs

#### GET /api/customers
**Cache:** ❌ NO (có pagination, search, filter)
```java
public PageResponse<CustomerResponse> getCustomers(
    String search, String gender, String nationality, Pageable pageable
) {
    // No cache - too many variations
    return customerRepository.findByFilters(search, gender, nationality, pageable);
}
```

#### GET /api/customers/search (autocomplete)
**Cache:** ❌ NO (search query khác nhau)
```java
public List<CustomerSearchResponse> searchCustomers(String query) {
    // No cache - search results vary
    return customerRepository.searchByQuery(query);
}
```

---

### 6. Employees APIs

#### GET /api/employees/active (for dropdowns)
**Cache:** ✅ YES (15 minutes)
```java
@Cacheable(value = "employees:active")
public List<EmployeeSummary> getActiveEmployees() {
    return employeeRepository.findByIsActiveTrue()
        .stream()
        .map(e -> new EmployeeSummary(e.getEmployeeId(), e.getFullName()))
        .collect(Collectors.toList());
}
```

#### GET /api/employees/positions
**Cache:** ✅ YES (30 minutes)
```java
@Cacheable(value = "employees:positions")
public List<String> getDistinctPositions() {
    return employeeRepository.findDistinctPositions();
}
```

**Cache Invalidation:**
```java
@CacheEvict(value = {"employees:active", "employees:positions"}, allEntries = true)
public EmployeeResponse createEmployee(EmployeeCreateRequest request) {
    // Clear employee caches
    return savedEmployee;
}
```

---

### 7. Rental Receipts & Bookings APIs

#### GET /api/rental-receipts
**Cache:** ❌ NO (real-time booking data)
```java
public List<RentalReceiptResponse> getRentalReceipts(
    LocalDate fromDate, LocalDate toDate, Integer customerId
) {
    // No cache - booking data changes frequently
    return rentalReceiptRepository.findByFilters(fromDate, toDate, customerId);
}
```

#### GET /api/rental-receipts/{id}
**Cache:** ❌ NO (có thể thêm services, thay đổi trạng thái)
```java
public RentalReceiptDetailResponse getRentalReceiptDetail(Integer id) {
    // No cache - may have services added
    return rentalReceiptService.getDetail(id);
}
```

---

### 8. Invoices APIs

#### GET /api/invoices
**Cache:** ❌ NO (financial data, must be accurate)
```java
public PageResponse<InvoiceResponse> getInvoices(
    LocalDate fromDate, LocalDate toDate, String paymentStatus, Pageable pageable
) {
    // No cache - financial data
    return invoiceRepository.findByFilters(fromDate, toDate, paymentStatus, pageable);
}
```

#### GET /api/invoices/{id}
**Cache:** ❌ NO (in hóa đơn cần data chính xác nhất)
```java
public InvoiceDetailResponse getInvoiceDetail(Integer id) {
    // No cache - print invoice needs accurate data
    return invoiceService.getDetailForPrint(id);
}
```

---

### 9. Reports & Statistics APIs

#### GET /api/reports/revenue-statistics
**Cache:** ✅ YES (1 hour cho historical data)
```java
@Cacheable(value = "reports:revenue", 
           key = "#type + ':' + #year + ':' + (#month != null ? #month : 'all')")
public Object getRevenueStatistics(String type, Integer year, Integer month) {
    if ("month".equals(type) && month != null) {
        // Tháng cụ thể - cache 1 hour
        return getMonthlyRevenueDetail(year, month);
    } else {
        // Cả năm - cache 1 hour
        return getYearlyRevenue(year);
    }
}
```

**Invalidation:**
- Tháng hiện tại: Clear cache khi có invoice mới được tạo
- Tháng trước: Không cần clear (data đã final)

```java
@CacheEvict(value = "reports:revenue", 
            key = "'month:' + T(java.time.LocalDate).now().getYear() + ':' + T(java.time.LocalDate).now().getMonthValue()")
public InvoiceResponse createInvoice(InvoiceCreateRequest request) {
    // Clear current month revenue cache
    return savedInvoice;
}
```

#### GET /api/reports/salary-by-position
**Cache:** ✅ YES (30 minutes)
```java
@Cacheable(value = "reports:salary")
public List<SalaryByPositionResponse> getSalaryByPosition() {
    return employeeRepository.aggregateSalaryByPosition();
}
```

**Invalidation:** Clear khi có thay đổi salary
```java
@CacheEvict(value = "reports:salary", allEntries = true)
public EmployeeResponse updateEmployeeSalary(Integer id, BigDecimal newSalary) {
    // Clear salary report cache
    return updatedEmployee;
}
```

---

## 🔄 Cache Invalidation Strategies

### 1. Time-based (TTL)
Tự động expire sau một khoảng thời gian
```java
@Cacheable(value = "dashboard:stats", key = "'overview'")
// Auto expire sau 5 phút (config trong CacheConfig)
```

### 2. Event-based (Manual eviction)
Clear cache khi có thay đổi data
```java
@CacheEvict(value = "room-types", allEntries = true)
public void updateRoomType() { ... }
```

### 3. Hybrid (TTL + Manual)
Kết hợp cả 2: TTL cho safety + manual eviction cho realtime
```java
@Cacheable(value = "services") // TTL 15 min
@CacheEvict(value = "services", allEntries = true) // Manual khi CRUD
```

---

## 📈 Cache Monitoring

### Redis CLI Commands
```bash
# Xem tất cả keys
redis-cli KEYS "hotel:*"

# Xem value của key
redis-cli GET "hotel:dashboard:stats::overview"

# Xem TTL còn lại
redis-cli TTL "hotel:dashboard:stats::overview"

# Clear tất cả cache
redis-cli FLUSHDB

# Clear cache theo pattern
redis-cli --scan --pattern "hotel:reports:*" | xargs redis-cli DEL
```

### Spring Boot Actuator (monitoring)
```properties
# application.properties
management.endpoints.web.exposure.include=health,info,caches
```

Access: `http://localhost:8080/actuator/caches`

---

## 🎯 Summary Table

| Module | Endpoint | Cache? | TTL | Invalidation |
|--------|----------|--------|-----|--------------|
| Dashboard | GET /api/dashboard/stats | ✅ | 5 min | Manual refresh |
| Room Types | GET /api/room-types | ✅ | 30 min | On CRUD |
| Rooms | GET /api/rooms | ❌ | - | - |
| Services | GET /api/services | ⚠️ | 15 min | On CRUD |
| Service Categories | GET /api/service-categories | ✅ | 30 min | On CRUD |
| Customers | GET /api/customers | ❌ | - | - |
| Employees (dropdown) | GET /api/employees/active | ✅ | 15 min | On CRUD |
| Employees (positions) | GET /api/employees/positions | ✅ | 30 min | On CRUD |
| Rental Receipts | GET /api/rental-receipts | ❌ | - | - |
| Invoices | GET /api/invoices | ❌ | - | - |
| Revenue Reports | GET /api/reports/revenue-statistics | ✅ | 1 hour | On invoice create (current month) |
| Salary Reports | GET /api/reports/salary-by-position | ✅ | 30 min | On salary update |

---

## 🚀 Implementation Priority

### Phase 1 (Week 1-2): Foundation
- [ ] Setup Redis
- [ ] Configure Spring Cache
- [ ] Basic @Cacheable for master data (room types, service categories)

### Phase 2 (Week 3-4): Critical Paths
- [ ] Dashboard stats cache
- [ ] Revenue reports cache
- [ ] Employee dropdowns cache

### Phase 3 (Week 5+): Optimization
- [ ] Fine-tune TTL values
- [ ] Add monitoring
- [ ] Performance testing

---

## 💡 Best Practices

1. **Start conservative:** Cache ít trước, mở rộng sau khi có data
2. **Monitor cache hit rate:** Aim for >70% hit rate cho cached endpoints
3. **Test invalidation:** Đảm bảo cache được clear đúng lúc
4. **Document TTL rationale:** Giải thích tại sao chọn TTL đó
5. **Có plan B:** Hệ thống vẫn hoạt động nếu Redis die

---

**Last Updated:** 2024-01-20  
**Version:** 1.0
