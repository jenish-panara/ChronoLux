'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, MapPin, Pencil, Save, X, LogOut,
  Plus, Trash2, Check, Star, Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import apiClient from '@/lib/apiClient';

// ─── Profile Input Field ────────────────────────────────────────────────────

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

// ─── Empty address template ─────────────────────────────────────────────────

const EMPTY_ADDRESS = {
  name: '', mobile: '', houseNo: '', area: '', city: '', state: '', pincode: '',
};

// ─── Main Component ─────────────────────────────────────────────────────────

export default function AccountPage() {
  const router = useRouter();
  const { logout } = useAuthStore();

  // Profile state
  const [userData, setUserData] = useState({ name: '', email: '', phone: '', profileImage: '' });
  const [originalData, setOriginalData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [editable, setEditable] = useState({ name: false, email: false, phone: false });

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null); // address object or null
  const [addressForm, setAddressForm] = useState({ ...EMPTY_ADDRESS });
  const [addressErrors, setAddressErrors] = useState({});
  const [addressSaving, setAddressSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [settingDefaultId, setSettingDefaultId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) { router.push('/login'); return; }
    fetchProfile();
    fetchAddresses();
  }, [router]);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      const data = {
        name: res.data?.user?.name || '',
        email: res.data?.user?.email || '',
        phone: res.data?.user?.phone || '',
        profileImage: res.data?.user?.profileImage || '',
      };
      setUserData(data);
      setOriginalData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await apiClient.get('/addresses');
      setAddresses(res.data.addresses || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setAddressLoading(false);
    }
  };

  // ─── Profile handlers ───────────────────────────────────────────────

  const handleChange = (e) => {
    setUserData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setHasChanges(true);
  };

  const toggleEdit = (field) => {
    setEditable((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      setOriginalData(userData);
      await apiClient.put('/auth/update-profile', userData);
      setEditable({ name: false, email: false, phone: false });
      setHasChanges(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setUserData(originalData);
    setEditable({ name: false, email: false, phone: false });
    setHasChanges(false);
  };

  const handleLogout = () => { logout(); router.push('/login'); };

  // ─── Address handlers ───────────────────────────────────────────────

  const validateAddress = () => {
    const errs = {};
    if (!addressForm.name?.trim()) errs.name = 'Name is required';
    if (!addressForm.mobile?.trim()) errs.mobile = 'Mobile is required';
    else if (!/^[0-9]{10}$/.test(addressForm.mobile)) errs.mobile = 'Invalid mobile';
    if (!addressForm.houseNo?.trim()) errs.houseNo = 'Required';
    if (!addressForm.area?.trim()) errs.area = 'Required';
    if (!addressForm.city?.trim()) errs.city = 'Required';
    if (!addressForm.state?.trim()) errs.state = 'Required';
    if (!addressForm.pincode?.trim()) errs.pincode = 'Required';
    else if (!/^[0-9]{6}$/.test(addressForm.pincode)) errs.pincode = 'Invalid pincode';
    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openAddForm = () => {
    setEditingAddress(null);
    setAddressForm({ ...EMPTY_ADDRESS, name: userData.name, mobile: userData.phone });
    setAddressErrors({});
    setShowAddressForm(true);
  };

  const openEditForm = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      name: addr.name, mobile: addr.mobile, houseNo: addr.houseNo,
      area: addr.area, city: addr.city, state: addr.state, pincode: addr.pincode,
    });
    setAddressErrors({});
    setShowAddressForm(true);
  };

  const closeForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressErrors({});
  };

  const saveAddress = async () => {
    if (!validateAddress()) return;
    setAddressSaving(true);
    try {
      let res;
      if (editingAddress) {
        res = await apiClient.put(`/addresses/${editingAddress._id}`, addressForm);
      } else {
        res = await apiClient.post('/addresses', addressForm);
      }
      setAddresses(res.data.addresses || []);
      closeForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save address');
    } finally {
      setAddressSaving(false);
    }
  };

  const deleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    setDeletingId(id);
    try {
      const res = await apiClient.delete(`/addresses/${id}`);
      setAddresses(res.data.addresses || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const setDefault = async (id) => {
    setSettingDefaultId(id);
    try {
      const res = await apiClient.put(`/addresses/${id}/default`);
      setAddresses(res.data.addresses || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to set default');
    } finally {
      setSettingDefaultId(null);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div className="bg-[var(--clx-ivory)] min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <span className="section-eyebrow">Your Profile</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--clx-text-primary)]">My Account</h1>
        </div>

        {/* ── Profile Card ─────────────────────────────────────────── */}
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

        {/* ── Details Card ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-md)] border border-[var(--clx-border-light)] p-6 sm:p-8 mb-6">
          <div className="grid md:grid-cols-2 gap-5">
            <InputField label="Full Name" name="name" value={userData.name} icon={User} editable={editable.name} handleChange={handleChange} toggleEdit={toggleEdit} />
            <InputField label="Email" name="email" value={userData.email} icon={Mail} editable={editable.email} handleChange={handleChange} toggleEdit={toggleEdit} />
            <InputField label="Phone" name="phone" value={userData.phone} icon={Phone} editable={editable.phone} handleChange={handleChange} toggleEdit={toggleEdit} />
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

        {/* ── My Addresses ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-md)] border border-[var(--clx-border-light)] p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-lg font-semibold text-[var(--clx-text-primary)] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--clx-gold)]" />
              My Addresses
            </h2>
            {addresses.length < 5 && !showAddressForm && (
              <button
                onClick={openAddForm}
                className="flex items-center gap-1.5 text-xs font-medium text-[var(--clx-gold)] hover:underline tracking-wider uppercase"
              >
                <Plus className="w-4 h-4" /> Add New
              </button>
            )}
          </div>

          {/* Loading */}
          {addressLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-[var(--clx-border)] border-t-[var(--clx-gold)]" />
            </div>
          )}

          {/* Empty state */}
          {!addressLoading && addresses.length === 0 && !showAddressForm && (
            <div className="text-center py-10">
              <MapPin className="w-10 h-10 text-[var(--clx-border)] mx-auto mb-3" />
              <p className="text-sm text-[var(--clx-text-muted)] mb-4">No saved addresses yet</p>
              <button onClick={openAddForm} className="luxury-btn-gold py-2.5 px-6 text-xs">
                <Plus className="w-4 h-4" /> Add Your First Address
              </button>
            </div>
          )}

          {/* Address List */}
          {!addressLoading && addresses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    addr.isDefault
                      ? 'border-[var(--clx-gold)]/40 bg-[var(--clx-gold)]/3'
                      : 'border-[var(--clx-border-light)]'
                  }`}
                >
                  {/* Default badge */}
                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[var(--clx-gold)]/10 text-[var(--clx-gold)] border border-[var(--clx-gold)]/20 mb-2">
                      <Star className="w-2.5 h-2.5" /> Default
                    </span>
                  )}

                  <h4 className="font-medium text-sm text-[var(--clx-text-primary)]">{addr.name}</h4>
                  <p className="text-xs text-[var(--clx-text-secondary)] mt-1">{addr.houseNo}, {addr.area}</p>
                  <p className="text-xs text-[var(--clx-text-secondary)]">{addr.city}, {addr.state} — {addr.pincode}</p>
                  <p className="text-xs text-[var(--clx-text-muted)] mt-1">📞 {addr.mobile}</p>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => openEditForm(addr)}
                      className="text-xs text-[var(--clx-text-muted)] hover:text-[var(--clx-gold)] flex items-center gap-1 transition-colors"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => deleteAddress(addr._id)}
                      disabled={deletingId === addr._id}
                      className="text-xs text-[var(--clx-text-muted)] hover:text-red-500 flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" /> {deletingId === addr._id ? 'Deleting...' : 'Delete'}
                    </button>
                    {!addr.isDefault && (
                      <button
                        onClick={() => setDefault(addr._id)}
                        disabled={settingDefaultId === addr._id}
                        className="text-xs text-[var(--clx-text-muted)] hover:text-[var(--clx-gold)] flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        <Check className="w-3 h-3" /> {settingDefaultId === addr._id ? 'Setting...' : 'Set as Default'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Address Form (Add / Edit) */}
          {showAddressForm && (
            <div className="bg-[var(--clx-surface)] rounded-xl border border-[var(--clx-border-light)] p-5 mt-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-base font-semibold text-[var(--clx-text-primary)]">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-white text-[var(--clx-text-muted)] hover:text-[var(--clx-text-primary)] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'name', label: 'Full Name *', placeholder: 'Enter full name', full: true },
                  { key: 'mobile', label: 'Mobile Number *', placeholder: '10-digit number', full: true },
                  { key: 'houseNo', label: 'House No./Building *', placeholder: 'House/Flat No.' },
                  { key: 'area', label: 'Area/Street *', placeholder: 'Area, Landmark' },
                  { key: 'city', label: 'City *', placeholder: 'City name' },
                  { key: 'state', label: 'State *', placeholder: 'State' },
                  { key: 'pincode', label: 'Pincode *', placeholder: '6-digit pincode', full: true },
                ].map((field) => (
                  <div key={field.key} className={field.full ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-semibold mb-1.5 text-[var(--clx-text-secondary)] tracking-wider uppercase">{field.label}</label>
                    <input
                      type="text"
                      value={addressForm[field.key]}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-3.5 py-2.5 text-sm border border-[var(--clx-border)] rounded-lg bg-white focus:outline-none focus:border-[var(--clx-gold)] transition-colors"
                    />
                    {addressErrors[field.key] && <p className="text-red-500 text-xs mt-1">{addressErrors[field.key]}</p>}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={saveAddress}
                  disabled={addressSaving}
                  className="luxury-btn-gold py-2.5 px-6 text-xs disabled:opacity-60"
                >
                  {addressSaving ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Save className="w-3.5 h-3.5" /> {editingAddress ? 'Update' : 'Save Address'}</span>
                  )}
                </button>
                <button onClick={closeForm} className="luxury-btn-outline py-2.5 px-6 text-xs">Cancel</button>
              </div>
            </div>
          )}

          {/* Footer info */}
          {addresses.length > 0 && (
            <p className="text-[10px] text-[var(--clx-text-muted)] mt-3">
              You can save up to 5 addresses. Your default address is automatically selected during checkout.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}