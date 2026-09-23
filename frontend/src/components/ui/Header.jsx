import React from 'react';

const Header = ({ sidebarWidth = 384 }) => {
  return (
    <header 
      style={{ left: `${sidebarWidth}px` }}
      className="fixed top-0 right-0 h-20 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-gutter-lg"
    >
      <div className="flex items-center gap-space-lg">
        <div className="flex items-center gap-space-sm bg-surface-container-high px-space-md py-space-sm rounded-lg">
          <span className="material-symbols-outlined text-primary text-[18px]">
            apartment
          </span>
          <span className="font-label-lg text-label-lg text-on-surface font-semibold">
            Grand Palace Resort & Spa ★★★★★
          </span>
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
            expand_more
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-space-xs text-on-surface-variant bg-surface-container-low px-space-md py-space-sm rounded-lg">
          <span className="material-symbols-outlined text-[18px] text-primary">
            schedule
          </span>
          <span className="font-label-md text-label-md tracking-wider text-on-surface">
            {new Date().toLocaleTimeString('vi-VN')} • GMT+7
          </span>
        </div>
      </div>
      <div className="flex items-center gap-space-lg">
        <button className="relative p-space-sm text-on-surface-variant hover:text-on-surface transition-colors rounded-lg hover:bg-surface-container">
          <span className="material-symbols-outlined text-[24px]">
            notifications
          </span>
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(242,202,80,0.6)]"></span>
        </button>
        <div className="h-8 w-[1px] bg-surface-container-high"></div>
        <div className="flex items-center gap-space-md">
          <div className="text-right hidden sm:block">
            <span className="block font-label-lg text-label-lg text-on-surface font-semibold">
              Trần Thái Khiêm
            </span>
            <span className="block font-label-sm text-label-sm text-primary uppercase tracking-wider">
              Quản trị hệ thống
            </span>
          </div>
          <img
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA84QaAnq1uM-ytFYqrkEE55SPKO5rKzTBOJZvgi2cFcmWk3b2i-fBEunEYOcrQjjHJBlEXXJvxGmr9E6-niSdqmwcg6CASYunMSo8vd23_Wcv83qg9CeGvj8CoqXWzji9wDOW4keonHDlwJ2aRlCkEYa9r16PUY_SnMHCt3XkVLiCMA171dx0NNIHrhW55GgTxbgvOd5B4_IVBtSmQ7ViWwar6ezjYkmmuWT-4gjdoq7VY8jfzsVDkpA"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
