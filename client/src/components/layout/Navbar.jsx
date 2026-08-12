import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, MapPin, UserPlus, LogOut, Zap } from 'lucide-react';

const Navbar = () => {
  const { user, logout, canCreateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand - Adani Gradient Accent */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl adani-gradient p-0.5 shadow-md shadow-sky-600/15 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#005691]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900">
                  THMS <span className="adani-gradient-text">Smart Grid</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-[#005691] border border-sky-200 font-semibold">
                  Kolhapur
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Smart Transformer Health Monitoring</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive('/')
                  ? 'bg-sky-50 text-[#005691] border border-sky-200 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4 text-[#0072CE]" />
              <span>Transformers</span>
            </Link>

            <Link
              to="/map"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive('/map')
                  ? 'bg-sky-50 text-[#005691] border border-sky-200 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4 text-[#5C2D91]" />
              <span>Kolhapur Map</span>
            </Link>

            {canCreateUser && (
              <Link
                to="/create-user"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive('/create-user')
                    ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4 text-purple-600" />
                <span className="hidden sm:inline">Create User</span>
              </Link>
            )}

            {/* User Profile & Role */}
            <div className="ml-2 pl-3 border-l border-slate-200 flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                    user?.role === 'Admin'
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : user?.role === 'Engineer'
                      ? 'bg-sky-100 text-sky-700 border border-sky-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {user?.role}
                </span>
              </div>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
