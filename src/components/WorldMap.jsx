import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import countriesGeoJson from '../data/countries.json';

const WorldMap = () => {
  const navigate = useNavigate();
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const languages = [
    { code: 'nl', name: 'Dutch' },
    { code: 'fr', name: 'French' },
    { code: 'it', name: 'Italian' },
    { code: 'ta', name: 'Tamil' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'bn', name: 'Bengali' },
    { code: 'af', name: 'Afrikaans' },
  ];

  const availableCountries = {
    'NLD': { 
      name: 'Netherlands', 
      languages: ['Dutch'],
      idiomCount: 10,
      flagEmoji: '🇳🇱'
    },
    'FRA': { 
      name: 'France', 
      languages: ['French'],
      idiomCount: 5,
      flagEmoji: '🇫🇷'
    },
    'ITA': { 
      name: 'Italy', 
      languages: ['Italian'],
      idiomCount: 5,
      flagEmoji: '🇮🇹'
    },
    'IND': { 
      name: 'India', 
      languages: ['Tamil', 'Malayalam', 'Bengali'],
      idiomCount: 15,
      flagEmoji: '🇮🇳'
    },
    'ZAF': { 
      name: 'South Africa', 
      languages: ['Afrikaans'],
      idiomCount: 5,
      flagEmoji: '🇿🇦'
    }
  };

  const countryStyle = {
    weight: 1,
    color: '#fff',
    fillOpacity: 1,
    fillColor: '#E2E8F0'
  };

  const highlightedStyle = {
    weight: 2,
    color: '#fff',
    fillOpacity: 1,
    fillColor: '#93c5fd'
  };

  const onEachFeature = (feature, layer) => {
    const countryCode = feature.properties.ISO_A3;
    const country = availableCountries[countryCode];

    if (country) {
      layer.setStyle(highlightedStyle);
    }

    layer.on({
      mouseover: (e) => {
        if (country) {
          layer.setStyle({
            ...highlightedStyle,
            fillColor: '#60a5fa'
          });
          
          const event = e.originalEvent;
          setTooltipPosition({
            x: event.clientX,
            y: event.clientY
          });
          
          setTooltipContent(`
            <div class="p-2">
              <div class="font-bold">${country.name} ${country.flagEmoji}</div>
              <div>Languages: ${country.languages.join(', ')}</div>
              <div>Idioms: ${country.idiomCount}</div>
              <div class="text-sm text-blue-600">Click to explore →</div>
            </div>
          `);
        }
      },
      mouseout: (e) => {
        if (country) {
          layer.setStyle(highlightedStyle);
          setTooltipContent(null);
        }
      },
      click: (e) => {
        if (country) {
          if (country.languages.length > 1) {
            navigate(`/country/${countryCode}`);
          } else {
            navigate(`/language/${country.languages[0].toLowerCase()}`);
          }
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sayingly</h1>
          <p className="text-lg text-gray-600">Explore idioms from around the world</p>
        </div>

        {/* Language Navigation Bar */}
        <div className="relative z-10 mb-4">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-3xl">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 flex flex-wrap justify-center gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => navigate(`/language/${lang.code}`)}
                  className="px-4 py-2 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-800 transition-colors"
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="h-[600px] relative">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
              zoomControl={false}
              attributionControl={false}
              minZoom={2}
              maxBounds={[[-90, -180], [90, 180]]}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
                noWrap={true}
              />
              <GeoJSON
                data={countriesGeoJson}
                style={countryStyle}
                onEachFeature={onEachFeature}
              />
            </MapContainer>
            
            {tooltipContent && (
              <div
                className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 pointer-events-none"
                style={{
                  left: tooltipPosition.x,
                  top: tooltipPosition.y,
                  transform: 'translate(-50%, -120%)'
                }}
                dangerouslySetInnerHTML={{ __html: tooltipContent }}
              />
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Featured Idioms */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Featured Idioms</h2>
            <div className="space-y-3">
              <div className="p-3 rounded-lg hover:bg-gray-50">
                <p className="font-medium text-blue-600">"In bocca al lupo"</p>
                <p className="text-sm text-gray-600">Italian - "Into the mouth of the wolf"</p>
              </div>
              <div className="p-3 rounded-lg hover:bg-gray-50">
                <p className="font-medium text-blue-600">"Il pleut des cordes"</p>
                <p className="text-sm text-gray-600">French - "It's raining ropes"</p>
              </div>
              <div className="p-3 rounded-lg hover:bg-gray-50">
                <p className="font-medium text-blue-600">"Nu komt de aap uit de mouw"</p>
                <p className="text-sm text-gray-600">Dutch - "Now the monkey comes out of the sleeve"</p>
              </div>
            </div>
          </div>

          {/* Collection Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Collection Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Languages</span>
                <span className="font-bold text-blue-600">7</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Idioms</span>
                <span className="font-bold text-blue-600">35+</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Countries</span>
                <span className="font-bold text-blue-600">5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;