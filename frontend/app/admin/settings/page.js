'use client';

import { useState } from 'react';
import { Settings, Shield, Bell, Key, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState({
    siteName: 'ChronoLux',
    contactEmail: 'admin@chronolux.com',
    enableNotifications: true,
    maintenanceMode: false,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <span className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--clx-gold)]">Preferences</span>
        <h1 className="font-serif text-3xl font-semibold text-[var(--clx-text-primary)] mt-1">Settings</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-2 mb-2 pb-4 border-b border-[var(--clx-border-light)]">
            <Shield className="w-5 h-5 text-[var(--clx-gold)]" />
            <h2 className="font-serif text-lg font-semibold text-[var(--clx-text-primary)]">System Configuration</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[var(--clx-text-secondary)] uppercase tracking-wider">Site Name</label>
              <input
                type="text"
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
                className="luxury-input text-sm py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[var(--clx-text-secondary)] uppercase tracking-wider">Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="luxury-input text-sm py-2"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="enableNotifications"
                name="enableNotifications"
                checked={formData.enableNotifications}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[var(--clx-border)] accent-[var(--clx-gold)] mt-0.5"
              />
              <div>
                <label htmlFor="enableNotifications" className="text-xs font-semibold text-[var(--clx-text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[var(--clx-gold)]" />
                  Enable System Notifications
                </label>
                <p className="text-[11px] text-[var(--clx-text-muted)] mt-1">Receive immediate notifications on new orders and customer registrations.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="maintenanceMode"
                name="maintenanceMode"
                checked={formData.maintenanceMode}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[var(--clx-border)] accent-[var(--clx-gold)] mt-0.5"
              />
              <div>
                <label htmlFor="maintenanceMode" className="text-xs font-semibold text-[var(--clx-text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-red-500" />
                  Maintenance Mode
                </label>
                <p className="text-[11px] text-[var(--clx-text-muted)] mt-1">Take the frontend storefront offline for routine server maintenance.</p>
              </div>
            </div>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-lg text-sm">
              Settings updated successfully!
            </div>
          )}

          <div className="pt-4 flex justify-end border-t border-[var(--clx-border-light)]">
            <button
              type="submit"
              disabled={saving}
              className="luxury-btn-gold py-2.5 px-6 text-xs inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
