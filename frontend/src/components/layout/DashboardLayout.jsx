import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { getInitialSidebarWidth } from "@/utils/sidebarWidth";
import { DESKTOP_QUERY, useMediaQuery } from "@/utils/useMediaQuery";

const DashboardLayout = () => {
  const [sidebarWidth, setSidebarWidth] = useState(getInitialSidebarWidth);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [drawerRequested, setDrawerRequested] = useState(false);

  // Ngăn kéo chỉ có trên mobile/tablet; lên màn hình lớn thì thanh bên cố định
  const drawerOpen = drawerRequested && !isDesktop;
  const closeDrawer = () => setDrawerRequested(false);

  // Đang mở ngăn kéo: nhấn Esc để đóng, khóa cuộn nền phía sau
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setDrawerRequested(false);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  const offset = isDesktop ? sidebarWidth : 0;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        onWidthChange={setSidebarWidth}
        isDesktop={isDesktop}
        isOpen={drawerOpen}
        onClose={closeDrawer}
      />
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[45] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}
      <div
        style={{ paddingLeft: `${offset}px` }}
        className="min-w-0 transition-[padding] duration-0"
      >
        <Header sidebarWidth={offset} onMenuClick={() => setDrawerRequested(true)} />
        <main className="w-full min-w-0 pt-20 px-gutter-mobile md:px-gutter-tablet lg:px-gutter pb-space-xl bg-surface min-h-screen">
          <div className="flex flex-col w-full min-w-0 gap-space-lg py-space-md md:py-space-lg">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
