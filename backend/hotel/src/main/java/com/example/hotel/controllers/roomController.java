package com.example.hotel.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.hotel.services.IRoomService;
import com.example.hotel.models.dto.request.RoomRequest;
import com.example.hotel.models.dto.response.RoomResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/room")
@CrossOrigin(origins = { "http://localhost:5173" })
@RequiredArgsConstructor
public class roomController {
    private final IRoomService roomService;

    @PostMapping
    public ResponseEntity<RoomResponse> create(
            @Valid @RequestBody RoomRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(roomService.CreateRoom(request));
    }

    @GetMapping
    public ResponseEntity<List<RoomResponse>> getAll() {

        return ResponseEntity.ok(
                roomService.GetAll());
    }
}
