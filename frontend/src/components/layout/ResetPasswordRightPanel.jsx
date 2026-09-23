import ResetPasswordForm from '../hotel/ResetPasswordForm';
import { Link } from 'react-router-dom';

/**
 * ResetPasswordRightPanel - Password Reset Interface
 * Right panel containing the password reset form and instructions
 */
function ResetPasswordRightPanel() {
  return (
    <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-10 xl:p-14 bg-surface-container-lowest/90 relative">
      {/* Decorative Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content */}
      <div>
        {/* Top Header & Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-primary">
            <span className="material-symbols-outlined text-base">shield</span>
            <span className="font-label-sm uppercase tracking-widest">
              CỔNG QUẢN TRỊ KHÁCH SẠN
            </span>
          </div>
        </div>

        {/* Main Title & Description */}
        <div className="mb-8">
          <h1 className="font-headline-md text-on-surface text-2xl sm:text-3xl mb-2">
            Khôi phục mật khẩu
          </h1>
          <p className="font-body-md text-secondary leading-relaxed">
            Vui lòng nhập tên đăng nhập và thiết lập mật khẩu mới cho tài khoản quản trị của bạn.
          </p>
        </div>

        {/* Password Reset Form */}
        <ResetPasswordForm />
      </div>
    </div>
  );
}

export default ResetPasswordRightPanel;
