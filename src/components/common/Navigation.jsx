import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBookmark, FaHome, FaGlobe } from 'react-icons/fa';
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../auth/AuthModal';

const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo/Home */}
            <Link 
              to="/" 
              className="flex items-center px-2 py-2 text-gray-700 hover:text-blue-600"
            >
              <FaHome className="h-5 w-5" />
              <span className="ml-2 font-medium">Sayingly</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Map Link */}
            <Link
              to="/map"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/map'
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <FaGlobe className="h-5 w-5 mr-1" />
              <span>Map</span>
            </Link>

            {/* Bookmarks - only show if user is logged in */}
            {user && (
              <Link
                to="/bookmarks"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/bookmarks'
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                <FaBookmark className="h-5 w-5 mr-1" />
                <span>Bookmarks</span>
              </Link>
            )}

            {/* Auth Button */}
            <button
              onClick={() => {
                if (user) {
                  signOut();
                } else {
                  setShowAuthModal(true);
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {user ? 'Sign Out' : 'Sign In'}
            </button>

            {/* Auth Modal */}
            <AuthModal 
              isOpen={showAuthModal} 
              onClose={() => setShowAuthModal(false)} 
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
