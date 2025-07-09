import React, { useState } from "react";
import {
  Home,
  User,
  Settings,
  Mail,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  FileText,
  Users,
  BarChart3,
  Calendar,
  Heart,
  Grid3x3,
} from "lucide-react";
import hindLogo from '../Assets/hindimg.png';
import { Link } from "react-router-dom"; // Add this import
import MyRequests from "../Pages/AdminPages/Approval";
import { Outlet } from "react-router-dom"; // Import Outlet for nested routes
const SidebarNavbar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: BarChart3, label: "Analytics", href: "/about", badge: "23" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-800/95  border-b border-slate-700/50 z-50 shadow-lg">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center space-x-4">
            {/* Hamburger Menu */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors duration-200 group"
            >
              <div className="space-y-1">
                <div
                  className={`w-5 h-0.5 bg-lime-400 transition-all duration-300 ${
                    isOpen ? "rotate-45 translate-y-1.5" : ""
                  }`}
                ></div>
                <div
                  className={`w-5 h-0.5 bg-lime-400 transition-all duration-300 ${
                    isOpen ? "opacity-0" : ""
                  }`}
                ></div>
                <div
                  className={`w-5 h-0.5 bg-lime-400 transition-all duration-300 ${
                    isOpen ? "-rotate-45 -translate-y-1.5" : ""
                  }`}
                ></div>
              </div>
            </button>

            {/* Logo */}
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img src={hindLogo} alt="Hind Logo" className="h-12 w-auto object-contain" />
          </div>
          </div>

          {/* Right side of navbar */}
          {/* <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-64 bg-slate-700 rounded-lg border-0 focus:ring-2 focus:ring-lime-400 focus:bg-slate-600 transition-all duration-200 text-white placeholder-slate-400"
              />
            </div>

            <button className="p-2 rounded-lg hover:bg-slate-700 transition-colors duration-200 relative">
              <Bell className="w-5 h-5 text-slate-300" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-lime-400 rounded-full"></span>
            </button>

            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200">
              <User className="w-5 h-5 text-white" />
            </div>
          </div> */}
        </div>
      </nav>

      <div className="flex flex-1 pt-16">
        {/* Sidebar Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-slate-800 shadow-2xl z-50 transition-all duration-300 ease-in-out border-r border-slate-700 ${
            isOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Grid3x3 className="w-6 h-6 text-white" />
                  </div>
                  <div
                    className={`transition-all duration-300 ${
                      isOpen ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <h2 className="text-lg font-bold text-lime-400">
                      Dashboard
                    </h2>
                    <p className="text-sm text-slate-400">Welcome back</p>
                  </div>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-1 rounded-lg hover:bg-slate-700 transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-2 px-4">
                {menuItems.map((item, index) => (
                  <div
                    key={item.label}
                    className={`transition-all duration-300 ${
                      isOpen
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-4"
                    }`}
                    style={{
                      transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
                    }}
                  >
                    <Link
                      to={item.href}
                      className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-700 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-slate-700 group-hover:bg-slate-600 transition-all duration-200">
                          <item.icon className="w-5 h-5 text-slate-400 group-hover:text-lime-400" />
                        </div>
                        <span className="font-medium text-slate-300 group-hover:text-white">
                          {item.label}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {item.badge && (
                          <span className="bg-lime-400 text-slate-800 text-xs px-2 py-1 rounded-full font-medium">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-lime-400 transition-colors duration-200" />
                      </div>
                    </Link>
                  </div>
                ))}
              </nav>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-slate-700">
              <div
                className={`transition-all duration-300 ${
                  isOpen ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-700">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">John Doe</p>
                    <p className="text-sm text-slate-400">
                      john@hindterminals.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className="flex-1 ml-0 transition-all duration-300 p-6"
          style={{ marginLeft: isOpen ? 0 : 0, marginTop: 0 }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SidebarNavbar;
