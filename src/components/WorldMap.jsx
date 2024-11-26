import React from 'react';
import { useNavigate } from 'react-router-dom';

const WorldMap = () => {
  const navigate = useNavigate();

  const handleCountryClick = (countryCode) => {
    navigate(`/country/${countryCode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sayingly</h1>
          <p className="text-lg text-gray-600">Explore idioms from around the world</p>
        </div>
        
        {/* Interactive Map Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="relative">
            {/* We can use SVG map here */}
            <svg 
              viewBox="0 0 1000 500" 
              className="w-full h-auto"
            >
              {/* Example country path - Netherlands */}
              <path
                d="M..." // Path data for Netherlands
                className="fill-blue-100 hover:fill-blue-300 cursor-pointer transition-colors"
                onClick={() => handleCountryClick('NL')}
              />
              {/* Add more country paths */}
            </svg>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Featured Countries */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Featured Countries</h2>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleCountryClick('NL')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Netherlands
                </button>
              </li>
              {/* Add more countries */}
            </ul>
          </div>

          {/* Featured Languages */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Featured Languages</h2>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => navigate('/language/nl')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Dutch
                </button>
              </li>
              {/* Add more languages */}
            </ul>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-2">
              <p>8 Languages</p>
              <p>40+ Idioms</p>
              <p>10+ Countries</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;