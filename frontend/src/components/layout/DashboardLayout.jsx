import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../ui/Sidebar';
import Header from '../ui/Header';

const DashboardLayout = () => {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const savedWidth = localStorage.getItem('sidebarWidth');
    return savedWidth ? parseInt(savedWidth) : 384;
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onWidthChange={setSidebarWidth} />
      <div 
        style={{ paddingLeft: `${sidebarWidth}px` }}
        className="transition-[padding] duration-0"
      >
        <Header sidebarWidth={sidebarWidth} />
        <main className="w-full pt-20 px-gutter-lg pb-margin-lg bg-surface min-h-screen">
          <div className="flex flex-col w-full gap-space-lg py-space-lg">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
