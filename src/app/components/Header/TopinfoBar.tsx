"use client";

import { useState, useEffect } from "react";
import {
  Phone,
  Mail,
  Cloud,
  CloudRain,
  CloudSun,
  Loader2,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiTiktok } from "react-icons/si";

const SKY_THEME = {
  primary: "#0284C7",
  secondary: "#38BDF8",
  tertiary: "#7DD3FC",
  light: "#F0F9FF",
  veryLight: "#E0F2FE",
  dark: "#0C4A6E",
  textPrimary: "#0F172A",
  textSecondary: "#334155",
  accent: "#F0F9FF",
  border: "rgba(125, 211, 252, 0.35)",
  shadowSoft: "0 4px 15px -6px rgba(2, 132, 199, 0.18)",
};

const TopInfoBar = ({ scrolled = false }) => {
  const [weather, setWeather] = useState({
    temp: 0,
    condition: "",
    icon: <CloudSun size={16} className="text-[var(--secondary)]" />,
    loading: true,
    error: false,
  });

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes("sun") || lower.includes("clear")) {
      return <CloudSun size={16} className="text-yellow-400" />;
    }
    if (lower.includes("cloud")) {
      return <Cloud size={16} className="text-[var(--tertiary)]" />;
    }
    if (lower.includes("rain")) {
      return <CloudRain size={16} className="text-[var(--secondary)]" />;
    }
    return <CloudSun size={16} className="text-[var(--secondary)/80]" />;
  };

  const fetchWeather = async () => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Kathmandu&appid=d7818a98cdb40947fce56490f73b49fa&units=metric`
      );

      if (!res.ok) throw new Error("Weather API error");

      const data = await res.json();

      setWeather({
        temp: Math.round(data.main.temp),
        condition: data.weather[0].description,
        icon: getWeatherIcon(data.weather[0].main),
        loading: false,
        error: false,
      });
    } catch (err) {
      console.error("Weather fetch failed:", err);
      setWeather({
        temp: 22,
        condition: "Sunny",
        icon: getWeatherIcon("Sunny"),
        loading: false,
        error: true,
      });
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  const socialLinks = [
    {
      icon: <FaFacebook size={16} />,
      href: "https://www.facebook.com/share/17gYmw6MMW/",
      label: "Facebook",
      color: "bg-[#1877F2] hover:bg-[#1462c9]",
    },
    {
      icon: <FaXTwitter size={16} />,
      href: "https://x.com/WonderTrav90995",
      label: "Twitter",
      color: "bg-black hover:bg-neutral-800",
    },
    {
      icon: <FaInstagram size={16} />,
      href: "https://www.instagram.com/wond_ertravelers?igsh=MXFsaTg2bGdqZDh0Ng==",
      label: "Instagram",
      color: "bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#FD1D1D] hover:brightness-110",
    },
    {
      icon: <FaYoutube size={16} />,
      href: "https://www.youtube.com/@WonderTravelers",
      label: "YouTube",
      color: "bg-[#FF0000] hover:bg-[#d60000]",
    },
    {
      icon: <SiTiktok size={16} />,
      href: "https://www.tiktok.com/@wonder.travelers?_r=1&_t=ZS-94nNvCFf8St",
      label: "TikTok",
      color: "bg-black hover:bg-neutral-800",
    },
  ];

  return (
    <div
      className={
        `bg-gradient-to-r from-[var(--light)] to-[var(--very-light)] text-[var(--text-primary)] backdrop-blur-md border-b border-[var(--border)] transition-all duration-300 ${
          scrolled ? "py-2 shadow-sm" : "py-2.5"
        } dark:from-slate-900 dark:to-slate-800 dark:text-slate-100 dark:border-slate-700/50`
      }
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between text-sm gap-3">
          <div className="flex items-center gap-3 md:gap-4 flex-wrap flex-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm border border-[var(--border)] dark:border-slate-600 hover:border-[var(--secondary)/50] transition-colors">
              <Mail size={15} className="text-[var(--secondary)]" />
              <span className="font-medium text-xs sm:text-sm">wondertravelsnepal@gmail.com</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm border border-[var(--border)] dark:border-slate-600 hover:border-[var(--secondary)/50] transition-colors">
              <Phone size={15} className="text-[var(--secondary)]" />
              <span className="font-medium text-xs sm:text-sm">9843911102</span>
            </div>

            <div className="hidden md:flex items-center gap-2.5">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 ${social.color}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            {weather.loading ? (
              <Loader2 size={16} className="animate-spin text-[var(--secondary)]" />
            ) : weather.error ? (
              <CloudSun size={16} className="text-[var(--secondary)] opacity-70" />
            ) : (
              weather.icon
            )}
            <span className="font-semibold">
              {weather.loading || weather.error ? "22" : weather.temp}°C
            </span>
            <span className="text-xs text-[var(--text-secondary)] dark:text-slate-400 hidden xs:inline">
              Kathmandu
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopInfoBar;