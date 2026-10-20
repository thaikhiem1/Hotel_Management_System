package com.example.hotel.exception;

/**
 * Exception thrown when attempting to create a resource that already exists
 * Returns HTTP 409 Conflict
 */
public class DuplicateResourceException extends RuntimeException {
    private final String field;
    private final String value;

    public DuplicateResourceException(String field, String value) {
        super(String.format("%s đã tồn tại", field));
        this.field = field;
        this.value = value;
    }

    public DuplicateResourceException(String message, String field, String value) {
        super(message);
        this.field = field;
        this.value = value;
    }

    public String getField() {
        return field;
    }

    public String getValue() {
        return value;
    }
}
