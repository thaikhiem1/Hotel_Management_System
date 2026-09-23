import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ResetPasswordForm - Password Reset Form Component
 * Handles password reset with strength validation and confirmation matching
 */
function ResetPasswordForm() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthText, setStrengthText] = useState('Độ an toàn mật khẩu');
  const [strengthClass, setStrengthClass] = useState('font-label-sm text-secondary/70');
  const [matchStatus, setMatchStatus] = useState('TRÙNG KHỚP');
  const [matchClass, setMatchClass] = useState('font-label-sm text-secondary/60');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    if (field === 'new') {
      setShowNewPassword(!showNewPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  // Update password strength
  const updatePasswordStrength = (value) => {
    if (!value || value.length === 0) {
      setPasswordStrength(0);
      setStrengthText('Độ an toàn mật khẩu');
      setStrengthClass('font-label-sm text-secondary/70');
      return;
    }

    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value) && /[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    setPasswordStrength(score);

    if (score === 1) {
      setStrengthText('Mức độ: Yếu');
      setStrengthClass('font-label-sm text-error');
    } else if (score === 2) {
      setStrengthText('Mức độ: Trung bình');
      setStrengthClass('font-label-sm text-primary');
    } else if (score === 3) {
      setStrengthText('Mức độ: Rất an toàn');
      setStrengthClass('font-label-sm text-primary font-semibold');
    }
  };

  // Check password match
  const checkPasswordMatch = (confirmValue) => {
    if (!confirmValue) {
      setMatchStatus('TRÙNG KHỚP');
      setMatchClass('font-label-sm text-secondary/60');
      return;
    }

    if (newPassword === confirmValue) {
      setMatchStatus('HỢP LỆ');
      setMatchClass('font-label-sm text-primary font-semibold');
    } else {
      setMatchStatus('CHƯA TRÙNG');
      setMatchClass('font-label-sm text-error');
    }
  };

  // Handle password change
  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    updatePasswordStrength(value);
    if (confirmPassword) {
      checkPasswordMatch(confirmPassword);
    }
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    checkPasswordMatch(value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp với mật khẩu mới. Vui lòng kiểm tra lại.');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessToast(true);
      setIsSuccess(true);
      setTimeout(() => {
        setShowSuccessToast(false)
        navigate('/login')
      }, 4000);
    }, 1000);
  };

  // Get strength bar classes
  const getStrengthBarClass = (barIndex) => {
    const baseClass = 'h-full w-1/3 transition-colors duration-300';
    if (passwordStrength >= barIndex) {
      if (passwordStrength === 1) return `${baseClass} bg-error`;
      return `${baseClass} bg-primary`;
    }
    return `${baseClass} bg-surface-container-highest`;
  };

  return (
    <>
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* 1. Username Field */}
        <div className="space-y-2">
          <label
            className="flex items-center justify-between font-label-md text-on-surface-variant"
            htmlFor="username"
          >
            <span>TÊN ĐĂNG NHẬP</span>
            <span className="font-label-sm text-secondary/60">BẮT BUỘC</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-secondary">
              <span className="material-symbols-outlined text-xl">account_circle</span>
            </div>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập hoặc mã nhân viên"
              required
              className="w-full bg-surface-container-lowest text-on-surface font-body-md pl-11 pr-4 py-3.5 rounded-lg focus:outline-none focus:bg-surface-container-low transition-all placeholder:text-secondary/40 shadow-inner"
            />
          </div>
        </div>

        {/* 2. New Password Field */}
        <div className="space-y-2">
          <label
            className="flex items-center justify-between font-label-md text-on-surface-variant"
            htmlFor="new-password"
          >
            <span>MẬT KHẨU MỚI</span>
            <span className="font-label-sm text-secondary/60">TỐI THIỂU 8 KÝ TỰ</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-secondary">
              <span className="material-symbols-outlined text-xl">lock</span>
            </div>
            <input
              type={showNewPassword ? 'text' : 'password'}
              id="new-password"
              name="newPassword"
              value={newPassword}
              onChange={handleNewPasswordChange}
              minLength={8}
              placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
              required
              className="w-full bg-surface-container-lowest text-on-surface font-body-md pl-11 pr-12 py-3.5 rounded-lg focus:outline-none focus:bg-surface-container-low transition-all placeholder:text-secondary/40 shadow-inner"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              aria-label="Ẩn hiện mật khẩu"
              className="absolute right-3 p-1.5 text-secondary hover:text-primary transition-colors focus:outline-none"
            >
              <span className="material-symbols-outlined text-xl">
                {showNewPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          {/* Password Strength Visualizer */}
          <div className="pt-1.5 space-y-1.5">
            <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden flex gap-1">
              <div className={getStrengthBarClass(1)} />
              <div className={getStrengthBarClass(2)} />
              <div className={getStrengthBarClass(3)} />
            </div>
            <div className="flex items-center justify-between font-label-sm text-secondary/70">
              <span className={strengthClass}>{strengthText}</span>
              <span>Chữ hoa, số &amp; ký hiệu đặc biệt</span>
            </div>
          </div>
        </div>

        {/* 3. Confirm Password Field */}
        <div className="space-y-2">
          <label
            className="flex items-center justify-between font-label-md text-on-surface-variant"
            htmlFor="confirm-password"
          >
            <span>XÁC NHẬN MẬT KHẨU MỚI</span>
            <span className={matchClass}>{matchStatus}</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-secondary">
              <span className="material-symbols-outlined text-xl">lock_reset</span>
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirm-password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="Nhập lại mật khẩu mới"
              required
              className="w-full bg-surface-container-lowest text-on-surface font-body-md pl-11 pr-12 py-3.5 rounded-lg focus:outline-none focus:bg-surface-container-low transition-all placeholder:text-secondary/40 shadow-inner"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              aria-label="Ẩn hiện mật khẩu xác nhận"
              className="absolute right-3 p-1.5 text-secondary hover:text-primary transition-colors focus:outline-none"
            >
              <span className="material-symbols-outlined text-xl">
                {showConfirmPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        {/* Primary CTA Action */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isSubmitting || isSuccess}
            className={`group w-full py-4 px-6 rounded-lg font-label-lg uppercase tracking-wider transition-all duration-300 shadow-xl flex items-center justify-center gap-2 transform active:scale-[0.99] ${
              isSuccess
                ? 'bg-surface-container-high text-primary cursor-default'
                : 'bg-primary hover:bg-primary-fixed-dim text-on-primary'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">
                  progress_activity
                </span>
                <span>ĐANG XỬ LÝ...</span>
              </>
            ) : isSuccess ? (
              <>
                <span className="material-symbols-outlined text-lg">check</span>
                <span>ĐÃ CẬP NHẬT</span>
              </>
            ) : (
              <>
                <span>CẬP NHẬT MẬT KHẨU</span>
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </div>

        {/* Back to Login Navigation */}
        <div className="text-center pt-2">
          <a
            className="inline-flex items-center gap-2 font-label-md text-secondary hover:text-primary py-2 px-3 rounded-lg hover:bg-surface-container-high/40 transition-all duration-200"
            href="/login"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Quay lại màn hình đăng nhập</span>
          </a>
        </div>
      </form>

      {/* Success Toast Notification */}
      {showSuccessToast && (
        <div className="mt-4 p-4 rounded-lg bg-surface-container-high text-primary flex items-start gap-3 transition-all duration-300 animate-fade-in">
          <span className="material-symbols-outlined text-primary mt-0.5">check_circle</span>
          <div>
            <p className="font-label-md text-primary">Yêu cầu được chấp thuận</p>
            <p className="font-body-sm text-secondary">
              Mật khẩu của bạn đã được cập nhật thành công. Vui lòng đăng nhập lại.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default ResetPasswordForm;
