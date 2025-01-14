import React from 'react';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const SocialAuth = ({ isOpen, onClose }) => {
  const { signInWithGoogle, signInWithGitHub } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        
        <div className="space-y-4">
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaGoogle className="h-5 w-5 text-red-500" />
            Continue with Google
          </button>

          <button
            onClick={signInWithGitHub}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaGithub className="h-5 w-5" />
            Continue with GitHub
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default SocialAuth;