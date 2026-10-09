'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Mail, Phone, MapPin, MessageSquare, Send, Facebook, Instagram, Youtube, Clock, Globe, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [contactInfo, setContactInfo] = useState<{ email?: string; whatsapp?: string } | null>(null);

  // Fetch contact info from backend
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch('/api/settings/contact');
        if (response.ok) {
          const data = await response.json();
          setContactInfo(data.contact);
        }
      } catch (error) {
        console.error('Failed to fetch contact info:', error);
      }
    };
    fetchContactInfo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactInfo?.whatsapp) {
      setFormStatus('error');
      console.error('WhatsApp number not configured');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      const whatsappMessage = `Hello 👋

New Contact Form Submission from Nepal Pictures Website

*SENDER DETAILS:*
📝 Name: ${formData.name}
📧 Email: ${formData.email}
📅 Date: ${currentDate}

*MESSAGE SUBJECT:*
${formData.subject}

*YOUR MESSAGE:*
${formData.message}

---
Please reply to this inquiry at your earliest convenience.
Thank you! 🙏`;

      const waLink = `https://wa.me/${contactInfo.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;
      
      // Open WhatsApp with the message
      window.open(waLink, '_blank');
      
      // Show toast notification
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      
      // Show success after a short delay
      setTimeout(() => {
        setFormStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }, 1000);
    } catch (error) {
      console.error('Failed to send message:', error);
      setFormStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFormStatus('idle'), 5000);
    }
  };

  const contactInfoCards = [
    {
      icon: <Mail className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Email Us',
      details: ['wondertravelsnepal@gmail.com'],
      action: 'mailto:wondertravelsnepal@gmail.com',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      hoverColor: 'hover:bg-blue-100'
    },
    {
      icon: <Phone className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Call Us',
      details: ['+977 9843911102'],
      action: 'tel:+97798439111102',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      hoverColor: 'hover:bg-green-100'
    },
    {
      icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Visit Us',
      details: ['Bagbazar, Nepal'],
      action: 'https://maps.google.com/?q=Bagbazar,Kathmandu,Nepal',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      hoverColor: 'hover:bg-amber-100'
    },
    {
      icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Working Hours',
      details: ['Mon-Fri: 9AM-6PM', 'Sat-Sun: 10AM-4PM'],
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      hoverColor: 'hover:bg-purple-100'
    }
  ];

  const faqs = [
    {
      question: 'How can I contribute my photos to Nepal Pictures?',
      answer: 'We welcome photography contributions! Please email us at wondertravelsnepal@gmail.com with your portfolio and we\'ll discuss collaboration opportunities.'
    },
    {
      question: 'Do you offer guided tours?',
      answer: 'While we don\'t organize tours directly, we partner with local guides. Contact us and we\'ll connect you with trusted tour operators.'
    },
    {
      question: 'How can I advertise on your platform?',
      answer: 'We offer various advertising packages. Please check our Advertising section on the About page or email us for detailed information.'
    },
    {
      question: 'Can I use your photos for commercial purposes?',
      answer: 'All photos are copyrighted. For licensing inquiries, please contact us with details about your intended use.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="bg-white">
      <Breadcrumb items={[{ label: 'Contact', current: true }]} />

      {/* Toast Notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: -20 }}
          className="fixed top-6 right-6 z-50"
        >
          <div className="bg-green-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-xs sm:max-w-sm">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm sm:text-base">Message Sent!</p>
              <p className="text-xs sm:text-sm text-green-100">We'll get back to you soon.</p>
            </div>
          </div>
        </motion.div>
      )}
      {/* Hero Section with Background Image */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 overflow-hidden"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/photos/bg-image.jpg"
            alt="Nepal landscape background"
            fill
            className="object-cover"
            priority
            quality={75}
            sizes="100vw"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
              Get in Touch
            </h1>
            <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto">
              Have questions about Nepal, want to collaborate, or need travel advice? We'd love to hear from you!
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Info Cards */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-8 sm:py-12 relative z-20 mt-8 sm:mt-12"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {contactInfoCards.map((item, idx) => (
              <motion.a
                key={idx}
                href={item.action || '#'}
                target={item.action?.startsWith('http') ? '_blank' : undefined}
                rel={item.action?.startsWith('http') ? 'noopener noreferrer' : undefined}
                variants={itemVariants}
                className={`group p-4 sm:p-5 ${item.bgColor} rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all ${item.hoverColor} cursor-pointer backdrop-blur-sm bg-opacity-90`}
              >
                <div className={`inline-flex p-2.5 sm:p-3 rounded-lg ${item.bgColor} ${item.iconColor} mb-2 sm:mb-3`}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">{item.title}</h3>
                {item.details.map((detail, i) => (
                  <p key={i} className="text-xs sm:text-sm text-slate-600">{detail}</p>
                ))}
              </motion.a>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Contact Form & Map Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-8 sm:py-12"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 sm:mb-8"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Send Us a Message
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              We'll get back to you within 24-48 hours
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Contact Form */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm"
            >
              {formStatus === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 sm:py-12"
                >
                  <div className="inline-flex p-3 bg-green-100 rounded-full text-green-600 mb-4">
                    <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-sm sm:text-base text-slate-600 mb-4">
                    Thank you for reaching out. We'll get back to you soon.
                  </p>
                  <button
                    onClick={() => setFormStatus('idle')}
                    className="px-4 sm:px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors text-sm sm:text-base"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <motion.div variants={itemVariants}>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm sm:text-base"
                      placeholder="Subash Thapa"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm sm:text-base"
                      placeholder="wondertravelsnepal@gmail.com"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm sm:text-base"
                    >
                      <option value="">Select a subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Collaboration">Collaboration</option>
                      <option value="Advertising">Advertising</option>
                      <option value="Photo Licensing">Photo Licensing</option>
                      <option value="Travel Advice">Travel Advice</option>
                      <option value="Technical Support">Technical Support</option>
                    </select>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                      Your Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm sm:text-base"
                      placeholder="Tell us how we can help..."
                    />
                  </motion.div>

                  {formStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm"
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span>There was an error sending your message. Please try again.</span>
                    </motion.div>
                  )}

                  <motion.button
                    variants={itemVariants}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </motion.div>

            {/* Map & Additional Info */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              className="space-y-4 sm:space-y-6"
            >
              <motion.div
                variants={itemVariants}
                className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden h-48 sm:h-64"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.8354486789307!2d85.3268!3d27.7218!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1985b0c0c0c1%3A0xb0c0c0c0c0c0c0c1!2sBagbazar%2C%20Kathmandu!5e0!3m2!1sen!2snp!4v1635678901234"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  className="grayscale hover:grayscale-0 transition-all"
                />
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 sm:p-6 border border-slate-200"
              >
                <h3 className="font-bold text-lg sm:text-xl text-slate-900 mb-3">Connect With Us</h3>
                <p className="text-sm sm:text-base text-slate-600 mb-4">
                  Follow us on social media for daily updates, stunning photos, and travel inspiration from Nepal.
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <a
                    href="https://www.facebook.com/share/17gYmw6MMW/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs sm:text-sm"
                  >
                    <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Facebook</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </a>
                  <a
                    href="https://www.instagram.com/wond_ertravelers?igsh=MXFsaTg2bGdqZDh0Ng=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors text-xs sm:text-sm"
                  >
                    <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Instagram</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </a>
                  <a
                    href="https://www.youtube.com/@WonderTravelers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs sm:text-sm"
                  >
                    <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>YouTube</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </a>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white rounded-lg p-4 sm:p-6 border border-slate-200"
              >
                <h3 className="font-bold text-lg sm:text-xl text-slate-900 mb-3">Quick Response</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm sm:text-base text-slate-900">Email Support</p>
                      <p className="text-xs sm:text-sm text-slate-600">Within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm sm:text-base text-slate-900">Social Media DM</p>
                      <p className="text-xs sm:text-sm text-slate-600">Within 12 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm sm:text-base text-slate-900">Phone Support</p>
                      <p className="text-xs sm:text-sm text-slate-600">During working hours</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-8 sm:py-12 bg-slate-50"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 sm:mb-8"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Quick answers to common inquiries
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid md:grid-cols-2 gap-4 sm:gap-6"
          >
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-white rounded-lg p-4 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center flex-shrink-0 text-xs sm:text-sm">
                    ?
                  </span>
                  {faq.question}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 pl-7 sm:pl-8">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-8 sm:py-12"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl p-6 sm:p-8 text-white shadow-xl"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">
              Ready to Explore Nepal?
            </h2>
            <p className="text-sm sm:text-base text-cyan-100 mb-4 sm:mb-6 max-w-2xl mx-auto">
              Let us help you plan your perfect Nepal adventure. Get personalized travel recommendations and expert advice.
            </p>
            <a
              href="mailto:wondertravelsnepal@gmail.com?subject=Travel%20Inquiry"
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-cyan-600 font-medium rounded-lg hover:bg-slate-100 transition-colors gap-2 text-sm sm:text-base"
            >
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
              Get Travel Advice
            </a>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}