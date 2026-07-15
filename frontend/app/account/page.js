'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Pencil, Save, X, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';

function InputField({ label, name, value, icon: Icon, editable, handleChange, toggleEdit }) {
  const inputRef = useRef(null);
  useEffect(() => { if (editable) inputRef.current?.focus(); }, [editable]);

  return (
    <div>
      <label className="block text-xs font-semibold mb-2 text-[var(--clx-text-secondary)] tracking-wider uppercase">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--clx-text-muted)]" />
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={value}
          readOnly={!editable}
          onChange={handleChange}
          className={`luxury-input pl-11 pr-12 ${editable ? 'border-[var(--clx-gold)] bg-white' : 'bg-[var(--clx-surface)] border-[var(--clx-border-light)]'}`}
        />
        <button type="button" onClick={() => toggleEdit(name)} className="absolute right-3.5 top-3.5 text-[var(--clx-text-muted)] hover:text-[var(--clx-gold)] transition-colors">
          <Pencil className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [userData, setUserData] = useState({ name: '', email: '', phone: '', address: '', profileImage: '' });
  const [originalData, setOriginalData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [editable, setEditable] = useState({ name: false, email: false, phone: false, address: false });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) { router.push('/login'); return; }
    (async () => {
      const userdata = await api.get('/auth/me');
      const data = {
        name: userdata.data?.user?.name || '', email: userdata.data?.user?.email || '',
        phone: userdata.data?.user?.phone || '', address: userdata.data?.user?.address || '',
        profileImage: userdata.data?.user?.profileImage || '',
      };
      setUserData(data);
      setOriginalData(data);
    })();
  }, [router]);

  const handleChange = (e) => { setUserData((prev) => ({ ...prev, [e.target.name]: e.target.value })); setHasChanges(true); };
  const toggleEdit = (field) => { setEditable((prev) => ({ ...prev, [field]: !prev[field] })); };

  const handleSave = async () => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      setOriginalData(userData);
      await api.put('/auth/update-profile', userData);
      setEditable({ name: false, email: false, phone: false, address: false });
      setHasChanges(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => { setUserData(originalData); setEditable({ name: false, email: false, phone: false, address: false }); setHasChanges(false); };
  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <div className="bg-[var(--clx-ivory)] min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <span className="section-eyebrow">Your Profile</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--clx-text-primary)]">My Account</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-md)] border border-[var(--clx-border-light)] p-6 sm:p-8 mb-6">
          <div className="flex flex-col items-center">
            {userData.profileImage ? (
              <img src={userData.profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-[var(--clx-surface)]" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[var(--clx-surface)] flex items-center justify-center">
                <User className="w-10 h-10 text-[var(--clx-text-muted)]" />
              </div>
            )}
            <h2 className="font-serif text-xl font-semibold mt-4 text-[var(--clx-text-primary)]">{userData.name}</h2>
            <p className="text-[var(--clx-text-secondary)] text-sm">{userData.email}</p>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-md)] border border-[var(--clx-border-light)] p-6 sm:p-8">
          <div className="grid md:grid-cols-2 gap-5">
            <InputField label="Full Name" name="name" value={userData.name} icon={User} editable={editable.name} handleChange={handleChange} toggleEdit={toggleEdit} />
            <InputField label="Email" name="email" value={userData.email} icon={Mail} editable={editable.email} handleChange={handleChange} toggleEdit={toggleEdit} />
            <InputField label="Phone" name="phone" value={userData.phone} icon={Phone} editable={editable.phone} handleChange={handleChange} toggleEdit={toggleEdit} />
            <InputField label="Address" name="address" value={userData.address} icon={MapPin} editable={editable.address} handleChange={handleChange} toggleEdit={toggleEdit} />
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            {hasChanges && (
              <>
                <button onClick={handleSave} className="luxury-btn py-2.5 px-6 text-xs"><Save className="w-4 h-4" /> Save Changes</button>
                <button onClick={handleCancel} className="luxury-btn-outline py-2.5 px-6 text-xs"><X className="w-4 h-4" /> Cancel</button>
              </>
            )}
            <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white rounded text-xs font-medium tracking-wider uppercase hover:bg-red-600 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}