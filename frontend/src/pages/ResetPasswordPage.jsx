import ResetPasswordLeftPanel from "../components/layout/ResetPasswordLeftPanel";
import ResetPasswordRightPanel from "../components/layout/ResetPasswordRightPanel";

function ResetPasswordPage() {
  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen relative selection:bg-primary selection:text-on-primary">
      {/* Background Radial Gradient Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_80%_-10%,rgba(27,42,74,0.3),transparent_70%)] z-0" />

      <main className="relative z-10 w-full min-h-screen bg-transparent flex flex-col justify-center">
        <div className="flex flex-col w-full">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12 flex items-center justify-center">
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 bg-surface-container-low rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
              {/* LEFT PANEL: Hotel Imagery & Heritage Brand Display */}
              <ResetPasswordLeftPanel />

              {/* RIGHT PANEL: Password Reset Form */}
              <ResetPasswordRightPanel />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ResetPasswordPage;
