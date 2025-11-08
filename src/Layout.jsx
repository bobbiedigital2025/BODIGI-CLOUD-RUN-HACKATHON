import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Sparkles,
  Rocket,
  TrendingUp,
  Zap,
  Repeat,
  Menu,
  X,
  Cloud,
  User,
  LogOut
} from "lucide-react";
import SupaBrainAgent from './components/SupaBrainAgent';
import { base44 } from "@/api/base44Client";

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(userData => setUser(userData))
      .catch(() => setUser(null));
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "Dashboard", color: "blue" },
    { name: "Brand Builder", icon: Sparkles, path: "BrandBuilder", color: "green" },
    { name: "MVP Creator", icon: Rocket, path: "MVPCreator", color: "yellow" },
    { name: "Marketing", icon: TrendingUp, path: "Marketing", color: "pink" },
    { name: "Automation", icon: Zap, path: "AutomationHub", color: "purple" },
    { name: "Loop Builder", icon: Repeat, path: "LoopBuilder", color: "cyan" },
    { name: "Cloud Deploy", icon: Cloud, path: "CloudDeployment", color: "blue" },
  ];

  const colorMap = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-400 to-yellow-500",
    pink: "from-pink-500 to-pink-600",
    purple: "from-purple-500 to-purple-600",
    cyan: "from-cyan-500 to-cyan-600",
  };

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate(createPageUrl("Welcome"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <style>{`
        /* Text Contrast Improvements */
        /* Ensure dark boxes have light text */
        .bg-gray-900, .bg-gray-800, .bg-gray-950 {
          color: rgba(255, 255, 255, 0.95);
        }

        /* Override gray text on dark backgrounds for better visibility */
        .bg-gray-900 .text-gray-300,
        .bg-gray-800 .text-gray-300,
        .bg-gray-950 .text-gray-300 {
          color: rgba(255, 255, 255, 0.95) !important;
        }

        .bg-gray-900 .text-gray-400,
        .bg-gray-800 .text-gray-400,
        .bg-gray-950 .text-gray-400 {
          color: rgba(255, 255, 255, 0.75) !important;
        }

        /* Bright button gradients */
        .gold-gradient {
          background: linear-gradient(135deg, #fde047 0%, #facc15 50%, #fbbf24 100%);
          color: #000000 !important;
          font-weight: 700;
          box-shadow: 0 4px 20px rgba(250, 204, 21, 0.4);
        }
        .gold-gradient:hover {
          background: linear-gradient(135deg, #facc15 0%, #fbbf24 50%, #f59e0b 100%);
          box-shadow: 0 6px 30px rgba(250, 204, 21, 0.6);
          transform: translateY(-2px);
        }
        .mint-gradient {
          background: linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 50%, #5eead4 100%);
          color: #000000 !important;
          font-weight: 700;
          box-shadow: 0 4px 20px rgba(110, 231, 183, 0.5);
        }
        .mint-gradient:hover {
          background: linear-gradient(135deg, #6ee7b7 0%, #5eead4 50%, #2dd4bf 100%);
          box-shadow: 0 6px 30px rgba(110, 231, 183, 0.7);
          transform: translateY(-2px);
        }
        .green-gradient {
          background: linear-gradient(135deg, #6ee7b7 0%, #34d399 50%, #10b981 100%);
          color: #000000 !important;
          font-weight: 700;
          box-shadow: 0 4px 20px rgba(52, 211, 153, 0.4);
        }
        .green-gradient:hover {
          background: linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%);
          box-shadow: 0 6px 30px rgba(52, 211, 153, 0.6);
          transform: translateY(-2px);
        }
        .yellow-gradient {
          background: linear-gradient(135deg, #fef08a 0%, #fde047 50%, #facc15 100%);
          color: #000000 !important;
          font-weight: 700;
          box-shadow: 0 4px 20px rgba(253, 224, 71, 0.5);
        }
        .yellow-gradient:hover {
          background: linear-gradient(135deg, #fde047 0%, #facc15 50%, #eab308 100%);
          box-shadow: 0 6px 30px rgba(253, 224, 71, 0.7);
          transform: translateY(-2px);
        }
        .glow-gold {
          filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.6));
        }
        
        /* Card backgrounds */
        .glass-dark {
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(251, 191, 36, 0.2);
        }
      `}</style>

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-yellow-500/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl("Welcome")} className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-green-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-gray-900" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-green-400 bg-clip-text text-transparent">
                BoDiGi™
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.path;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.path)}
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`
                      relative px-4 py-2 rounded-lg transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-r ' + colorMap[item.color] + ' text-white shadow-lg scale-105' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center gap-3">
              {user && (
                <>
                  <Link to={createPageUrl("Profile")}>
                    <Button variant="outline" size="sm" className="mint-gradient border-2 border-teal-300">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-yellow-500/30">
              <div className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPageName === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={createPageUrl(item.path)}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                        ${isActive 
                          ? 'bg-gradient-to-r ' + colorMap[item.color] + ' text-white shadow-lg' 
                          : 'text-gray-300 hover:bg-white/10'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
                {user && (
                  <>
                    <Link
                      to={createPageUrl("Profile")}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10"
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>

      {/* Support Agent */}
      <SupaBrainAgent />
    </div>
  );
}