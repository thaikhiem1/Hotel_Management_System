import React from 'react';
import RoomCard from './RoomCard';

const RoomGrid = ({ rooms, onRoomAction, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-margin-lg">
        <div className="flex flex-col items-center gap-space-md">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Đang tải danh sách phòng...
          </p>
        </div>
      </div>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="flex items-center justify-center py-margin-lg">
        <div className="flex flex-col items-center gap-space-md text-center">
          <span className="material-symbols-outlined text-[64px] text-outline">
            meeting_room_off
          </span>
          <div>
            <p className="font-headline-md text-headline-md text-on-surface mb-space-xs">
              Không tìm thấy phòng
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Thử thay đổi bộ lọc hoặc thời gian để xem phòng khác
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-lg">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          onAction={onRoomAction}
        />
      ))}
    </div>
  );
};

export default RoomGrid;
