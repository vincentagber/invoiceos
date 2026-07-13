'use client';

import React from 'react';
import Link from 'next/link';

const footerLinks = {
  Company: ['About', 'Careers', 'Blog', 'Press'],
  Resources: ['Documentation', 'API Reference', 'Guides', 'Support'],
  Support: ['Contact', 'Privacy', 'Terms', 'Cookies'],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2">
            <div className="mb-5">
              <img src="/logo.png" alt="InvoiceOS" className="h-12 w-auto object-contain brightness-0 invert" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Professional invoicing software for freelancers and businesses.
              Send invoices, track payments, and get paid faster.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-6">
                {category}
              </h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-gray-400">
            &copy; 2026 InvoiceOS. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Twitter', 'GitHub', 'LinkedIn'].map((social) => (
              <Link
                key={social}
                href="#"
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
