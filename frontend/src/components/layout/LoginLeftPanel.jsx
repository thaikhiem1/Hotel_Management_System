function LoginLeftPanel() {
  return (
    <div className="relative lg:col-span-6 flex flex-col justify-between p-8 sm:p-12 lg:p-16 min-h-[520px] lg:min-h-screen overflow-hidden">
      {/* Background Luxury Hotel Image with Scrim Gradient */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out scale-105 hover:scale-100 z-0"
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDHcA53nvLnNZrAh5Qoq9pdRHCa3OW_f9hniZgvl4NUzrokDxhzPmFq6twh0yJK2js_TjnZu4uJlaQNhpi2A04ym7j4ULPN6jxQ08q3-GeNtmUrYVZWwjc-QWHNNsD6IhrqHIvJ6FW0ltatbuBjIkQASaESV9qKXLIHko2vhTd9rwq7Rfb4H5d7VmpgQZv3RmSK6W8RId7KOve4PYdnNmpZD0C8Z_d3EwmEY6kLk1czqh1wfpUgepPK')",
        }}
        role="img"
        aria-label="Sumptuous interior of luxury five-star hotel lobby Grand Astoria with warm golden ambient chandelier lighting, polished Italian marble floors, ornate classical staircase, intimate concierge counter, and guests relaxing in velvet armchairs with deep emerald and obsidian tones."
      />

      {/* Duotone Atmospheric Scrim Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-surface-dim/80 to-surface-dim/40 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-at-c from-transparent via-background/40 to-background/90 z-10 pointer-events-none" />

      {/* Top Branding Crest */}
      <div className="relative z-20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-container-high/80 backdrop-blur-md flex items-center justify-center text-primary shadow-xl">
          <span className="material-symbols-outlined text-primary text-2xl">
            hotel_class
          </span>
        </div>
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">
            Luxury Operations System
          </span>
          <p className="font-headline-sm text-headline-sm text-on-surface tracking-wide">
            Grand Palace
          </p>
        </div>
      </div>

      {/* Middle Architectural Editorial Quote */}
      <div className="relative z-20 my-auto py-12 max-w-xl">
        <blockquote className="text-[20px] pl-4 italic font-headline-sm text-headline-sm text-secondary-fixed/90">
          "Hệ Thống Quản Trị &amp; Vận Hành Khách Sạn Cao Cấp. Đẳng cấp phục vụ,
          chuẩn mực trải nghiệm quốc tế."
        </blockquote>
      </div>

      {/* Bottom Trust Badges & System Specs */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 pt-6 text-on-surface-variant/80 font-body-sm text-body-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base">
            verified_user
          </span>
          <span>Bảo mật an toàn, Phục vụ 24/7</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 rounded bg-surface-container-highest/60 text-secondary font-label-sm text-label-sm uppercase tracking-wider">
            Liên hệ ngay: 19001508
          </span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default LoginLeftPanel;
