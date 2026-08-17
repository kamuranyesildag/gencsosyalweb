import { NavLink } from "react-router";
import { useAuthStore } from "../context/useAuth";
import { Home, Search, Bell, Mail, Bookmark, Users, Settings, UserCircle, LogOut, Hexagon, ShieldAlert, Rocket } from "lucide-react";

export function Sidebar() {
  const { user, logout } = useAuthStore();

  const navItems = [
    { name: "Ana Sayfa", path: "/home", icon: Home },
        { name: "Keşfet", path: "/explore", icon: Search },
    { name: "Projeler", path: "/projects", icon: Rocket },
    { name: "Bildirimler", path: "/notifications", icon: Bell },
    { name: "Mesajlar", path: "/messages", icon: Mail },
    { name: "Kaydedilenler", path: "/bookmarks", icon: Bookmark },
    { name: "Topluluklar", path: "/communities", icon: Users },
    { name: "Profil", path: `/profile/${user?.username}`, icon: UserCircle },
    { name: "Ayarlar", path: "/settings", icon: Settings },
  ];

  if (user?.role === "ADMIN") {
    navItems.push({ name: "Admin Paneli", path: "/admin", icon: ShieldAlert });
  }

  return (
    <div className="flex flex-col h-full py-6 px-4 xl:px-6">
      <div className="flex-1 flex flex-col gap-1.5">
        <NavLink to="/home" className="flex items-center gap-3 px-4 py-3 mb-6 transition-transform hover:scale-105 origin-left">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-200">
            <Hexagon className="w-6 h-6 fill-current" />
          </div>
          <span className="text-2xl font-black tracking-tight text-gray-900 hidden xl:block">Genç Sosyal</span>
        </NavLink>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 text-lg group ${
                isActive
                  ? "bg-gray-900 text-white font-semibold shadow-lg shadow-gray-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-6 h-6 transition-transform group-hover:scale-110 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
                <span className="hidden xl:inline tracking-wide">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <button 
        onClick={() => logout()}
        className="flex items-center gap-4 px-4 py-4 rounded-2xl transition-colors text-lg text-red-500 hover:bg-red-50 hover:text-red-600 mt-auto group"
      >
        <LogOut className="w-6 h-6 stroke-[1.5] group-hover:stroke-2" />
        <span className="hidden xl:inline font-medium tracking-wide">Çıkış Yap</span>
      </button>
    </div>
  );
}
