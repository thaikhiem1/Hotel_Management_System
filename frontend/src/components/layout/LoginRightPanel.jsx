import { useState } from "react";
import LoginForm from "../hotel/LoginForm";
import LanguageToggle from "../ui/LanguageToggle";
import { Link } from "react-router-dom";
function LoginRightPanel({ language, setLanguage }) {
  return (
    <div className="relative lg:col-span-6 flex flex-col justify-between p-6 sm:p-12 lg:p-20 bg-surface-container-lowest/90 backdrop-blur-xl min-h-screen">
      {/* Top Action Row: Multi-Property Badge & Language Toggle */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant shadow-sm">
          <span className="material-symbols-outlined text-primary text-base">
            domain
          </span>
          <span className="text-sm font-label-sm text-label-sm tracking-wider uppercase text-on-surface font-semibold">
            Cụm Khách Sạn: Hồ Chí Minh City
          </span>
        </div>

        {/* Language Selector */}
        <LanguageToggle language={language} setLanguage={setLanguage} />
      </div>

      {/* Center Form Canvas */}
      <div className="my-auto w-full max-w-md mx-auto py-8">
        {/* Header Monogram & Text */}
        <div className="mb-10 text-left">
          <h2 className="text-[30px] font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Đăng nhập hệ thống
          </h2>

          <p className="text-[20px] font-body-md text-body-md text-on-surface-variant mt-2">
            Vui lòng nhập thông tin xác thực để truy cập bảng điều khiển vận
            hành khách sạn.
          </p>
        </div>

        {/* Login Form Element */}
        <LoginForm />

        {/* Role Badges & Quick Context */}
        <div className="mt-8 pt-6 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
          <span className="text-on-surface-variant/60">
            Quyền truy cập hợp lệ:
          </span>
          <div className="flex gap-2">
            <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
              Admin
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
              Nhân viên lễ tân
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
              Quản lý
            </span>
          </div>
        </div>
      </div>

      {/* Footer Security Notice & IT Desk */}
      <div className="w-full max-w-md mx-auto pt-6 text-center lg:text-left flex flex-col sm:flex-row items-center justify-between gap-3 text-on-surface-variant/70 font-body-sm text-body-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm material-symbols-outlined text-primary">
            support_agent
          </span>
          <span>
            Bộ phận CNTT Khách sạn <strong className="text-lg">Team 10</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoginRightPanel;
