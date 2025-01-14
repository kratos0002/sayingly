import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthView() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(username, password);
      } else {
        await signUp(username, password);
      }
      navigate('/');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-0"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex p-3 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 shadow-inner mb-4 transform hover:scale-110 transition-transform duration-200">
              <span className="text-5xl" role="img" aria-label="wave">👋</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              {isLogin ? 'Welcome Back!' : 'Join Us Today'}
            </h2>
            <p className="text-gray-600 text-lg">
              {isLogin ? 'Continue your language journey' : 'Start your language adventure'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 sm:text-base hover:bg-white"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 sm:text-base hover:bg-white"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 transform hover:-translate-y-0.5"
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Processing...' : isLogin ? 'Sign in' : 'Sign up'}
              </button>
            </div>
          </form>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 backdrop-blur-sm text-gray-500 rounded-full">or</span>
              </div>
            </div>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-center py-2 text-blue-600 hover:text-blue-700 font-medium transition-all duration-200 hover:underline decoration-2 underline-offset-4"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full text-center py-2 text-gray-500 hover:text-gray-700 font-medium transition-all duration-200 hover:underline decoration-2 underline-offset-4"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}