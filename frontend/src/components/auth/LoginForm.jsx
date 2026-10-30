import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // 'success' or 'error'

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setAlertMessage("");
    setAlertType("");

    try {
      const user = await login(username.trim(), password, rememberMe);
      setAlertType("success");
      setAlertMessage(
        `Xin chào ${user.employee?.fullName || user.username}. Đang chuyển hướng PMS...`,
      );
      setTimeout(() => {
        setAlertMessage("");
        navigate(location.state?.from?.pathname || "/dashboard", {
          replace: true,
        });
      }, 600);
    } catch (error) {
      setAlertType("error");
      setAlertMessage(
        error.response?.data?.message ||
          "Không thể kết nối máy chủ. Vui lòng thử lại.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Field 1: Username / Staff ID */}
        <div className="space-y-2">
          <label
            className="flex items-center justify-between font-label-lg text-label-lg text-on-surface font-medium"
            htmlFor="username"
          >
            <span>Tên đăng nhập</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
              <span className="material-symbols-outlined text-lg">badge</span>
            </div>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              required
              autoComplete="username"
              className="w-full pl-11 pr-4 py-3.5 bg-surface-container text-on-surface placeholder:text-on-surface-variant/40 rounded text-body-md font-body-md transition-all shadow-inner focus:outline-none focus:bg-surface-container-high focus:shadow-focus"
            />
          </div>
        </div>

        {/* Field 2: Password */}
        <div className="space-y-2">
          <label
            className="block font-label-lg text-label-lg text-on-surface font-medium"
            htmlFor="password"
          >
            Mật khẩu
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
              <span className="material-symbols-outlined text-lg">key</span>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu quản trị"
              required
              autoComplete="current-password"
              className="w-full pl-11 pr-11 py-3.5 bg-surface-container text-on-surface placeholder:text-on-surface-variant/40 rounded text-body-md font-body-md transition-all shadow-inner focus:outline-none focus:bg-surface-container-high focus:shadow-focus"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              title="Ẩn/hiện mật khẩu"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
            >
              <span className="material-symbols-outlined text-lg">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>

        {/* Options Row: Show Password Checkbox & Forgot Password Link */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                id="showPasswordCheck"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="peer appearance-none w-4 h-4 rounded-sm bg-surface-container-high checked:bg-primary checked:border-primary transition-all cursor-pointer"
              />
              <span className="material-symbols-outlined absolute text-[12px] text-on-primary pointer-events-none opacity-0 peer-checked:opacity-100 font-bold transition-opacity">
                check
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
              Hiển thị mật khẩu
            </span>
          </label>
          <Link
            to="/reset-password"
            className="font-label-lg text-label-lg text-primary hover:text-primary-fixed underline-offset-4 hover:underline transition-all"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Secondary Row: Remember Session */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="peer appearance-none w-4 h-4 rounded-sm bg-surface-container-high checked:bg-primary checked:border-primary transition-all cursor-pointer"
            />
            <span className="material-symbols-outlined absolute text-[12px] text-on-primary pointer-events-none opacity-0 peer-checked:opacity-100 font-bold transition-opacity">
              check
            </span>
          </div>
          <label
            className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer select-none"
            htmlFor="rememberMe"
          >
            Ghi nhớ thông tin tôi
          </label>
        </div>

        {/* Action Button: Luxury Gold CTA */}
        <button
          type="submit"
          disabled={isLoading}
          className="relative w-full py-3.5 px-6 rounded bg-primary text-on-primary font-label-lg text-label-lg uppercase tracking-wider font-semibold transition-all duration-300 shadow-md hover:bg-primary-fixed-dim hover:shadow-glow-lg active:scale-[0.99] flex items-center justify-center gap-2 overflow-hidden disabled:opacity-80"
        >
          {isLoading ? (
            <>
              <span className="inline-block animate-spin material-symbols-outlined text-lg">
                progress_activity
              </span>
              <span>Đang Xác Thực Thông Tin...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-lg">lock</span>
              <span>Đăng Nhập Quản Trị</span>
            </>
          )}
        </button>
      </form>

      {/* Dynamic Feedback Message Container */}
      {alertMessage && (
        <div
          className={`mt-4 p-3 rounded font-body-sm text-body-sm flex items-center justify-center gap-2 ${
            alertType === "success"
              ? "bg-surface-container-high text-primary"
              : "bg-error-container text-on-error-container"
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {alertType === "success" ? "check_circle" : "error"}
          </span>
          <span>{alertMessage}</span>
        </div>
      )}
    </>
  );
}

export default LoginForm;
