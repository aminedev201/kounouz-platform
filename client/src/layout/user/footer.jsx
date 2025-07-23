'use client';

import React from 'react';
import Link from 'next/link';
import {
  Package,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center md:text-left">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-center md:justify-start">
              <Package className="h-8 w-8 text-blue-400 mr-2" />
              <span className="text-xl font-bold">Kounouz</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your trusted online store for quality products and exceptional service.
              We're committed to providing the best shopping experience.
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Youtube" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Service</h3>
            <ul className="space-y-2">
              {['Help Center', 'Shipping Info', 'Returns & Exchanges', 'Track Your Order', 'Size Guide', 'FAQ'].map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 justify-center md:justify-start">
                <MapPin className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-center md:text-left">
                  <p className="text-gray-400 text-sm">123 Business Street</p>
                  <p className="text-gray-400 text-sm">City, State 12345</p>
                  <p className="text-gray-400 text-sm">United States</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 justify-center md:justify-start">
                <Phone className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <p className="text-gray-400 text-sm">+1 (555) 123-4567</p>
              </div>
              <div className="flex items-center space-x-3 justify-center md:justify-start">
                <Mail className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <a href="mailto:aminedev032@gmail.com" className="text-gray-400 text-sm">
                  aminedev032@gmail.com
                </a>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2">Subscribe to Newsletter</h4>
              <div className="flex max-w-sm mx-auto md:mx-0">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-gray-800 text-white text-sm rounded-l-md border border-gray-700 focus:outline-none focus:border-blue-400"
                />
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-r-md hover:bg-blue-700 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">© {currentYear} Kounouz. All rights reserved.</p>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6">
              {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Accessibility'].map((policy, idx) => (
                <a key={idx} href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {policy}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
