import React from 'react';
import Link from 'next/link';
import {
  Twitter,
  Mail,
  Github,
  Facebook,
  Linkedin,
  Instagram
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Company",
      links: [
        { href: "/about", label: "About Us" },
        { href: "/faq", label: "FAQ" }
      ]
    },
    {
      title: "Support",
      links: [
        { href: "/contact", label: "Contact Us" },
        { href: "/leaderboard", label: "Leaderboard" }
      ]
    }
  ];

  return (
    <footer className="bg-[#0F172A] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Logo and Description */}
        <div className="col-span-1 sm:col-span-2 md:col-span-1">
          <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#A5B4FC]">
            MinijuegosTiesos
          </h3>
          <p className="text-gray-300 mb-6 max-w-xs">
            Enjoy a wide variety of mini-games with a fair and efficient system. Compete, have fun, and climb the leaderboards!
          </p>
        </div>

        {/* Footer Links - Responsive Grid */}
        {footerLinks.map((section, index) => (
          <div key={index}>
            <h4 className="font-bold mb-4 text-[#6366F1]">{section.title}</h4>
            <ul className="space-y-2">
              {section.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer Bottom */}
      <div className="max-w-7xl mx-auto border-t border-[#1E293B] mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center">
        <p className="text-gray-400 text-sm mb-4 sm:mb-0">
          © {currentYear} MinijuegosTiesos. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}