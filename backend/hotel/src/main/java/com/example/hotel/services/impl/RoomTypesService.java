package com.example.hotel.services.impl;

import com.example.hotel.exception.DuplicateResourceException;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.mapper.RoomTypeMapper;
import com.example.hotel.models.dto.request.RoomTypeRequest;
import com.example.hotel.models.dto.response.RoomTypeResponse;
import com.example.hotel.models.entities.room_types;
import com.example.hotel.repositorys.RoomRepository;
import com.example.hotel.repositorys.RoomTypeRepository;
import com.example.hotel.services.IRoomTypesService;

import java.util.Locale;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoomTypesService implements IRoomTypesService {

    private final RoomTypeMapper roomTypeMapper;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomRepository roomRepository;

    public RoomTypesService(
            RoomTypeMapper roomTypeMapper,
            RoomTypeRepository roomTypeRepository,
            RoomRepository roomRepository) {
        this.roomTypeMapper = roomTypeMapper;
        this.roomTypeRepository = roomTypeRepository;
        this.roomRepository = roomRepository;
    }

    @Override
    @Transactional
    public RoomTypeResponse createRoomType(RoomTypeRequest request) {
        // Trim và chuẩn hóa tên
        String roomTypeName = request.getRoomTypeName().trim().toLowerCase(Locale.ROOT);
        
        // Kiểm tra giá ngày phải lớn hơn hoặc bằng giá giờ
        if (request.getDailyRate().compareTo(request.getHourlyRate()) <= 0) {
            throw new IllegalArgumentException(
                "Giá thuê theo ngày (" + request.getDailyRate() + 
                ") không được nhỏ hơn giá thuê theo giờ (" + request.getHourlyRate() + ")"
            );
        }
        
        // Kiểm tra tên chưa tồn tại (case-insensitive)
        if (roomTypeRepository.existsByRoomTypeNameIgnoreCase(roomTypeName)) {
            throw new DuplicateResourceException(
                "Tên loại phòng '" + roomTypeName + "' đã tồn tại trong hệ thống (không phân biệt hoa thường)",
                "roomTypeName",
                roomTypeName
            );
        }

        // Tạo entity
        room_types roomType = roomTypeMapper.toEntities(request);
        roomType.setRoomTypeName(roomTypeName); // Đảm bảo dùng tên đã trim
        
        // Lưu vào database (ID tự sinh)
        room_types savedRoomType = roomTypeRepository.save(roomType);
        
        return roomTypeMapper.toRoomTypeResponse(savedRoomType);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoomTypeResponse> getAllRoomTypes(Pageable pageable) {
        Page<room_types> roomTypesPage = roomTypeRepository.findAll(pageable);
        return roomTypesPage.map(roomTypeMapper::toRoomTypeResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public RoomTypeResponse getRoomTypeById(Integer id) {
        if(id == null || id <= 0){
            throw  new IllegalArgumentException(
                "Loại phòng có " + id + " không tồn tại"
            );
        }
        room_types roomType = roomTypeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Không tìm thấy loại phòng với ID: " + id
            ));
        
        return roomTypeMapper.toRoomTypeResponse(roomType);
    }

    @Override
    @Transactional
    public RoomTypeResponse updateRoomType(Integer id, RoomTypeRequest request) {
        if(id == null || id <= 0){
            throw  new IllegalArgumentException(
                "Loại phòng có " + id + " không tồn tại"
            );
        }
        // Tìm loại phòng
        room_types existingRoomType = roomTypeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Không tìm thấy loại phòng với ID: " + id
            ));

        // Trim và chuẩn hóa tên mới
        String newRoomTypeName = request.getRoomTypeName().trim();
        
        // Kiểm tra giá ngày phải lớn hơn hoặc bằng giá giờ
        if (request.getDailyRate().compareTo(request.getHourlyRate()) < 0) {
            throw new IllegalArgumentException(
                "Giá thuê theo ngày (" + request.getDailyRate() + 
                ") không được nhỏ hơn giá thuê theo giờ (" + request.getHourlyRate() + ")"
            );
        }
        
        // Kiểm tra tên không trùng với loại phòng khác (case-insensitive)
        if (roomTypeRepository.existsByRoomTypeNameIgnoreCaseAndRoomTypeIdNot(newRoomTypeName, id)) {
            throw new DuplicateResourceException(
                "Tên loại phòng '" + newRoomTypeName + "' đã được sử dụng bởi loại phòng khác (không phân biệt hoa thường)",
                "roomTypeName",
                newRoomTypeName
            );
        }

        // Cập nhật thông tin
        existingRoomType.setRoomTypeName(newRoomTypeName);
        existingRoomType.setNumberOfBeds(request.getNumberOfBeds());
        existingRoomType.setMaximumOccupancy(request.getMaximumOccupancy());
        existingRoomType.setDailyRate(request.getDailyRate());
        existingRoomType.setHourlyRate(request.getHourlyRate());
        
        // Lưu vào database
        room_types updatedRoomType = roomTypeRepository.save(existingRoomType);
        
        return roomTypeMapper.toRoomTypeResponse(updatedRoomType);
    }

    @Override
    @Transactional
    public void deleteRoomType(Integer id) {
        if(id == null || id <= 0){
            return;
        }
        // Kiểm tra loại phòng tồn tại
        room_types roomType = roomTypeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Không tìm thấy loại phòng với ID: " + id
            ));

        // Kiểm tra có phòng nào đang sử dụng không
        boolean hasRooms = roomRepository.existsByRoomTypesRoomTypeId(id);
        
        if (hasRooms) {
            throw new IllegalStateException(
                "Không thể xóa loại phòng '" + roomType.getRoomTypeName() + 
                "' vì đang có phòng sử dụng loại phòng này"
            );
        }

        // Xóa loại phòng
        roomTypeRepository.delete(roomType);
    }
}

