import { cn } from '@/utils/lib/util';

const ResizeHandle = ({ isResizing, onMouseDown }) => {
  return (
    <div
      onMouseDown={onMouseDown}
      className={cn(
        'absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize z-50',
        'hover:bg-primary/50 transition-all duration-200 group',
        isResizing && 'bg-primary w-2'
      )}
      title="Kéo để thay đổi kích thước sidebar"
    >
      {/* Visual Indicator */}
      <div 
        className={cn(
          'absolute right-0 top-1/2 -translate-y-1/2 h-16 w-1 rounded-l-full',
          'bg-primary/40 group-hover:bg-primary/80 transition-all duration-200',
          isResizing && 'bg-primary h-24 w-1.5'
        )}
      />
      
      {/* Grip Lines */}
      <div className="absolute right-0.5 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-0.5 h-1 bg-primary rounded-full" />
        <div className="w-0.5 h-1 bg-primary rounded-full" />
        <div className="w-0.5 h-1 bg-primary rounded-full" />
      </div>
    </div>
  );
};

export default ResizeHandle;
