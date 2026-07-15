'use client';

import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="bg-[var(--clx-ivory)]">
      {/* Hero Section */}
      <section className="bg-[var(--clx-black)] text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, var(--clx-gold) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <span className="text-[var(--clx-gold)] text-xs tracking-[0.3em] uppercase font-medium mb-3 block">
            Get in Touch
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">
            Contact ChronoLux
          </h1>
          <div className="w-12 h-[2px] bg-[var(--clx-gold)] mx-auto mb-4" />
          <p className="text-white/50 text-sm sm:text-base max-w-xl mx-auto">
            Have questions about our luxury timepieces? We're here to help you find the perfect watch.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-md)] p-6 sm:p-8 lg:p-10 border border-[var(--clx-border-light)]">
            <span className="section-eyebrow">Send a Message</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold mb-6 text-[var(--clx-text-primary)]">
              We'd Love to Hear from You
            </h2>
            <div className="gold-accent mb-8" />

            <div className="space-y-5">
              <input type="text" placeholder="Your Name" className="luxury-input" />
              <input type="email" placeholder="Email Address" className="luxury-input" />
              <input type="text" placeholder="Subject" className="luxury-input" />
              <textarea rows="5" placeholder="Write your message..." className="luxury-input resize-none" />
              <button className="luxury-btn w-full py-3.5">
                <Send className="w-4 h-4" />
                Send Message
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-5">
            {[
              { icon: Phone, title: 'Phone Number', value: '+91 98765 43210' },
              { icon: Mail, title: 'Email Address', value: 'support@chronolux.com' },
              { icon: MapPin, title: 'Store Location', value: 'Ahmedabad, Gujarat, India' },
              { icon: Clock, title: 'Business Hours', value: 'Mon – Sat : 9:00 AM – 8:00 PM' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] p-5 sm:p-6 flex items-center gap-4 border border-[var(--clx-border-light)] hover:border-[var(--clx-gold)] transition-all duration-300 group">
                <div className="bg-[var(--clx-black)] text-[var(--clx-gold)] p-3.5 rounded-xl group-hover:bg-[var(--clx-gold)] group-hover:text-[var(--clx-black)] transition-all duration-300">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-base text-[var(--clx-text-primary)]">{item.title}</h3>
                  <p className="text-[var(--clx-text-secondary)] text-sm">{item.value}</p>
                </div>
              </div>
            ))}

            {/* Social Media */}
            <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] p-5 sm:p-6 border border-[var(--clx-border-light)]">
              <h3 className="font-serif text-lg font-semibold mb-3 text-[var(--clx-text-primary)]">Follow Us</h3>
              <p className="text-[var(--clx-text-secondary)] text-sm">Stay connected on social media for the latest updates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Google Map */}
      <section className="max-w-7xl mx-auto px-4 pb-12 sm:pb-16 lg:pb-20">
        <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-md)] overflow-hidden border border-[var(--clx-border-light)]">
          <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb="
            width="100%"
            height="400"
            style={{ border: 0 }}
            loading="lazy"
          />
        </div>
      </section>
    </div>
  );
}