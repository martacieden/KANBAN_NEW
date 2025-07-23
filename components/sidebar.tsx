import { Home, Users, ArrowUpRight, List, Layers, DollarSign, MoreHorizontal, HelpCircle } from "lucide-react";

const menu = [
  { icon: <Home size={18} />, label: "Home" },
  { icon: <Users size={18} />, label: "Clients" },
  { icon: <ArrowUpRight size={18} />, label: "Decisions" },
  { icon: <List size={18} />, label: "Tasks", active: true },
  { icon: <Layers size={18} />, label: "Objects" },
  { icon: <DollarSign size={18} />, label: "Budgets" },
  { icon: <MoreHorizontal size={18} />, label: "More" },
];

export default function Sidebar() {
  return (
    <aside className="flex flex-col h-screen w-[72px] bg-white border-r items-center pt-4 pb-2">
      {/* Logo */}
      <div className="mb-3 flex flex-col items-center">
        <div className="bg-blue-100 rounded-xl p-1 flex flex-col items-center">
          <div className="bg-blue-500 rounded-lg w-7 h-7 flex items-center justify-center"></div>
        </div>
        <div className="mt-1 text-[10px] font-semibold tracking-widest text-center">WAY2B1</div>
      </div>
      {/* Menu */}
      <nav className="flex-1 flex flex-col gap-1 items-center w-full mt-2">
        {menu.map((item, i) => (
          <button
            key={item.label}
            className={`flex flex-col items-center w-full py-1 gap-0.5 transition
              ${item.active ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-500 hover:bg-gray-100"}
              ${i === 3 ? "rounded-xl" : ""}
            `}
          >
            {item.icon}
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
      </nav>
      {/* Help at bottom */}
      <div className="mt-auto mb-1 flex flex-col items-center w-full">
        <button className="flex flex-col items-center w-full py-2 text-gray-400 hover:text-blue-600 transition">
          <HelpCircle size={18} />
          <span className="text-[10px]">Help</span>
        </button>
      </div>
    </aside>
  );
} 