import React from "react";
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: <Facebook size={18} />,
      href: "#",
      label: "Facebook",
      color: "hover:bg-facebook hover:text-white",
    },
    {
      icon: <Twitter size={18} />,
      href: "#",
      label: "Twitter",
      color: "hover:bg-twitter hover:text-white",
    },
    {
      icon: <Instagram size={18} />,
      href: "#",
      label: "Instagram",
      color: "hover:bg-instagram hover:text-white",
    },
    {
      icon: <Youtube size={18} />,
      href: "#",
      label: "YouTube",
      color: "hover:bg-youtube hover:text-white",
    },
  ];

  return (
    <footer className="bg-secondary dark:bg-dark border-t border-border mt-12">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-secondary shadow-soft"></div>
              <h3 className="text-xl font-bold text-textPrimary dark:text-accent">
                WonderTravelers
              </h3>
            </div>
            <p className="text-sm text-textSecondary dark:text-accent">
              Discover amazing travel experiences through blogs, photos, and destinations from travelers around the world.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-textPrimary dark:text-accent mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-textSecondary dark:text-accent hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-textSecondary dark:text-accent hover:text-primary transition-colors"
                >
                  Blogs
                </Link>
              </li>
              <li>
                <Link
                  href="/photos"
                  className="text-sm text-textSecondary dark:text-accent hover:text-primary transition-colors"
                >
                  Photos
                </Link>
              </li>
              <li>
                <Link
                  href="/destinations"
                  className="text-sm text-textSecondary dark:text-accent hover:text-primary transition-colors"
                >
                  Destinations
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-textSecondary dark:text-accent hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-textSecondary dark:text-accent hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-textPrimary dark:text-accent mb-4">
              Contact Us
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-sm text-textSecondary dark:text-accent">
                  +1 (555) 123-4567
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-sm text-textSecondary dark:text-accent">
                  contact@wondertravelers.com
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm text-textSecondary dark:text-accent">
                  Kathmandu, Nepal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-textSecondary dark:text-accent">
            © {currentYear} WonderTravelers. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center space-x-3">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                aria-label={social.label}
                className={`w-8 h-8 rounded-full flex items-center justify-center border border-border text-textSecondary dark:text-accent transition-all duration-300 ${social.color}`}
              >
                {social.icon}
              </a>
            ))}
          </div>

          {/* Legal Links */}
          <div className="flex items-center space-x-6">
            <Link
              href="/privacy"
              className="text-xs text-textSecondary dark:text-accent hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-textSecondary dark:text-accent hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;