import { Bell } from "lucide-react";

export default function TopBar() {
  return (
    <header className="w-full h-14 flex items-center justify-between px-6 border-b bg-white">
      {/* Пошук */}
      <div className="flex-1 flex items-center">
        <div className="relative w-80">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search..." className="pl-10 pr-2 py-2 w-full rounded bg-[#f9f9fb] text-[14px] border border-[#e8e8ec] focus:outline-none" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">⌘K</span>
        </div>
      </div>
      {/* Дії справа */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <Bell size={20} className="text-gray-500" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          <img src="/placeholder-user.svg" alt="User" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
} 