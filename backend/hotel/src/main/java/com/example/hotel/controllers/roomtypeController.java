package com.example.hotel.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.hotel.services.IRoomtypeService;
import com.example.hotel.models.dto.request.RoomTypeRequest;
import com.example.hotel.models.dto.response.RoomTypeResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/roomtype")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173", "http://localhost:5174" })
@RequiredArgsConstructor
public class roomtypeController {
    private final IRoomtypeService roomTypeService;

    @PostMapping
    public ResponseEntity<RoomTypeResponse> create(
            @Valid @RequestBody RoomTypeRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(roomTypeService.CreateRoomtype(request));
    }

    @GetMapping
    public ResponseEntity<List<RoomTypeResponse>> getAll() {

        return ResponseEntity.ok(
                roomTypeService.GetAll());
    }
}
