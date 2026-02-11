"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogIn,
  Cloud,
  Menu,
  X,
  MapPin,
  Mountain,
  BookOpen,
  Camera,
  Users,
  MessageCircle,
  ChevronRight,
  Home,
} from "lucide-react";

// Premium Sky & Cloud Theme
const SKY_THEME = {
  primary: "#0284C7",
  secondary: "#38BDF8",
  tertiary: "#7DD3FC",
  light: "#F0F9FF",
  veryLight: "#E0F2FE",
  dark: "#0C4A6E",
  gradient: "linear-gradient(135deg, #0284C7 0%, #38BDF8 50%, #7DD3FC 100%)",
  bgLight: "rgba(240, 249, 255, 0.97)",
  bgDark: "rgba(12, 74, 110, 0.92)",
  textPrimary: "#0F172A",
  textSecondary: "#334155",
  accent: "#F0F9FF",
  border: "rgba(125, 211, 252, 0.4)",
  shadowSoft: "0 10px 30px -12px rgba(2, 132, 199, 0.18)",
  glow: "0 0 35px rgba(56, 189, 248, 0.15)",
};

interface MainNavigationProps {
  scrolled: boolean;
}

export default function MainNavigation({ scrolled }: MainNavigationProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Destinations", path: "/destinations", icon: MapPin },
    { name: "Explore", path: "/explore", icon: Mountain },
    { name: "Blogs", path: "/blog", icon: BookOpen },
    { name: "Gallery", path: "/photos", icon: Camera },
    { name: "About", path: "/about", icon: Users },
    { name: "Contact", path: "/contact", icon: MessageCircle },
  ];

  return (
    <>
      {/* Global CSS Variables & Animations */}
      <style jsx global>{`
        :root {
          --primary: ${SKY_THEME.primary};
          --secondary: ${SKY_THEME.secondary};
          --tertiary: ${SKY_THEME.tertiary};
          --light: ${SKY_THEME.light};
          --very-light: ${SKY_THEME.veryLight};
          --dark: ${SKY_THEME.dark};
          --gradient: ${SKY_THEME.gradient};
          --bg-light: ${SKY_THEME.bgLight};
          --bg-dark: ${SKY_THEME.bgDark};
          --text-primary: ${SKY_THEME.textPrimary};
          --text-secondary: ${SKY_THEME.textSecondary};
          --accent: ${SKY_THEME.accent};
          --border: ${SKY_THEME.border};
          --shadow-soft: ${SKY_THEME.shadowSoft};
          --glow: ${SKY_THEME.glow};
        }

        @keyframes cloud-drift {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(6px) translateY(-2px); }
        }

        .animate-cloud { animation: cloud-drift 14s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <header
        className={`relative transition-all duration-500 border-b border-[var(--border)] ${
          scrolled
            ? "bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] backdrop-blur-xl shadow-[var(--shadow-soft)] py-3.5"
            : "bg-gradient-to-b from-[var(--light)] via-[var(--very-light)] to-transparent backdrop-blur-md py-4.5"
        }`}
      >
        {/* Subtle top glow border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--secondary)/60] to-transparent"></div>

        {/* Decorative cloud blobs */}
        <div className="absolute top-3 left-[12%] w-20 h-10 bg-[var(--tertiary)/12] rounded-full blur-xl animate-cloud"></div>
        <div className="absolute top-5 right-[18%] w-16 h-8 bg-[var(--secondary)/8] rounded-full blur-lg animate-cloud delay-3000"></div>

        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Name – WONDER travelers */}
            <Link href="/" className="flex flex-col items-start group">
              <h1
                className="
                  text-4xl sm:text-5xl md:text-6xl lg:text-7xl 
                  font-extrabold tracking-tight 
                  text-[var(--primary)] 
                  leading-none
                  group-hover:text-[var(--secondary)] transition-colors duration-300
                "
              >
                WONDER
              </h1>
              <p
                className="
                  text-xl sm:text-2xl md:text-3xl lg:text-4xl 
                  font-semibold tracking-wide 
                  text-[var(--secondary)] 
                  -mt-1 sm:-mt-2
                  opacity-90
                "
              >
                travelers
              </p>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 bg-white/75 dark:bg-slate-900/65 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-[var(--border)] shadow-sm">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`group relative px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${
                      isActive
                        ? "text-[var(--primary)] dark:text-[var(--secondary)]"
                        : "text-[var(--text-secondary)] dark:text-slate-300 hover:text-[var(--primary)] dark:hover:text-[var(--secondary)]"
                    }`}
                  >
                    <div className="relative flex items-center gap-2">
                      <Icon size={16} className={isActive ? "text-[var(--primary)] dark:text-[var(--secondary)]" : ""} />
                      <span className="font-semibold tracking-wide">{item.name}</span>
                    </div>

                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--secondary)]"></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right side controls */}
            <div className="flex items-center gap-4">
              {/* Login Button – hidden below lg */}
              <div className="hidden lg:block relative">
                <button
                  onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                  className="group relative px-6 py-2.5 rounded-xl font-semibold text-white shadow-md hover:shadow-[var(--glow)] transition-all duration-300 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"
                >
                  <div className="absolute inset-0 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  <div className="relative flex items-center gap-2">
                    <LogIn size={17} />
                    <span>Login</span>
                  </div>
                </button>

                {/* Login dropdown – remains unchanged */}
                {isLoginDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl border border-[var(--border)] bg-white dark:bg-slate-900 overflow-hidden z-50">
                    <div className="p-6 bg-gradient-to-br from-[var(--very-light)] to-[var(--light)] border-b border-[var(--border)] dark:from-slate-800 dark:to-slate-900">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] shadow-md">
                          <Cloud size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-[var(--text-primary)] dark:text-white">Welcome Back</h3>
                          <p className="text-sm text-[var(--text-secondary)] dark:text-slate-300">Sign in to explore more</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <button className="w-full flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--secondary)] bg-white/60 dark:bg-slate-800/60 hover:bg-[var(--very-light)] dark:hover:bg-slate-700 transition-all group">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] group-hover:scale-105 transition-transform">
                          <LogIn className="text-white" size={20} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-[var(--text-primary)] dark:text-white">Sign In</div>
                          <div className="text-xs text-[var(--text-secondary)] dark:text-slate-300">Access your adventures</div>
                        </div>
                        <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-secondary)] dark:text-slate-300" />
                      </button>

                      <button className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--secondary)] hover:bg-[var(--very-light)/50] dark:hover:bg-slate-800/50 transition-all group">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-[var(--secondary)] to-[var(--tertiary)] group-hover:scale-105 transition-transform">
                          <Users className="text-white" size={20} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-[var(--text-primary)] dark:text-white">Create Account</div>
                          <div className="text-xs text-[var(--text-secondary)] dark:text-slate-300">Join the journey</div>
                        </div>
                        <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-secondary)] dark:text-slate-300" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-md hover:shadow-lg transition-all"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[100] transition-all duration-500 lg:hidden ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-black/30 backdrop-blur-md"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <div
          className={`absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white dark:bg-slate-950 shadow-2xl transform transition-transform duration-500 ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="relative h-full overflow-y-auto">
            {/* Mobile Header – with WONDER travelers */}
            <div className="sticky top-0 z-10 px-5 py-3.5 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col">
                  <h1
                    className="
                      text-4xl sm:text-5xl 
                      font-extrabold tracking-tight 
                      text-[var(--primary)] 
                      leading-none
                    "
                  >
                    WONDER
                  </h1>
                  <p
                    className="
                      text-xl sm:text-2xl 
                      font-semibold tracking-wide 
                      text-[var(--secondary)]
                      -mt-1
                    "
                  >
                    travelers
                  </p>
                </Link>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={28} className="text-gray-700 dark:text-gray-200" />
                </button>
              </div>
            </div>

            {/* Mobile Nav Items */}
            <div className="px-4 py-2 space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base font-medium ${
                      isActive
                        ? "bg-gradient-to-r from-[var(--very-light)] to-[var(--light)] dark:from-slate-800 dark:to-slate-900 text-[var(--primary)] dark:text-[var(--secondary)]"
                        : "hover:bg-gray-50 dark:hover:bg-slate-800/70 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-md ${
                        isActive
                          ? "bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]"
                          : "bg-gray-100 dark:bg-slate-800"
                      }`}
                    >
                      <Icon size={20} className={isActive ? "text-white" : "text-[var(--primary)] dark:text-[var(--secondary)]"} />
                    </div>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Login Actions */}
            <div className="px-5 py-5 border-t border-gray-200 dark:border-slate-800">
              <div className="space-y-2.5">
                <button className="w-full py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:brightness-110 transition-all">
                  Sign In
                </button>
                <button className="w-full py-3.5 rounded-xl font-semibold border-2 border-[var(--secondary)] text-[var(--primary)] dark:text-[var(--secondary)] hover:bg-gradient-to-r hover:from-[var(--primary)] hover:to-[var(--secondary)] hover:text-white transition-all">
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Close login dropdown */}
      {isLoginDropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsLoginDropdownOpen(false)} />
      )}
    </>
  );
}