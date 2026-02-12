"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LogIn,
  Menu,
  X,
  MapPin,
  Mountain,
  BookOpen,
  Camera,
  Users,
  MessageCircle,
  Home,
} from "lucide-react";

interface MainNavigationProps {
  scrolled: boolean;
}

export default function MainNavigation({ scrolled }: MainNavigationProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "News", path: "/news", icon: MapPin },
    { name: "Explore", path: "/explore", icon: Mountain },
    { name: "Blogs", path: "/blog", icon: BookOpen },
    { name: "Gallery", path: "/photos", icon: Camera },
    { name: "About", path: "/about", icon: Users },
    { name: "Contact", path: "/contact", icon: MessageCircle },
  ];

  return (
    <>
      {/* Header - below infobar */}
      <header
        className={`w-full transition-all duration-300 ${
          scrolled 
            ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 py-2.5" 
            : "bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/50 py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo - increased font size */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-11 h-11 sm:w-12 sm:h-12">
                <div className="relative w-full h-full rounded-xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800 p-2 group-hover:border-sky-400 transition-colors">
                  <Image
                    src="/logo.png"
                    alt="WONDER travelers"
                    fill
                    className="object-contain"
                    priority
                    sizes="48px"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold text-sky-600 dark:text-sky-400 leading-tight tracking-wide">
                  WONDER
                </span>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  travelers
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - centered */}
            <nav className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-1 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`relative px-4 py-2 rounded-xl transition-all ${
                        isActive
                          ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-white/80 dark:hover:bg-slate-900/80"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={17} />
                        <span className="text-sm font-semibold tracking-wide">{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Desktop Login - increased font */}
              <Link
                href="/login"
                className="hidden lg:flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                <LogIn size={17} />
                <span>Login</span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-colors shadow-sm"
                aria-label="Open menu"
              >
                <Menu size={21} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-[100] lg:hidden transition-all duration-300 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sidebar */}
        <div
          className={`absolute top-0 right-0 h-full w-[300px] max-w-[90vw] bg-white dark:bg-slate-900 shadow-xl transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Header - increased font */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <Link 
                href="/" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="flex items-center gap-3"
              >
                <div className="relative w-9 h-9">
                  <div className="relative w-full h-full rounded-lg bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800 p-1.5">
                    <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-sky-600 dark:text-sky-400">
                    WONDER
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    travelers
                  </span>
                </div>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close menu"
              >
                <X size={21} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Navigation Items - increased font & spacing */}
            <div className="flex-1 overflow-y-auto py-5 px-4">
              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                        isActive
                          ? "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-sky-800/50"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-base font-medium">{item.name}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Login - increased font */}
              <div className="mt-8 pt-5 border-t border-slate-200 dark:border-slate-800">
                <div className="px-2 space-y-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2.5 w-full px-4 py-3.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
                  >
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2.5 w-full px-4 py-3.5 border-2 border-sky-500 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 text-sm font-semibold rounded-xl transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
                <p className="mt-6 text-xs text-center text-slate-500 dark:text-slate-500">
                  Discover amazing destinations in Nepal
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}