import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

const geoUrl = "/world-110m.json";  // Updated path

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
          <ComposableMap>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      const languageCode = highlightedCountries[geo.properties.ISO_A3];
                      if (languageCode) {
                        navigate(`/language/${languageCode}`);
                      }
                    }}
                    style={{
                      default: {
                        fill: highlightedCountries[geo.properties.ISO_A3] 
                          ? "#93c5fd" 
                          : "#D6D6DA",
                        outline: "none"
                      },
                      hover: {
                        fill: highlightedCountries[geo.properties.ISO_A3]
                          ? "#60a5fa"
                          : "#D6D6DA",
                        outline: "none"
                      },
                      pressed: {
                        fill: "#3b82f6",
                        outline: "none"
                      }
                    }}
                  />
                ))
              }
            </Geographies>
          </ComposableMap>
        </div>

        {/* Rest of your component ... */}
      </div>
    </div>
  );
};

export default WorldMap;