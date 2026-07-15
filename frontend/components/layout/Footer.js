import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Share2,
  AtSign
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[var(--clx-black)] text-white relative overflow-hidden">
      {/* Gold accent top border */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[var(--clx-gold)] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">

          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold mb-4 tracking-tight">
              Chrono<span className="text-[var(--clx-gold)]">Lux</span>
            </h3>
            <p className="text-[var(--clx-text-light)] mb-6 text-sm leading-relaxed max-w-sm opacity-80">
              Your destination for exceptional luxury timepieces. Discover premium watches from the world's finest horological houses.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:border-[var(--clx-gold)] hover:text-[var(--clx-gold)] transition-all duration-300"
                aria-label="Website"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:border-[var(--clx-gold)] hover:text-[var(--clx-gold)] transition-all duration-300"
                aria-label="Share"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:border-[var(--clx-gold)] hover:text-[var(--clx-gold)] transition-all duration-300"
                aria-label="Email"
              >
                <AtSign className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--clx-gold)] mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { href: '/products', label: 'All Collections' },
                { href: '/products?isBestSeller=true', label: 'Best Sellers' },
                { href: '/products?isNewArrival=true', label: 'New Arrivals' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/50 hover:text-[var(--clx-gold)] transition-colors duration-300 text-sm py-0.5 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--clx-gold)] mb-5">
              Customer Service
            </h4>
            <ul className="space-y-3">
              {[
                { href: '/faq', label: 'FAQ' },
                { href: '/shipping', label: 'Shipping Info' },
                { href: '/returns', label: 'Returns & Exchanges' },
                { href: '/privacy', label: 'Privacy Policy' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/50 hover:text-[var(--clx-gold)] transition-colors duration-300 text-sm py-0.5 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--clx-gold)] mb-5">
              Get in Touch
            </h4>
            <ul className="space-y-4 text-white/50">
              <li className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-[var(--clx-gold)]" />
                </div>
                <span className="text-sm break-all">support@chronolux.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-[var(--clx-gold)]" />
                </div>
                <span className="text-sm">+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-[var(--clx-gold)]" />
                </div>
                <span className="text-sm">Mumbai, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-10 sm:mt-14 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs tracking-wider">
            &copy; {new Date().getFullYear()} ChronoLux. All rights reserved.
          </p>
          <p className="text-white/20 text-xs tracking-wider">
            Crafted with precision & passion
          </p>
        </div>
      </div>
    </footer>
  );
}