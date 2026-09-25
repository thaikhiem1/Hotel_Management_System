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
import org.springframework.web.bind.annotation.ResponseBody;
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
public class RoomController {
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

    @PutMapping("/{id}")
    public ResponseEntity<RoomResponse> update(
            @PathVariable Integer id, @Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.UpdateRoom(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @Valid Integer id) {
        roomService.DeletedRoom(id);
        return ResponseEntity.noContent().build();
    }
}
