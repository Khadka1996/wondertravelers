"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiTiktok } from "react-icons/si";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: <FaFacebook size={18} />,
      href: "https://www.facebook.com/share/17gYmw6MMW/",
      label: "Facebook",
    },
    {
      icon: <FaXTwitter size={18} />,
      href: "https://x.com/WonderTrav90995",
      label: "Twitter",
    },
    {
      icon: <FaInstagram size={18} />,
      href: "https://www.instagram.com/wond_ertravelers?igsh=MXFsaTg2bGdqZDh0Ng==",
      label: "Instagram",
    },
    {
      icon: <FaYoutube size={18} />,
      href: "https://www.youtube.com/@WonderTravelers",
      label: "YouTube",
    },
    {
      icon: <SiTiktok size={18} />,
      href: "https://www.tiktok.com/@wonder.travelers?_r=1&_t=ZS-94nNvCFf8St",
      label: "TikTok",
    },
  ];

  const footerLinks = {
    quickLinks: [
      { name: "Home", path: "/" },
      { name: "News", path: "/news" },
      { name: "Explore", path: "/explore" },
      { name: "Blogs", path: "/blog" },
      { name: "Gallery", path: "/photos" },
    ],
    company: [
      { name: "About Us", path: "/about" },
      { name: "Contact", path: "/contact" },
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms of Service", path: "/terms" },
    ],
  };

  return (
    <footer className="w-full bg-white border-t border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
            {/* Brand Info - Wider column */}
            <div className="md:col-span-4 space-y-3">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-11 h-11 sm:w-12 sm:h-12">
                  <div className="relative w-full h-full rounded-xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800 p-2 group-hover:border-sky-400 transition-colors">
                    <Image
                      src="/logo.png"
                      alt="WONDER travelers"
                      fill
                      className="object-contain"
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
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
                Discover amazing travel experiences through blogs, photos, and destinations from travelers around the world. Join our community of adventure seekers.
              </p>
              {/* Social Links - In brand section */}
              <div className="flex items-center gap-2 pt-2">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 dark:hover:bg-sky-600 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-white transition-all"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-2 md:col-start-6">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {footerLinks.quickLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      href={link.path}
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <ChevronRight size={14} className="text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="md:col-span-2">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Company
              </h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.path}>
                    <Link
                      href={link.path}
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <ChevronRight size={14} className="text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="md:col-span-2">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Contact
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center flex-shrink-0">
                    <Phone size={16} className="text-sky-600 dark:text-sky-400" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    9843911102
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center flex-shrink-0">
                    <Mail size={16} className="text-sky-600 dark:text-sky-400" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400 break-all">
                    wondertravelsnepal@gmail.com
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-sky-600 dark:text-sky-400" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Bagbazzar, Kathmandu
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200/50 dark:border-slate-800/50"></div>

        {/* Bottom Bar */}
        <div className="py-8 flex flex-col items-center justify-center gap-4">
          {/* Developer Credit - Centered and Prominent */}
          <div className="flex items-center gap-2 justify-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Developed by
            </span>
            <a
              href="https://www.khadka-manish.com.np/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-bold text-sky-600 dark:text-sky-400 transition-all duration-300 active:scale-95 cursor-pointer hover:text-sky-700 dark:hover:text-sky-300"
            >
              MNZ
            </a>
          </div>

          {/* Footer Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500">
              © {currentYear} WONDER travelers. All rights reserved.
            </p>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <Link
              href="/privacy"
              className="text-xs text-slate-500 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              Privacy
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link
              href="/terms"
              className="text-xs text-slate-500 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              Terms
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link
              href="/sitemap"
              className="text-xs text-slate-500 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;