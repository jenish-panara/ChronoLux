'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Save,
  X,
  LogOut,
} from 'lucide-react';

import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
function InputField({
  label,
  name,
  value,
  icon: Icon,
  editable,
  handleChange,
  toggleEdit,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (editable) {
      inputRef.current?.focus();
    }
  }, [editable]);

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-700">
        {label}
      </label>

      <div className="relative">
        <Icon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />

        <input
          ref={inputRef}
          type="text"
          name={name}
          value={value}
          readOnly={!editable}
          onChange={handleChange}
          className={`w-full pl-11 pr-12 py-3 border rounded-xl transition-all duration-200
          ${
            editable
              ? 'border-black bg-white'
              : 'bg-gray-50 border-gray-200'
          }`}
        />

        <button
          type="button"
          onClick={() => toggleEdit(name)}
          className="absolute right-3 top-3 text-gray-500 hover:text-black"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    profileImage: '',
  });

  const [originalData, setOriginalData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const [editable, setEditable] = useState({
    name: false,
    email: false,
    phone: false,
    address: false,
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
      router.push('/login');
      return;
    }

    (async () => {
      const userdata = await api.get('/auth/me');
       const data = {
      name: userdata.data?.user?.name || '',
      email: userdata.data?.user?.email || '',
      phone: userdata.data?.user?.phone || '',
      address: userdata.data?.user?.address || '',
      profileImage: userdata.data?.user?.profileImage || '',
    };

    setUserData(data);
    setOriginalData(data);
    })();

   
  }, [router]);

  const handleChange = (e) => {
    setUserData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setHasChanges(true);
  };

  const toggleEdit = (field) => {
    setEditable((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSave = async () => {
    try {
      // TODO: Call API here
      // await userAPI.updateProfile(userData);

      localStorage.setItem('user', JSON.stringify(userData));

      setOriginalData(userData);
        console.log("🚀 ~ handleSave ~ userData:", userData)
        await api.put('/auth/update-profile', userData);
      setEditable({
        name: false,
        email: false,
        phone: false,
        address: false,
      });

      setHasChanges(false);

      alert('Profile updated successfully!');
    } catch (error) {
      console.error(error);
        alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setUserData(originalData);

    setEditable({
      name: false,
      email: false,
      phone: false,
      address: false,
    });

    setHasChanges(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4">

        {/* Page Heading */}
        <h1 className="text-3xl font-bold mb-8">
          My Account
        </h1>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-md p-8 mb-8">

          <div className="flex flex-col items-center">

            {userData.profileImage ? (
              <img
                src={userData.profileImage}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-gray-100"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-12 h-12 text-gray-500" />
              </div>
            )}

            <h2 className="text-2xl font-bold mt-4">
              {userData.name}
            </h2>

            <p className="text-gray-500">
              {userData.email}
            </p>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-3xl shadow-md p-8">

          <div className="grid md:grid-cols-2 gap-6">

            <InputField
              label="Full Name"
              name="name"
              value={userData.name}
              icon={User}
              editable={editable.name}
              handleChange={handleChange}
              toggleEdit={toggleEdit}
            />

            <InputField
              label="Email"
              name="email"
              value={userData.email}
              icon={Mail}
              editable={editable.email}
              handleChange={handleChange}
              toggleEdit={toggleEdit}
            />

            <InputField
              label="Phone"
              name="phone"
              value={userData.phone}
              icon={Phone}
              editable={editable.phone}
              handleChange={handleChange}
              toggleEdit={toggleEdit}
            />

            <InputField
              label="Address"
              name="address"
              value={userData.address}
              icon={MapPin}
              editable={editable.address}
              handleChange={handleChange}
              toggleEdit={toggleEdit}
            />

          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-8">

            {hasChanges && (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>

                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}