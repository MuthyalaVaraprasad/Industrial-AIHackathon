import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#070b13] flex flex-col justify-center items-center relative overflow-hidden">
      {/* Tech Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c1322_1px,transparent_1px),linear-gradient(to_bottom,#0c1322_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Main card container */}
      <div className="w-full max-w-md px-4 z-10">
        <Outlet />
      </div>

      <div className="absolute bottom-6 text-[10px] text-slate-600 font-mono">
        SECURE ENTERPRISE AUTHENTICATION CHANNEL
      </div>
    </div>
  );
}
