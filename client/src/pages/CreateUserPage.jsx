import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import { createUser } from '../services/authService';
import { UserPlus, Shield, CheckCircle, AlertCircle, Mail, Lock, User } from 'lucide-react';

const CreateUserPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Engineer',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await createUser(formData);
      if (res.success) {
        setSuccessMsg(`User '${res.data.name}' (${res.data.role}) created successfully!`);
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'Engineer',
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="white-panel rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-purple-700">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Provision User Account</h1>
              <p className="text-xs text-slate-500 font-medium">
                Admin Privilege: Create accounts for engineers or viewers
              </p>
            </div>
          </div>

          {successMsg && (
            <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
              {successMsg}
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Er. Suresh Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#0072CE] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="engineer@thms.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#0072CE] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Initial Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#0072CE] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Role Authorization *
              </label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#0072CE] focus:bg-white transition-all"
                >
                  <option value="Engineer">Engineer (View, Edit, Maintenance)</option>
                  <option value="Viewer">Viewer (Read-only)</option>
                  <option value="Admin">Admin (Full Control)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create User Account'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateUserPage;
