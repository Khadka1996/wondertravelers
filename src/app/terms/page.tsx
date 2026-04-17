'use client';

import React from 'react';
import { FileText, AlertCircle, Zap, Copy, Trash2, Shield, DollarSign, Scale } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TermsPage() {
  const sections = [
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: 'Acceptance of Terms',
      content: [
        'By accessing and using WONDER Travelers, you agree to comply with these Terms of Service',
        'If you do not agree to these terms, you must not use our services',
        'We reserve the right to modify these terms at any time without prior notice',
        'Your continued use of the service constitutes acceptance of updated terms',
        'We recommend reviewing this policy regularly for changes',
      ],
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Use License',
      content: [
        'We grant you a limited, non-exclusive, non-transferable license to use our services',
        'You may view and download content for personal, non-commercial use only',
        'Reproduction, modification, or redistribution of content is prohibited without permission',
        'Commercial use of our platform without authorization is strictly forbidden',
        'You agree not to interfere with or disrupt our services or servers',
      ],
    },
    {
      icon: <Copy className="w-6 h-6" />,
      title: 'Intellectual Property Rights',
      content: [
        'All content on WONDER Travelers is owned by or licensed to us',
        'This includes text, images, videos, photography, logos, and design elements',
        'You may not reproduce, republish, or distribute our content without permission',
        'User-generated content remains your property, but you grant us a license to use it',
        'Unauthorized use of our intellectual property is prohibited',
        'Copyright infringement claims should be reported to wondertravelsnepal@gmail.com',
      ],
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: 'User Conduct & Prohibited Activities',
      content: [
        'You agree not to post illegal, harmful, or abusive content',
        'No harassment, discrimination, or hate speech is tolerated',
        'Do not attempt to hack, breach, or gain unauthorized access',
        'No spam, phishing, or malicious software distribution',
        'Do not impersonate other users or misrepresent your identity',
        'No automated scraping or data harvesting without permission',
        'Violating these terms may result in account suspension or termination',
      ],
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Account Security & Responsibility',
      content: [
        'You are responsible for maintaining the confidentiality of your account credentials',
        'You agree not to share your password with others',
        'You are liable for all activities that occur under your account',
        'Report unauthorized access or suspicious activity immediately',
        'We are not responsible for unauthorized account access due to your negligence',
        'You agree to provide accurate and current information',
      ],
    },
    {
      icon: <Trash2 className="w-6 h-6" />,
      title: 'Content Moderation & Removal',
      content: [
        'We reserve the right to remove any content that violates these terms',
        'We may suspend or terminate accounts that violate policies',
        'Removal does not constitute endorsement or liability for other users\' content',
        'We are not responsible for third-party content on our platform',
        'Users are responsible for their own submissions and interactions',
        'Appeal procedures are available for content disputes',
      ],
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Payments & Refunds',
      content: [
        'Premium features (if available) are subject to payment terms',
        'Subscriptions automatically renew unless canceled',
        'Refunds are processed according to our refund policy',
        'Payment information is handled by secure third-party processors',
        'You authorize us to charge your payment method for services',
        'Billing disputes should be reported within 30 days',
      ],
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: 'Limitation of Liability',
      content: [
        'Our services are provided "as is" without warranties',
        'We are not liable for indirect, incidental, or consequential damages',
        'Our liability is limited to the amount paid for services',
        'We do not warrant uninterrupted or error-free service',
        'You use our services at your own risk',
        'Some jurisdictions do not allow liability limitations',
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
              <FileText className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            Terms of Service
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Please read these terms carefully before using WONDER Travelers. By accessing our services, you agree to be bound by these terms and conditions.
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
              These Terms of Service ("Terms") constitute a legal agreement between you and WONDER Travelers regarding your access to and use of our website, mobile applications, and all associated services ("Services").
            </p>
            <p className="text-slate-700 leading-relaxed text-base sm:text-lg">
              Our mission is to provide travelers with professional photography, destination guides, documentaries, and travel content about Nepal. These Terms govern your conduct and your rights and responsibilities when using our platform.
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

      {/* Third-Party Links */}
      <section className="py-8 sm:py-12 px-2 sm:px-4 lg:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white border border-slate-200 rounded-lg p-6 sm:p-7"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Third-Party Links & External Sites</h2>
            <div className="space-y-3 text-slate-700">
              <p>
                Our website may contain links to external websites and third-party services. We are not responsible for:
              </p>
              <ul className="space-y-2 ml-4">
                <li>• The availability or accuracy of external content</li>
                <li>• Privacy practices of third-party websites</li>
                <li>• Damages or losses resulting from external links</li>
                <li>• Quality or reliability of linked services</li>
              </ul>
              <p>
                We recommend reviewing the terms and privacy policies of any external sites before providing personal information.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dispute Resolution */}
      <section className="py-8 sm:py-12 px-2 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6 sm:p-7"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-600 rounded-lg text-white flex-shrink-0">
                <Scale className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Dispute Resolution & Governing Law</h2>
                <div className="space-y-3 text-slate-700">
                  <p>
                    These Terms are governed by the laws of Nepal. Any disputes arising from or related to these Terms or our Services shall be resolved through:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li>• Informal resolution and good faith negotiation</li>
                    <li>• Mediation if informal resolution fails</li>
                    <li>• Legal action in Nepal's courts as a last resort</li>
                  </ul>
                  <p>
                    By using our Services, you consent to the exclusive jurisdiction of Nepal's courts.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-8 sm:py-12 px-2 sm:px-4 lg:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-6 sm:p-7"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-600 rounded-lg text-white flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Questions About Our Terms?</h2>
                <p className="text-slate-700 mb-4">
                  If you have any questions or concerns about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-slate-700 ml-4">
                  <p><strong>Email:</strong> wondertravelsnepal@gmail.com</p>
                  <p><strong>Address:</strong> Kathmandu, Nepal</p>
                  <p><strong>Phone:</strong> 9843911102</p>
                </div>
                <p className="text-sm text-slate-600 mt-4">
                  We will respond to your inquiry within 7 business days.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
