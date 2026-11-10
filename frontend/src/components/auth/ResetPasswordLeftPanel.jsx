/**
 * ResetPasswordLeftPanel - Hotel Imagery & Brand Heritage
 * Left panel with luxury hotel visuals and branding for password reset page
 */
import lobby from "@/assets/hotelbackground.jpg";

function ResetPasswordLeftPanel() {
  return (
    <div className="relative hidden lg:flex lg:col-span-6 flex-col justify-between p-10 xl:p-14 overflow-hidden min-h-[680px]">
      {/* Background Image with Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          alt="Grand Astoria Hotel Lobby"
          className="w-full h-full object-cover object-center scale-105 transform duration-1000 ease-out"
          src={lobby}
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/70 to-surface-container-lowest/30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-surface/40 to-surface-dim/95" />
      </div>

      {/* Center Emblem / Prestige Typography */}
      <div className="relative z-10 my-auto py-8">
        <div className="w-12 h-1 bg-primary mb-6" />
        <p className="font-label-sm uppercase tracking-widest text-primary mb-3">
          Khu Nghỉ Dưỡng &amp; Khách Sạn Cao Cấp
        </p>
        <h2 className="font-headline-lg text-on-surface text-3xl xl:text-4xl leading-tight mb-4">
          Grand Palace{' '}
          <span className="italic font-display-lg text-primary font-normal">
            Hotel &amp; Resorts
          </span>
        </h2>
        <p className="font-body-md text-secondary/80 max-w-md leading-relaxed">
          Hạ tầng quản lý tập trung dành riêng cho ban điều hành, bộ phận tiền sảnh và nhân sự cấp cao toàn hệ thống.
        </p>
      </div>

      {/* Bottom Status Bar */}
      <div className="relative z-10 pt-6 bg-surface-container-lowest/60 px-6 py-4 rounded-lg backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-body-sm text-on-surface">
            Cổng Máy Chủ Quản Trị Trung Tâm
          </span>
        </div>
        <span className="font-label-sm text-primary tracking-wider uppercase">
          Bảo Mật Cấp Cao
        </span>
      </div>
    </div>
  );
}

export default ResetPasswordLeftPanel;
