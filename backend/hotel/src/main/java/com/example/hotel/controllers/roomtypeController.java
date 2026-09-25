package com.example.hotel.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.hotel.services.IRoomTypesService;
import com.example.hotel.models.dto.request.RoomTypeRequest;
import com.example.hotel.models.dto.response.RoomTypeResponse;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/roomtype")
@CrossOrigin(origins = { "http://localhost:5173" })
@RequiredArgsConstructor
public class RoomTypeController {
    private final IRoomTypesService roomTypeService;

    @PostMapping
    public ResponseEntity<RoomTypeResponse> create(
            @Valid @RequestBody RoomTypeRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(roomTypeService.CreateRoomType(request));
    }

    @GetMapping
    public ResponseEntity<List<RoomTypeResponse>> getAll() {

        return ResponseEntity.ok(roomTypeService.GetAll());
    }

    @PutMapping("/{IdLPH}")
    public ResponseEntity<RoomTypeResponse> update(
            @PathVariable Integer IdLPH, @Valid @RequestBody RoomTypeRequest request) {
        return ResponseEntity.ok(roomTypeService.UpdateRoomType(IdLPH, request));
    }

    @DeleteMapping("/{IdLPH}")
    public ResponseEntity<Void> delete(
            @PathVariable @Valid Integer IdLPH) {
        roomTypeService.DeletedRoomType(IdLPH);
        return ResponseEntity.noContent().build();
    }
}
