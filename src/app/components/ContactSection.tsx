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

    // Simulate API call (replace with real fetch/axios to your backend or Formspree/Netlify/etc.)
    setTimeout(() => {
      if (formData.name && formData.email && formData.message) {
        setStatus("success");
        setMessage("Thank you! Your message has been sent. We'll get back to you soon.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
        setMessage("Please fill in all required fields.");
      }
    }, 1200);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--very-light)] dark:bg-[var(--bg-dark)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl flex items-center justify-center shadow-[var(--shadow-soft)] ring-1 ring-[var(--border)]">
              <Mail size={32} className="text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--primary)] dark:text-[var(--secondary)] tracking-tight">
              Get in Touch
            </h2>
          </div>
          <p className="text-xl text-[var(--text-secondary)] dark:text-slate-300 max-w-3xl mx-auto">
            Have questions about trips, bookings, or just want to say hello? We're here for you.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-800/60 backdrop-blur-sm border border-[var(--border)] rounded-2xl shadow-[var(--shadow-soft)] p-8">
            <h3 className="text-2xl font-bold text-[var(--primary)] dark:text-[var(--secondary)] mb-6">
              Send Us a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent outline-none transition-all"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent outline-none transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent outline-none transition-all"
                  placeholder="How can we help you?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Your Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Tell us more about your plans or questions..."
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                  status === "loading"
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:brightness-110 hover:shadow-xl"
                }`}
              >
                {status === "loading" ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message <Send size={20} />
                  </>
                )}
              </button>

              {/* Status Messages */}
              {status === "success" && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-3">
                  <CheckCircle size={24} className="text-green-600" />
                  {message}
                </div>
              )}
              {status === "error" && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-3">
                  <AlertCircle size={24} className="text-red-600" />
                  {message}
                </div>
              )}
            </form>
          </div>

          {/* Contact Info + Map */}
          <div className="lg:col-span-5 space-y-8">
            {/* Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800/60 backdrop-blur-sm border border-[var(--border)] rounded-2xl p-6 shadow-[var(--shadow-soft)] hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl flex items-center justify-center mb-4">
                  <Phone size={24} className="text-white" />
                </div>
                <h4 className="font-semibold text-lg mb-2">Phone</h4>
                <p className="text-[var(--text-secondary)] dark:text-slate-300">+977 980-1234567</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Mon–Sun: 8AM–8PM</p>
              </div>

              <div className="bg-white dark:bg-slate-800/60 backdrop-blur-sm border border-[var(--border)] rounded-2xl p-6 shadow-[var(--shadow-soft)] hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl flex items-center justify-center mb-4">
                  <Mail size={24} className="text-white" />
                </div>
                <h4 className="font-semibold text-lg mb-2">Email</h4>
                <p className="text-[var(--text-secondary)] dark:text-slate-300">hello@wondertravelers.com</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">We reply within 24 hours</p>
              </div>

              <div className="bg-white dark:bg-slate-800/60 backdrop-blur-sm border border-[var(--border)] rounded-2xl p-6 shadow-[var(--shadow-soft)] hover:shadow-lg transition-all sm:col-span-2">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl flex items-center justify-center mb-4">
                  <MapPin size={24} className="text-white" />
                </div>
                <h4 className="font-semibold text-lg mb-2">Office Address</h4>
                <p className="text-[var(--text-secondary)] dark:text-slate-300">
                  Thamel, Kathmandu, Nepal
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Near Garden of Dreams</p>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="bg-white dark:bg-slate-800/60 backdrop-blur-sm border border-[var(--border)] rounded-2xl overflow-hidden shadow-[var(--shadow-soft)]">
              <div className="relative h-64 md:h-80">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.934022837924!2d85.312500314581!3d27.714999982794!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb198a307baabf%3A0xb5137c1bf18db1ea!2sThamel%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1698765432100"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Wonder Travelers Location"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}