package com.example.hotel.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

/**
 * Global exception handler for the application
 * Handles all exceptions and returns appropriate HTTP status codes and error messages
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handles validation errors from @Valid annotation
     * Returns 400 Bad Request with field-specific error messages
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex,
            WebRequest request) {
        
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message("Thông tin không hợp lệ")
                .path(request.getDescription(false).replace("uri=", ""))
                .fieldErrors(fieldErrors)
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles duplicate resource exceptions (e.g., duplicate phone or citizen ID)
     * Returns 409 Conflict
     */
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResourceException(
            DuplicateResourceException ex,
            WebRequest request) {

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .error("Conflict")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    /**
     * Handles resource not found exceptions
     * Returns 404 Not Found
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex,
            WebRequest request) {

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Handles illegal argument exceptions (business logic validation errors)
     * Returns 400 Bad Request
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException ex,
            WebRequest request) {

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Sai tên đăng nhập / mật khẩu -> 401
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex,
            WebRequest request) {
        return buildError(HttpStatus.UNAUTHORIZED, "Unauthorized", ex.getMessage(), request);
    }

    /**
     * Tài khoản bị vô hiệu hóa -> 403
     */
    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ErrorResponse> handleDisabled(
            DisabledException ex,
            WebRequest request) {
        return buildError(HttpStatus.FORBIDDEN, "Forbidden", ex.getMessage(), request);
    }

    /**
     * Không đủ quyền (ví dụ @PreAuthorize) -> 403, tránh bị nuốt thành 500
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex,
            WebRequest request) {
        // Thông điệp nghiệp vụ tự đặt (vd: không xác định được nhân viên lập phiếu) được giữ lại
        String message = "Access Denied".equals(ex.getMessage()) || ex.getMessage() == null
                ? "Bạn không có quyền thực hiện chức năng này"
                : ex.getMessage();
        return buildError(HttpStatus.FORBIDDEN, "Forbidden", message, request);
    }

    /**
     * Dữ liệu nghiệp vụ không hợp lệ, có thể kèm nhiều lỗi theo trường -> 400
     */
    @ExceptionHandler(BusinessValidationException.class)
    public ResponseEntity<ErrorResponse> handleBusinessValidation(
            BusinessValidationException ex,
            WebRequest request) {
        ErrorResponse body = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .fieldErrors(ex.getFieldErrors().isEmpty() ? null : ex.getFieldErrors())
                .build();
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    /**
     * Phòng vừa được giao dịch khác đặt / lịch chồng lấn -> 409, kèm danh sách phòng cần tra cứu lại
     */
    @ExceptionHandler(RoomUnavailableException.class)
    public ResponseEntity<ErrorResponse> handleRoomUnavailable(
            RoomUnavailableException ex,
            WebRequest request) {
        ErrorResponse body = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .error("Conflict")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .data(Map.of("unavailableRoomIds", ex.getRoomIds()))
                .build();
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    /**
     * Giá tính lại khác số tiền đã xác nhận -> 409 kèm chi phí mới để người dùng xác nhận lại
     */
    @ExceptionHandler(PriceChangedException.class)
    public ResponseEntity<ErrorResponse> handlePriceChanged(
            PriceChangedException ex,
            WebRequest request) {
        ErrorResponse body = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .error("Conflict")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .data(ex.getNewEstimate())
                .build();
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    /**
     * JSON sai định dạng, ngày giờ hoặc giá trị enum không hợp lệ -> 400
     */
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ErrorResponse> handleUnreadableRequest(
            Exception ex,
            WebRequest request) {
        return buildError(HttpStatus.BAD_REQUEST, "Bad Request",
                "Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại định dạng ngày giờ và các giá trị đã chọn.",
                request);
    }

    private ResponseEntity<ErrorResponse> buildError(
            HttpStatus status, String error, String message, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(error)
                .message(message)
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, status);
    }

    /**
     * Handles all other unexpected exceptions
     * Returns 500 Internal Server Error
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(
            Exception ex,
            WebRequest request) {

        String path = request.getDescription(false).replace("uri=", "");
        logger.error("Unhandled exception while processing request {}", path, ex);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message("Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.")
                .path(path)
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
