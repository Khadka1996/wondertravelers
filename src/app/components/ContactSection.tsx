"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle } from "lucide-react";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // Simulate API call
    setTimeout(() => {
      if (formData.name && formData.email && formData.message) {
        setStatus("success");
        setMessage("Thank you! Your message has been sent. We'll get back to you soon.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
        setMessage("Please fill in all required fields.");
      }
    }, 1000);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-sky-50/30">
      <div className="max-w-7xl mx-auto">
        {/* Simple Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Have questions about trips, bookings, or just want to say hello? We're here for you.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white border border-sky-200/50 rounded-2xl shadow-sm p-6 md:p-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">
              Send Us a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#00BCFF] focus:border-transparent outline-none transition-all"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#00BCFF] focus:border-transparent outline-none transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#00BCFF] focus:border-transparent outline-none transition-all"
                  placeholder="How can we help you?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Your Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#00BCFF] focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Tell us more about your plans or questions..."
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-white transition-all ${
                  status === "loading"
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-[#00BCFF] hover:bg-[#00A6E6]"
                }`}
              >
                {status === "loading" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message <Send size={16} />
                  </>
                )}
              </button>

              {/* Status Messages */}
              {status === "success" && (
                <div className="mt-4 p-4 bg-[#00BCFF]/10 border border-[#00BCFF]/30 text-[#00A6E6] rounded-lg flex items-start gap-3">
                  <CheckCircle size={20} className="text-[#00BCFF] flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{message}</span>
                </div>
              )}
              {status === "error" && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{message}</span>
                </div>
              )}
            </form>
          </div>

          {/* Contact Info + Map */}
          <div className="lg:col-span-5 space-y-6">
            {/* Contact Cards - Simple grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-sky-200/50 rounded-xl p-5 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-[#00BCFF]/10 rounded-lg flex items-center justify-center mb-3">
                  <Phone size={20} className="text-[#00BCFF]" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">Phone</h4>
                <p className="text-sm text-slate-600">+977 980-1234567</p>
                <p className="text-xs text-slate-500 mt-1">Mon–Sun: 8AM–8PM</p>
              </div>

              <div className="bg-white border border-sky-200/50 rounded-xl p-5 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-[#00BCFF]/10 rounded-lg flex items-center justify-center mb-3">
                  <Mail size={20} className="text-[#00BCFF]" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">Email</h4>
                <p className="text-sm text-slate-600">hello@wondertravelers.com</p>
                <p className="text-xs text-slate-500 mt-1">Reply within 24h</p>
              </div>
            </div>

            {/* Address Card - Full width */}
            <div className="bg-white border border-sky-200/50 rounded-xl p-5 hover:shadow-sm transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#00BCFF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} className="text-[#00BCFF]" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Office Address</h4>
                  <p className="text-sm text-slate-600">
                    Bagbazzar, Kathmandu, Nepal
                  </p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Clock size={12} className="text-[#00BCFF]" />
                    Open daily: 9AM - 6PM
                  </p>
                </div>
              </div>
            </div>

            {/* Google Maps - Bagbazzar location */}
            <div className="bg-white border border-sky-200/50 rounded-xl overflow-hidden shadow-sm">
              <div className="relative h-56 md:h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.834628012345!2d85.316111114581!3d27.701944982794!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb190a5f5e5c5d%3A0x3b7e7e3c5f5e5c5d!2sBagbazzar%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1698765432100"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Wonder Travelers Location - Bagbazzar"
                  className="w-full h-full"
                />
              </div>
              <div className="px-5 py-3 bg-[#00BCFF]/5 border-t border-sky-200/50">
                <p className="text-xs text-slate-600 flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#00BCFF]" />
                  Bagbazzar, Kathmandu - Opposite of Bagbazzar Chowk
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}