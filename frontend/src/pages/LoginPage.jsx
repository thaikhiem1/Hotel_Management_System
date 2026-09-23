import { useState } from 'react';
import LoginLeftPanel from '../components/layout/LoginLeftPanel';
import LoginRightPanel from '../components/layout/LoginRightPanel';

/**
 * LoginPage - Grand Astoria Hotel Management System Login
 * Main authentication page with luxury hotel branding and secure access
 */
function LoginPage() {
  const [language, setLanguage] = useState('vn');

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen relative selection:bg-primary selection:text-on-primary">
      {/* Background Radial Gradient Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_80%_-10%,rgba(22, 32, 54, 0.3),transparent_70%)] z-0" />
      
      <main className="relative z-10 w-full min-h-screen bg-transparent flex flex-col justify-center">
        <div className="flex flex-col w-full">
          <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 relative overflow-hidden">
            {/* LEFT PANEL: Hero Visual & Prestige Brand Narrative (50% on desktop) */}
            <LoginLeftPanel />

            {/* RIGHT PANEL: Authentication Terminal & Concierge Login Form (50% on desktop) */}
            <LoginRightPanel language={language} setLanguage={setLanguage} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
