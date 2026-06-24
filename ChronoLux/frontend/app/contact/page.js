'use client';

import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
} from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="bg-gray-50">

      {/* Hero Section */}
      <section className="bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Contact ChronoLux
          </h1>

          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Have questions about our luxury watches? We're here to help you find the perfect timepiece.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">

        <div className="grid lg:grid-cols-2 gap-10">

          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-lg p-8">

            <h2 className="text-3xl font-bold mb-6">
              Send Us a Message
            </h2>

            <div className="space-y-5">

              <input
                type="text"
                placeholder="Your Name"
                className="w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-black"
              />

              <input
                type="email"
                placeholder="Email Address"
                className="w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-black"
              />

              <input
                type="text"
                placeholder="Subject"
                className="w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-black"
              />

              <textarea
                rows="6"
                placeholder="Write your message..."
                className="w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-black"
              />

              <button className="flex items-center justify-center gap-2 w-full bg-black text-white py-4 rounded-xl hover:bg-gray-800 transition">
                <Send className="w-5 h-5" />
                Send Message
              </button>

            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">

            <div className="bg-white rounded-3xl shadow-lg p-6 flex items-center gap-4">
              <div className="bg-black text-white p-4 rounded-2xl">
                <Phone />
              </div>

              <div>
                <h3 className="font-bold text-lg">
                  Phone Number
                </h3>
                <p className="text-gray-600">
                  +91 98765 43210
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6 flex items-center gap-4">
              <div className="bg-black text-white p-4 rounded-2xl">
                <Mail />
              </div>

              <div>
                <h3 className="font-bold text-lg">
                  Email Address
                </h3>
                <p className="text-gray-600">
                  support@chronolux.com
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6 flex items-center gap-4">
              <div className="bg-black text-white p-4 rounded-2xl">
                <MapPin />
              </div>

              <div>
                <h3 className="font-bold text-lg">
                  Store Location
                </h3>
                <p className="text-gray-600">
                  Ahmedabad, Gujarat, India
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6 flex items-center gap-4">
              <div className="bg-black text-white p-4 rounded-2xl">
                <Clock />
              </div>

              <div>
                <h3 className="font-bold text-lg">
                  Business Hours
                </h3>
                <p className="text-gray-600">
                  Mon - Sat : 9:00 AM - 8:00 PM
                </p>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-3xl shadow-lg p-6">

              <h3 className="text-xl font-bold mb-4">
                Follow Us
              </h3>

            </div>

          </div>
        </div>
      </section>

      {/* Google Map */}
      <section className="max-w-7xl mx-auto px-4 pb-16">

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">

          <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb="
            width="100%"
            height="450"
            style={{ border: 0 }}
            loading="lazy"
          />

        </div>

      </section>

    </div>
  );
}