package com.example.hotel.services.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.hotel.Enums.BookingStatus;
import com.example.hotel.Enums.RoomStatus;
import com.example.hotel.exception.BusinessValidationException;
import com.example.hotel.exception.DuplicateResourceException;
import com.example.hotel.exception.ResourceInUseException;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.mapper.RoomMapper;
import com.example.hotel.models.dto.request.RoomRequest;
import com.example.hotel.models.dto.response.RoomResponse;
import com.example.hotel.models.entities.room_types;
import com.example.hotel.models.entities.rooms;
import com.example.hotel.repositorys.BookingDetailRepository;
import com.example.hotel.repositorys.RoomRepository;
import com.example.hotel.repositorys.RoomTypeRepository;
import com.example.hotel.services.IRoomService;

/**
 * Quản lý phòng. Cập nhật và xóa phòng kiểm tra trạng thái hiện tại của phòng (đang có khách, có lượt đặt sắp tới)
 * sau khi khóa dòng phòng, cùng thứ tự khóa với nhận phòng, trả phòng và ghi nhận dịch vụ để không ghi đè lên
 * thao tác đang diễn ra trên phòng.
 */
@Service
public class RoomService implements IRoomService {
    private static final String MSG_NOT_FOUND = "Không tìm thấy phòng.";

    private final RoomRepository _RoomRepository;
    private final RoomTypeRepository _RoomTypeRepository;
    private final BookingDetailRepository _BookingDetailRepository;
    private final RoomMapper _RoomMapper;

    public RoomService(RoomRepository _roomRepository, RoomMapper _roomMapper,
            RoomTypeRepository _roomTypeRepository, BookingDetailRepository _bookingDetailRepository) {
        this._RoomRepository = _roomRepository;
        this._RoomMapper = _roomMapper;
        this._RoomTypeRepository = _roomTypeRepository;
        this._BookingDetailRepository = _bookingDetailRepository;
    }

    @Override
    public RoomResponse CreateRoom(RoomRequest request) {
        if (_RoomRepository.existsByRoomCode(request.getRoomCode())) {
            throw new IllegalArgumentException("Room label not exists");
        }
        Integer roomTypeId = request.getRoomTypeId();
        if (roomTypeId == null) {
            throw new IllegalArgumentException("Room type ID is required");
        }
        room_types roomType = _RoomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new RuntimeException("Room Type not exists"));
        rooms room = _RoomMapper.toEntity(request);
        room.setRoomTypes(roomType);
        rooms savedRoom = _RoomRepository.save(room);
        return _RoomMapper.toRoomResponse(savedRoom);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> GetAll() {
        // Hai truy vấn gom sẵn các phòng đang có khách / có lượt đặt, không truy vấn lặp theo từng phòng
        Set<Integer> occupied = new HashSet<>(_BookingDetailRepository.findRoomIdsByStatus(BookingStatus.CHECKED_IN));
        Set<Integer> reserved = new HashSet<>(_BookingDetailRepository.findRoomIdsByStatus(BookingStatus.RESERVED));
        return _RoomRepository.findAll()
                .stream()
                .map(r -> _RoomMapper.toRoomResponse(r, occupied.contains(r.getRoomId()),
                        reserved.contains(r.getRoomId())))
                .toList();
    }

    @Override
    @Transactional
    public RoomResponse UpdateRoom(Integer roomId, RoomRequest request) {
        rooms room = lockRoom(roomId);
        boolean occupied = _BookingDetailRepository.existsByRoomRoomIdAndBookingStatus(roomId,
                BookingStatus.CHECKED_IN);
        boolean reserved = _BookingDetailRepository.existsByRoomRoomIdAndBookingStatus(roomId,
                BookingStatus.RESERVED);

        // Phòng đang có khách thì không được cập nhật gì để không làm sai lệch lượt lưu trú đang diễn ra
        if (occupied) {
            throw new BusinessValidationException(
                    "Phòng " + room.getRoomCode() + " đang có khách nên không thể cập nhật.", Map.of());
        }

        if (!room.getRoomCode().equals(request.getRoomCode())
                && _RoomRepository.existsByRoomCode(request.getRoomCode())) {
            throw new DuplicateResourceException("Mã phòng đã tồn tại", "room_code", request.getRoomCode());
        }
        Integer roomTypeId = request.getRoomTypeId();
        room_types newType = _RoomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại phòng."));

        // Trạng thái không gửi lên thì giữ nguyên
        RoomStatus current = room.getRoomStatus();
        RoomStatus target = request.getRoomStatus() == null ? current : request.getRoomStatus();
        if (target != current) {
            checkTransition(room, current, target);
            if (reserved && target != RoomStatus.AVAILABLE) {
                throw new BusinessValidationException("Phòng " + room.getRoomCode()
                        + " đang có lượt đặt sắp tới nên không thể chuyển sang " + label(target) + ".", Map.of());
            }
        }
        if (reserved && !newType.getRoomTypeId().equals(room.getRoomTypes().getRoomTypeId())) {
            throw new BusinessValidationException("Phòng " + room.getRoomCode()
                    + " đang có lượt đặt sắp tới nên không thể đổi loại phòng.", Map.of());
        }

        room.setRoomCode(request.getRoomCode());
        room.setRoomTypes(newType);
        room.setRoomStatus(target);
        room.setNote(request.getNote());
        return _RoomMapper.toRoomResponse(_RoomRepository.saveAndFlush(room), false, reserved);
    }

    @Override
    @Transactional
    public void DeletedRoom(Integer roomId) {
        rooms room = lockRoom(roomId);
        // Phòng đã có lịch sử đặt/lưu trú thì không xóa được (dữ liệu hóa đơn, phiếu thuê tham chiếu tới phòng)
        if (_BookingDetailRepository.existsByRoomRoomId(roomId)) {
            throw new ResourceInUseException("Phòng " + room.getRoomCode()
                    + " đã có lịch sử đặt phòng nên không thể xóa. Hãy chuyển phòng sang đang sửa chữa nếu không còn sử dụng.");
        }
        _RoomRepository.delete(room);
    }

    /** Khóa dòng phòng trước khi đọc lại trạng thái và các lượt đặt của phòng */
    private rooms lockRoom(Integer roomId) {
        if (roomId == null) {
            throw new IllegalArgumentException("Room ID is require");
        }
        return _RoomRepository.findAllByIdForUpdate(List.of(roomId)).stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(MSG_NOT_FOUND));
    }

    /**
     * Chuyển trạng thái thủ công: Trống và Đang sửa chữa chuyển qua lại; Đang dọn dẹp chuyển được sang Trống (dọn xong)
     * hoặc Đang sửa chữa. Đang dọn dẹp chỉ do trả phòng tạo ra nên không đặt thủ công được.
     */
    private void checkTransition(rooms room, RoomStatus from, RoomStatus to) {
        boolean allowed = switch (from) {
            case AVAILABLE -> to == RoomStatus.UNDER_MAINTENANCE;
            case UNDER_MAINTENANCE -> to == RoomStatus.AVAILABLE;
            case CLEANING -> to == RoomStatus.AVAILABLE || to == RoomStatus.UNDER_MAINTENANCE;
        };
        if (!allowed) {
            throw new BusinessValidationException("Phòng " + room.getRoomCode() + " đang ở trạng thái "
                    + label(from) + " nên không thể chuyển sang " + label(to) + ".", Map.of());
        }
    }

    private String label(RoomStatus status) {
        return switch (status) {
            case AVAILABLE -> "Trống";
            case UNDER_MAINTENANCE -> "Đang sửa chữa";
            case CLEANING -> "Đang dọn dẹp";
        };
    }
}
