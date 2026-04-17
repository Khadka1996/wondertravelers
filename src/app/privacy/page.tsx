'use client';

import React from 'react';
import { Shield, Mail, Clock, Lock, Eye, Trash2, Share2, Cookie } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
  const sections = [
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'Information We Collect',
      content: [
        'Personal identification information (name, email, phone number)',
        'Profile information (bio, profile picture, location)',
        'Usage data (pages visited, time spent, interactions)',
        'Device information (browser type, IP address, operating system)',
        'Content you create (blog posts, comments, ratings, reviews)',
        'Payment information (when applicable, processed securely)',
      ],
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: 'How We Use Your Information',
      content: [
        'Provide and improve our services',
        'Personalize your experience and content recommendations',
        'Send newsletters, updates, and promotional content (with your consent)',
        'Respond to inquiries and customer support requests',
        'Analyze usage patterns to enhance user experience',
        'Prevent fraud and maintain security',
        'Comply with legal obligations',
      ],
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Data Security',
      content: [
        'We implement industry-standard security measures to protect your data',
        'All sensitive information is encrypted using SSL/TLS technology',
        'Access to personal data is restricted to authorized personnel',
        'Regular security audits and updates are conducted',
        'We maintain strict data protection protocols',
        'However, no internet transmission is completely secure',
      ],
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: 'Information Sharing',
      content: [
        'We do not sell your personal information to third parties',
        'We may share information with service providers who assist in operations',
        'Information may be disclosed if required by law or legal process',
        'Aggregated and anonymized data may be used for analytics',
        'With your consent, we may share information for partnerships',
      ],
    },
    {
      icon: <Cookie className="w-6 h-6" />,
      title: 'Cookies and Tracking',
      content: [
        'We use cookies to enhance your browsing experience',
        'Session cookies store temporary information during your visit',
        'Persistent cookies remember your preferences across visits',
        'Analytics cookies help us understand user behavior',
        'You can manage cookie preferences through browser settings',
        'Third-party ads may use cookies for targeted advertising',
      ],
    },
    {
      icon: <Trash2 className="w-6 h-6" />,
      title: 'Your Rights and Choices',
      content: [
        'You can request access to your personal data anytime',
        'You have the right to request correction of inaccurate information',
        'You can request deletion of your account and associated data',
        'You can opt-out of marketing communications',
        'You can control your privacy settings in your account',
        'You have the right to data portability',
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 px-2 sm:px-4 lg:px-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center mb-4"
          >
            <div className="p-3 bg-cyan-600 rounded-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            Privacy Policy
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            We are committed to protecting your privacy and ensuring transparency about how we collect, use, and safeguard your personal information.
          </p>
          <p className="text-sm text-slate-400 mt-4">
            Last Updated: March 13, 2026
          </p>
        </div>
      </motion.section>

      {/* Introduction */}
      <section className="py-8 sm:py-12 px-2 sm:px-4 lg:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-slate-700 leading-relaxed text-base sm:text-lg mb-4">
              WONDER Travelers ("we," "us," "our," or "Company") operates the wondertravelers.com website and related mobile applications. This Privacy Policy explains our practices regarding the collection and use of information through our website, mobile apps, and online services.
            </p>
            <p className="text-slate-700 leading-relaxed text-base sm:text-lg">
              By accessing and using WONDER Travelers, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy. If you do not agree with our privacy practices, please do not use our services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sections */}
      <section className="py-8 sm:py-12 px-2 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="space-y-6 sm:space-y-8"
          >
            {sections.map((section, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-white border border-slate-200 rounded-lg p-6 sm:p-7 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-cyan-100 rounded-lg text-cyan-600 flex-shrink-0 mt-1">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{section.title}</h2>
                </div>
                <ul className="space-y-2 ml-16">
                  {section.content.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex gap-3 text-slate-700">
                      <span className="text-cyan-600 font-bold mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* GDPR & Legal */}
      <section className="py-8 sm:py-12 px-2 sm:px-4 lg:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white border border-slate-200 rounded-lg p-6 sm:p-7"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-amber-100 rounded-lg text-amber-600 flex-shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">GDPR & International Data Protection</h2>
            </div>
            <div className="ml-16 space-y-3 text-slate-700">
              <p>
                For users in the European Union, we comply with the General Data Protection Regulation (GDPR). You have the right to:
              </p>
              <ul className="space-y-2 ml-4">
                <li>• Access your personal data</li>
                <li>• Rectify inaccurate data</li>
                <li>• Request erasure of your data</li>
                <li>• Restrict processing of your data</li>
                <li>• Data portability</li>
                <li>• Object to processing</li>
              </ul>
              <p className="mt-4">
                To exercise any of these rights, please contact us at wondertravelsnepal@gmail.com.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-8 sm:py-12 px-2 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-6 sm:p-7"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-600 rounded-lg text-white flex-shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Questions About Our Privacy Policy?</h2>
                <p className="text-slate-700 mb-4">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="space-y-2 text-slate-700 ml-4">
                  <p><strong>Email:</strong> wondertravelsnepal@gmail.com</p>
                  <p><strong>Address:</strong> Kathmandu, Nepal</p>
                  <p><strong>Phone:</strong> 9843911102</p>
                </div>
                <p className="text-sm text-slate-600 mt-4">
                  We will respond to your inquiry within 30 days.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Policy Updates */}
      <section className="py-8 sm:py-12 px-2 sm:px-4 lg:px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-orange-100 rounded-lg text-orange-600 flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Policy Updates</h2>
            </div>
            <div className="ml-16 space-y-3 text-slate-700">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by updating the "Last Updated" date at the top of this policy.
              </p>
              <p>
                Continued use of our services following any changes constitutes your acceptance of the updated Privacy Policy. We encourage you to review this policy periodically to stay informed about how we protect your information.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
