package com.example.hotel.models.dto.request;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ServicesRequestValidationTest {

    private static final ValidatorFactory VALIDATOR_FACTORY =
            Validation.buildDefaultValidatorFactory();
    private static final Validator VALIDATOR = VALIDATOR_FACTORY.getValidator();

    @AfterAll
    static void closeValidatorFactory() {
        VALIDATOR_FACTORY.close();
    }

    @Test
    void validRequestAllowsZeroPriceAndUnmanagedStock() {
        ServicesRequest request = new ServicesRequest(
                " Spa ", 1, new BigDecimal("0.00"), null, " lần ");

        assertTrue(VALIDATOR.validate(request).isEmpty());
    }

    @Test
    void requestValidationRejectsMissingAndOutOfRangeFields() {
        ServicesRequest request = new ServicesRequest(
                " ", null, new BigDecimal("-0.01"), -1, "U".repeat(21));

        Set<String> invalidFields = VALIDATOR.validate(request).stream()
                .map(violation -> violation.getPropertyPath().toString())
                .collect(Collectors.toSet());

        assertEquals(Set.of("serviceName", "serviceCategoryId", "unitPrice",
                "stockQuantity", "unit"), invalidFields);
    }

    @Test
    void requestValidationRejectsPriceWithTooManyDecimalOrIntegerDigits() {
        ServicesRequest tooManyDecimals = requestWithPrice(new BigDecimal("10.001"));
        ServicesRequest tooManyIntegerDigits = requestWithPrice(new BigDecimal("10000000000000000.00"));

        assertFalse(VALIDATOR.validate(tooManyDecimals).isEmpty());
        assertFalse(VALIDATOR.validate(tooManyIntegerDigits).isEmpty());
    }

    private ServicesRequest requestWithPrice(BigDecimal unitPrice) {
        return new ServicesRequest("Spa", 1, unitPrice, null, "lần");
    }
}
