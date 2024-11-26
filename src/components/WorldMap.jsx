import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { supabase } from '../lib/supabase';

const WorldMap = () => {
  const navigate = useNavigate();
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [countryData, setCountryData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCountryStats();
  }, []);

  const fetchCountryStats = async () => {
    try {
      const { data, error } = await supabase
        .from('country_stats')
        .select('*');

      if (error) throw error;

      // Convert array to object with country_code as key
      const countryStats = data.reduce((acc, country) => {
        acc[country.country_code] = {
          name: country.country_name,
          languages: country.languages,
          idiomCount: country.idiom_count,
          languageCount: country.language_count
        };
        return acc;
      }, {});

      setCountryData(countryStats);
    } catch (error) {
      console.error('Error fetching country stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = (e) => {
    setTooltipPosition({ x: e.clientX + 16, y: e.clientY + 16 });
  };

  const handleCountryClick = (geo) => {
    const countryCode = geo.properties.ISO_A3;
    const country = countryData[countryCode];
    
    if (country) {
      if (country.languageCount > 1) {
        navigate(`/country/${countryCode}`);
      } else {
        navigate(`/language/${country.languages[0].code}`);
      }
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
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 relative">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-gray-500">Loading map data...</div>
            </div>
          ) : (
            <ComposableMap
              projectionConfig={{
                rotate: [-10, 0, 0],
                scale: 147
              }}
            >
              <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countryCode = geo.properties.ISO_A3;
                    const country = countryData[countryCode];
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => handleCountryClick(geo)}
                        onMouseEnter={() => {
                          if (country) {
                            setTooltipContent(`
                              <div class="font-bold">${country.name}</div>
                              <div>Languages: ${country.languages.map(l => l.name).join(', ')}</div>
                              <div>Idioms: ${country.idiomCount}</div>
                              <div class="text-sm text-blue-500">Click to explore →</div>
                            `);
                          }
                        }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setTooltipContent("")}
                        style={{
                          default: {
                            fill: country ? "#93c5fd" : "#D6D6DA",
                            outline: "none",
                            stroke: "#FFF",
                            strokeWidth: 0.5,
                          },
                          hover: {
                            fill: country ? "#60a5fa" : "#D6D6DA",
                            outline: "none",
                            stroke: "#FFF",
                            strokeWidth: 0.5,
                            cursor: country ? 'pointer' : 'default'
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
            </ComposableMap>
          )}
          
          {/* Tooltip */}
          {tooltipContent && (
            <div
              className="absolute z-10 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200 pointer-events-none"
              style={{
                left: tooltipPosition.x,
                top: tooltipPosition.y,
                transform: 'translate(-50%, -100%)'
              }}
              dangerouslySetInnerHTML={{ __html: tooltipContent }}
            />
          )}
        </div>

        {/* Rest of the component remains the same */}
        {/* ... */}
      </div>
    </div>
  );
};

export default WorldMap;