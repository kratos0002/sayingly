import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";

const WorldMap = () => {
  const navigate = useNavigate();

  // Countries we have idioms for
  const highlightedCountries = {
    'NLD': 'nl', // Netherlands -> Dutch
    'FRA': 'fr', // France -> French
    'ITA': 'it', // Italy -> Italian
    'IND': 'ta', // India -> Tamil (and others)
    'ZAF': 'af', // South Africa -> Afrikaans
  };

  // Handle country click
  const handleCountryClick = (countryCode) => {
    const languageCode = highlightedCountries[countryCode];
    if (languageCode) {
      navigate(`/language/${languageCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sayingly</h1>
          <p className="text-lg text-gray-600">Explore idioms from around the world</p>
        </div>

        {/* Map Container */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <ComposableMap projection="geoMercator">
            <ZoomableGroup center={[0, 30]} zoom={1}>
              <Geographies geography="/features.json">
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const isHighlighted = highlightedCountries[geo.id];
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => handleCountryClick(geo.id)}
                        style={{
                          default: {
                            fill: isHighlighted ? "#93c5fd" : "#D6D6DA",
                            outline: "none"
                          },
                          hover: {
                            fill: isHighlighted ? "#60a5fa" : "#D6D6DA",
                            outline: "none"
                          },
                          pressed: {
                            fill: "#3b82f6",
                            outline: "none"
                          }
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Available Languages */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Available Languages</h2>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/language/nl')} className="text-blue-600 hover:text-blue-800">Dutch</button></li>
              <li><button onClick={() => navigate('/language/fr')} className="text-blue-600 hover:text-blue-800">French</button></li>
              <li><button onClick={() => navigate('/language/it')} className="text-blue-600 hover:text-blue-800">Italian</button></li>
              <li><button onClick={() => navigate('/language/ta')} className="text-blue-600 hover:text-blue-800">Tamil</button></li>
              <li><button onClick={() => navigate('/language/af')} className="text-blue-600 hover:text-blue-800">Afrikaans</button></li>
            </ul>
          </div>

          {/* Featured Idioms */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Popular Idioms</h2>
            <ul className="space-y-2 text-gray-700">
              <li>"In bocca al lupo" - Italian</li>
              <li>"Il pleut des cordes" - French</li>
              <li>"Nu komt de aap uit de mouw" - Dutch</li>
            </ul>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Collection Stats</h2>
            <div className="space-y-2 text-gray-700">
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